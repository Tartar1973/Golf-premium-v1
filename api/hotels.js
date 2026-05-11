// GetAreaClass APIの実際の値に基づく正確なマッピング
const PREF_MIDDLE = {
  '北海道':'hokkaido','青森県':'aomori','岩手県':'iwate','宮城県':'miyagi','秋田県':'akita',
  '山形県':'yamagata','福島県':'hukushima','茨城県':'ibaragi','栃木県':'tochigi','群馬県':'gunma',
  '埼玉県':'saitama','千葉県':'tiba','東京都':'tokyo','神奈川県':'kanagawa','新潟県':'niigata',
  '富山県':'toyama','石川県':'ishikawa','福井県':'hukui','山梨県':'yamanasi','長野県':'nagano',
  '岐阜県':'gihu','静岡県':'shizuoka','愛知県':'aichi','三重県':'mie','滋賀県':'shiga',
  '京都府':'kyoto','大阪府':'osaka','兵庫県':'hyogo','奈良県':'nara','和歌山県':'wakayama',
  '鳥取県':'tottori','島根県':'simane','岡山県':'okayama','広島県':'hiroshima','山口県':'yamaguchi',
  '徳島県':'tokushima','香川県':'kagawa','愛媛県':'ehime','高知県':'kouchi','福岡県':'hukuoka',
  '佐賀県':'saga','長崎県':'nagasaki','熊本県':'kumamoto','大分県':'ooita','宮崎県':'miyazaki',
  '鹿児島県':'kagoshima','沖縄県':'okinawa'
};

// smallClassName に含まれるキーワード → smallClassCode
// 住所・市区町村名で部分一致検索
const AREA_MAP = [
  // 北海道
  ['札幌','hokkaido','sapporo'],['定山渓','hokkaido','jozankei'],
  ['稚内','hokkaido','wakkanai'],['留萌','hokkaido','wakkanai'],['利尻','hokkaido','wakkanai'],['礼文','hokkaido','wakkanai'],
  ['網走','hokkaido','abashiri'],['紋別','hokkaido','abashiri'],['北見','hokkaido','abashiri'],['知床','hokkaido','abashiri'],
  ['釧路','hokkaido','kushiro'],['阿寒','hokkaido','kushiro'],['根室','hokkaido','kushiro'],
  ['帯広','hokkaido','obihiro'],['十勝','hokkaido','obihiro'],
  ['日高','hokkaido','hidaka'],['えりも','hokkaido','hidaka'],
  ['富良野','hokkaido','furano'],['美瑛','hokkaido','furano'],
  ['旭川','hokkaido','asahikawa'],['層雲峡','hokkaido','asahikawa'],
  ['千歳','hokkaido','chitose'],['苫小牧','hokkaido','chitose'],['滝川','hokkaido','chitose'],['夕張','hokkaido','chitose'],
  ['小樽','hokkaido','otaru'],['積丹','hokkaido','otaru'],['余市','hokkaido','otaru'],
  ['ニセコ','hokkaido','niseko'],['倶知安','hokkaido','niseko'],
  ['函館','hokkaido','hakodate'],['大沼','hokkaido','hakodate'],['奥尻','hokkaido','hakodate'],
  ['登別','hokkaido','noboribetsu'],['室蘭','hokkaido','noboribetsu'],['洞爺','hokkaido','noboribetsu'],
  // 青森
  ['青森','aomori','aomori'],['浅虫','aomori','aomori'],
  ['五所川原','aomori','tsugaru'],['弘前','aomori','hirosaki'],['黒石','aomori','hirosaki'],
  ['十和田','aomori','towadako'],['奥入瀬','aomori','towadako'],
  ['八戸','aomori','hachinohe'],['三沢','aomori','hachinohe'],
  ['むつ','aomori','shimokita'],['大間','aomori','shimokita'],
  // 岩手
  ['盛岡','iwate','morioka'],['雫石','iwate','shizukuishi'],
  ['八幡平','iwate','appi'],['二戸','iwate','appi'],
  ['宮古','iwate','kuji'],['久慈','iwate','kuji'],['岩泉','iwate','kuji'],
  ['釜石','iwate','ofunato'],['大船渡','iwate','ofunato'],['陸前高田','iwate','ofunato'],
  ['北上','iwate','kitakami'],['花巻','iwate','kitakami'],['遠野','iwate','kitakami'],
  ['奥州','iwate','ichinoseki'],['平泉','iwate','ichinoseki'],['一関','iwate','ichinoseki'],
  // 宮城
  ['仙台','miyagi','sendai'],['多賀城','miyagi','sendai'],['名取','miyagi','sendai'],
  ['秋保','miyagi','akiu'],['作並','miyagi','akiu'],
  ['鳴子','miyagi','naruko'],['古川','miyagi','naruko'],
  ['松島','miyagi','matsushima'],['塩釜','miyagi','matsushima'],['石巻','miyagi','matsushima'],['気仙沼','miyagi','matsushima'],
  ['白石','miyagi','shiroishi'],['蔵王','miyagi','shiroishi'],
  // 秋田
  ['秋田市','akita','akita'],
  ['能代','akita','noshiro'],['男鹿','akita','noshiro'],
  ['大館','akita','odate'],['鹿角','akita','odate'],
  ['角館','akita','tazawa'],['田沢湖','akita','tazawa'],['大曲','akita','tazawa'],
  ['横手','akita','yuzawa'],['湯沢','akita','yuzawa'],
  ['由利本荘','akita','honjo'],['鳥海','akita','honjo'],
  // 山形
  ['山形市','yamagata','yamagata'],['天童','yamagata','yamagata'],['上山','yamagata','yamagata'],['蔵王','yamagata','yamagata'],
  ['米沢','yamagata','yonezawa'],['長井','yamagata','yonezawa'],
  ['寒河江','yamagata','sagae'],['月山','yamagata','sagae'],
  ['新庄','yamagata','mogami'],['村山','yamagata','mogami'],['尾花沢','yamagata','mogami'],
  ['鶴岡','yamagata','shonai'],['酒田','yamagata','shonai'],['庄内','yamagata','shonai'],['湯野浜','yamagata','shonai'],['温海','yamagata','shonai'],
  // 福島
  ['福島市','hukushima','fukushima'],['二本松','hukushima','fukushima'],
  ['会津','hukushima','aizu'],['喜多方','hukushima','aizu'],
  ['猪苗代','hukushima','bandai'],
  ['郡山','hukushima','koriyama'],
  ['白河','hukushima','nakadori'],['須賀川','hukushima','nakadori'],
  ['いわき','hukushima','hamadori'],['相馬','hukushima','hamadori'],
  // 茨城
  ['水戸','ibaragi','mito'],['笠間','ibaragi','mito'],
  ['大洗','ibaragi','oarai'],['ひたちなか','ibaragi','oarai'],
  ['日立','ibaragi','hitachi'],['北茨城','ibaragi','hitachi'],
  ['つくば','ibaragi','tsukuba'],['土浦','ibaragi','tsukuba'],['取手','ibaragi','tsukuba'],
  ['古河','ibaragi','yuki'],['結城','ibaragi','yuki'],
  ['鹿嶋','ibaragi','kashima'],['神栖','ibaragi','kashima'],['潮来','ibaragi','kashima'],
  // 栃木
  ['宇都宮','tochigi','utsunomiya'],
  ['日光','tochigi','nikko'],['中禅寺','tochigi','nikko'],
  ['鬼怒川','tochigi','kinugawa'],['川治','tochigi','kinugawa'],
  ['那須','tochigi','nasu'],['黒磯','tochigi','nasu'],
  ['塩原','tochigi','shiobara'],['矢板','tochigi','shiobara'],
  ['小山','tochigi','koyama'],['足利','tochigi','koyama'],['佐野','tochigi','koyama'],
  // 群馬
  ['前橋','gunma','maebashi'],['赤城','gunma','maebashi'],
  ['伊香保','gunma','ikaho'],['渋川','gunma','ikaho'],
  ['草津','gunma','kusatsu'],
  ['水上','gunma','numata'],['沼田','gunma','numata'],
  ['高崎','gunma','takasaki'],
  ['富岡','gunma','fujioka'],['藤岡','gunma','fujioka'],
  // 埼玉
  ['大宮','saitama','saitama'],['浦和','saitama','saitama'],['川口','saitama','saitama'],
  ['越谷','saitama','kasukabe'],['春日部','saitama','kasukabe'],
  ['熊谷','saitama','kumagaya'],['深谷','saitama','kumagaya'],
  ['川越','saitama','kawagoe'],['志木','saitama','kawagoe'],
  ['所沢','saitama','tokorozawa'],['飯能','saitama','tokorozawa'],
  ['秩父','saitama','chichibu'],
  // 千葉
  ['千葉市','tiba','chiba'],
  ['浦安','tiba','keiyo'],['船橋','tiba','keiyo'],['幕張','tiba','keiyo'],
  ['松戸','tiba','kashiwa'],['柏','tiba','kashiwa'],
  ['成田','tiba','narita'],['佐倉','tiba','narita'],
  ['銚子','tiba','choshi'],['九十九里','tiba','choshi'],['東金','tiba','choshi'],
  ['鴨川','tiba','sotobo'],['勝浦','tiba','sotobo'],
  ['館山','tiba','tateyama'],['南房総','tiba','tateyama'],
  ['木更津','tiba','uchibo'],['君津','tiba','uchibo'],
  // 東京
  ['東京','tokyo','tokyo'],['新宿','tokyo','tokyo'],['渋谷','tokyo','tokyo'],['銀座','tokyo','tokyo'],
  ['品川','tokyo','tokyo'],['池袋','tokyo','tokyo'],['上野','tokyo','tokyo'],['浅草','tokyo','tokyo'],
  ['立川','tokyo','nishi'],['八王子','tokyo','nishi'],['町田','tokyo','nishi'],
  ['青梅','tokyo','okutama'],['奥多摩','tokyo','okutama'],
  // 神奈川
  ['横浜','kanagawa','yokohama'],['川崎','kanagawa','kawasaki'],
  ['箱根','kanagawa','hakone'],['小田原','kanagawa','odawara'],
  ['湯河原','kanagawa','yugawara'],['真鶴','kanagawa','yugawara'],
  ['相模湖','kanagawa','sagamiko'],['丹沢','kanagawa','sagamiko'],
  ['相模原','kanagawa','sagamihara'],['大和','kanagawa','sagamihara'],
  ['厚木','kanagawa','ebina'],['海老名','kanagawa','ebina'],['伊勢原','kanagawa','ebina'],
  ['鎌倉','kanagawa','shonan'],['藤沢','kanagawa','shonan'],['平塚','kanagawa','shonan'],['茅ヶ崎','kanagawa','shonan'],
  ['横須賀','kanagawa','miura'],['三浦','kanagawa','miura'],
  // 新潟
  ['新潟市','niigata','niigata'],
  ['月岡','niigata','kaetsu'],['瀬波','niigata','kaetsu'],
  ['長岡','niigata','kita'],['燕','niigata','kita'],['三条','niigata','kita'],['柏崎','niigata','kita'],
  ['魚沼','niigata','minami'],['十日町','niigata','minami'],['六日町','niigata','minami'],
  ['湯沢','niigata','yuzawa'],['苗場','niigata','yuzawa'],
  ['上越','niigata','joetsu'],['糸魚川','niigata','joetsu'],['妙高','niigata','joetsu'],
  ['佐渡','niigata','sado'],
  // 富山
  ['富山市','toyama','toyama'],['立山','toyama','toyama'],
  ['魚津','toyama','goto'],['黒部','toyama','goto'],['宇奈月','toyama','goto'],
  ['高岡','toyama','gosei'],['氷見','toyama','gosei'],['砺波','toyama','gosei'],
  // 石川
  ['金沢','ishikawa','kanazawa'],
  ['加賀','ishikawa','kaga'],['小松','ishikawa','kaga'],
  ['能登','ishikawa','noto'],['輪島','ishikawa','noto'],['珠洲','ishikawa','noto'],
  ['七尾','ishikawa','nanao'],['和倉','ishikawa','nanao'],
  // 福井
  ['福井市','hukui','hukui'],
  ['あわら','hukui','awara'],['三国','hukui','awara'],
  ['永平寺','hukui','katsuyama'],['勝山','hukui','katsuyama'],
  ['越前','hukui','echizen'],['鯖江','hukui','echizen'],
  ['敦賀','hukui','tsuruga'],
  ['小浜','hukui','obama'],['若狭','hukui','obama'],
  // 山梨
  ['甲府','yamanasi','kofu'],
  ['山梨市','yamanasi','yamanashi'],['石和','yamanasi','yamanashi'],['勝沼','yamanasi','yamanashi'],
  ['山中湖','yamanasi','yamanakako'],['忍野','yamanasi','yamanakako'],
  ['河口湖','yamanasi','kawaguchiko'],['富士吉田','yamanasi','kawaguchiko'],
  ['清里','yamanasi','kiyosato'],['小淵沢','yamanasi','kiyosato'],
  // 長野
  ['長野市','nagano','nagano'],['戸隠','nagano','nagano'],
  ['野沢温泉','nagano','nozawa'],
  ['志賀高原','nagano','shiga'],['湯田中','nagano','shiga'],
  ['上田','nagano','ueda'],['別所','nagano','ueda'],
  ['軽井沢','nagano','karui'],['佐久','nagano','karui'],['小諸','nagano','karui'],
  ['蓼科','nagano','kirigamine'],['白樺湖','nagano','kirigamine'],['霧ヶ峰','nagano','kirigamine'],
  ['諏訪','nagano','suwa'],
  ['伊那','nagano','ina'],['駒ヶ根','nagano','ina'],['飯田','nagano','ina'],['昼神','nagano','ina'],
  ['木曽','nagano','kiso'],
  ['松本','nagano','matsumo'],['浅間温泉','nagano','matsumo'],
  ['上高地','nagano','kamiko'],['乗鞍','nagano','kamiko'],
  ['安曇野','nagano','hotaka'],['穂高','nagano','hotaka'],['大町','nagano','hotaka'],
  ['白馬','nagano','hakuba'],['八方','nagano','hakuba'],
  // 岐阜
  ['岐阜市','gihu','gifu'],['各務原','gihu','gifu'],
  ['奥飛騨','gihu','kamitakara'],['新穂高','gihu','kamitakara'],
  ['高山','gihu','takayama'],['飛騨','gihu','takayama'],
  ['下呂','gihu','gero'],
  ['中津川','gihu','tajimi'],['多治見','gihu','tajimi'],
  ['郡上','gihu','gujo'],
  ['白川郷','gihu','shirakawago'],
  ['大垣','gihu','ogaki'],
  // 静岡
  ['静岡市','shizuoka','shizuoka'],['清水','shizuoka','shizuoka'],
  ['熱海','shizuoka','atami'],['伊東','shizuoka','ito'],
  ['伊豆高原','shizuoka','izukogen'],
  ['東伊豆','shizuoka','higashi'],['河津','shizuoka','higashi'],
  ['下田','shizuoka','shimoda'],['南伊豆','shizuoka','shimoda'],
  ['西伊豆','shizuoka','nishi'],['堂ヶ島','shizuoka','nishi'],
  ['修善寺','shizuoka','naka'],['伊豆長岡','shizuoka','naka'],
  ['富士市','shizuoka','fuji'],['富士宮','shizuoka','fuji'],
  ['御殿場','shizuoka','numazu'],['沼津','shizuoka','numazu'],['三島','shizuoka','numazu'],
  ['浜松','shizuoka','hamamatsu'],['浜名湖','shizuoka','hamamatsu'],
  ['掛川','shizuoka','kikugawa'],['袋井','shizuoka','kikugawa'],
  // 愛知
  ['名古屋','aichi','nagoyashi'],
  ['豊橋','aichi','mikawawan'],['蒲郡','aichi','mikawawan'],
  ['豊田','aichi','mikawa'],['岡崎','aichi','mikawa'],['刈谷','aichi','mikawa'],
  ['一宮','aichi','owari'],['犬山','aichi','owari'],['小牧','aichi','owari'],['春日井','aichi','owari'],
  ['知多','aichi','chita'],['半田','aichi','chita'],
  ['南知多','aichi','minamichita'],['日間賀','aichi','minamichita'],
  // 三重
  ['津市','mie','tsu'],['鈴鹿','mie','tsu'],
  ['四日市','mie','yunoyama'],['桑名','mie','yunoyama'],['長島','mie','yunoyama'],
  ['伊賀','mie','iga'],['名張','mie','iga'],
  ['松阪','mie','matsusaka'],
  ['伊勢','mie','ise'],['二見','mie','ise'],
  ['鳥羽','mie','toba'],
  ['志摩','mie','shima'],['賢島','mie','shima'],
  ['熊野','mie','kumano'],['尾鷲','mie','kumano'],
  // 滋賀
  ['大津','shiga','ootsu'],['草津市','shiga','ootsu'],
  ['高島','shiga','kosei'],['マキノ','shiga','kosei'],
  ['長浜','shiga','kohoku'],['米原','shiga','kohoku'],
  ['彦根','shiga','kotou'],['近江八幡','shiga','kotou'],
  ['信楽','shiga','shigaraki'],['甲賀','shiga','shigaraki'],
  // 京都
  ['京都市','kyoto','shi'],['嵐山','kyoto','shi'],['祇園','kyoto','shi'],
  ['宇治','kyoto','nannbu'],['長岡京','kyoto','nannbu'],
  ['亀岡','kyoto','yunohana'],['美山','kyoto','yunohana'],
  ['福知山','kyoto','fukuchiyama'],['綾部','kyoto','fukuchiyama'],
  ['丹後','kyoto','hokubu'],['久美浜','kyoto','hokubu'],
  ['天橋立','kyoto','miyazu'],['宮津','kyoto','miyazu'],['舞鶴','kyoto','miyazu'],
  // 大阪
  ['大阪市','osaka','shi'],['梅田','osaka','shi'],['難波','osaka','shi'],['新大阪','osaka','shi'],
  ['高槻','osaka','hokubu'],['茨木','osaka','hokubu'],['箕面','osaka','hokubu'],
  ['枚方','osaka','toubu'],['東大阪','osaka','toubu'],
  ['堺','osaka','nanbu'],['岸和田','osaka','nanbu'],['関西空港','osaka','nanbu'],
  // 兵庫
  ['神戸','hyogo','kobe'],['有馬','hyogo','kobe'],
  ['宝塚','hyogo','nantou'],['西宮','hyogo','nantou'],['三田','hyogo','nantou'],['篠山','hyogo','nantou'],
  ['明石','hyogo','minamichu'],['加古川','hyogo','minamichu'],
  ['姫路','hyogo','nannansei'],['相生','hyogo','nannansei'],['赤穂','hyogo','nannansei'],
  ['城崎','hyogo','kita'],['豊岡','hyogo','kita'],
  ['香住','hyogo','kasumi'],['浜坂','hyogo','kasumi'],['湯村','hyogo','kasumi'],
  ['淡路','hyogo','awaji'],
  // 奈良
  ['奈良市','nara','nara'],
  ['橿原','nara','hokubu'],['大和郡山','nara','hokubu'],['天理','nara','hokubu'],
  ['吉野','nara','nanbu'],['十津川','nara','nanbu'],
  // 和歌山
  ['和歌山市','wakayama','wakayama'],
  ['高野山','wakayama','Kihoku'],
  ['御坊','wakayama','gobo'],['有田','wakayama','gobo'],
  ['白浜','wakayama','shirahama'],['田辺','wakayama','shirahama'],['龍神','wakayama','shirahama'],
  ['勝浦','wakayama','Katsuura'],['串本','wakayama','Katsuura'],
  ['熊野','wakayama','hongu'],['新宮','wakayama','hongu'],
  // 鳥取
  ['鳥取市','tottori','tottori'],['岩美','tottori','tottori'],
  ['倉吉','tottori','chubu'],['三朝','tottori','chubu'],
  ['米子','tottori','seibu'],['皆生','tottori','seibu'],['大山','tottori','seibu'],
  // 島根
  ['松江','simane','matsue'],['玉造','simane','matsue'],['安来','simane','matsue'],['出雲','simane','toubu'],
  ['大田','simane','toubu'],['石見銀山','simane','toubu'],
  ['益田','simane','masuda'],['津和野','simane','masuda'],['浜田','simane','masuda'],
  ['隠岐','simane','ritou'],
  // 岡山
  ['岡山市','okayama','okayama'],
  ['倉敷','okayama','kurashiki'],['総社','okayama','kurashiki'],
  ['津山','okayama','tsuyama'],['湯郷','okayama','tsuyama'],
  ['湯原','okayama','niimi'],['蒜山','okayama','niimi'],
  // 広島
  ['広島市','hiroshima','hiroshima'],
  ['東広島','hiroshima','higashihiroshima'],['竹原','hiroshima','higashihiroshima'],
  ['福山','hiroshima','fukuyama'],['尾道','hiroshima','fukuyama'],
  ['呉','hiroshima','kure'],
  ['宮島','hiroshima','miyajima'],['廿日市','hiroshima','miyajima'],
  // 山口
  ['山口市','yamaguchi','yamaguchi'],['湯田','yamaguchi','yamaguchi'],['防府','yamaguchi','yamaguchi'],
  ['下関','yamaguchi','shimonoseki'],['宇部','yamaguchi','shimonoseki'],
  ['岩国','yamaguchi','iwakuni'],['周南','yamaguchi','iwakuni'],
  ['萩','yamaguchi','hagi'],['長門','yamaguchi','hagi'],['秋吉台','yamaguchi','hagi'],
  // 徳島
  ['徳島市','tokushima','tokushima'],['鳴門','tokushima','tokushima'],
  ['大歩危','tokushima','hokubu'],['祖谷','tokushima','hokubu'],
  ['阿南','tokushima','nanbu'],['日和佐','tokushima','nanbu'],
  // 香川
  ['高松','kagawa','takamatsu'],
  ['坂出','kagawa','sakaide'],['丸亀','kagawa','sakaide'],
  ['琴平','kagawa','kotohira'],
  ['小豆島','kagawa','ritou'],['直島','kagawa','ritou'],
  // 愛媛
  ['松山','ehime','chuuyo'],['道後','ehime','chuuyo'],
  ['今治','ehime','touyo'],
  ['新居浜','ehime','saijo'],['四国中央','ehime','saijo'],
  ['宇和島','ehime','nanyo'],['八幡浜','ehime','nanyo'],
  // 高知
  ['高知市','kouchi','kouchi'],['南国','kouchi','kouchi'],
  ['室戸','kouchi','toubu'],
  ['四万十','kouchi','seibu'],['足摺','kouchi','seibu'],
  // 福岡
  ['福岡市','hukuoka','fukuoka'],['博多','hukuoka','fukuoka'],['太宰府','hukuoka','fukuoka'],
  ['天神','hukuoka','seibu'],['糸島','hukuoka','seibu'],
  ['北九州','hukuoka','kitakyusyu'],
  ['飯塚','hukuoka','chikuzen'],['宗像','hukuoka','chikuzen'],
  ['久留米','hukuoka','kurume'],['原鶴','hukuoka','kurume'],
  ['大牟田','hukuoka','chikugo'],['柳川','hukuoka','chikugo'],
  // 佐賀
  ['佐賀市','saga','saga'],
  ['鳥栖','saga','tosu'],
  ['嬉野','saga','ureshino'],['武雄','saga','ureshino'],['有田','saga','ureshino'],
  ['唐津','saga','karatsu'],['呼子','saga','karatsu'],
  // 長崎
  ['長崎市','nagasaki','nagasaki'],
  ['雲仙','nagasaki','unzen'],['島原','nagasaki','unzen'],
  ['諫早','nagasaki','airport'],['大村','nagasaki','airport'],
  ['佐世保','nagasaki','sasebo'],['平戸','nagasaki','sasebo'],
  ['五島','nagasaki','ritou'],
  ['対馬','nagasaki','tsushima'],['壱岐','nagasaki','iki'],
  // 熊本
  ['熊本市','kumamoto','kumamoto'],
  ['玉名','kumamoto','kikuchi'],['山鹿','kumamoto','kikuchi'],['阿蘇','kumamoto','aso'],
  ['八代','kumamoto','yatsushiro'],
  ['人吉','kumamoto','kuma'],['球磨','kumamoto','kuma'],
  ['天草','kumamoto','amakusa'],
  ['黒川温泉','kumamoto','kurokawa'],['杖立','kumamoto','kurokawa'],
  // 大分
  ['大分市','ooita','oita'],
  ['別府','ooita','beppu'],['日出','ooita','beppu'],
  ['佐伯','ooita','usuki'],['臼杵','ooita','usuki'],
  ['湯布院','ooita','yufuin'],['由布院','ooita','yufuin'],
  ['久住','ooita','taketa'],['竹田','ooita','taketa'],
  ['九重','ooita','hita'],['日田','ooita','hita'],
  ['中津','ooita','kunisaki'],['宇佐','ooita','kunisaki'],['国東','ooita','kunisaki'],
  // 宮崎
  ['宮崎市','miyazaki','miyazaki'],
  ['延岡','miyazaki','hokubu'],['日向','miyazaki','hokubu'],['高千穂','miyazaki','hokubu'],
  ['都城','miyazaki','nanbu'],['日南','miyazaki','nanbu'],['えびの','miyazaki','nanbu'],
  // 鹿児島
  ['鹿児島市','kagoshima','kagoshima'],['桜島','kagoshima','kagoshima'],
  ['霧島','kagoshima','oosumi'],['国分','kagoshima','oosumi'],
  ['鹿屋','kagoshima','kanoya'],
  ['川内','kagoshima','hokusatsu'],['出水','kagoshima','hokusatsu'],
  ['指宿','kagoshima','nansatsu'],['枕崎','kagoshima','nansatsu'],
  ['屋久島','kagoshima','yakushima'],
  ['奄美','kagoshima','amami'],
  // 沖縄
  ['那覇','okinawa','nahashi'],
  ['恩納','okinawa','hokubu'],['名護','okinawa','hokubu'],['本部','okinawa','hokubu'],
  ['宜野湾','okinawa','chubu'],['北谷','okinawa','chubu'],['沖縄市','okinawa','chubu'],
  ['糸満','okinawa','nanbu'],['豊見城','okinawa','nanbu'],
  ['久米島','okinawa','kumejima'],
  ['宮古島','okinawa','Miyako'],['石垣','okinawa','ritou'],['西表','okinawa','ritou'],
];

function findAreaCodes(address, cityName, middleCode) {
  const target = (address + ' ' + cityName).replace(/\s+/g,' ');
  for (const [keyword, mid, small] of AREA_MAP) {
    if (mid === middleCode && target.includes(keyword)) {
      return small;
    }
  }
  return '';
}

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
    if (!applicationId || !accessKey) { res.status(500).send('Missing API credentials.'); return; }

    const prefName   = pref || (address.match(/(.+?[都道府県])/)||[])[1] || '';
    const cityName   = (address.match(/[都道府県](.+?[市区町村郡])/)||[])[1] || '';
    const middleCode = PREF_MIDDLE[prefName] || '';
    const smallCode  = middleCode ? findAreaCodes(address, cityName, middleCode) : '';

    function toDateStr(d) { return d.toISOString().slice(0, 10); }
    const today    = new Date();
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const checkinDate  = checkin  || toDateStr(today);
    const checkoutDate = checkout || toDateStr(tomorrow);

    const hdrs = {
      'User-Agent': 'GolfJourneyRoulette/1.0',
      'Referer':    'https://golf-premium-v1.vercel.app/',
      'Origin':     'https://golf-premium-v1.vercel.app',
    };

    async function fetchJSON(url) {
      for (let i = 0; i <= 2; i++) {
        const r = await fetch(url, { headers: hdrs });
        if (r.status === 429) { await new Promise(r => setTimeout(r, 1200)); continue; }
        if (!r.ok) return null;
        return await r.json();
      }
      return null;
    }

    function buildUrl(extra = {}) {
      const u = new URL('https://openapi.rakuten.co.jp/engine/api/Travel/VacantHotelSearch/20170426');
      u.searchParams.set('format','json');
      u.searchParams.set('formatVersion','2');
      u.searchParams.set('applicationId', applicationId);
      u.searchParams.set('accessKey', accessKey);
      if (affiliateId) u.searchParams.set('affiliateId', affiliateId);
      u.searchParams.set('checkinDate', checkinDate);
      u.searchParams.set('checkoutDate', checkoutDate);
      u.searchParams.set('adultNum', String(Math.min(10,Math.max(1,parseInt(adults)||1))));
      u.searchParams.set('roomNum',  String(Math.min(10,Math.max(1,parseInt(rooms) ||1))));
      u.searchParams.set('hits','30');
      u.searchParams.set('page','1');
      u.searchParams.set('sort','+roomCharge');
      u.searchParams.set('responseType','middle');
      if (squeeze) u.searchParams.set('squeezeCondition', squeeze);
      Object.entries(extra).forEach(([k,v]) => u.searchParams.set(k, v));
      return u.toString();
    }

    function parseHotels(data) {
      if (!data) return [];
      return (data.hotels || []).map(h => {
        const arr    = Array.isArray(h.hotel) ? h.hotel : [];
        const basic  = (arr.find(x => x.hotelBasicInfo)  ||{}).hotelBasicInfo  ||{};
        const rating = (arr.find(x => x.hotelRatingInfo) ||{}).hotelRatingInfo ||{};
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

    function merge(base, adds) {
      const seen = new Set(base.map(h => h.hotelNo));
      adds.forEach(h => { if (!seen.has(h.hotelNo)) { base.push(h); seen.add(h.hotelNo); } });
      return base;
    }

    let hotels = [];
    let usedKeyword = prefName;

    // ① smallClassCode で検索（市区町村レベル）
    if (middleCode && smallCode) {
      const d = await fetchJSON(buildUrl({
        largeClassCode: 'japan', middleClassCode: middleCode, smallClassCode: smallCode
      }));
      hotels = parseHotels(d);
      usedKeyword = cityName || prefName;
    }

    // ② 結果が少なければ都道府県レベルで検索
    if (hotels.length < 5 && middleCode) {
      const d = await fetchJSON(buildUrl({
        largeClassCode: 'japan', middleClassCode: middleCode
      }));
      hotels = merge(hotels, parseHotels(d));
      usedKeyword = prefName;
    }

    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=1800');
    res.status(200).json({
      ok: true, courseName: name,
      keyword: usedKeyword, middleCode, smallCode,
      checkinDate, checkoutDate,
      count: hotels.length, hotels,
    });

  } catch(e) {
    res.status(500).send(e?.message || 'Server error');
  }
}
