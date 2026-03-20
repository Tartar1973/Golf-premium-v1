# Golf Journey Roulette - Bilingual Version

日本語 / 英語の両方に対応した版です。

## 追加した内容
- トップページで日本語版 / 英語版を選択可能
- アプリ内でもいつでも言語切り替え可能
- Season / Area / Brand / ボタン / ステータス表示 / 候補一覧を日英対応
- 英語表示時は都道府県名・エリア名・ブランド名も英語表記に切り替え

## Files
- `index_en_ja.html` : bilingual top page + in-app language switch
- `search.js` : existing Rakuten GORA API handler (no change needed)
- `vercel.json` : unchanged

## How to apply
1. Replace your current `index.html` with `index_en_ja.html`
2. Keep `search.js` and `vercel.json` as they are
3. Deploy to Vercel

## Required environment variables
- `RAKUTEN_APPLICATION_ID`
- `RAKUTEN_ACCESS_KEY`
- `RAKUTEN_AFFILIATE_ID`

## Notes
- Language choice is saved in `localStorage`
- Golf course names and addresses are shown from Rakuten GORA data as-is
- Brand filtering logic is unchanged from the current working version
