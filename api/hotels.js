export default async function handler(req, res) {
  try {
    const {
      lat, lng, name = '',
      checkin = '', checkout = '',
      adults = '2', rooms = '1',
      squeeze = ''
    } = req.query;

    if (!lat || !lng) {
      res.status(400).send('lat and lng are required.');
      return;
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    if (!isFinite(latitude) || !isFinite(longitude)) {
      res.status(400).send('Invalid lat/lng values.');
      return;
    }

    const applicationId = process.env.RAKUTEN_APPLICATION_ID;
    const accessKey = process.env.RAKUTEN_ACCESS_KEY;
    const affiliateId = process.env.RAKUTEN_AFFILIATE_ID || '';

    if (!applicationId || !accessKey) {
      res.status(500).send('Missing RAKUTEN_APPLICATION_ID or RAKUTEN_ACCESS_KEY.');
      return;
    }

    // デフォルト日付: 今日・明日
    function toDateStr(d) {
      return d.toISOString().slice(0, 10);
    }
    const today = new Date();
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
            'Origin': 'https://golf-premium-v1.vercel.app',
          }
        });
        if (r.status !== 429) return r;
        if (i === retries) return r;
        await new Promise(resolve => setTimeout(resolve, 1200));
      }
    }

    // 楽天トラベル空室検索API (VacantHotelSearch)
    // searchRadius: 最大3.0km（API仕様上限）
    const url = new URL('https://openapi.rakuten.co.jp/engine/api/Travel/VacantHotelSearch/20170426');
    url.searchParams.set('format', 'json');
    url.searchParams.set('formatVersion', '2');
    url.searchParams.set('applicationId', applicationId);
    url.searchParams.set('accessKey', accessKey);
    if (affiliateId) url.searchParams.set('affiliateId', affiliateId);
    url.searchParams.set('latitude', String(latitude));
    url.searchParams.set('longitude', String(longitude));
    url.searchParams.set('datumType', '1');       // 世界測地系・度単位
    url.searchParams.set('searchRadius', '3');    // 最大3km
    url.searchParams.set('checkinDate', checkinDate);
    url.searchParams.set('checkoutDate', checkoutDate);
    url.searchParams.set('adultNum', String(Math.min(10, Math.max(1, parseInt(adults) || 2))));
    url.searchParams.set('roomNum', String(Math.min(10, Math.max(1, parseInt(rooms) || 1))));
    url.searchParams.set('hits', '30');
    url.searchParams.set('page', '1');
    url.searchParams.set('sort', 'standard');     // 近い順
    url.searchParams.set('responseType', 'middle');

    // 絞り込み条件（onsen/daiyoku/internet/kinen）
    if (squeeze) {
      url.searchParams.set('squeezeCondition', squeeze);
    }

    const r = await fetchWithRetry(url.toString());

    if (!r.ok) {
      const t = await r.text();
      res.status(r.status).send(t);
      return;
    }

    const data = await r.json();

    // VacantHotelSearch レスポンス構造:
    // hotels[].hotel[0].hotelBasicInfo, [1].hotelRatingInfo など
    const rawHotels = data.hotels || [];
    const hotels = rawHotels.map(h => {
      const hotelArr = h.hotel || [];
      const basicObj = hotelArr.find(x => x.hotelBasicInfo);
      const ratingObj = hotelArr.find(x => x.hotelRatingInfo);
      const roomObj   = hotelArr.find(x => x.roomInfo);

      const info   = basicObj?.hotelBasicInfo || {};
      const rating = ratingObj?.hotelRatingInfo || {};
      const room   = roomObj?.roomInfo || {};
      const planInfo = room.reserveInfo || {};

      return {
        hotelNo: info.hotelNo,
        hotelName: info.hotelName,
        hotelSpecial: info.hotelSpecial,
        minCharge: planInfo.total || info.hotelMinCharge,
        latitude: info.latitude,
        longitude: info.longitude,
        address1: info.address1,
        address2: info.address2,
        hotelImageUrl: info.hotelImageUrl || info.hotelThumbnailUrl,
        reviewAverage: info.reviewAverage,
        reviewCount: info.reviewCount,
        checkinTime: info.checkinTime,
        checkoutTime: info.checkoutTime,
        hotelInformationUrl: info.hotelInformationUrl,
        planListUrl: info.planListUrl,
        serviceAverage: rating.serviceAverage,
        locationAverage: rating.locationAverage,
        roomAverage: rating.roomAverage,
        bathAverage: rating.bathAverage,
        mealAverage: rating.mealAverage,
      };
    }).filter(h => h.hotelName);

    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=1800');
    res.status(200).json({
      ok: true,
      courseName: name,
      lat: latitude,
      lng: longitude,
      checkinDate,
      checkoutDate,
      adults: parseInt(adults) || 2,
      rooms: parseInt(rooms) || 1,
      count: hotels.length,
      hotels,
    });

  } catch (e) {
    res.status(500).send(e?.message || 'Server error');
  }
}
