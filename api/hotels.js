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

    // 住所から検索キーワードを生成
    // 例: "東京都八王子市大船町620" → "八王子市" を優先、なければ都道府県名
    function extractKeyword(address, pref) {
      // 市区町村を抽出
      const m = address.match(/(.+?[市区町村郡])/);
      if (m) return m[1];
      // 政令市の区など
      const m2 = address.match(/(.+?[都道府県])(.+?[市])/);
      if (m2) return m2[2];
      // フォールバック: 都道府県名
      return pref || address.slice(0, 6);
    }
    const keyword = extractKeyword(address, pref);

    // デフォルト日付
    function toDateStr(d) { return d.toISOString().slice(0, 10); }
    const today    = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const checkinDate  = checkin  || toDateStr(today);
    const checkoutDate = checkout || toDateStr(tomorrow);

    async function fetchWithRetry(url, retries = 2) {
      for (let i = 0; i <= retries; i++) {
        const r = await fetch(url, {
          headers: {
            'User-Agent': 'GolfJourneyRoulette/1.0',
            'Referer': 'https://golf-premium-v1.vercel.app/',
            'Origin':  'https://golf-premium-v1.vercel.app',
          }
        });
        if (r.status !== 429) return r;
        if (i === retries) return r;
        await new Promise(resolve => setTimeout(resolve, 1200));
      }
    }

    // 楽天トラベル空室検索API (VacantHotelSearch) + キーワード絞り込み
    const url = new URL('https://openapi.rakuten.co.jp/engine/api/Travel/VacantHotelSearch/20170426');
    url.searchParams.set('format', 'json');
    url.searchParams.set('formatVersion', '2');
    url.searchParams.set('applicationId', applicationId);
    url.searchParams.set('accessKey', accessKey);
    if (affiliateId) url.searchParams.set('affiliateId', affiliateId);
    // キーワード検索（市区町村名）→ 緯度経度不要・広域検索可能
    url.searchParams.set('keyword', keyword);
    url.searchParams.set('checkinDate',  checkinDate);
    url.searchParams.set('checkoutDate', checkoutDate);
    url.searchParams.set('adultNum', String(Math.min(10, Math.max(1, parseInt(adults) || 1))));
    url.searchParams.set('roomNum',  String(Math.min(10, Math.max(1, parseInt(rooms)  || 1))));
    url.searchParams.set('hits', '30');
    url.searchParams.set('page', '1');
    url.searchParams.set('sort', '+roomCharge');  // 料金安い順
    url.searchParams.set('responseType', 'middle');
    if (squeeze) url.searchParams.set('squeezeCondition', squeeze);

    const r = await fetchWithRetry(url.toString());
    if (!r.ok) {
      const t = await r.text();
      res.status(r.status).send(t);
      return;
    }

    const data = await r.json();
    const rawHotels = data.hotels || [];

    const hotels = rawHotels.map(h => {
      const hotelArr = Array.isArray(h.hotel) ? h.hotel : [];
      const basicObj  = hotelArr.find(x => x.hotelBasicInfo);
      const ratingObj = hotelArr.find(x => x.hotelRatingInfo);

      const info   = basicObj?.hotelBasicInfo   || {};
      const rating = ratingObj?.hotelRatingInfo  || {};

      return {
        hotelNo:   info.hotelNo,
        hotelName: info.hotelName,
        hotelSpecial: info.hotelSpecial,
        minCharge: info.hotelMinCharge,
        latitude:  info.latitude,
        longitude: info.longitude,
        address1:  info.address1,
        address2:  info.address2,
        hotelImageUrl:      info.hotelImageUrl || info.hotelThumbnailUrl,
        reviewAverage:      info.reviewAverage,
        reviewCount:        info.reviewCount,
        checkinTime:        info.checkinTime,
        checkoutTime:       info.checkoutTime,
        hotelInformationUrl: info.hotelInformationUrl,
        planListUrl:        info.planListUrl,
        serviceAverage:     rating.serviceAverage,
        locationAverage:    rating.locationAverage,
        roomAverage:        rating.roomAverage,
        bathAverage:        rating.bathAverage,
        mealAverage:        rating.mealAverage,
      };
    }).filter(h => h.hotelName);

    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=1800');
    res.status(200).json({
      ok: true,
      courseName: name,
      keyword,
      checkinDate,
      checkoutDate,
      count: hotels.length,
      hotels,
    });

  } catch (e) {
    res.status(500).send(e?.message || 'Server error');
  }
}
