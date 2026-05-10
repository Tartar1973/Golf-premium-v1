// 都道府県名 → 楽天トラベル middleClassCode マップ
const PREF_TO_MIDDLE = {
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

    // 都道府県名を住所から抽出
    function extractPref(address, prefHint) {
      if (prefHint) return prefHint;
      const m = address.match(/(.+?[都道府県])/);
      return m ? m[1] : '';
    }

    // 市区町村名を抽出（検索キーワード用）
    function extractCity(address) {
      const m = address.match(/[都道府県](.+?[市区町村郡])/);
      return m ? m[1] : '';
    }

    const prefName    = extractPref(address, pref);
    const middleCode  = PREF_TO_MIDDLE[prefName] || '';
    const cityName    = extractCity(address);
    const keyword     = cityName || prefName || address.slice(0, 6);

    // デフォルト日付
    function toDateStr(d) { return d.toISOString().slice(0, 10); }
    const today    = new Date();
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const checkinDate  = checkin  || toDateStr(today);
    const checkoutDate = checkout || toDateStr(tomorrow);

    async function fetchWithRetry(url, retries = 2) {
      for (let i = 0; i <= retries; i++) {
        const r = await fetch(url, {
          headers: {
            'User-Agent': 'GolfJourneyRoulette/1.0',
            'Referer':    'https://golf-premium-v1.vercel.app/',
            'Origin':     'https://golf-premium-v1.vercel.app',
          }
        });
        if (r.status !== 429) return r;
        if (i === retries) return r;
        await new Promise(resolve => setTimeout(resolve, 1200));
      }
    }

    function buildUrl(extraParams = {}) {
      const url = new URL('https://openapi.rakuten.co.jp/engine/api/Travel/VacantHotelSearch/20170426');
      url.searchParams.set('format',       'json');
      url.searchParams.set('formatVersion','2');
      url.searchParams.set('applicationId', applicationId);
      url.searchParams.set('accessKey',     accessKey);
      if (affiliateId) url.searchParams.set('affiliateId', affiliateId);
      url.searchParams.set('checkinDate',   checkinDate);
      url.searchParams.set('checkoutDate',  checkoutDate);
      url.searchParams.set('adultNum',  String(Math.min(10, Math.max(1, parseInt(adults) || 1))));
      url.searchParams.set('roomNum',   String(Math.min(10, Math.max(1, parseInt(rooms)  || 1))));
      url.searchParams.set('hits',      '30');
      url.searchParams.set('page',      '1');
      url.searchParams.set('sort',      '+roomCharge');
      url.searchParams.set('responseType', 'middle');
      if (squeeze) url.searchParams.set('squeezeCondition', squeeze);
      Object.entries(extraParams).forEach(([k, v]) => url.searchParams.set(k, v));
      return url.toString();
    }

    // ① まず都道府県コード＋市区町村キーワードで検索
    // ② 結果が少なければ都道府県全体にフォールバック
    let hotels = [];
    let usedKeyword = keyword;

    async function parseHotels(r) {
      if (!r.ok) return [];
      const data = await r.json();
      return (data.hotels || []).map(h => {
        const arr     = Array.isArray(h.hotel) ? h.hotel : [];
        const basic   = (arr.find(x => x.hotelBasicInfo)  || {}).hotelBasicInfo  || {};
        const rating  = (arr.find(x => x.hotelRatingInfo) || {}).hotelRatingInfo || {};
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

    // 検索① : 都道府県(middle) + 市区町村キーワード → 広域カバー
    if (middleCode) {
      const r1 = await fetchWithRetry(buildUrl({
        largeClassCode:  'japan',
        middleClassCode: middleCode,
      }));
      hotels = await parseHotels(r1);
      usedKeyword = prefName;
    }

    // 結果が少ない or middleCode不明 → キーワード検索でフォールバック
    if (hotels.length < 5 && keyword) {
      const r2 = await fetchWithRetry(buildUrl({ keyword }));
      const h2 = await parseHotels(r2);
      // 重複排除してマージ
      const seen = new Set(hotels.map(h => h.hotelNo));
      h2.forEach(h => { if (!seen.has(h.hotelNo)) { hotels.push(h); seen.add(h.hotelNo); } });
      usedKeyword = keyword;
    }

    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=1800');
    res.status(200).json({
      ok:       true,
      courseName: name,
      keyword:  usedKeyword,
      checkinDate,
      checkoutDate,
      count:    hotels.length,
      hotels,
    });

  } catch (e) {
    res.status(500).send(e?.message || 'Server error');
  }
}
