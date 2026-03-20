export default async function handler(req, res) {
  try {
    const applicationId = process.env.RAKUTEN_APPLICATION_ID;
    const accessKey = process.env.RAKUTEN_ACCESS_KEY;
    const affiliateId = process.env.RAKUTEN_AFFILIATE_ID || '';
    if (!applicationId || !accessKey) {
      res.status(500).send('Missing Vercel environment variables.');
      return;
    }
    const pref = String(req.query.pref || '');
    const prefCodes = {
      '北海道':1,'青森県':2,'岩手県':3,'宮城県':4,'秋田県':5,'山形県':6,'福島県':7,
      '茨城県':8,'栃木県':9,'群馬県':10,'埼玉県':11,'千葉県':12,'東京都':13,'神奈川県':14,
      '新潟県':15,'富山県':16,'石川県':17,'福井県':18,'山梨県':19,'長野県':20,'岐阜県':21,'静岡県':22,'愛知県':23,
      '三重県':24,'滋賀県':25,'京都府':26,'大阪府':27,'兵庫県':28,'奈良県':29,'和歌山県':30,
      '鳥取県':31,'島根県':32,'岡山県':33,'広島県':34,'山口県':35,
      '徳島県':36,'香川県':37,'愛媛県':38,'高知県':39,
      '福岡県':40,'佐賀県':41,'長崎県':42,'熊本県':43,'大分県':44,'宮崎県':45,'鹿児島県':46,'沖縄県':47
    };
    const areaCode = prefCodes[pref];
    if (!areaCode) {
      res.status(400).send('Unknown prefecture.');
      return;
    }

    let all = [];
    for (let page = 1; page <= 3 && all.length < 25; page++) {
      const u = new URL('https://app.rakuten.co.jp/services/api/Gora/GoraGolfCourseSearch/20170623');
      u.searchParams.set('format', 'json');
      u.searchParams.set('formatVersion', '2');
      u.searchParams.set('applicationId', applicationId);
      u.searchParams.set('accessKey', accessKey);
      if (affiliateId) u.searchParams.set('affiliateId', affiliateId);
      u.searchParams.set('areaCode', String(areaCode));
      u.searchParams.set('sort', 'evaluation');
      u.searchParams.set('hits', '30');
      u.searchParams.set('page', String(page));
      u.searchParams.set('reservation', '1');
      u.searchParams.set('elements', 'golfCourseId,golfCourseName,evaluation,golfCourseDetailUrl,reserveCalUrl,address,golfCourseCaption,golfCourseImageUrl');

      const r = await fetch(u.toString(), { headers: { 'User-Agent': 'GolfJourneyRoulette/1.0' } });
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

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.status(200).json({ items: all });
  } catch (e) {
    res.status(500).send(e?.message || 'Server error');
  }
}
