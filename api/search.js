export default async function handler(req, res) {
  try {
    const { prefCode, pref = '' } = req.query;

    if (!prefCode) {
      res.status(200).json({
        ok: true,
        message: 'alive',
        usage: '/api/search?prefCode=13&pref=東京都',
      });
      return;
    }

    const code = Number(prefCode);
    if (!Number.isFinite(code) || code < 1 || code > 47) {
      res.status(400).send('Invalid prefCode.');
      return;
    }

    const applicationId = process.env.RAKUTEN_APPLICATION_ID;
    const accessKey = process.env.RAKUTEN_ACCESS_KEY;
    const affiliateId = process.env.RAKUTEN_AFFILIATE_ID || '';

    if (!applicationId || !accessKey) {
      res.status(500).send('Missing Vercel environment variables.');
      return;
    }

    let all = [];

    for (let page = 1; page <= 3 && all.length < 25; page++) {
      const u = new URL(
        'https://openapi.rakuten.co.jp/engine/api/Gora/GoraGolfCourseSearch/20170623'
      );

      u.searchParams.set('format', 'json');
      u.searchParams.set('formatVersion', '2');
      u.searchParams.set('applicationId', applicationId);
      u.searchParams.set('accessKey', accessKey);

      if (affiliateId) {
        u.searchParams.set('affiliateId', affiliateId);
      }

      u.searchParams.set('areaCode', String(code));
      u.searchParams.set('sort', 'evaluation');
      u.searchParams.set('hits', '30');
      u.searchParams.set('page', String(page));
      u.searchParams.set('reservation', '1');
      u.searchParams.set(
        'elements',
        'golfCourseId,golfCourseName,golfCourseAbbr,golfCourseNameKana,golfCourseCaption,address,latitude,longitude,highway,golfCourseDetailUrl,reserveCalUrl,ratingUrl,golfCourseImageUrl,evaluation'
      );

      const r = await fetch(u.toString(), {
        headers: { 'User-Agent': 'GolfJourneyRoulette/1.0' },
      });

      if (!r.ok) {
        const t = await r.text();
        res.status(r.status).send(t);
        return;
      }

      const data = await r.json();
      const items = data.Items || data.items || [];

      if (!items.length) break;
      all.push(...items);
    }

    const seen = new Set();
    all = all.filter((item) => {
      const id = item.golfCourseId;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.status(200).json({
      ok: true,
      pref,
      prefCode: code,
      items: all,
    });
  } catch (e) {
    res.status(500).send(e?.message || 'Server error');
  }
}
