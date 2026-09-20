import { Booth, Product, Facility, Walkway, ZoneArea, MapLegendItem, ModuleSizeSettings } from './types';

export const DEFAULT_BOOTHS: Booth[] = [
  // A區: 時尚潮流 (Fashion & Apparel)
  {
    id: 'A1',
    name: '運動潮流館',
    zone: 'A區: 時尚潮流',
    color: 'teal',
    x: 60,
    y: 60,
    width: 150,
    height: 100,
    description: '匯集各大運動品牌，提供最新的慢跑鞋、運動服飾、潮流球鞋與專業配件。',
  },
  {
    id: 'A2',
    name: '時尚精品男女裝',
    zone: 'A區: 時尚潮流',
    color: 'teal',
    x: 230,
    y: 60,
    width: 150,
    height: 100,
    description: '精選當季歐美日韓流行男女裝、外套、風衣、皮包、與設計師服飾。',
  },
  {
    id: 'A3',
    name: '童裝與玩具樂園',
    zone: 'A區: 時尚潮流',
    color: 'teal',
    x: 60,
    y: 180,
    width: 150,
    height: 100,
    description: '提供各年齡層童裝、嬰幼兒用品，以及熱門玩具、樂高與益智桌遊。',
  },

  // B區: 美妝生活 (Beauty & Lifestyle)
  {
    id: 'B1',
    name: '國際彩妝香氛',
    zone: 'B區: 美妝生活',
    color: 'rose',
    x: 520,
    y: 60,
    width: 140,
    height: 100,
    description: '國際知名化妝品牌、限量唇膏、粉底、眼影以及迷人沙龍香水。',
  },
  {
    id: 'B2',
    name: '個人香氛護理',
    zone: 'B區: 美妝生活',
    color: 'rose',
    x: 680,
    y: 60,
    width: 140,
    height: 100,
    description: '精選洗髮精、沐浴乳、天然精油、身體乳液與專業沙龍級吹風機。',
  },
  {
    id: 'B3',
    name: '文具生活館',
    zone: 'B區: 美妝生活',
    color: 'rose',
    x: 840,
    y: 60,
    width: 140,
    height: 100,
    description: '創意文具、精美筆記本、手帳、萬用卡片、禮品包裝與日常雜貨。',
  },

  // C區: 科技生活 (Digital & Gadgets)
  {
    id: 'C1',
    name: '蘋果與智慧旗艦',
    zone: 'C區: 科技生活',
    color: 'violet',
    x: 60,
    y: 330,
    width: 150,
    height: 110,
    description: '最新 Apple 產品展示、智慧型手機、平板電腦、防摔手機殼與快充配件。',
  },
  {
    id: 'C2',
    name: '智能家電體驗館',
    zone: 'C區: 科技生活',
    color: 'violet',
    x: 230,
    y: 330,
    width: 150,
    height: 110,
    description: '手持吸塵器、空氣清淨機、全自動咖啡機、智能電視與廚房家電。',
  },

  // D區: 美食天地 (Gourmet Food Court)
  {
    id: 'D1',
    name: '經典日式拉麵',
    zone: 'D區: 美食天地',
    color: 'amber',
    x: 520,
    y: 200,
    width: 140,
    height: 100,
    description: '濃郁豚骨拉麵、香脆日式餃子、經典天婦羅與冰涼日式綠茶。',
  },
  {
    id: 'D2',
    name: '精品咖啡與甜點',
    zone: 'D區: 美食天地',
    color: 'amber',
    x: 680,
    y: 200,
    width: 140,
    height: 100,
    description: '手沖精品咖啡、現烤肉桂捲、起司蛋糕、馬卡龍與舒心下午茶。',
  },
  {
    id: 'D3',
    name: '懷舊台式美食',
    zone: 'D區: 美食天地',
    color: 'amber',
    x: 840,
    y: 200,
    width: 140,
    height: 100,
    description: '招牌紅燒牛肉麵、香 Q 珍珠奶茶、秘製滷肉飯與經典台式小吃。',
  },

  // E區: 鮮綠超市 (Fresh Supermarket)
  {
    id: 'E1',
    name: '有機生鮮蔬果',
    zone: 'E區: 鮮綠超市',
    color: 'emerald',
    x: 520,
    y: 340,
    width: 140,
    height: 110,
    description: '在地小農直送有機蔬菜、產銷履歷水果、進口藍莓與產地直送酪梨。',
  },
  {
    id: 'E2',
    name: '冷鏈急凍食品',
    zone: 'E區: 鮮綠超市',
    color: 'emerald',
    x: 680,
    y: 340,
    width: 140,
    height: 110,
    description: '鮮肉手工水餃、義式急凍披薩、頂級盒裝冰淇淋與海鮮冷凍食材。',
  },
  {
    id: 'E3',
    name: '休閒零嘴飲料',
    zone: 'E區: 鮮綠超市',
    color: 'emerald',
    x: 840,
    y: 340,
    width: 140,
    height: 110,
    description: '各國進口洋芋片、榛果巧克力、冰涼可口可樂、無糖氣泡水與啤酒。',
  }
];

export const DEFAULT_PRODUCTS: Product[] = [
  // A1: 運動潮流館
  {
    id: 'p1_1',
    name: '極速氣墊慢跑鞋',
    category: '鞋類 / 運動裝備',
    tags: ['慢跑鞋', '慢跑', '鞋子', '氣墊', '運動鞋', '跑鞋', 'NIKE', 'ADIDAS'],
    description: '採用最新高回彈氣墊技術，提供絕佳的腳感反饋，適合日常訓練與中長跑。',
    price: 3280,
    boothId: 'A1',
  },
  {
    id: 'p1_2',
    name: '吸濕排汗運動機能衣',
    category: '服飾 / 運動裝備',
    tags: ['短袖', '機能衣', '運動服', '排汗衫', '排汗', '健身', 'T恤'],
    description: '專為高強度運動設計的排汗布料，迅速帶走熱量與汗水，保持身體乾爽。',
    price: 980,
    boothId: 'A1',
  },
  {
    id: 'p1_3',
    name: '防滑專業瑜伽墊',
    category: '健身器材',
    tags: ['瑜伽', '瑜珈墊', '防滑', '拉伸', '無毒', '運動'],
    description: '厚度 6mm 的雙面防滑環保材質，親膚且支撐力強，附贈專用收納網袋與背帶。',
    price: 1200,
    boothId: 'A1',
  },

  // A2: 時尚精品男女裝
  {
    id: 'p2_1',
    name: '英倫風雙排扣風衣',
    category: '女裝 / 外套',
    tags: ['外套', '風衣', '大衣', '英倫風', '穿搭', '防風', 'Zara'],
    description: '經典優雅版型，抗皺防潑水布料，附腰帶，不論通勤或休閒都十分百搭。',
    price: 4500,
    boothId: 'A2',
  },
  {
    id: 'p2_2',
    name: '經典真皮斜背包',
    category: '配件 / 精品包款',
    tags: ['皮包', '斜背包', '真皮', '小包', '精品', '女包'],
    description: '採用頂級牛皮製作，五金質感精緻，內部多隔層設計，完美收納小物件。',
    price: 5800,
    boothId: 'A2',
  },
  {
    id: 'p2_3',
    name: '純棉舒適圓領衛衣',
    category: '男裝 / 休閒服飾',
    tags: ['衛衣', '大學T', '純棉', '長袖', '休閒', '上衣'],
    description: '厚磅純棉毛圈布料，內裡親膚柔軟，寬鬆版型，隨意搭配牛仔褲即可出門。',
    price: 1480,
    boothId: 'A2',
  },

  // A3: 童裝與玩具樂園
  {
    id: 'p3_1',
    name: '樂高經典創意拼砌箱',
    category: '玩具 / 積木',
    tags: ['樂高', 'LEGO', '積木', '拼圖', '創意', '兒童玩具', '益智'],
    description: '包含豐富色彩的經典樂高積木，啟發孩童無限空間想像力與手眼協調力。',
    price: 1299,
    boothId: 'A3',
  },
  {
    id: 'p3_2',
    name: '純棉卡通連身包屁衣',
    category: '嬰幼兒 / 童裝',
    tags: ['嬰兒服', '包屁衣', '童裝', '純棉', '連身衣', '卡通'],
    description: '100% 精梳棉，無螢光劑。親膚舒適，開襟排扣設計方便爸媽替寶寶更換尿布。',
    price: 590,
    boothId: 'A3',
  },

  // B1: 國際彩妝香氛
  {
    id: 'p4_1',
    name: '絲絨霧面經典純色唇膏',
    category: '美妝 / 唇彩',
    tags: ['唇膏', '口紅', '唇蜜', '化妝', '美妝', '霧面', '彩妝'],
    description: '極致飽和度與絲絨質地，一抹滑順不顯唇紋，持色長達 8 小時，展現完美氣場。',
    price: 1350,
    boothId: 'B1',
  },
  {
    id: 'p4_2',
    name: '無瑕恆久持妝粉底液',
    category: '美妝 / 底妝',
    tags: ['粉底', '粉底液', '防曬', '遮瑕', '持妝', '底妝', '美妝'],
    description: '超微細粉體能完美修飾毛孔瑕疵，控油耐汗，讓肌膚維持整天精緻的微霧光澤。',
    price: 1980,
    boothId: 'B1',
  },
  {
    id: 'p4_3',
    name: '午後晨曦沙龍淡香水',
    category: '香氛 / 香水',
    tags: ['香水', '香氛', '沙龍香', '淡香水', '花香', '柑橘調'],
    description: '前調以清新柑橘與佛手柑開場，中調揉合白玫瑰與綠茶，尾韻是溫暖安穩的木質麝香。',
    price: 3600,
    boothId: 'B1',
  },

  // B2: 個人香氛護理
  {
    id: 'p5_1',
    name: '草本頭皮淨化洗髮精',
    category: '個人護理 / 髮品',
    tags: ['洗髮精', '頭皮護理', '草本', '控油', '薄荷', '無矽靈'],
    description: '蘊含茶樹、迷迭香與薄荷萃取，溫和淨化頭皮多餘油脂，洗後蓬鬆清爽不緊繃。',
    price: 680,
    boothId: 'B2',
  },
  {
    id: 'p5_2',
    name: '負離子大風量極速吹風機',
    category: '生活家電 / 美髮',
    tags: ['吹風機', '負離子', '大風量', '護髮', '快乾', '沙龍級'],
    description: '千萬級負離子技術，有效撫平秀髮毛躁，鎖住核心水分。多段溫控，快速吹乾。',
    price: 2480,
    boothId: 'B2',
  },

  // B3: 文具生活館
  {
    id: 'p6_1',
    name: '極簡皮質萬用手帳',
    category: '文具 / 紙製品',
    tags: ['筆記本', '手帳', '皮質', '萬用手帳', '鋼筆可用', '行事曆'],
    description: '柔軟仿皮封面，內頁使用 100g 優質道林紙，書寫流暢不滲墨，格線設計井然有序。',
    price: 420,
    boothId: 'B3',
  },
  {
    id: 'p6_2',
    name: '職人靜音按壓式中性筆組',
    category: '文具 / 書寫工具',
    tags: ['原子筆', '中性筆', '靜音', '速乾', '文具', '辦公用品'],
    description: '特殊按壓緩衝機構，極致安靜。速乾油墨不易暈染，握持舒適，適合長時間書寫。',
    price: 180,
    boothId: 'B3',
  },

  // C1: 蘋果與智慧旗艦
  {
    id: 'p7_1',
    name: '智慧旗艦智慧型手機 Pro Max',
    category: '3C 數位 / 行動裝置',
    tags: ['iPhone', '手機', '智慧手機', '行動電話', 'Apple', 'Pro Max', '相機'],
    description: '搭載最新旗艦處理器，擁有專業級三鏡頭攝影系統，夜拍與錄影功能極致升級。',
    price: 37900,
    boothId: 'C1',
  },
  {
    id: 'p7_2',
    name: '軍規防摔氣囊手機殼',
    category: '3C 配件',
    tags: ['手機殼', '防摔殼', '保護套', '軍規', '抗震', 'MagSafe'],
    description: '邊角專利氣囊防撞設計，通過 3 米防摔測試，支援 MagSafe 磁吸無線充電。',
    price: 890,
    boothId: 'C1',
  },

  // C2: 智能家電體驗館
  {
    id: 'p8_1',
    name: '無塵感無線手持吸塵器',
    category: '智能家電 / 清潔',
    tags: ['吸塵器', '無線吸塵器', '手持吸塵器', '除塵蟎', 'Dyson', '強勁吸力'],
    description: '智慧感應粉塵量自動調速，強效除蟎吸頭，長達 60 分鐘續航力，全家清潔無死角。',
    price: 16900,
    boothId: 'C2',
  },
  {
    id: 'p8_2',
    name: '全自動美式研磨咖啡機',
    category: '廚房家電 / 咖啡',
    tags: ['咖啡機', '磨豆機', '全自動', '美式咖啡', '手沖風', '咖啡豆'],
    description: '內建錐磨磨豆器，多段研磨粗細可調，預約定時，一鍵泡出宛如大師手沖的醇香咖啡。',
    price: 4980,
    boothId: 'C2',
  },

  // D1: 經典日式拉麵
  {
    id: 'p9_1',
    name: '黃金特濃豚骨拉麵',
    category: '熟食 / 日式料理',
    tags: ['拉麵', '日式拉麵', '豚骨', '叉燒', '糖心蛋', '日式', '麵食', '美食街'],
    description: '慢火熬煮 12 小時的濃厚豚骨高湯，搭配秘製梅花叉燒、糖心蛋與彈牙日式拉麵。',
    price: 240,
    boothId: 'D1',
  },
  {
    id: 'p9_2',
    name: '黃金日式炸餃子',
    category: '熟食 / 單點副食',
    tags: ['煎餃', '炸餃子', '日式餃子', '點心', '香脆', '熟食'],
    description: '外皮金黃酥脆，內餡飽滿多汁，咬下時散發鮮美豬肉與韭黃香氣，是拉麵的最佳搭檔。',
    price: 80,
    boothId: 'D1',
  },

  // D2: 精品咖啡與甜點
  {
    id: 'p10_1',
    name: '經典燕麥奶熱拿鐵',
    category: '飲品 / 咖啡',
    tags: ['拿鐵', '咖啡', '熱拿鐵', '燕麥奶', '拿鐵咖啡', '星巴克', 'Starbucks'],
    description: '選用中深烘焙阿拉比卡咖啡豆，結合香醇植物燕麥奶，調和出柔順甘甜的極致口感。',
    price: 150,
    boothId: 'D2',
  },
  {
    id: 'p10_2',
    name: '招牌肉桂捲（熔岩焦糖）',
    category: '甜點 / 下午茶',
    tags: ['肉桂捲', '焦糖', '蛋糕', '甜點', '下午茶', '麵包', '烘焙'],
    description: '外酥內軟，層層包裹濃厚肉桂辛香，淋上特製手作溫熱焦糖醬與香草奶油乳酪。',
    price: 120,
    boothId: 'D2',
  },

  // D3: 懷舊台式美食
  {
    id: 'p11_1',
    name: '私房紅燒牛肉麵',
    category: '熟食 / 中式料理',
    tags: ['牛肉麵', '紅燒', '牛腱心', '麵食', '台式', '川味', '傳統美食'],
    description: '特選半筋半肉黃牛腱，以數十種中藥材慢火精燉，湯頭濃郁香辣，麵體勁道十足。',
    price: 220,
    boothId: 'D3',
  },
  {
    id: 'p11_2',
    name: '經典黑糖珍珠鮮奶茶',
    category: '飲品 / 台式茶飲',
    tags: ['珍奶', '珍珠奶茶', '手搖杯', '黑糖', '鮮奶茶', '波霸', '飲料'],
    description: '每日手工手炒黑糖蜜漬波霸珍珠，Q 彈有嚼勁，倒入百分之百小農鮮乳，香濃絕配。',
    price: 75,
    boothId: 'D3',
  },

  // E1: 有機生鮮蔬果
  {
    id: 'p12_1',
    name: '青森王林青森蘋果',
    category: '生鮮 / 水果',
    tags: ['蘋果', '王林', '青森蘋果', '水果', '有機', '進口'],
    description: '日本青森空運直送，果皮黃綠，甜度極高且香氣四溢，果肉細緻爽脆。',
    price: 69,
    boothId: 'E1',
  },
  {
    id: 'p12_2',
    name: '有機高山高麗菜',
    category: '生鮮 / 蔬菜',
    tags: ['高麗菜', '蔬菜', '有機蔬菜', '小農', '高山高麗菜', '清甜'],
    description: '產自梨山高海拔有機農場，口感清脆甘甜，極適合清炒或用於火鍋。',
    price: 99,
    boothId: 'E1',
  },

  // E2: 冷鏈急凍食品
  {
    id: 'p13_1',
    name: '手作爆汁高麗菜豬肉水餃',
    category: '冷凍食品 / 點心',
    tags: ['水餃', '冷凍水餃', '豬肉水餃', '手工水餃', '宵夜', '快煮'],
    description: '精選在地豬前腿肉與鮮甜高麗菜，純手工擀皮，顆顆飽滿爆汁，無添加防腐劑。',
    price: 180,
    boothId: 'E2',
  },
  {
    id: 'p13_2',
    name: '義式極致經典瑪格麗特披薩',
    category: '冷凍食品 / 快餐',
    tags: ['披薩', 'Pizza', '冷凍披薩', '瑪格麗特', '起司', '義式'],
    description: '純天然小麥麵糰窯烤，鋪滿特製蕃茄糊、莫札瑞拉起司與新鮮羅勒葉。烤箱 8 分鐘即可享用。',
    price: 220,
    boothId: 'E2',
  },

  // E3: 休閒零嘴飲料
  {
    id: 'p14_1',
    name: '極致香脆黑松露洋芋片',
    category: '休閒零嘴 / 餅乾',
    tags: ['洋芋片', '松露', '黑松露', '零食', '餅乾', '進口零嘴', '薯片'],
    description: '精選整顆優質馬鈴薯薄切，注入頂級義大利黑松露香氣，酥脆爽口，風味高雅。',
    price: 110,
    boothId: 'E3',
  },
  {
    id: 'p14_2',
    name: '零卡無糖冰爽可口可樂',
    category: '休閒飲品 / 汽水',
    tags: ['可樂', '汽水', '無糖', '零卡', 'Coke', '可口可樂', '飲料', '冰鎮'],
    description: '經典可口可樂冰爽風味，無糖零卡路里、零負擔，夏日消暑、聚會派對必備。',
    price: 25,
    boothId: 'E3',
  }
];

export const ZONE_THEMES: Record<string, { bg: string; text: string; fill: string; border: string; highlightFill: string; accent: string }> = {
  'A區: 時尚潮流': {
    bg: 'bg-teal-50',
    text: 'text-teal-800',
    fill: 'fill-teal-50 hover:fill-teal-100',
    border: 'border-teal-200 stroke-teal-400',
    highlightFill: 'fill-teal-500/20 stroke-teal-600',
    accent: 'teal'
  },
  'B區: 美妝生活': {
    bg: 'bg-rose-50',
    text: 'text-rose-800',
    fill: 'fill-rose-50 hover:fill-rose-100',
    border: 'border-rose-200 stroke-rose-400',
    highlightFill: 'fill-rose-500/20 stroke-rose-600',
    accent: 'rose'
  },
  'C區: 科技生活': {
    bg: 'bg-violet-50',
    text: 'text-violet-800',
    fill: 'fill-violet-50 hover:fill-violet-100',
    border: 'border-violet-200 stroke-violet-400',
    highlightFill: 'fill-violet-500/20 stroke-violet-600',
    accent: 'violet'
  },
  'D區: 美食天地': {
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    fill: 'fill-amber-50 hover:fill-amber-100',
    border: 'border-amber-200 stroke-amber-400',
    highlightFill: 'fill-amber-500/20 stroke-amber-600',
    accent: 'amber'
  },
  'E區: 鮮綠超市': {
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    fill: 'fill-emerald-50 hover:fill-emerald-100',
    border: 'border-emerald-200 stroke-emerald-400',
    highlightFill: 'fill-emerald-500/20 stroke-emerald-600',
    accent: 'emerald'
  }
};

export interface BoothColorOption {
  key: string;
  name: string;
  category: string;
  hex: string;
  fill: string;
  stroke: string;
  text: string;
  badgeBg: string;
  badgeText: string;
  badgeClass: string;
  textClass: string;
  iconClass: string;
}

export const BOOTH_COLOR_OPTIONS: BoothColorOption[] = [
  // 經典分區主題色系
  {
    key: 'teal',
    name: '時尚青 (Teal)',
    category: '主題推薦',
    hex: '#0d9488',
    fill: '#f0fdfa',
    stroke: '#0d9488',
    text: '#0f766e',
    badgeBg: '#ccfbf1',
    badgeText: '#0f766e',
    badgeClass: 'bg-teal-50 text-teal-700 border border-teal-200',
    textClass: 'text-teal-700',
    iconClass: 'text-teal-600'
  },
  {
    key: 'rose',
    name: '美妝粉 (Rose)',
    category: '主題推薦',
    hex: '#e11d48',
    fill: '#fff1f2',
    stroke: '#e11d48',
    text: '#be123c',
    badgeBg: '#ffe4e6',
    badgeText: '#be123c',
    badgeClass: 'bg-rose-50 text-rose-700 border border-rose-200',
    textClass: 'text-rose-700',
    iconClass: 'text-rose-600'
  },
  {
    key: 'violet',
    name: '科技紫 (Violet)',
    category: '主題推薦',
    hex: '#7c3aed',
    fill: '#f5f3ff',
    stroke: '#7c3aed',
    text: '#6d28d9',
    badgeBg: '#ede9fe',
    badgeText: '#6d28d9',
    badgeClass: 'bg-violet-50 text-violet-700 border border-violet-200',
    textClass: 'text-violet-700',
    iconClass: 'text-violet-600'
  },
  {
    key: 'amber',
    name: '美食橘 (Amber)',
    category: '主題推薦',
    hex: '#d97706',
    fill: '#fffbeb',
    stroke: '#d97706',
    text: '#b45309',
    badgeBg: '#fef3c7',
    badgeText: '#b45309',
    badgeClass: 'bg-amber-50 text-amber-700 border border-amber-200',
    textClass: 'text-amber-700',
    iconClass: 'text-amber-600'
  },
  {
    key: 'emerald',
    name: '生鮮綠 (Emerald)',
    category: '主題推薦',
    hex: '#059669',
    fill: '#f0fdf4',
    stroke: '#059669',
    text: '#047857',
    badgeBg: '#d1fae5',
    badgeText: '#047857',
    badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    textClass: 'text-emerald-700',
    iconClass: 'text-emerald-600'
  },

  // 藍靛冷色系
  {
    key: 'blue',
    name: '海洋藍 (Ocean Blue)',
    category: '海洋冷色',
    hex: '#2563eb',
    fill: '#eff6ff',
    stroke: '#2563eb',
    text: '#1d4ed8',
    badgeBg: '#dbeafe',
    badgeText: '#1e40af',
    badgeClass: 'bg-blue-50 text-blue-700 border border-blue-200',
    textClass: 'text-blue-700',
    iconClass: 'text-blue-600'
  },
  {
    key: 'indigo',
    name: '商務靛藍 (Indigo)',
    category: '海洋冷色',
    hex: '#4f46e5',
    fill: '#eef2ff',
    stroke: '#4f46e5',
    text: '#4338ca',
    badgeBg: '#e0e7ff',
    badgeText: '#3730a3',
    badgeClass: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    textClass: 'text-indigo-700',
    iconClass: 'text-indigo-600'
  },
  {
    key: 'sky',
    name: '澄澈天藍 (Sky Blue)',
    category: '海洋冷色',
    hex: '#0284c7',
    fill: '#f0f9ff',
    stroke: '#0284c7',
    text: '#0369a1',
    badgeBg: '#e0f2fe',
    badgeText: '#075985',
    badgeClass: 'bg-sky-50 text-sky-700 border border-sky-200',
    textClass: 'text-sky-700',
    iconClass: 'text-sky-600'
  },
  {
    key: 'cyan',
    name: '霓虹青藍 (Cyan)',
    category: '海洋冷色',
    hex: '#0891b2',
    fill: '#ecfeff',
    stroke: '#0891b2',
    text: '#0e7490',
    badgeBg: '#cffafe',
    badgeText: '#155e75',
    badgeClass: 'bg-cyan-50 text-cyan-700 border border-cyan-200',
    textClass: 'text-cyan-700',
    iconClass: 'text-cyan-600'
  },

  // 暖色活潑色系
  {
    key: 'red',
    name: '旗艦正紅 (Crimson Red)',
    category: '暖陽熱情',
    hex: '#dc2626',
    fill: '#fef2f2',
    stroke: '#dc2626',
    text: '#b91c1c',
    badgeBg: '#fee2e2',
    badgeText: '#991b1b',
    badgeClass: 'bg-red-50 text-red-700 border border-red-200',
    textClass: 'text-red-700',
    iconClass: 'text-red-600'
  },
  {
    key: 'orange',
    name: '活力亮橘 (Bright Orange)',
    category: '暖陽熱情',
    hex: '#ea580c',
    fill: '#fff7ed',
    stroke: '#ea580c',
    text: '#c2410c',
    badgeBg: '#ffedd5',
    badgeText: '#9a3412',
    badgeClass: 'bg-orange-50 text-orange-700 border border-orange-200',
    textClass: 'text-orange-700',
    iconClass: 'text-orange-600'
  },
  {
    key: 'yellow',
    name: '陽光金黃 (Gold Yellow)',
    category: '暖陽熱情',
    hex: '#ca8a04',
    fill: '#fefce8',
    stroke: '#ca8a04',
    text: '#a16207',
    badgeBg: '#fef9c3',
    badgeText: '#854d0e',
    badgeClass: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    textClass: 'text-yellow-700',
    iconClass: 'text-yellow-600'
  },

  // 粉紫浪漫色系
  {
    key: 'pink',
    name: '甜美粉紅 (Soft Pink)',
    category: '粉紫浪漫',
    hex: '#db2777',
    fill: '#fdf2f8',
    stroke: '#db2777',
    text: '#be185d',
    badgeBg: '#fce7f3',
    badgeText: '#9d174d',
    badgeClass: 'bg-pink-50 text-pink-700 border border-pink-200',
    textClass: 'text-pink-700',
    iconClass: 'text-pink-600'
  },
  {
    key: 'fuchsia',
    name: '魅惑桃紅 (Fuchsia)',
    category: '粉紫浪漫',
    hex: '#c026d3',
    fill: '#fdf4ff',
    stroke: '#c026d3',
    text: '#a21caf',
    badgeBg: '#fae8ff',
    badgeText: '#86198f',
    badgeClass: 'bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200',
    textClass: 'text-fuchsia-700',
    iconClass: 'text-fuchsia-600'
  },
  {
    key: 'purple',
    name: '尊爵紫 (Deep Purple)',
    category: '粉紫浪漫',
    hex: '#9333ea',
    fill: '#faf5ff',
    stroke: '#9333ea',
    text: '#7e22ce',
    badgeBg: '#f3e8ff',
    badgeText: '#6b21a8',
    badgeClass: 'bg-purple-50 text-purple-700 border border-purple-200',
    textClass: 'text-purple-700',
    iconClass: 'text-purple-600'
  },

  // 綠意自然色系
  {
    key: 'lime',
    name: '嫩芽萊姆綠 (Lime)',
    category: '自然綠意',
    hex: '#65a30d',
    fill: '#f7fee7',
    stroke: '#65a30d',
    text: '#4d7c0f',
    badgeBg: '#ecfccb',
    badgeText: '#3f6212',
    badgeClass: 'bg-lime-50 text-lime-700 border border-lime-200',
    textClass: 'text-lime-700',
    iconClass: 'text-lime-600'
  },
  {
    key: 'green',
    name: '森林綠 (Forest Green)',
    category: '自然綠意',
    hex: '#16a34a',
    fill: '#f0fdf4',
    stroke: '#16a34a',
    text: '#15803d',
    badgeBg: '#dcfce7',
    badgeText: '#166534',
    badgeClass: 'bg-green-50 text-green-700 border border-green-200',
    textClass: 'text-green-700',
    iconClass: 'text-green-600'
  },

  // 高級中性灰砂色系
  {
    key: 'slate',
    name: '極簡石墨灰 (Slate Grey)',
    category: '中性優雅',
    hex: '#475569',
    fill: '#f8fafc',
    stroke: '#475569',
    text: '#334155',
    badgeBg: '#e2e8f0',
    badgeText: '#1e293b',
    badgeClass: 'bg-slate-50 text-slate-700 border border-slate-200',
    textClass: 'text-slate-700',
    iconClass: 'text-slate-600'
  },
  {
    key: 'zinc',
    name: '白金冷銀 (Zinc Silver)',
    category: '中性優雅',
    hex: '#52525b',
    fill: '#fafafa',
    stroke: '#52525b',
    text: '#3f3f46',
    badgeBg: '#e4e4e7',
    badgeText: '#27272a',
    badgeClass: 'bg-zinc-50 text-zinc-700 border border-zinc-200',
    textClass: 'text-zinc-700',
    iconClass: 'text-zinc-600'
  },
  {
    key: 'stone',
    name: '暖砂大地色 (Warm Stone)',
    category: '中性優雅',
    hex: '#78716c',
    fill: '#fafaf9',
    stroke: '#78716c',
    text: '#57534e',
    badgeBg: '#e7e5e4',
    badgeText: '#292524',
    badgeClass: 'bg-stone-50 text-stone-700 border border-stone-200',
    textClass: 'text-stone-700',
    iconClass: 'text-stone-600'
  }
];

export const BOOTH_COLOR_MAP: Record<string, BoothColorOption> = BOOTH_COLOR_OPTIONS.reduce(
  (acc, opt) => {
    acc[opt.key] = opt;
    return acc;
  },
  {} as Record<string, BoothColorOption>
);

/**
 * Returns complete SVG theme colors for any booth color key
 */
export function getBoothThemeStyles(colorKey?: string, isSelected: boolean = false) {
  const normalizedKey = (colorKey || 'teal').toLowerCase();
  const option = BOOTH_COLOR_MAP[normalizedKey] || BOOTH_COLOR_MAP['teal'];

  return {
    key: option.key,
    name: option.name,
    hex: option.hex,
    accentBar: option.hex,
    fill: isSelected ? '#ffffff' : option.fill,
    stroke: option.stroke,
    text: isSelected ? option.hex : option.text,
    badgeBg: isSelected ? option.hex : option.badgeBg,
    badgeText: isSelected ? '#ffffff' : option.badgeText,
    badgeClass: option.badgeClass,
    textClass: option.textClass,
    iconClass: option.iconClass
  };
}

export const DEFAULT_FACILITIES: Facility[] = [
  {
    id: 'fac_main_gate',
    type: 'entrance',
    name: '★ 主入口',
    x: 420,
    y: 440,
    width: 80,
    height: 30,
    color: 'emerald',
    description: '商場南側主要迎賓出入口，直通手扶梯與服務台。'
  },
  {
    id: 'fac_info_desk',
    type: 'info',
    name: '服務中心',
    x: 420,
    y: 210,
    width: 80,
    height: 80,
    color: 'blue',
    description: '提供諮詢服務、商場地圖導覽、退稅與失物招領。'
  },
  {
    id: 'fac_escalator_up',
    type: 'escalator',
    name: '雙向手扶梯',
    x: 430,
    y: 70,
    width: 60,
    height: 40,
    color: 'slate',
    description: '直達 2F 主題餐廳與 3F 影城之核心手扶梯。'
  },
  {
    id: 'fac_elevator_west',
    type: 'elevator',
    name: '景觀直達梯',
    x: 430,
    y: 360,
    width: 60,
    height: 40,
    color: 'indigo',
    description: '全無障礙景觀電梯，可通往地下停車場與各樓層。'
  },
  {
    id: 'fac_restroom_sw',
    type: 'restroom',
    name: '🚻 洗手間',
    x: 30,
    y: 430,
    width: 70,
    height: 30,
    color: 'slate',
    description: '男女無障礙洗手間與親子友善衛生設施。'
  },
  {
    id: 'fac_nursing_sw',
    type: 'nursery',
    name: '🍼 哺育室',
    x: 110,
    y: 430,
    width: 70,
    height: 30,
    color: 'pink',
    description: '配備溫水飲水機、獨立哺乳室與尿布更換台。'
  },
  {
    id: 'fac_cafe_lounge',
    type: 'cafe',
    name: '☕ 休憩咖啡廊',
    x: 840,
    y: 200,
    width: 110,
    height: 80,
    color: 'amber',
    description: '提供顧客歇腳休息、品嚐手沖精品咖啡與甜點之舒適廊道。'
  },
  {
    id: 'fac_atm_corner',
    type: 'atm',
    name: '🏧 ATM提款機',
    x: 30,
    y: 390,
    width: 70,
    height: 30,
    color: 'emerald',
    description: '提供跨行提款、存款與帳務查詢服務。'
  }
];

export const DEFAULT_WALKWAYS: Walkway[] = [
  {
    id: 'walk_h_main',
    name: '東西向主走道 (中央橫貫大道)',
    x: 40,
    y: 295,
    width: 920,
    height: 40,
    type: 'primary',
    color: '#f1f5f9'
  },
  {
    id: 'walk_v_main',
    name: '南北向中庭主廊道 (迎賓大道)',
    x: 420,
    y: 40,
    width: 80,
    height: 420,
    type: 'primary',
    color: '#f1f5f9'
  },
  {
    id: 'walk_a_sec1',
    name: 'A區潮流通道 (北側支線)',
    x: 40,
    y: 160,
    width: 190,
    height: 25,
    type: 'secondary',
    color: '#f1f5f9'
  },
  {
    id: 'walk_a_sec2',
    name: 'A區時尚穿廊 (南側支線)',
    x: 230,
    y: 160,
    width: 190,
    height: 25,
    type: 'secondary',
    color: '#f1f5f9'
  },
  {
    id: 'walk_entrance',
    name: '南門迎賓大廳通道',
    x: 360,
    y: 440,
    width: 200,
    height: 40,
    type: 'entrance',
    color: '#e2e8f0'
  }
];

export const DEFAULT_ZONE_AREAS: ZoneArea[] = [
  {
    id: 'zone_a',
    name: 'A區: 時尚潮流',
    color: 'teal',
    x: 40,
    y: 40,
    width: 360,
    height: 245
  },
  {
    id: 'zone_b',
    name: 'B區: 美妝生活',
    color: 'rose',
    x: 505,
    y: 40,
    width: 455,
    height: 140
  },
  {
    id: 'zone_c',
    name: 'C區: 科技生活',
    color: 'violet',
    x: 40,
    y: 335,
    width: 360,
    height: 90
  },
  {
    id: 'zone_d',
    name: 'D區: 美食天地',
    color: 'amber',
    x: 505,
    y: 185,
    width: 455,
    height: 110
  },
  {
    id: 'zone_e',
    name: 'E區: 鮮綠超市',
    color: 'emerald',
    x: 505,
    y: 335,
    width: 455,
    height: 135
  }
];

export interface FloorPlanPreset {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  iconName: string;
  booths: Booth[];
  facilities: Facility[];
  walkways: Walkway[];
}

export const FLOOR_PLAN_PRESETS: FloorPlanPreset[] = [
  {
    id: 'standard-cross',
    name: '經典十字主軸商場 (Cross Mall)',
    subtitle: '中央中庭服務台 + 十字交織通道',
    description: '標準大型商場結構，以迎賓垂直大道與橫向主要大道十字貫穿，各分區視野開闊清晰。',
    iconName: 'LayoutGrid',
    booths: DEFAULT_BOOTHS,
    facilities: DEFAULT_FACILITIES,
    walkways: DEFAULT_WALKWAYS
  },
  {
    id: 'dual-wing-plaza',
    name: '旗艦雙翼中庭商城 (Dual-Wing Plaza)',
    subtitle: '開闊中庭廣場 + 兩翼環繞旗艦店',
    description: '兩側配置超大獨立旗艦專櫃與精品廊道，中央設置大型景觀休憩區與雙手扶梯節點。',
    iconName: 'Maximize2',
    booths: [
      { id: 'A1', name: '旗艦奢華時尚館', zone: 'A區: 時尚潮流', color: 'teal', x: 50, y: 50, width: 250, height: 180, description: '旗艦頂級男女裝與精品服飾' },
      { id: 'A2', name: '潮流運動旗艦', zone: 'A區: 時尚潮流', color: 'teal', x: 50, y: 250, width: 250, height: 180, description: '全系列運動裝備與限量球鞋' },
      { id: 'B1', name: '國際美妝名品館', zone: 'B區: 美妝生活', color: 'rose', x: 700, y: 50, width: 250, height: 180, description: '國際一線香氛與彩妝專櫃' },
      { id: 'D1', name: '景觀美食匯聚', zone: 'D區: 美食天地', color: 'amber', x: 700, y: 250, width: 250, height: 180, description: '米其林推薦美饌與精緻甜點' },
      { id: 'C1', name: '中庭數位體驗島', zone: 'C區: 科技生活', color: 'violet', x: 370, y: 70, width: 260, height: 90, description: 'Apple與智慧穿戴新品互動體驗' },
      { id: 'E1', name: '生鮮優選超市', zone: 'E區: 鮮綠超市', color: 'emerald', x: 370, y: 350, width: 260, height: 80, description: '進口有機蔬果與烘焙麵包' }
    ],
    facilities: [
      { id: 'fac_main_gate', type: 'entrance', name: '★ 景觀主門廳', x: 450, y: 445, width: 100, height: 30, color: 'emerald', description: '挑高迎賓大廳' },
      { id: 'fac_info_desk', type: 'info', name: '中庭尊榮服務台', x: 460, y: 200, width: 80, height: 80, color: 'blue', description: 'VIP貴賓諮詢中心' },
      { id: 'fac_escalator_up', type: 'escalator', name: '中央手扶梯', x: 340, y: 215, width: 60, height: 45, color: 'slate', description: '通往 2F' },
      { id: 'fac_elevator_west', type: 'elevator', name: '全景透明電梯', x: 600, y: 215, width: 60, height: 45, color: 'indigo', description: '地下直達' },
      { id: 'fac_restroom_sw', type: 'restroom', name: '🚻 豪華洗手間', x: 30, y: 440, width: 80, height: 30, color: 'slate', description: '親子友善' },
      { id: 'fac_cafe_lounge', type: 'cafe', name: '☕ 中庭水景咖啡', x: 420, y: 290, width: 160, height: 45, color: 'amber', description: '精選下午茶' }
    ],
    walkways: [
      { id: 'walk_h_main', name: '中央迎賓大道', x: 40, y: 435, width: 920, height: 35, type: 'primary', color: '#f1f5f9' },
      { id: 'walk_wing_left', name: '西翼旗艦走廊', x: 310, y: 45, width: 50, height: 390, type: 'primary', color: '#f1f5f9' },
      { id: 'walk_wing_right', name: '東翼名品走廊', x: 640, y: 45, width: 50, height: 390, type: 'primary', color: '#f1f5f9' },
      { id: 'walk_atrium_trans', name: '中庭貫穿步道', x: 310, y: 170, width: 380, height: 30, type: 'secondary', color: '#f1f5f9' }
    ]
  },
  {
    id: 'loop-galleria',
    name: '環形中庭走廊商圈 (Loop Galleria)',
    subtitle: '360度迴廊動線 + 聚集式核心商圈',
    description: '環繞型迴廊規劃，保證顧客能無死角逛遍所有專櫃，動線流暢無折返死角。',
    iconName: 'RotateCcw',
    booths: [
      { id: 'A1', name: '北翼潮流專區', zone: 'A區: 時尚潮流', color: 'teal', x: 60, y: 50, width: 190, height: 90, description: '最新潮流服飾與配件' },
      { id: 'A2', name: '都會名品服飾', zone: 'A區: 時尚潮流', color: 'teal', x: 270, y: 50, width: 200, height: 90, description: '都會男女雅痞穿搭' },
      { id: 'B1', name: '彩妝香氛旗艦', zone: 'B區: 美妝生活', color: 'rose', x: 530, y: 50, width: 200, height: 90, description: '頂級沙龍香水' },
      { id: 'B2', name: '生活美學選物', zone: 'B區: 美妝生活', color: 'rose', x: 750, y: 50, width: 190, height: 90, description: '香氛蠟燭與手作' },
      { id: 'C1', name: '智慧科技體驗', zone: 'C區: 科技生活', color: 'violet', x: 60, y: 170, width: 110, height: 160, description: '科技生活產品' },
      { id: 'E1', name: '精選生鮮超市', zone: 'E區: 鮮綠超市', color: 'emerald', x: 60, y: 350, width: 220, height: 90, description: '生鮮優格乳品' },
      { id: 'D1', name: '和風拉麵食堂', zone: 'D區: 美食天地', color: 'amber', x: 300, y: 350, width: 190, height: 90, description: '道地豚骨拉麵' },
      { id: 'D2', name: '義式窯烤披薩', zone: 'D區: 美食天地', color: 'amber', x: 510, y: 350, width: 190, height: 90, description: '現做脆皮披薩' },
      { id: 'D3', name: '法式甜點烘焙', zone: 'D區: 美食天地', color: 'amber', x: 720, y: 350, width: 220, height: 90, description: '馬卡龍與可頌' },
      { id: 'B3', name: '質感文具生活', zone: 'B區: 美妝生活', color: 'rose', x: 830, y: 170, width: 110, height: 160, description: '手帳與文創' }
    ],
    facilities: [
      { id: 'fac_main_gate', type: 'entrance', name: '★ 環狀迎賓門', x: 450, y: 445, width: 100, height: 30, color: 'emerald', description: '迎賓入口' },
      { id: 'fac_info_desk', type: 'info', name: '環狀中庭服務台', x: 455, y: 205, width: 90, height: 90, color: 'blue', description: '中庭導覽' },
      { id: 'fac_escalator_up', type: 'escalator', name: '北手扶梯', x: 330, y: 190, width: 60, height: 40, color: 'slate', description: '北向' },
      { id: 'fac_elevator_west', type: 'elevator', name: '南手扶梯', x: 610, y: 190, width: 60, height: 40, color: 'slate', description: '南向' },
      { id: 'fac_cafe_lounge', type: 'cafe', name: '☕ 環景咖啡座', x: 350, y: 265, width: 300, height: 45, color: 'amber', description: '環狀休閒座位' }
    ],
    walkways: [
      { id: 'walk_top', name: '北側長廊', x: 60, y: 145, width: 880, height: 20, type: 'primary', color: '#f1f5f9' },
      { id: 'walk_bottom', name: '南側長廊', x: 60, y: 330, width: 880, height: 20, type: 'primary', color: '#f1f5f9' },
      { id: 'walk_left', name: '西側長廊', x: 175, y: 145, width: 25, height: 200, type: 'primary', color: '#f1f5f9' },
      { id: 'walk_right', name: '東側長廊', x: 800, y: 145, width: 25, height: 200, type: 'primary', color: '#f1f5f9' }
    ]
  },
  {
    id: 'food-market-bazaar',
    name: '主題美食市集 (Food Market & Bazaar)',
    subtitle: '高坪效攤位排列 + 寬敞公共用餐空間',
    description: '適合美食街、文創市集、展會市集，提供大量規格化攤位與中央寬敞餐飲桌椅。',
    iconName: 'ShoppingBag',
    booths: [
      { id: 'D1', name: '拉麵職人', zone: 'D區: 美食天地', color: 'amber', x: 50, y: 50, width: 130, height: 85, description: '特濃拉麵' },
      { id: 'D2', name: '台式滷肉飯', zone: 'D區: 美食天地', color: 'amber', x: 195, y: 50, width: 130, height: 85, description: '在地傳統小吃' },
      { id: 'D3', name: '韓式石鍋拌飯', zone: 'D區: 美食天地', color: 'amber', x: 340, y: 50, width: 130, height: 85, description: '韓式料理' },
      { id: 'D4', name: '泰式椒麻雞', zone: 'D區: 美食天地', color: 'amber', x: 530, y: 50, width: 130, height: 85, description: '道地泰國菜' },
      { id: 'D5', name: '手作漢堡排', zone: 'D區: 美食天地', color: 'amber', x: 675, y: 50, width: 130, height: 85, description: '美式漢堡' },
      { id: 'D6', name: '日式炸豬排', zone: 'D區: 美食天地', color: 'amber', x: 820, y: 50, width: 130, height: 85, description: '酥脆炸物' },
      { id: 'E1', name: '現打鮮果汁', zone: 'E區: 鮮綠超市', color: 'emerald', x: 50, y: 350, width: 130, height: 85, description: '新鮮水果飲品' },
      { id: 'E2', name: '精品手搖飲', zone: 'E區: 鮮綠超市', color: 'emerald', x: 195, y: 350, width: 130, height: 85, description: '台灣高山茶' },
      { id: 'E3', name: '手工義式冰淇淋', zone: 'E區: 鮮綠超市', color: 'emerald', x: 340, y: 350, width: 130, height: 85, description: '低脂冰淇淋' },
      { id: 'B1', name: '文創紀念品', zone: 'B區: 美妝生活', color: 'rose', x: 530, y: 350, width: 130, height: 85, description: '特色小物' },
      { id: 'B2', name: '手作陶藝選物', zone: 'B區: 美妝生活', color: 'rose', x: 675, y: 350, width: 130, height: 85, description: '生活器皿' },
      { id: 'B3', name: '伴手禮名產盒', zone: 'B區: 美妝生活', color: 'rose', x: 820, y: 350, width: 130, height: 85, description: '禮品盒裝' }
    ],
    facilities: [
      { id: 'fac_main_gate', type: 'entrance', name: '★ 美食市集主門', x: 450, y: 445, width: 100, height: 30, color: 'emerald', description: '市集入口' },
      { id: 'fac_cafe_lounge', type: 'cafe', name: '🍽️ 中央公共用餐大廳 (200席)', x: 100, y: 170, width: 800, height: 140, color: 'amber', description: '供全場食客共用的原木餐桌椅與自助回收台' },
      { id: 'fac_info_desk', type: 'info', name: '市集諮詢與結帳台', x: 460, y: 140, width: 80, height: 25, color: 'blue', description: '統一開票處' },
      { id: 'fac_restroom_sw', type: 'restroom', name: '🚻 市集洗手間', x: 25, y: 440, width: 70, height: 30, color: 'slate', description: '洗手間' },
      { id: 'fac_nursing_sw', type: 'nursery', name: '🍼 哺育室', x: 100, y: 440, width: 70, height: 30, color: 'pink', description: '育嬰室' }
    ],
    walkways: [
      { id: 'walk_top', name: '北排點餐大道', x: 40, y: 140, width: 920, height: 25, type: 'primary', color: '#f1f5f9' },
      { id: 'walk_bottom', name: '南排點餐大道', x: 40, y: 320, width: 920, height: 25, type: 'primary', color: '#f1f5f9' },
      { id: 'walk_mid_v', name: '中軸取餐通道', x: 480, y: 40, width: 40, height: 420, type: 'secondary', color: '#f1f5f9' }
    ]
  }
];

export const DEFAULT_LEGENDS: MapLegendItem[] = [
  {
    id: 'legend_zone_a',
    name: '時尚潮流 (A區)',
    color: 'teal',
    category: '分區主題',
    description: '服飾鞋包、流行飾品與設計專櫃',
    visible: true,
    zoneCode: 'A'
  },
  {
    id: 'legend_zone_b',
    name: '美妝生活 (B區)',
    color: 'rose',
    category: '分區主題',
    description: '專櫃彩妝、香氛香水、醫美保養',
    visible: true,
    zoneCode: 'B'
  },
  {
    id: 'legend_zone_c',
    name: '科技生活 (C區)',
    color: 'violet',
    category: '分區主題',
    description: '智慧手機、3C配件、生活家電',
    visible: true,
    zoneCode: 'C'
  },
  {
    id: 'legend_zone_d',
    name: '美食天地 (D區)',
    color: 'amber',
    category: '分區主題',
    description: '日式拉麵、義式蔬食、排隊甜點飲品',
    visible: true,
    zoneCode: 'D'
  },
  {
    id: 'legend_zone_e',
    name: '鮮綠超市 (E區)',
    color: 'emerald',
    category: '分區主題',
    description: '有機生鮮、進口零食、天然果物烘焙',
    visible: true,
    zoneCode: 'E'
  },
  {
    id: 'legend_fac_nursery',
    name: '友善育嬰哺乳室',
    color: 'pink',
    category: '公共設施',
    description: '獨立溫奶器、換尿布台與母嬰親善空間',
    visible: true
  },
  {
    id: 'legend_fac_service',
    name: '顧客服務中心',
    color: 'indigo',
    category: '公共設施',
    description: '退稅服務、商品諮詢、廣播與失物招領',
    visible: true
  },
  {
    id: 'legend_fac_restroom',
    name: '無障礙與公共化妝室',
    color: 'sky',
    category: '公共設施',
    description: '男女洗手間與無障礙便利空間',
    visible: true
  }
];

export const DEFAULT_SYSTEM_TITLE = '智慧商場導覽與管理系統';

export const DEFAULT_MODULE_SIZE_SETTINGS: ModuleSizeSettings = {
  columnRatio: '5:7',
  mapHeight: 580,
  searchMinHeight: 460,
  searchDensity: 'comfortable',
  searchCardSize: 'md',
  mapViewScale: 1.0,
  contentMaxWidth: '7xl',
  mapBorderRadius: '3xl',
  showFrontendQuickResize: true,
  showBoothIds: true,
  canvasWidth: 1000,
  canvasHeight: 500,
  systemTitle: DEFAULT_SYSTEM_TITLE
};

