# Golf Journey Roulette - Final Secure Edition

楽天GORA検索APIが実際に通ることを確認した完成版です。

## 特徴
- Vercel Functions 経由で楽天GORA検索APIを呼ぶ安全版
- 候補名、評価、住所、詳細、予約カレンダーを実データ表示
- 北海道 / 東北 / 関東 / 中部 / 近畿 / 中国 / 四国 / 九州 / 沖縄 に対応
- PGM / GRAND PGM / アコーディア / その他 のブランド切り替え
- その他は評価 3.8 以上のみ
- 季節快適度ロジック付き

## 必要な環境変数
- RAKUTEN_APPLICATION_ID
- RAKUTEN_ACCESS_KEY
- RAKUTEN_AFFILIATE_ID

## 動作確認
- /api/search
- /api/search?prefCode=13&pref=東京都
