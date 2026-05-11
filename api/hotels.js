// 都道府県名 → 楽天トラベル middleClassCode（GetAreaClass APIの値）
const PREF_MIDDLE = {
  '北海道':'hokkaido','青森県':'aomori','岩手県':'iwate','宮城県':'miyagi','秋田県':'akita',
  '山形県':'yamagata','福島県':'fukushima','茨城県':'ibaraki','栃木県':'tochigi','群馬県':'gunma',
  '埼玉県':'saitama','千葉県':'chiba','東京都':'tokyo','神奈川県':'kanagawa','新潟県':'niigata',
  '富山県':'toyama','石川県':'ishikawa','福井県':'fukui','山梨県':'yamanashi','長野県':'nagano',
  '岐阜県':'gifu','静岡県':'shizuoka','愛知県':'aichi','三重県':'mie','滋賀県':'shiga',
  '京都府':'kyoto','大阪府':'osaka','兵庫県':'hyogo','奈良県':'nara','和歌山県':'wakayama',
  '鳥取県':'tottori','島根県':'shimane','岡山県':'okayama','広島県':'hiroshima','山口県':'yamaguchi',
  '徳島県':'tokushima','香川県':'kagawa','愛媛県':'ehime','高知県':'kochi','福岡県':'fukuoka',
  '佐賀県':'saga','長崎県':'nagasaki','熊本県':'kumamoto','大分県':'oita','宮崎県':'miyazaki',
  '鹿児島県':'kagoshima','沖縄県':'okinawa'
};

export default async function handler(req, res) {
  try {
    const {
      address = '', pref = '', name = '',
      checkin = '', checkout = '',
      adults = '1', rooms = '1',
      squeeze = ''
    } = req.query;

    const applicationId = process.env.RAKUTEN_APPLICATION_ID;
    const accessKey     = process.env.RAKUTEN_ACCESS_KEY;
    const affiliateId   = process.env.RAKUTEN_AFFILIATE_ID || '';

    if (!applicationId || !accessKey) {
      res.status(500).send('Missing API credentials.');
      return;
    }

    // 都道府県名・市区町村名を抽出
    const prefName = pref || (address.match(/(.+?[都道府県])/)||[])[1] || '';
    const cityName = (address.match(/[都道府県](.+?[市区町村郡])/)||[])[1] || '';
    const middleCode = PREF_MIDDLE[prefName] || '';

    // デフォルト日付
    function toDateStr(d) { return d.toISOString().slice(0, 10); }
    const today    = new Date();
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const checkinDate  = checkin  || toDateStr(today);
    const checkoutDate = checkout || toDateStr(tomorrow);

    const headers = {
      'User-Agent': 'GolfJourneyRoulette/1.0',
      'Referer':    'https://golf-premium-v1.vercel.app/',
      'Origin':     'https://golf-premium-v1.vercel.app',
    };

    async function fetchJSON(url) {
      for (let i = 0; i <= 2; i++) {
        const r = await fetch(url, { headers });
        if (r.status === 429) { await new Promise(res => setTimeout(res, 1200)); continue; }
        if (!r.ok) return null;
        return await r.json();
      }
      return null;
    }

    // --- ① GetAreaClass で smallClassCode を取得 ---
    let smallCode = '';
    if (middleCode && cityName) {
      const areaUrl = `https://openapi.rakuten.co.jp/engine/api/Travel/GetAreaClass/20140210?format=json&formatVersion=2&applicationId=${applicationId}&accessKey=${accessKey}`;
      const areaData = await fetchJSON(areaUrl);
      if (areaData) {
        try {
          const largeClasses = areaData.areaClasses?.largeClasses || [];
          const japan = largeClasses.find(l => l.largeClass?.[0]?.largeClassCode === 'japan');
          const middles = japan?.largeClass?.[1]?.middleClasses || [];
          const mid = middles.find(m => m.middleClass?.[0]?.middleClassCode === middleCode);
          const smalls = mid?.middleClass?.[1]?.smallClasses || [];
          // 市区町村名で部分一致
          const sm = smalls.find(s => {
            const nm = s.smallClass?.[0]?.smallClassName || '';
            return nm.includes(cityName.replace(/[市区町村郡]$/,'')) || cityName.includes(nm.replace(/[市区町村郡]$/,''));
          });
          smallCode = sm?.smallClass?.[0]?.smallClassCode || '';
        } catch(e) { smallCode = ''; }
      }
    }

    // --- VacantHotelSearch 共通パラメータ ---
    function buildVacantUrl(extra = {}) {
      const u = new URL('https://openapi.rakuten.co.jp/engine/api/Travel/VacantHotelSearch/20170426');
      u.searchParams.set('format',        'json');
      u.searchParams.set('formatVersion', '2');
      u.searchParams.set('applicationId',  applicationId);
      u.searchParams.set('accessKey',      accessKey);
      if (affiliateId) u.searchParams.set('affiliateId', affiliateId);
      u.searchParams.set('checkinDate',    checkinDate);
      u.searchParams.set('checkoutDate',   checkoutDate);
      u.searchParams.set('adultNum', String(Math.min(10, Math.max(1, parseInt(adults)||1))));
      u.searchParams.set('roomNum',  String(Math.min(10, Math.max(1, parseInt(rooms) ||1))));
      u.searchParams.set('hits',     '30');
      u.searchParams.set('page',     '1');
      u.searchParams.set('sort',     '+roomCharge');
      u.searchParams.set('responseType', 'middle');
      if (squeeze) u.searchParams.set('squeezeCondition', squeeze);
      Object.entries(extra).forEach(([k,v]) => u.searchParams.set(k, v));
      return u.toString();
    }

    function parseHotels(data) {
      if (!data) return [];
      return (data.hotels || []).map(h => {
        const arr    = Array.isArray(h.hotel) ? h.hotel : [];
        const basic  = (arr.find(x => x.hotelBasicInfo)  ||{}).hotelBasicInfo  ||{};
        const rating = (arr.find(x => x.hotelRatingInfo) ||{}).hotelRatingInfo ||{};
        return {
          hotelNo:    basic.hotelNo,
          hotelName:  basic.hotelName,
          hotelSpecial: basic.hotelSpecial,
          minCharge:  basic.hotelMinCharge,
          latitude:   basic.latitude,
          longitude:  basic.longitude,
          address1:   basic.address1,
          address2:   basic.address2,
          hotelImageUrl:       basic.hotelImageUrl || basic.hotelThumbnailUrl,
          reviewAverage:       basic.reviewAverage,
          reviewCount:         basic.reviewCount,
          checkinTime:         basic.checkinTime,
          checkoutTime:        basic.checkoutTime,
          hotelInformationUrl: basic.hotelInformationUrl,
          planListUrl:         basic.planListUrl,
          serviceAverage:      rating.serviceAverage,
          locationAverage:     rating.locationAverage,
          roomAverage:         rating.roomAverage,
          bathAverage:         rating.bathAverage,
          mealAverage:         rating.mealAverage,
        };
      }).filter(h => h.hotelName);
    }

    function mergeHotels(base, adds) {
      const seen = new Set(base.map(h => h.hotelNo));
      adds.forEach(h => { if (!seen.has(h.hotelNo)) { base.push(h); seen.add(h.hotelNo); } });
      return base;
    }

    let hotels = [];
    let usedKeyword = prefName;

    // ② smallClassCode で検索（市区町村レベル）
    if (middleCode && smallCode) {
      const d = await fetchJSON(buildVacantUrl({
        largeClassCode:  'japan',
        middleClassCode: middleCode,
        smallClassCode:  smallCode,
      }));
      hotels = parseHotels(d);
      usedKeyword = cityName;
    }

    // ③ 結果少 → 都道府県レベル（middleClassCode）で再検索
    if (hotels.length < 5 && middleCode) {
      const d = await fetchJSON(buildVacantUrl({
        largeClassCode:  'japan',
        middleClassCode: middleCode,
      }));
      hotels = mergeHotels(hotels, parseHotels(d));
      usedKeyword = prefName;
    }

    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=1800');
    res.status(200).json({
      ok: true,
      courseName: name,
      keyword: usedKeyword,
      checkinDate,
      checkoutDate,
      count: hotels.length,
      hotels,
    });

  } catch (e) {
    res.status(500).send(e?.message || 'Server error');
  }
}
