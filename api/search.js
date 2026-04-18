export default async function handler(req, res) {
  try {
    const { prefCode, pref = '', hokkaidoArea = '' } = req.query;

    if (!prefCode) {
      res.status(200).json({
        ok: true,
        message: 'alive',
        usage: '/api/search?prefCode=13&pref=東京都'
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

    async function fetchWithRetry(url, options = {}, retries = 2) {
      for (let i = 0; i <= retries; i++) {
        const r = await fetch(url, options);
        if (r.status !== 429) return r;
        if (i === retries) return r;
        await new Promise(resolve => setTimeout(resolve, 1200));
      }
    }

    function normalizeText(s = '') {
      return String(s)
        .replace(/[Ａ-Ｚａ-ｚ０-９]/g, ch =>
          String.fromCharCode(ch.charCodeAt(0) - 0xFEE0)
        )
        .replace(/[　]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
    }
const HOKKAIDO_AREA_SEARCH = {
  central: { latitude: 43.0642, longitude: 141.3469, searchRadius: 110 },
  south:   { latitude: 41.7687, longitude: 140.7288, searchRadius: 110 },
  east:    { latitude: 43.0410, longitude: 144.2730, searchRadius: 140 },
  north:   { latitude: 43.7706, longitude: 142.3650, searchRadius: 130 }
};
    function detectHokkaidoArea(item) {
      const text = normalizeText(
        [
          item.address || '',
          item.golfCourseName || '',
          item.golfCourseCaption || '',
          item.highway || ''
        ].join(' ')
      );

      if (/(札幌|千歳|苫小牧|小樽|北広島|恵庭|石狩|岩見沢|江別|当別|長沼|夕張)/.test(text)) {
        return 'central';
      }

      if (/(函館|北斗|室蘭|登別|伊達|森町|七飯|八雲|長万部|江差|松前|木古内|鹿部)/.test(text)) {
        return 'south';
      }

      if (/(帯広|釧路|北見|網走|根室|中標津|弟子屈|清里|知床|紋別|十勝|斜里|標津|別海)/.test(text)) {
        return 'east';
      }

      if (/(旭川|富良野|名寄|稚内|留萌|士別|深川|美瑛|宗谷|枝幸|羽幌)/.test(text)) {
        return 'north';
      }

      return null;
    }

    let all = [];

    for (let page = 1; page <= 2 && all.length < 100; page++) {
      const u = new URL('https://openapi.rakuten.co.jp/engine/api/Gora/GoraGolfCourseSearch/20170623');
      u.searchParams.set('format', 'json');
      u.searchParams.set('formatVersion', '2');
      u.searchParams.set('applicationId', applicationId);
      u.searchParams.set('accessKey', accessKey);
      if (affiliateId) u.searchParams.set('affiliateId', affiliateId);
     const useGeoSearch = code === 1 && hokkaidoArea && HOKKAIDO_AREA_SEARCH[hokkaidoArea];

if (useGeoSearch) {
  const geo = HOKKAIDO_AREA_SEARCH[hokkaidoArea];
  u.searchParams.set('latitude', String(geo.latitude));
  u.searchParams.set('longitude', String(geo.longitude));
  u.searchParams.set('searchRadius', String(geo.searchRadius));
  u.searchParams.set('areaCode', String(code));
} else {
  u.searchParams.set('areaCode', String(code));
}

u.searchParams.set('sort', 'evaluation');
u.searchParams.set('hits', '30');
u.searchParams.set('page', String(page));
      u.searchParams.set(
        'elements',
        'golfCourseId,golfCourseName,golfCourseAbbr,golfCourseNameKana,golfCourseCaption,address,latitude,longitude,highway,golfCourseDetailUrl,reserveCalUrl,ratingUrl,golfCourseImageUrl,evaluation'
      );

      const r = await fetchWithRetry(u.toString(), {
        headers: {
          'User-Agent': 'GolfJourneyRoulette/1.0',
          'Referer': 'https://golf-premium-v1.vercel.app/',
          'Origin': 'https://golf-premium-v1.vercel.app'
        }
      });

      if (r.status === 404) break;

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
    all = all.filter(item => {
      const id = item.golfCourseId;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });

    if (code === 1 && hokkaidoArea && !HOKKAIDO_AREA_SEARCH[hokkaidoArea]) {
  all = all.filter(item => detectHokkaidoArea(item) === hokkaidoArea);
}

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.status(200).json({
      ok: true,
      pref,
      prefCode: code,
      hokkaidoArea,
      items: all
    });
  } catch (e) {
    res.status(500).send(e?.message || 'Server error');
  }
}