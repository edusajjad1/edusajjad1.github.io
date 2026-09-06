/**
 * دربك سالك (Darbak Salik) v2.0
 * Real-Time Crowdsourced Traffic & Checkpoint Radar for Iraq
 * =========================================================
 * Features: LocalStorage persistence, Marker Clustering,
 * Toast Notifications, Stats Panel, All 18 Provinces,
 * PWA Install Prompt, Proximity Alerts, Infinite Scroll
 */

'use strict';

// ==========================================
// 0. Constants & Config
// ==========================================
const APP_VERSION = '2.0.0';
const REPORT_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours in ms
const FEED_PAGE_SIZE = 8;
const LIVE_UPDATE_INTERVAL = 35000; // 35s
const DRIVER_TICK_INTERVAL = 4500;
const PROXIMITY_ALERT_RADIUS_KM = 3;

// ==========================================
// 1. Initial State & Authentic Iraqi Dataset
// ==========================================
const INITIAL_IRAQ_REPORTS = [
  // --- BAGHDAD (بغداد) ---
  {
    id: "rep-bgd-1", city: "baghdad", type: "checkpoint", severity: "heavy",
    title: "سيطرة الصقور (مدخل بغداد - الأنبار)",
    desc: "طابور شاحنات وسيارات طويل، مسارين فقط مفتوحة والتفتيش بطيء بالسونار.",
    lat: 33.2980, lng: 44.2480, upvotes: 42, resolvedVotes: 3,
    timeAgo: "منذ 4 دقائق", author: "كابتن أبو علي", ts: Date.now() - 4*60000
  },
  {
    id: "rep-bgd-2", city: "baghdad", type: "checkpoint", severity: "smooth",
    title: "سيطرة الشعب (مدخل بغداد الشمالي)",
    desc: "السيطرة سالكة وممتازة، تم فتح 4 مسارات وحركة التفتيش سريعة جداً.",
    lat: 33.4020, lng: 44.3850, upvotes: 28, resolvedVotes: 1,
    timeAgo: "منذ 11 دقيقة", author: "أحمد العراقي", ts: Date.now() - 11*60000
  },
  {
    id: "rep-bgd-3", city: "baghdad", type: "radar", severity: "moderate",
    title: "رادار سريع محمد القاسم (قرب النهضة)",
    desc: "كاميرا مراقبة ذكية جديدة ترصد السرعة الزائدة (حد السرعة 80 كم/س) وعدم ربط الحزام.",
    lat: 33.3440, lng: 44.4250, upvotes: 65, resolvedVotes: 0,
    timeAgo: "منذ 18 دقيقة", author: "سجاد التميمي", ts: Date.now() - 18*60000
  },
  {
    id: "rep-bgd-4", city: "baghdad", type: "block", severity: "heavy",
    title: "جسر السنك (قطع جزئي)",
    desc: "أعمال صيانة وتبديل فواصل التمدد بالجسر باتجاه الرصافة، السير ثقيل جداً يفضل العبور من الجادرية.",
    lat: 33.3275, lng: 44.4022, upvotes: 51, resolvedVotes: 5,
    timeAgo: "منذ 25 دقيقة", author: "حسين مهندس", ts: Date.now() - 25*60000
  },
  {
    id: "rep-bgd-5", city: "baghdad", type: "fuel", severity: "smooth",
    title: "محطة وقود المنصور الحكومية",
    desc: "متوفر بنزين سوبر وبنزين محسن، الدفع ببطاقة فيزا/كي كارد أو كاش، لا يوجد طابور حالياً.",
    lat: 33.3105, lng: 44.3540, upvotes: 34, resolvedVotes: 0,
    timeAgo: "منذ 32 دقيقة", author: "عمر السامرائي", ts: Date.now() - 32*60000
  },
  {
    id: "rep-bgd-6", city: "baghdad", type: "radar", severity: "moderate",
    title: "رادار طريق مطار بغداد الدولي",
    desc: "رادارات رصد السرعة شغالة باتجاه ساحة عباس بن فرناس، السرعة القصوى 100 كم/س.",
    lat: 33.2680, lng: 44.2950, upvotes: 77, resolvedVotes: 1,
    timeAgo: "منذ 45 دقيقة", author: "محمد الطائي", ts: Date.now() - 45*60000
  },
  {
    id: "rep-bgd-7", city: "baghdad", type: "shortcut", severity: "smooth",
    title: "دربونة سالكة (تحويلة حي الجامعة / النفق)",
    desc: "لتجنب زحام نفق الشرطة ادخل من فرع جامع ملا حويش تطلع مباشرة على شارع الربيع سالكة تماماً.",
    lat: 33.3280, lng: 44.3310, upvotes: 39, resolvedVotes: 0,
    timeAgo: "منذ ساعة", author: "مصطفى درايف", ts: Date.now() - 60*60000
  },
  {
    id: "rep-bgd-8", city: "baghdad", type: "traffic", severity: "heavy",
    title: "ساحة النسور (أعمال مجسرات)",
    desc: "زحام وتكدس مروري بسبب أعمال تحويل مسار الآليات لمشروع فك الاختناقات.",
    lat: 33.3080, lng: 44.3680, upvotes: 48, resolvedVotes: 2,
    timeAgo: "منذ ساعة", author: "ياسر الكرخي", ts: Date.now() - 62*60000
  },
  {
    id: "rep-bgd-9", city: "baghdad", type: "checkpoint", severity: "moderate",
    title: "سيطرة الرستمية (مخرج بغداد - الكوت)",
    desc: "حركة متوسطة، تدقيق هويات خفيف للسيارات الصالون.",
    lat: 33.2750, lng: 44.5120, upvotes: 19, resolvedVotes: 0,
    timeAgo: "منذ ساعة ونصف", author: "كرار الواسطي", ts: Date.now() - 90*60000
  },
  {
    id: "rep-bgd-10", city: "baghdad", type: "traffic", severity: "moderate",
    title: "دوار الرصيف / شارع الأمة",
    desc: "كثافة مرورية عالية قرب دوار الرصيف بسبب ازدحام السوق.",
    lat: 33.3400, lng: 44.4050, upvotes: 31, resolvedVotes: 0,
    timeAgo: "منذ ساعتين", author: "علي الرصافي", ts: Date.now() - 120*60000
  },

  // --- BASRA (البصرة) ---
  {
    id: "rep-bsr-1", city: "basra", type: "checkpoint", severity: "heavy",
    title: "سيطرة السدرة (مدخل البصرة الشمالي)",
    desc: "تكدس شاحنات وصهاريج، تفتيش أمني دقيق مع زحام لمسافة 1 كم.",
    lat: 30.6800, lng: 47.7100, upvotes: 29, resolvedVotes: 1,
    timeAgo: "منذ 15 دقيقة", author: "حيدر البصراوي", ts: Date.now() - 15*60000
  },
  {
    id: "rep-bsr-2", city: "basra", type: "radar", severity: "moderate",
    title: "رادار شارع الوفود / الكورنيش الجديد",
    desc: "كاميرات مراقبة ورادار ذكي لرصد السرعة واستخدام الهاتف النقال.",
    lat: 30.5180, lng: 47.8350, upvotes: 44, resolvedVotes: 0,
    timeAgo: "منذ نصف ساعة", author: "علي شط العرب", ts: Date.now() - 30*60000
  },
  {
    id: "rep-bsr-3", city: "basra", type: "fuel", severity: "smooth",
    title: "محطة وقود الجزائر الحكومية",
    desc: "بنزين محسن متوفر 24 ساعة، الدفع إلكتروني سريع جداً.",
    lat: 30.5050, lng: 47.8200, upvotes: 18, resolvedVotes: 0,
    timeAgo: "منذ ساعتين", author: "وسام العيداني", ts: Date.now() - 120*60000
  },
  {
    id: "rep-bsr-4", city: "basra", type: "block", severity: "moderate",
    title: "إغلاق جزئي شارع 14 رمضان",
    desc: "أعمال مد أنابيب الصرف الصحي، مسار واحد مفتوح فقط.",
    lat: 30.5120, lng: 47.8400, upvotes: 22, resolvedVotes: 0,
    timeAgo: "منذ 40 دقيقة", author: "قاسم الشيخلي", ts: Date.now() - 40*60000
  },

  // --- ERBIL (أربيل) ---
  {
    id: "rep-ebl-1", city: "erbil", type: "radar", severity: "heavy",
    title: "رادارات طريق 100 المتر (أربيل)",
    desc: "رادارات نقطة لنقطة (Point to Point) تحسب معدل السرعة (80 كم/س) احذر تجاوز السرعة.",
    lat: 36.1980, lng: 44.0150, upvotes: 56, resolvedVotes: 0,
    timeAgo: "منذ 20 دقيقة", author: "ريبين سوران", ts: Date.now() - 20*60000
  },
  {
    id: "rep-ebl-2", city: "erbil", type: "checkpoint", severity: "smooth",
    title: "سيطرة شيراوا (مدخل أربيل - كركوك)",
    desc: "إجراءات الدخول سريعة وانسيابية جداً عبر البوابات الإلكترونية.",
    lat: 36.0800, lng: 44.0200, upvotes: 31, resolvedVotes: 0,
    timeAgo: "منذ 40 دقيقة", author: "ديار هولير", ts: Date.now() - 40*60000
  },

  // --- NAJAF (النجف) ---
  {
    id: "rep-njf-1", city: "najaf", type: "traffic", severity: "smooth",
    title: "طريق يا حسين (النجف - كربلاء)",
    desc: "الطريق سالك تماماً وسرعة الحركة ممتازة مع توفر دوريات النجدة.",
    lat: 32.1200, lng: 44.3100, upvotes: 37, resolvedVotes: 0,
    timeAgo: "منذ 30 دقيقة", author: "مهدي الموسوي", ts: Date.now() - 30*60000
  },
  {
    id: "rep-njf-2", city: "najaf", type: "checkpoint", severity: "moderate",
    title: "سيطرة النجف الجديدة (مطار النجف)",
    desc: "تدقيق هويات وجوازات للزوار الأجانب، المسافة متوسطة.",
    lat: 31.9900, lng: 44.4000, upvotes: 14, resolvedVotes: 0,
    timeAgo: "منذ ساعة", author: "أبو رضا", ts: Date.now() - 60*60000
  },

  // --- KARBALA (كربلاء) ---
  {
    id: "rep-krb-1", city: "karbala", type: "checkpoint", severity: "moderate",
    title: "سيطرة الوند (مدخل كربلاء من بغداد)",
    desc: "تدقيق باجات وهويات للمركبات الكبيرة، الصالون مسارهم سريع.",
    lat: 32.7200, lng: 44.1100, upvotes: 23, resolvedVotes: 1,
    timeAgo: "منذ 50 دقيقة", author: "أبو منتظر", ts: Date.now() - 50*60000
  },
  {
    id: "rep-krb-2", city: "karbala", type: "fuel", severity: "smooth",
    title: "محطة وقود مقابل الحسينية",
    desc: "بنزين محسن وعادي متوفر بدون طابور.",
    lat: 32.6100, lng: 44.0300, upvotes: 11, resolvedVotes: 0,
    timeAgo: "منذ ساعة", author: "زيد الكربلائي", ts: Date.now() - 65*60000
  },

  // --- MOSUL / NINEVEH (الموصل / نينوى) ---
  {
    id: "rep-msl-1", city: "mosul", type: "checkpoint", severity: "smooth",
    title: "سيطرة العقرب (مدخل الموصل الجنوبي)",
    desc: "مفتوحة وسالكة بدون أي معوقات أو تأخير.",
    lat: 36.2500, lng: 43.1500, upvotes: 21, resolvedVotes: 0,
    timeAgo: "منذ ساعة", author: "يوسف النينوي", ts: Date.now() - 60*60000
  },
  {
    id: "rep-msl-2", city: "mosul", type: "radar", severity: "moderate",
    title: "رادار جسر الحرية (الموصل)",
    desc: "رادار ثابت على الجسر، حد السرعة 60 كم/س، احذر.",
    lat: 36.3500, lng: 43.1400, upvotes: 33, resolvedVotes: 0,
    timeAgo: "منذ 45 دقيقة", author: "أيوب النينوي", ts: Date.now() - 45*60000
  },

  // --- BABIL (بابل) ---
  {
    id: "rep-bbl-1", city: "babil", type: "traffic", severity: "heavy",
    title: "سيطرة الآثار (مدخل الحلة الشمالي)",
    desc: "زحام متكرر بسبب تفتيش السونار، المسار بطيء.",
    lat: 32.5500, lng: 44.4100, upvotes: 19, resolvedVotes: 0,
    timeAgo: "منذ 35 دقيقة", author: "ضرغام البابلي", ts: Date.now() - 35*60000
  },
  {
    id: "rep-bbl-2", city: "babil", type: "shortcut", severity: "smooth",
    title: "طريق بديل الكوفة - الحلة",
    desc: "سالك وانسيابي، يختصر 20 دقيقة عن الطريق الرئيسي.",
    lat: 32.4500, lng: 44.3900, upvotes: 27, resolvedVotes: 0,
    timeAgo: "منذ ساعة", author: "علي الحلي", ts: Date.now() - 70*60000
  },

  // --- SULAYMANIYAH (السليمانية) ---
  {
    id: "rep-sly-1", city: "sulaymaniyah", type: "checkpoint", severity: "smooth",
    title: "سيطرة إبراهيم الخليل (مدخل السليمانية)",
    desc: "تفتيش خفيف وانسيابي، مسارات مفتوحة.",
    lat: 35.5000, lng: 45.4000, upvotes: 15, resolvedVotes: 0,
    timeAgo: "منذ 50 دقيقة", author: "كوتشر سليماني", ts: Date.now() - 50*60000
  },

  // --- DIYALA (ديالى) ---
  {
    id: "rep-diy-1", city: "diyala", type: "checkpoint", severity: "moderate",
    title: "سيطرة الصدر (مدخل بعقوبة من بغداد)",
    desc: "تدقيق هويات لجميع المركبات، متوسطة الانسياب.",
    lat: 33.7400, lng: 44.6500, upvotes: 18, resolvedVotes: 0,
    timeAgo: "منذ 25 دقيقة", author: "حسن الديالي", ts: Date.now() - 25*60000
  },

  // --- KIRKUK (كركوك) ---
  {
    id: "rep-krk-1", city: "kirkuk", type: "radar", severity: "heavy",
    title: "رادار محور 80 (كركوك - بغداد)",
    desc: "رادار ثابت وكاميرا ذكية، حد السرعة 100 كم/س على الطريق السريع.",
    lat: 35.4700, lng: 44.4000, upvotes: 41, resolvedVotes: 0,
    timeAgo: "منذ 10 دقائق", author: "صابر الكركوكلي", ts: Date.now() - 10*60000
  },

  // --- ANBAR (الأنبار) ---
  {
    id: "rep-anb-1", city: "anbar", type: "checkpoint", severity: "heavy",
    title: "سيطرة خان الذيبان (بغداد - الفلوجة)",
    desc: "تفتيش أمني مشدد للمركبات والهويات، طابور متوسط الطول.",
    lat: 33.4700, lng: 43.7500, upvotes: 35, resolvedVotes: 0,
    timeAgo: "منذ 8 دقائق", author: "أبو ماجد الأنباري", ts: Date.now() - 8*60000
  },

  // --- SALAH ALDDIN (صلاح الدين) ---
  {
    id: "rep-sld-1", city: "salahalddin", type: "checkpoint", severity: "moderate",
    title: "سيطرة الدور (صلاح الدين - بغداد)",
    desc: "حركة متوسطة ومنتظمة، تدقيق هويات.",
    lat: 34.4500, lng: 43.6700, upvotes: 12, resolvedVotes: 0,
    timeAgo: "منذ ساعة", author: "طارق التكريتي", ts: Date.now() - 60*60000
  },

  // --- WASIT (واسط) ---
  {
    id: "rep-wst-1", city: "wasit", type: "checkpoint", severity: "smooth",
    title: "سيطرة الكوت الرئيسية",
    desc: "سالكة وانسيابية، تفتيش خفيف.",
    lat: 32.5500, lng: 45.8000, upvotes: 9, resolvedVotes: 0,
    timeAgo: "منذ ساعة", author: "علي الواسطي", ts: Date.now() - 65*60000
  },

  // --- DUHOK (دهوك) ---
  {
    id: "rep-dhk-1", city: "duhok", type: "radar", severity: "moderate",
    title: "رادار طريق دهوك - زاخو",
    desc: "كاميرا رصد سرعة على الطريق السريع الجبلي، حد السرعة 80 كم/س.",
    lat: 36.9000, lng: 42.9500, upvotes: 17, resolvedVotes: 0,
    timeAgo: "منذ 35 دقيقة", author: "شيروان دهوكي", ts: Date.now() - 35*60000
  },

  // --- DIWANIYAH / QADISIYAH (الديوانية / القادسية) ---
  {
    id: "rep-dwn-1", city: "diwaniyah", type: "checkpoint", severity: "smooth",
    title: "سيطرة الديوانية الشمالية (طريق الحلة - بابل)",
    desc: "سالكة وانسيابية بالكامل، مسارات التفتيش مفتوحة والسير طبيعي.",
    lat: 32.0500, lng: 44.9100, upvotes: 16, resolvedVotes: 0,
    timeAgo: "منذ 45 دقيقة", author: "أبو حيدر القادسي", ts: Date.now() - 45*60000
  },
  {
    id: "rep-dwn-2", city: "diwaniyah", type: "traffic", severity: "moderate",
    title: "تقاطع حي العروبة / شارع المواكب",
    desc: "كثافة سيارات متوسطة بسبب تسوق المواطنين والنشاط التجاري.",
    lat: 31.9950, lng: 44.9350, upvotes: 12, resolvedVotes: 0,
    timeAgo: "منذ ساعة", author: "سجاد الديواني", ts: Date.now() - 60*60000
  },

  // --- MAYSAN (ميسان - العمارة) ---
  {
    id: "rep-mys-1", city: "maysan", type: "checkpoint", severity: "moderate",
    title: "سيطرة العمارة الجنوبية (طريق البصرة السريع)",
    desc: "تدقيق وثائق شاحنات نقل البضائع، مسار السيارات الصالون سالك.",
    lat: 31.8100, lng: 47.1600, upvotes: 21, resolvedVotes: 0,
    timeAgo: "منذ 25 دقيقة", author: "كرار العماري", ts: Date.now() - 25*60000
  },
  {
    id: "rep-mys-2", city: "maysan", type: "radar", severity: "smooth",
    title: "رادار شارع دجلة / الكورنيش الجديد",
    desc: "كاميرات مراقبة ذكية لرصد السرعة الزائدة (السرعة المحددة 60 كم/س).",
    lat: 31.8420, lng: 47.1450, upvotes: 19, resolvedVotes: 0,
    timeAgo: "منذ ساعة ونصف", author: "عمر الميساني", ts: Date.now() - 90*60000
  },

  // --- DHI QAR (ذي قار - الناصرية) ---
  {
    id: "rep-dhq-1", city: "dhiqar", type: "checkpoint", severity: "heavy",
    title: "سيطرة الفدائية (مدخل الناصرية - البصرة)",
    desc: "طابور شاحنات وسيارات طويل، السونار يعمل ببطء، يفضل الانتظار بهدوء.",
    lat: 31.0200, lng: 46.2800, upvotes: 38, resolvedVotes: 1,
    timeAgo: "منذ 15 دقيقة", author: "حسين الناصري", ts: Date.now() - 15*60000
  },
  {
    id: "rep-dhq-2", city: "dhiqar", type: "block", severity: "moderate",
    title: "جسر الحضارات (أعمال صيانة وتبليط)",
    desc: "تحويل مسار جزئي باتجاه شارع الحبوبي لوجود أعمال صيانة دورية.",
    lat: 31.0450, lng: 46.2550, upvotes: 24, resolvedVotes: 0,
    timeAgo: "منذ 50 دقيقة", author: "أحمد السومري", ts: Date.now() - 50*60000
  },

  // --- MUTHANNA (المثنى - السماوة) ---
  {
    id: "rep-mth-1", city: "muthanna", type: "checkpoint", severity: "smooth",
    title: "سيطرة الدراجي (طريق السماوة - النجف الدولي)",
    desc: "الطريق الدولي سالك تماماً وبدون أي قطوعات أو طوابير.",
    lat: 31.3300, lng: 45.2600, upvotes: 18, resolvedVotes: 0,
    timeAgo: "منذ 30 دقيقة", author: "سلمان السماوي", ts: Date.now() - 30*60000
  },
  {
    id: "rep-mth-2", city: "muthanna", type: "fuel", severity: "smooth",
    title: "محطة وقود الوركاء الحكومية",
    desc: "توفر بنزين ممتاز ومحسن بنظام الدفع الإلكتروني وبدون أي زحام.",
    lat: 31.3150, lng: 45.2900, upvotes: 14, resolvedVotes: 0,
    timeAgo: "منذ ساعتين", author: "أمير السماوي", ts: Date.now() - 120*60000
  }
];

// Iraqi Governorates Center Coordinates
const CITY_COORDS = {
  baghdad:      [33.3152, 44.3661],
  basra:        [30.5085, 47.8183],
  babil:        [32.4786, 44.4286],
  najaf:        [32.0000, 44.3333],
  karbala:      [32.6160, 44.0249],
  wasit:        [32.6000, 45.6000],
  diwaniyah:    [31.9889, 44.9289],
  maysan:       [31.8333, 47.1333],
  dhiqar:       [31.0500, 46.2333],
  muthanna:     [28.6833, 45.2333],
  mosul:        [36.3400, 43.1300],
  diyala:       [33.7667, 44.7167],
  kirkuk:       [35.4681, 44.3922],
  anbar:        [33.4558, 43.3000],
  salahalddin:  [34.5553, 43.6746],
  erbil:        [36.1911, 44.0092],
  sulaymaniyah: [35.5570, 45.4350],
  duhok:        [36.8669, 42.9813]
};

// App State
const state = {
  currentCity: "baghdad",
  activeCategory: "all",
  searchQuery: "",
  sortMode: "newest",   // newest | mostVoted | severity
  reports: [],
  userUpvoted: new Set(),
  userResolved: new Set(),
  soundEnabled: true,
  clusteringEnabled: true,
  currentTileIndex: 0,
  pickedCoords: { lat: 33.3152, lng: 44.3661 },
  map: null,
  markersLayer: null,   // can be LayerGroup or MarkerClusterGroup
  userLocationMarker: null,
  feedPage: 1,
  deferredInstallPrompt: null,
  userLat: null,
  userLng: null
};

// Map Tile Providers (100% Free OpenSource)
const TILE_LAYERS = [
  {
    name: "Dark Matter (ليلي داكن)",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://openstreetmap.org">OSM</a>'
  },
  {
    name: "Voyager (نهاري عصري)",
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://openstreetmap.org">OSM</a>'
  },
  {
    name: "OpenStreetMap (الافتراضي)",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
  },
  {
    name: "Esri WorldImagery (قمر صناعي)",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>'
  }
];

const TYPE_LABELS = {
  checkpoint: "🚨 سيطرة أمنية",
  radar:      "📷 رادار / كاميرا",
  block:      "⛔ قطع مروري",
  traffic:    "🚗 زحام / حادث",
  fuel:       "⛽ محطة وقود",
  shortcut:   "🛣️ دربونة سالكة"
};

const SEVERITY_LABELS = {
  smooth:   '<span class="status-pill pill-green">🟢 سالك</span>',
  moderate: '<span class="status-pill pill-yellow">🟡 بطيء</span>',
  heavy:    '<span class="status-pill pill-red">🔴 متوقف</span>'
};

// ==========================================
// Toast Notification System
// ==========================================
const Toast = {
  queue: [],
  active: 0,
  MAX: 3,

  show(message, type = 'info', duration = 3500) {
    if (this.active >= this.MAX) return;
    this.active++;
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    const icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', warning: 'fa-triangle-exclamation', info: 'fa-circle-info' };
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i> <span>${message}</span>`;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('toast-visible'));
    setTimeout(() => {
      toast.classList.remove('toast-visible');
      toast.addEventListener('transitionend', () => { toast.remove(); this.active--; });
    }, duration);
  }
};

// ==========================================
// Sound Synthesizer via Web Audio API
// ==========================================
class SoundFX {
  constructor() { this.ctx = null; }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) this.ctx = new AudioContext();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playRadarBeep() {
    if (!state.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, this.ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch (e) {}
  }

  playSuccessChime() {
    if (!state.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.08, this.ctx.currentTime + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.06 + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.06);
        osc.stop(this.ctx.currentTime + idx * 0.06 + 0.25);
      });
    } catch (e) {}
  }

  playAlert() {
    if (!state.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      [440, 550, 440, 330].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "square";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.05, this.ctx.currentTime + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.12 + 0.1);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + i * 0.12);
        osc.stop(this.ctx.currentTime + i * 0.12 + 0.1);
      });
    } catch (e) {}
  }
}

const sfx = new SoundFX();

// ==========================================
// 2. DOM Initialization
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  loadSavedState();
  initMap();
  initEventHandlers();
  renderCounters();
  renderFeed();
  startLiveSimulationTicker();
  initPWA();
  setConnectionStatus(true);
  
  // Simulate initial load
  setTimeout(() => {
    Toast.show('مرحباً بك في دربك سالك! 🚗🇮🇶', 'success', 4000);
  }, 800);
  
  // Register Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
});

// ==========================================
// 3. State Management
// ==========================================
function loadSavedState() {
  try {
    const saved = localStorage.getItem('darbak_reports_v2');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Filter expired reports (older than TTL), keep seed data
      const now = Date.now();
      state.reports = parsed.filter(r => r.id.startsWith('rep-') || (now - (r.ts || 0)) < REPORT_TTL_MS);
      if (state.reports.length === 0) state.reports = [...INITIAL_IRAQ_REPORTS];
    } else {
      state.reports = [...INITIAL_IRAQ_REPORTS];
    }
  } catch(e) {
    state.reports = [...INITIAL_IRAQ_REPORTS];
  }

  try {
    const upvoted = localStorage.getItem('darbak_upvoted_v2');
    if (upvoted) state.userUpvoted = new Set(JSON.parse(upvoted));
  } catch(e) {}

  try {
    const resolved = localStorage.getItem('darbak_resolved_v2');
    if (resolved) state.userResolved = new Set(JSON.parse(resolved));
  } catch(e) {}

  try {
    const sound = localStorage.getItem('darbak_sound');
    if (sound !== null) state.soundEnabled = JSON.parse(sound);
  } catch(e) {}
}

function saveState() {
  try {
    localStorage.setItem('darbak_reports_v2', JSON.stringify(state.reports));
    localStorage.setItem('darbak_upvoted_v2', JSON.stringify([...state.userUpvoted]));
    localStorage.setItem('darbak_resolved_v2', JSON.stringify([...state.userResolved]));
    localStorage.setItem('darbak_sound', JSON.stringify(state.soundEnabled));
  } catch(e) {
    console.warn('Failed to save state:', e);
  }
}

// ==========================================
// 4. Leaflet Map Setup & Markers
// ==========================================
function initMap() {
  state.map = L.map("map", {
    zoomControl: true,
    attributionControl: true,
    preferCanvas: true
  }).setView([33.3152, 44.3661], 12);

  state.tileLayer = L.tileLayer(TILE_LAYERS[0].url, {
    maxZoom: 19,
    attribution: TILE_LAYERS[0].attribution
  }).addTo(state.map);

  // Initialize clustering layer
  initMarkersLayer();

  state.map.on("click", (e) => {
    state.pickedCoords = { lat: e.latlng.lat, lng: e.latlng.lng };
    updateReportModalCoords(e.latlng.lat, e.latlng.lng, `📍 ${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`);
    sfx.playRadarBeep();
  });

  renderMarkers();
}

function initMarkersLayer() {
  if (state.markersLayer) {
    state.map.removeLayer(state.markersLayer);
  }
  if (state.clusteringEnabled && window.L && L.markerClusterGroup) {
    state.markersLayer = L.markerClusterGroup({
      maxClusterRadius: 60,
      iconCreateFunction(cluster) {
        const count = cluster.getChildCount();
        const size = count > 20 ? 'large' : count > 10 ? 'medium' : 'small';
        return L.divIcon({
          html: `<div class="cluster-icon cluster-${size}"><span>${count}</span></div>`,
          className: 'custom-cluster-marker',
          iconSize: [44, 44]
        });
      },
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      animate: true
    });
  } else {
    state.markersLayer = L.layerGroup();
  }
  state.markersLayer.addTo(state.map);
}

function createCustomIcon(report) {
  const typeIcons = {
    checkpoint: "fa-shield-halved",
    radar:      "fa-camera",
    block:      "fa-ban",
    traffic:    "fa-car-burst",
    fuel:       "fa-gas-pump",
    shortcut:   "fa-route"
  };
  const iconClass = typeIcons[report.type] || "fa-location-dot";
  const severityClass = `pin-sev-${report.severity || 'smooth'}`;

  const html = `
    <div class="custom-radar-pin pin-${report.type} ${severityClass}">
      <span class="pin-pulse"></span>
      <div class="pin-icon-box">
        <i class="fa-solid ${iconClass}"></i>
      </div>
    </div>
  `;
  return L.divIcon({
    html, className: "custom-leaflet-marker",
    iconSize: [40, 40], iconAnchor: [20, 20], popupAnchor: [0, -22]
  });
}

function createPopupContent(report) {
  const isUpvoted = state.userUpvoted.has(report.id);
  const sevClass = { smooth: 'text-green', moderate: 'text-yellow', heavy: 'text-red' }[report.severity] || '';
  const sevEmoji = { smooth: '🟢', moderate: '🟡', heavy: '🔴' }[report.severity] || '';

  return `
    <div class="popup-container">
      <div class="popup-header">
        <span class="card-tag tag-${report.type}">${TYPE_LABELS[report.type] || 'بلاغ'}</span>
        <span class="card-time">${report.timeAgo}</span>
      </div>
      <h4 class="popup-title">${escapeHTML(report.title)}</h4>
      ${report.desc ? `<p class="popup-desc">${escapeHTML(report.desc)}</p>` : ''}
      <div class="popup-meta">
        <span class="${sevClass}">${sevEmoji} ${{ smooth: 'سالك', moderate: 'بطيء', heavy: 'خانق' }[report.severity] || ''}</span>
        <span class="popup-author"><i class="fa-solid fa-user-tie"></i> ${escapeHTML(report.author || 'مجهول')}</span>
      </div>
      <div class="popup-actions">
        <button class="popup-btn ${isUpvoted ? 'upvoted' : ''}" onclick="window.handleUpvote('${report.id}')">
          <i class="fa-solid fa-thumbs-up"></i> تأكيد (${report.upvotes})
        </button>
        <button class="popup-btn popup-btn-share" onclick="window.openShareModal('${report.id}')">
          <i class="fa-solid fa-share-nodes"></i> مشاركة
        </button>
        <button class="popup-btn popup-btn-nav" onclick="window.navigateTo(${report.lat}, ${report.lng})">
          <i class="fa-solid fa-diamond-turn-right"></i> توجيه
        </button>
      </div>
    </div>
  `;
}

function renderMarkers() {
  state.markersLayer.clearLayers();
  const filtered = getFilteredReports();

  filtered.forEach(report => {
    const icon = createCustomIcon(report);
    const marker = L.marker([report.lat, report.lng], { icon, title: report.title });
    marker.bindPopup(createPopupContent(report), {
      maxWidth: 280,
      className: 'custom-popup-wrapper'
    });
    state.markersLayer.addLayer(marker);
  });
}

// ==========================================
// 5. Filtering & Sorting
// ==========================================
function getFilteredReports() {
  let results = state.reports.filter(report => {
    // City filter
    if (state.currentCity !== "all" && report.city !== state.currentCity) {
      if (!state.searchQuery) return false;
    }
    // Category filter
    if (state.activeCategory !== "all" && report.type !== state.activeCategory) return false;
    // Search
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      if (!report.title.toLowerCase().includes(q) && !(report.desc || '').toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // Sort
  if (state.sortMode === 'mostVoted') {
    results = results.sort((a, b) => b.upvotes - a.upvotes);
  } else if (state.sortMode === 'severity') {
    const sevOrder = { heavy: 0, moderate: 1, smooth: 2 };
    results = results.sort((a, b) => (sevOrder[a.severity] ?? 3) - (sevOrder[b.severity] ?? 3));
  } else {
    results = results.sort((a, b) => (b.ts || 0) - (a.ts || 0));
  }

  return results;
}

// ==========================================
// 6. Feed & Counters Rendering
// ==========================================
function renderFeed() {
  state.feedPage = 1;
  const feedContainer = document.getElementById("feedContent");
  const filtered = getFilteredReports();
  const page = filtered.slice(0, FEED_PAGE_SIZE * state.feedPage);

  if (filtered.length === 0) {
    feedContainer.innerHTML = `
      <div class="empty-feed">
        <i class="fa-solid fa-road-circle-check"></i>
        <p>لا توجد بلاغات تطابق البحث</p>
        <span>طريقك سالك أو كن أول من يبلّغ!</span>
      </div>
    `;
    document.getElementById('loadMoreContainer').style.display = 'none';
    return;
  }

  feedContainer.innerHTML = page.map(item => buildFeedCard(item)).join('');
  
  const loadMoreContainer = document.getElementById('loadMoreContainer');
  loadMoreContainer.style.display = filtered.length > FEED_PAGE_SIZE ? 'flex' : 'none';
}

function buildFeedCard(item) {
  const isUpvoted = state.userUpvoted.has(item.id);
  return `
    <div class="feed-card" id="card-${item.id}" onclick="window.flyToReport(${item.lat}, ${item.lng})">
      <div class="card-top">
        <span class="card-tag tag-${item.type}">${TYPE_LABELS[item.type] || 'بلاغ'}</span>
        <span class="card-time"><i class="fa-regular fa-clock"></i> ${item.timeAgo}</span>
      </div>
      <h4 class="card-title">${escapeHTML(item.title)}</h4>
      ${item.desc ? `<p class="card-desc">${escapeHTML(item.desc)}</p>` : ''}
      <div class="card-footer">
        <div>${SEVERITY_LABELS[item.severity] || ''}</div>
        <div class="card-actions-mini" onclick="event.stopPropagation()">
          <button class="action-btn-mini ${isUpvoted ? 'upvoted' : ''}" onclick="window.handleUpvote('${item.id}')" title="تأكيد صحة البلاغ">
            <i class="fa-solid fa-thumbs-up"></i> ${item.upvotes}
          </button>
          <button class="action-btn-mini action-share-mini" onclick="window.openShareModal('${item.id}')" title="مشاركة">
            <i class="fa-solid fa-share-nodes"></i>
          </button>
          <button class="action-btn-mini action-nav-mini" onclick="window.navigateTo(${item.lat}, ${item.lng})" title="توجيه">
            <i class="fa-solid fa-diamond-turn-right"></i>
          </button>
        </div>
      </div>
      ${item.author ? `<div class="card-author"><i class="fa-solid fa-user-circle"></i> ${escapeHTML(item.author)}</div>` : ''}
    </div>
  `;
}

function loadMoreFeed() {
  state.feedPage++;
  const filtered = getFilteredReports();
  const page = filtered.slice(0, FEED_PAGE_SIZE * state.feedPage);
  const feedContainer = document.getElementById("feedContent");

  feedContainer.innerHTML = page.map(item => buildFeedCard(item)).join('');

  const loadMoreContainer = document.getElementById('loadMoreContainer');
  loadMoreContainer.style.display = filtered.length > FEED_PAGE_SIZE * state.feedPage ? 'flex' : 'none';
}

function renderCounters() {
  const total = state.reports.length;
  const totalEl = document.getElementById("totalMarkersCount");
  if (totalEl) totalEl.textContent = total;

  const typeCounts = {};
  const cityCounts = {};

  state.reports.forEach(r => {
    typeCounts[r.type] = (typeCounts[r.type] || 0) + 1;
    cityCounts[r.city] = (cityCounts[r.city] || 0) + 1;
  });

  ['checkpoint','radar','block','traffic','fuel','shortcut'].forEach(t => {
    const el = document.getElementById(`count-type-${t}`);
    if (el) el.textContent = typeCounts[t] || 0;
  });

  const allCities = [
    'baghdad','basra','babil','najaf','karbala','wasit','diwaniyah','maysan','dhiqar','muthanna',
    'mosul','diyala','kirkuk','anbar','salahalddin','erbil','sulaymaniyah','duhok'
  ];
  allCities.forEach(c => {
    const el = document.getElementById(`count-${c}`);
    if (el) el.textContent = `${cityCounts[c] || 0} بلاغ`;
  });

  const elAll = document.getElementById('count-all');
  if (elAll) elAll.textContent = `${total} بلاغ`;

  const activeLabel = document.getElementById("activeReportsLabel");
  if (activeLabel) activeLabel.innerHTML = `<strong>${total}</strong> حدث نشط الآن في العراق`;
}

// ==========================================
// 7. Stats Panel
// ==========================================
function renderStats() {
  const body = document.getElementById('statsBody');
  const total = state.reports.length;

  const typeCounts = {};
  const cityCounts = {};
  const sevCounts = { smooth: 0, moderate: 0, heavy: 0 };

  state.reports.forEach(r => {
    typeCounts[r.type] = (typeCounts[r.type] || 0) + 1;
    cityCounts[r.city] = (cityCounts[r.city] || 0) + 1;
    sevCounts[r.severity] = (sevCounts[r.severity] || 0) + 1;
  });

  const topCity = Object.entries(cityCounts).sort((a,b) => b[1]-a[1])[0];
  const topType = Object.entries(typeCounts).sort((a,b) => b[1]-a[1])[0];

  const cityNames = {
    baghdad:'بغداد', basra:'البصرة', erbil:'أربيل', najaf:'النجف',
    karbala:'كربلاء', mosul:'نينوى', sulaymaniyah:'السليمانية',
    babil:'بابل', diyala:'ديالى', kirkuk:'كركوك', anbar:'الأنبار',
    salahalddin:'صلاح الدين', wasit:'واسط', diwaniyah:'القادسية',
    maysan:'ميسان', dhiqar:'ذي قار', muthanna:'المثنى', duhok:'دهوك'
  };

  body.innerHTML = `
    <div class="stats-grid">
      <div class="stat-box stat-blue">
        <i class="fa-solid fa-flag"></i>
        <div class="stat-number">${total}</div>
        <div class="stat-label">إجمالي البلاغات</div>
      </div>
      <div class="stat-box stat-red">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <div class="stat-number">${sevCounts.heavy}</div>
        <div class="stat-label">أوضاع خطيرة</div>
      </div>
      <div class="stat-box stat-yellow">
        <i class="fa-solid fa-clock"></i>
        <div class="stat-number">${sevCounts.moderate}</div>
        <div class="stat-label">أوضاع متوسطة</div>
      </div>
      <div class="stat-box stat-green">
        <i class="fa-solid fa-road"></i>
        <div class="stat-number">${sevCounts.smooth}</div>
        <div class="stat-label">طرق سالكة</div>
      </div>
    </div>

    <div class="stats-section">
      <h4 class="stats-section-title"><i class="fa-solid fa-medal"></i> أكثر المناطق نشاطاً</h4>
      <div class="stats-bar-list">
        ${Object.entries(cityCounts).sort((a,b) => b[1]-a[1]).slice(0,6).map(([city, count]) => `
          <div class="stats-bar-item">
            <span class="stats-bar-label">${cityNames[city] || city}</span>
            <div class="stats-bar-track">
              <div class="stats-bar-fill" style="width:${(count/total*100).toFixed(0)}%"></div>
            </div>
            <span class="stats-bar-count">${count}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="stats-section">
      <h4 class="stats-section-title"><i class="fa-solid fa-chart-pie"></i> توزيع أنواع البلاغات</h4>
      <div class="stats-type-grid">
        ${Object.entries(typeCounts).map(([type, count]) => `
          <div class="stats-type-item type-item-${type}">
            <i class="fa-solid ${({checkpoint:'fa-shield-halved',radar:'fa-camera',block:'fa-ban',traffic:'fa-car-burst',fuel:'fa-gas-pump',shortcut:'fa-route'}[type]||'fa-flag')}"></i>
            <span class="stats-type-count">${count}</span>
            <span class="stats-type-label">${TYPE_LABELS[type]?.replace(/^[^\s]+\s/,'') || type}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="stats-highlights">
      <div class="highlight-item">
        <i class="fa-solid fa-trophy text-amber"></i>
        <div>
          <strong>الأكثر نشاطاً:</strong> ${cityNames[topCity?.[0]] || '—'} (${topCity?.[1] || 0} بلاغات)
        </div>
      </div>
      <div class="highlight-item">
        <i class="fa-solid fa-star text-cyan"></i>
        <div>
          <strong>أكثر نوع بلاغ:</strong> ${TYPE_LABELS[topType?.[0]]?.replace(/^[^\s]+\s/,'') || '—'} (${topType?.[1] || 0})
        </div>
      </div>
    </div>
  `;
}

// ==========================================
// 8. Event Handlers
// ==========================================
function initEventHandlers() {
  // City Dropdown
  const cityDropdownBtn = document.getElementById("cityDropdownBtn");
  const cityDropdownMenu = document.getElementById("cityDropdownMenu");

  cityDropdownBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    cityDropdownMenu.classList.toggle("show");
    cityDropdownBtn.querySelector('.arrow-icon').style.transform =
      cityDropdownMenu.classList.contains('show') ? 'rotate(180deg)' : 'rotate(0)';
  });

  document.addEventListener("click", () => {
    cityDropdownMenu.classList.remove("show");
    if (cityDropdownBtn.querySelector('.arrow-icon')) {
      cityDropdownBtn.querySelector('.arrow-icon').style.transform = 'rotate(0)';
    }
  });

  document.querySelectorAll(".city-opt").forEach(opt => {
    opt.addEventListener("click", (e) => {
      e.stopPropagation();
      document.querySelectorAll(".city-opt").forEach(o => o.classList.remove("active"));
      opt.classList.add("active");

      const city = opt.getAttribute("data-city");
      const lat = parseFloat(opt.getAttribute("data-lat"));
      const lng = parseFloat(opt.getAttribute("data-lng"));
      const zoom = parseInt(opt.getAttribute("data-zoom"));
      const cityLabel = opt.querySelector("span:first-child").textContent;

      state.currentCity = city;
      document.getElementById("currentCityName").textContent =
        cityLabel.replace(/^[^\s]+\s/, '').split('(')[0].trim();

      cityDropdownMenu.classList.remove("show");
      state.map.flyTo([lat, lng], zoom, { duration: 1.2, easeLinearity: 0.5 });
      state.pickedCoords = { lat, lng };
      updateReportModalCoords(lat, lng, `تم التحديد على مركز ${cityLabel}`);

      renderMarkers();
      renderFeed();
      renderCounters();
      sfx.playRadarBeep();
      Toast.show(`انتقلت إلى ${cityLabel} 🗺️`, 'info', 2500);
    });
  });

  // Category Filter Pills
  document.querySelectorAll(".pill-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".pill-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.activeCategory = btn.getAttribute("data-category");
      renderMarkers();
      renderFeed();
      sfx.playRadarBeep();
    });
  });

  // Search
  const searchInput = document.getElementById("searchInput");
  const clearSearchBtn = document.getElementById("clearSearchBtn");

  searchInput.addEventListener("input", (e) => {
    state.searchQuery = e.target.value.trim();
    clearSearchBtn.style.display = state.searchQuery ? "flex" : "none";
    renderMarkers();
    renderFeed();
  });

  clearSearchBtn.addEventListener("click", () => {
    searchInput.value = "";
    state.searchQuery = "";
    clearSearchBtn.style.display = "none";
    renderMarkers();
    renderFeed();
  });

  // Locate Me
  document.getElementById("locateMeBtn").addEventListener("click", getUserLocation);

  // Report Modal
  const reportModal = document.getElementById("reportModal");
  const openModal = () => { reportModal.classList.add("open"); sfx.playRadarBeep(); };
  const closeModal = () => reportModal.classList.remove("open");

  document.getElementById("openReportModalBtn").addEventListener("click", openModal);
  document.getElementById("fabReportBtn").addEventListener("click", openModal);
  document.getElementById("closeReportModalBtn").addEventListener("click", closeModal);
  document.getElementById("cancelReportBtn").addEventListener("click", closeModal);
  reportModal.addEventListener("click", (e) => { if (e.target === reportModal) closeModal(); });

  // GPS / Map picker
  document.getElementById("pickCurrentGpsBtn").addEventListener("click", () => {
    document.getElementById("pickCurrentGpsBtn").classList.add("active");
    document.getElementById("pickOnMapBtn").classList.remove("active");
    getUserLocation();
  });

  document.getElementById("pickOnMapBtn").addEventListener("click", () => {
    document.getElementById("pickOnMapBtn").classList.add("active");
    document.getElementById("pickCurrentGpsBtn").classList.remove("active");
    closeModal();
    Toast.show('📍 انقر على الخريطة لتحديد موقع البلاغ', 'info', 4000);
  });

  // Submit report
  document.getElementById("newReportForm").addEventListener("submit", handleReportSubmit);

  // Drawer
  const feedDrawer = document.getElementById("feedDrawer");
  const toggleDrawer = () => feedDrawer.classList.toggle("collapsed");
  document.getElementById("drawerHandle").addEventListener("click", toggleDrawer);
  document.getElementById("toggleDrawerBtn").addEventListener("click", (e) => { e.stopPropagation(); toggleDrawer(); });

  // Drawer sort
  document.getElementById('drawerSortBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    const modes = ['newest', 'mostVoted', 'severity'];
    const labels = ['الأحدث', 'الأكثر تأكيداً', 'الأشد خطورة'];
    const idx = (modes.indexOf(state.sortMode) + 1) % modes.length;
    state.sortMode = modes[idx];
    renderFeed();
    renderMarkers();
    Toast.show(`ترتيب البلاغات: ${labels[idx]}`, 'info', 2000);
  });

  // Load more
  document.getElementById('loadMoreBtn').addEventListener('click', loadMoreFeed);

  // Map tile toggle
  document.getElementById("toggleLayerBtn").addEventListener("click", () => {
    state.currentTileIndex = (state.currentTileIndex + 1) % TILE_LAYERS.length;
    const newTile = TILE_LAYERS[state.currentTileIndex];
    state.map.removeLayer(state.tileLayer);
    state.tileLayer = L.tileLayer(newTile.url, { maxZoom: 19, attribution: newTile.attribution }).addTo(state.map);
    sfx.playRadarBeep();
    Toast.show(`طبقة الخريطة: ${newTile.name}`, 'info', 2000);
  });

  // Cluster toggle
  document.getElementById("clusterToggleBtn").addEventListener("click", () => {
    state.clusteringEnabled = !state.clusteringEnabled;
    initMarkersLayer();
    renderMarkers();
    Toast.show(state.clusteringEnabled ? '🔵 تجميع الأيقونات مفعّل' : '📌 عرض فردي للأيقونات', 'info', 2000);
    sfx.playRadarBeep();
  });

  // Sound toggle
  document.getElementById("soundToggleBtn").addEventListener("click", () => {
    state.soundEnabled = !state.soundEnabled;
    document.getElementById("soundToggleBtn").innerHTML = state.soundEnabled
      ? '<i class="fa-solid fa-volume-high"></i>'
      : '<i class="fa-solid fa-volume-xmark" style="color:#f87171"></i>';
    if (state.soundEnabled) sfx.playRadarBeep();
    saveState();
  });

  // Refresh
  document.getElementById("refreshFeedBtn").addEventListener("click", () => {
    const btn = document.getElementById("refreshFeedBtn");
    btn.querySelector("i").classList.add("fa-spin");
    setTimeout(() => {
      btn.querySelector("i").classList.remove("fa-spin");
      renderMarkers();
      renderFeed();
      renderCounters();
      sfx.playSuccessChime();
      Toast.show('تم تحديث البيانات ✅', 'success', 2500);
    }, 700);
  });

  // Ticker items
  document.querySelectorAll(".ticker-item").forEach(item => {
    item.addEventListener("click", () => {
      const coords = item.getAttribute("data-target");
      if (coords) {
        const [lat, lng] = coords.split(",").map(Number);
        state.map.flyTo([lat, lng], 15, { duration: 1.5 });
        sfx.playRadarBeep();
      }
    });
  });

  // Share modal
  const shareModal = document.getElementById("shareModal");
  document.getElementById("closeShareModalBtn").addEventListener("click", () => shareModal.classList.remove("open"));
  shareModal.addEventListener("click", (e) => { if (e.target === shareModal) shareModal.classList.remove("open"); });

  // Stats modal
  const statsModal = document.getElementById("statsModal");
  document.getElementById("statsBtn").addEventListener("click", () => {
    renderStats();
    statsModal.classList.add("open");
    sfx.playRadarBeep();
  });
  document.getElementById("closeStatsModalBtn").addEventListener("click", () => statsModal.classList.remove("open"));
  statsModal.addEventListener("click", (e) => { if (e.target === statsModal) statsModal.classList.remove("open"); });
}

// ==========================================
// 9. GPS & Location
// ==========================================
function updateReportModalCoords(lat, lng, label) {
  document.getElementById("reportLat").value = lat.toFixed(6);
  document.getElementById("reportLng").value = lng.toFixed(6);
  document.getElementById("coordsText").textContent = label || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

function getUserLocation() {
  if (!navigator.geolocation) {
    Toast.show('⚠️ متصفحك لا يدعم تحديد الموقع (GPS)', 'error');
    return;
  }

  Toast.show('🛰️ جاري تحديد موقعك...', 'info', 3000);
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude: lat, longitude: lng } = pos.coords;
      state.pickedCoords = { lat, lng };
      state.userLat = lat;
      state.userLng = lng;

      state.map.flyTo([lat, lng], 15, { duration: 1.2 });

      if (state.userLocationMarker) state.map.removeLayer(state.userLocationMarker);

      const userIcon = L.divIcon({
        html: `<div class="user-location-pin"><span class="user-pulse-ring"></span><span class="user-dot"></span></div>`,
        className: '',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      state.userLocationMarker = L.marker([lat, lng], { icon: userIcon }).addTo(state.map);
      state.userLocationMarker.bindPopup('<strong>📍 أنت هنا الآن</strong>').openPopup();
      updateReportModalCoords(lat, lng, 'تم تحديد موقعك بدقة عبر GPS');
      sfx.playSuccessChime();
      Toast.show('✅ تم تحديد موقعك بنجاح!', 'success');

      // Check proximity alerts
      checkProximityAlerts(lat, lng);
    },
    (err) => {
      const msgs = {
        1: 'رفضت المتصفح الوصول للموقع. فعّل الإذن وأعد المحاولة.',
        2: 'تعذر تحديد موقعك. تحقق من الـ GPS.',
        3: 'انتهت مهلة الاستجابة. حاول مجدداً.'
      };
      Toast.show(msgs[err.code] || 'خطأ في الموقع الجغرافي', 'error');
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
  );
}

function checkProximityAlerts(userLat, userLng) {
  const nearby = state.reports.filter(r => {
    const dist = calcDistance(userLat, userLng, r.lat, r.lng);
    return dist < PROXIMITY_ALERT_RADIUS_KM && r.severity === 'heavy';
  });

  if (nearby.length > 0) {
    sfx.playAlert();
    Toast.show(`⚠️ تنبيه! ${nearby.length} حدث خطير على بُعد ${PROXIMITY_ALERT_RADIUS_KM}كم منك`, 'warning', 6000);
  }
}

function calcDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// ==========================================
// 10. Report Submission
// ==========================================
function handleReportSubmit(e) {
  e.preventDefault();

  const reportType = document.querySelector('input[name="reportType"]:checked').value;
  const severity = document.querySelector('input[name="severity"]:checked').value;
  const title = document.getElementById("reportTitle").value.trim();
  const note = document.getElementById("reportNote").value.trim();
  const authorInput = document.getElementById("reporterName")?.value.trim();
  const lat = parseFloat(document.getElementById("reportLat").value) || state.pickedCoords.lat;
  const lng = parseFloat(document.getElementById("reportLng").value) || state.pickedCoords.lng;

  if (!title) {
    Toast.show('⚠️ يرجى كتابة اسم الشارع أو السيطرة', 'warning');
    return;
  }

  const btn = document.getElementById('submitReportBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري النشر...';

  setTimeout(() => {
    let reportCity = state.currentCity;
    if (reportCity === "all") {
      let closest = "baghdad", minDist = Infinity;
      for (const [c, coords] of Object.entries(CITY_COORDS)) {
        const d = calcDistance(lat, lng, coords[0], coords[1]);
        if (d < minDist) { minDist = d; closest = c; }
      }
      reportCity = closest;
    }

    const newReport = {
      id: `rep-user-${Date.now()}`,
      city: reportCity,
      type: reportType,
      severity,
      title,
      desc: note,
      lat, lng,
      upvotes: 1,
      resolvedVotes: 0,
      timeAgo: "الآن",
      author: authorInput || "سائق متصل",
      ts: Date.now()
    };

    state.reports.unshift(newReport);
    state.userUpvoted.add(newReport.id);
    saveState();

    // Try posting to local/remote server if running
    try {
      fetch('http://localhost:5000/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReport)
      }).catch(() => {});
    } catch(e) {}

    renderCounters();
    renderMarkers();
    renderFeed();

    document.getElementById("reportModal").classList.remove("open");
    document.getElementById("newReportForm").reset();
    state.map.flyTo([lat, lng], 15, { duration: 1 });

    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> نشر البلاغ فوراً';

    sfx.playSuccessChime();
    Toast.show('✅ تم نشر بلاغك بنجاح! شكراً لمساهمتك 🙏', 'success', 4500);

    // Highlight new card briefly
    setTimeout(() => {
      const newCard = document.getElementById(`card-${newReport.id}`);
      if (newCard) newCard.classList.add('card-new');
    }, 200);
  }, 800);
}

// ==========================================
// 11. Global Window Helpers
// ==========================================
window.flyToReport = function(lat, lng) {
  state.map.flyTo([lat, lng], 16, { duration: 1.2 });
  sfx.playRadarBeep();
};

window.handleUpvote = function(reportId) {
  const report = state.reports.find(r => r.id === reportId);
  if (!report) return;

  if (state.userUpvoted.has(reportId)) {
    state.userUpvoted.delete(reportId);
    report.upvotes = Math.max(0, report.upvotes - 1);
    Toast.show('تم إلغاء التأكيد', 'info', 1800);
  } else {
    state.userUpvoted.add(reportId);
    report.upvotes += 1;
    sfx.playSuccessChime();
    Toast.show(`✅ تم تأكيد البلاغ! (${report.upvotes} تأكيد)`, 'success', 2200);
  }

  saveState();
  renderMarkers();
  renderFeed();
};

window.openShareModal = function(reportId) {
  const report = state.reports.find(r => r.id === reportId);
  if (!report) return;

  const shareText = `🚗 تنبيه مروري من دربك سالك:\n\n📍 ${report.title}\n${TYPE_LABELS[report.type] || ''}\n📝 ${report.desc || ''}\n⏰ ${report.timeAgo}\n\n✅ تأكيد من ${report.upvotes} سائق\n\nتابع السيطرات والازدحامات لحظة بلحظة:\n🌐 https://darbaksalik.me`;

  const preview = document.getElementById("sharePreviewText");
  preview.textContent = shareText;

  document.getElementById("shareWhatsappBtn").onclick = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, "_blank");
  };
  document.getElementById("shareTelegramBtn").onclick = () => {
    window.open(`https://t.me/share/url?url=https://darbaksalik.me&text=${encodeURIComponent(shareText)}`, "_blank");
  };
  document.getElementById("copyShareTextBtn").onclick = () => {
    navigator.clipboard.writeText(shareText).then(() => {
      Toast.show('✅ تم نسخ نص البلاغ!', 'success');
    }).catch(() => {
      Toast.show('تعذر النسخ، حاول يدوياً', 'error');
    });
  };

  document.getElementById("shareModal").classList.add("open");
  sfx.playRadarBeep();
};

window.navigateTo = function(lat, lng) {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
  window.open(url, '_blank');
  Toast.show('🗺️ فتح خرائط Google للتوجيه...', 'info', 2500);
};

// ==========================================
// 12. Live Simulation Ticker
// ==========================================
function startLiveSimulationTicker() {
  // Driver count fluctuation
  setInterval(() => {
    const el = document.getElementById("onlineDriversCount");
    if (!el) return;
    const current = parseInt(el.textContent.replace(/,/g, '')) || 1420;
    const variation = Math.floor(Math.random() * 9) - 4;
    el.textContent = Math.max(1200, current + variation).toLocaleString();
  }, DRIVER_TICK_INTERVAL);

  // Simulate random live report updates
  setInterval(() => {
    simulateLiveUpdate();
  }, LIVE_UPDATE_INTERVAL);

  // Update "time ago" labels
  setInterval(updateTimeAgo, 60000);
}

function simulateLiveUpdate() {
  if (state.reports.length === 0) return;

  const actions = ['upvote', 'new_comment', 'status_change'];
  const action = actions[Math.floor(Math.random() * actions.length)];

  if (action === 'status_change') {
    const randomReport = state.reports[Math.floor(Math.random() * Math.min(5, state.reports.length))];
    if (randomReport && !randomReport.id.startsWith('rep-user-')) {
      const severities = ['smooth', 'moderate', 'heavy'];
      const newSev = severities[Math.floor(Math.random() * severities.length)];
      if (newSev !== randomReport.severity) {
        randomReport.severity = newSev;
        renderFeed();
        renderMarkers();
        const emoji = { smooth:'🟢', moderate:'🟡', heavy:'🔴' }[newSev];
        Toast.show(`${emoji} تحديث حي: ${randomReport.title.substring(0,30)}...`, 'info', 3000);
        sfx.playRadarBeep();
      }
    }
  }
}

function updateTimeAgo() {
  state.reports.forEach(r => {
    if (!r.ts) return;
    const diff = Date.now() - r.ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) r.timeAgo = 'الآن';
    else if (mins < 60) r.timeAgo = `منذ ${mins} دقيقة`;
    else {
      const hours = Math.floor(mins / 60);
      r.timeAgo = hours < 24 ? `منذ ${hours} ساعة` : `منذ ${Math.floor(hours/24)} يوم`;
    }
  });
  renderFeed();
}

// ==========================================
// 13. PWA Install Prompt
// ==========================================
function initPWA() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    state.deferredInstallPrompt = e;

    // Show install bar after 10s if not dismissed
    const dismissed = localStorage.getItem('pwa_dismissed');
    if (!dismissed) {
      setTimeout(() => {
        const bar = document.getElementById('pwaInstallBar');
        if (bar) bar.style.display = 'flex';
      }, 10000);
    }
  });

  const installBtn = document.getElementById('pwaInstallBtn');
  const dismissBtn = document.getElementById('pwaDismissBtn');

  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      if (state.deferredInstallPrompt) {
        state.deferredInstallPrompt.prompt();
        const { outcome } = await state.deferredInstallPrompt.userChoice;
        state.deferredInstallPrompt = null;
        document.getElementById('pwaInstallBar').style.display = 'none';
        if (outcome === 'accepted') {
          Toast.show('✅ تم تثبيت دربك سالك بنجاح!', 'success', 4000);
        }
      }
    });
  }

  if (dismissBtn) {
    dismissBtn.addEventListener('click', () => {
      document.getElementById('pwaInstallBar').style.display = 'none';
      localStorage.setItem('pwa_dismissed', '1');
    });
  }

  window.addEventListener('appinstalled', () => {
    document.getElementById('pwaInstallBar').style.display = 'none';
    Toast.show('🎉 مرحباً! تم تثبيت التطبيق على هاتفك', 'success', 5000);
  });
}

// ==========================================
// 14. Connection Status
// ==========================================
function setConnectionStatus(online) {
  const el = document.getElementById('connectionStatus');
  const dot = el.querySelector('.conn-dot');
  const label = document.getElementById('connLabel');
  if (online) {
    dot.className = 'conn-dot online';
    label.textContent = 'متصل';
  } else {
    dot.className = 'conn-dot offline';
    label.textContent = 'غير متصل';
  }
}

window.addEventListener('online', () => {
  setConnectionStatus(true);
  Toast.show('✅ عاد الاتصال بالإنترنت', 'success', 2500);
});
window.addEventListener('offline', () => {
  setConnectionStatus(false);
  Toast.show('⚠️ انقطع الاتصال بالإنترنت', 'warning', 4000);
});

// ==========================================
// 15. Utilities
// ==========================================
function escapeHTML(str) {
  return (str || '').replace(/[&<>'"/]/g,
    t => ({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;','/':'&#47;' }[t] || t)
  );
}
