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

    // 市区町村名を抽出
    function extractCity(addr) {
      const m = addr.match(/[都道府県](.+?[市区町村郡])/);
      return m ? m[1] : '';
    }
    // 都道府県名を抽出
    function extractPref(addr, hint) {
      if (hint) return hint;
      const m = addr.match(/(.+?[都道府県])/);
      return m ? m[1] : '';
    }

    const prefName = extractPref(address, pref);
    const cityName = extractCity(address);

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

    function buildUrl(keyword) {
      const url = new URL('https://openapi.rakuten.co.jp/engine/api/Travel/VacantHotelSearch/20170426');
      url.searchParams.set('format',        'json');
      url.searchParams.set('formatVersion', '2');
      url.searchParams.set('applicationId',  applicationId);
      url.searchParams.set('accessKey',      accessKey);
      if (affiliateId) url.searchParams.set('affiliateId', affiliateId);
      url.searchParams.set('keyword',        keyword);
      url.searchParams.set('checkinDate',    checkinDate);
      url.searchParams.set('checkoutDate',   checkoutDate);
      url.searchParams.set('adultNum',  String(Math.min(10, Math.max(1, parseInt(adults) || 1))));
      url.searchParams.set('roomNum',   String(Math.min(10, Math.max(1, parseInt(rooms)  || 1))));
      url.searchParams.set('hits',      '30');
      url.searchParams.set('page',      '1');
      url.searchParams.set('sort',      '+roomCharge');
      url.searchParams.set('responseType', 'middle');
      if (squeeze) url.searchParams.set('squeezeCondition', squeeze);
      return url.toString();
    }

    async function parseHotels(r) {
      if (!r.ok) return [];
      const data = await r.json();
      return (data.hotels || []).map(h => {
        const arr    = Array.isArray(h.hotel) ? h.hotel : [];
        const basic  = (arr.find(x => x.hotelBasicInfo)  || {}).hotelBasicInfo  || {};
        const rating = (arr.find(x => x.hotelRatingInfo) || {}).hotelRatingInfo || {};
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

    let hotels = [];
    let usedKeyword = '';

    // ① 市区町村名で検索
    if (cityName) {
      usedKeyword = cityName;
      const r1 = await fetchWithRetry(buildUrl(cityName));
      hotels = await parseHotels(r1);
    }

    // ② 結果が少なければ都道府県名でフォールバック
    if (hotels.length < 5 && prefName) {
      usedKeyword = prefName;
      const r2 = await fetchWithRetry(buildUrl(prefName));
      const h2 = await parseHotels(r2);
      const seen = new Set(hotels.map(h => h.hotelNo));
      h2.forEach(h => { if (!seen.has(h.hotelNo)) { hotels.push(h); seen.add(h.hotelNo); } });
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
