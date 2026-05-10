export default async function handler(req, res) {
  try {
    const { lat, lng, name = '' } = req.query;

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
    const affiliateId = process.env.RAKUTEN_AFFILIATE_ID || '';

    if (!applicationId) {
      res.status(500).send('Missing RAKUTEN_APPLICATION_ID environment variable.');
      return;
    }

    async function fetchWithRetry(url, retries = 2) {
      for (let i = 0; i <= retries; i++) {
        const r = await fetch(url, {
          headers: {
            'User-Agent': 'GolfJourneyRoulette/1.0',
            'Referer': 'https://golf-premium-v1.vercel.app/',
          }
        });
        if (r.status !== 429) return r;
        if (i === retries) return r;
        await new Promise(resolve => setTimeout(resolve, 1200));
      }
    }

    // 楽天トラベル キーワード検索API
    // 半径60km（車で約1時間）でホテルを検索
    const searchRadius = 60; // km

    const url = new URL('https://app.rakuten.co.jp/services/api/Travel/SimpleHotelSearch/20170426');
    url.searchParams.set('format', 'json');
    url.searchParams.set('formatVersion', '2');
    url.searchParams.set('applicationId', applicationId);
    if (affiliateId) url.searchParams.set('affiliateId', affiliateId);
    url.searchParams.set('latitude', String(latitude));
    url.searchParams.set('longitude', String(longitude));
    url.searchParams.set('searchRadius', String(searchRadius));
    url.searchParams.set('hits', '30');
    url.searchParams.set('page', '1');
    url.searchParams.set('sort', '+roomCharge'); // 料金の安い順
    url.searchParams.set('elements', [
      'hotelNo',
      'hotelName',
      'hotelSpecial',
      'hotelMinCharge',
      'latitude',
      'longitude',
      'postalCode',
      'address1',
      'address2',
      'telephoneNo',
      'hotelImageUrl',
      'reviewAverage',
      'reviewCount',
      'hotelInformationUrl',
      'planListUrl',
    ].join(','));

    const r = await fetchWithRetry(url.toString());

    if (!r.ok) {
      const t = await r.text();
      res.status(r.status).send(t);
      return;
    }

    const data = await r.json();

    // 楽天トラベルのレスポンス構造を正規化
    // hotels[].hotel[0].hotelBasicInfo の形式
    const rawHotels = data.hotels || [];
    const hotels = rawHotels.map(h => {
      const info = h.hotel?.[0]?.hotelBasicInfo || {};
      return {
        hotelNo: info.hotelNo,
        hotelName: info.hotelName,
        hotelSpecial: info.hotelSpecial,
        minCharge: info.hotelMinCharge,
        latitude: info.latitude,
        longitude: info.longitude,
        address1: info.address1,
        address2: info.address2,
        hotelImageUrl: info.hotelImageUrl,
        reviewAverage: info.reviewAverage,
        reviewCount: info.reviewCount,
        hotelInformationUrl: info.hotelInformationUrl,
        planListUrl: info.planListUrl,
      };
    }).filter(h => h.hotelName);

    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');
    res.status(200).json({
      ok: true,
      courseName: name,
      lat: latitude,
      lng: longitude,
      searchRadius,
      count: hotels.length,
      hotels,
    });

  } catch (e) {
    res.status(500).send(e?.message || 'Server error');
  }
}
