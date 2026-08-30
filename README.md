# دربك سالك (Darbak Salik) 🚗🇮🇶
### Waze العراقي التشاركي اللحظي لرصد السيطرات والازدحامات

<p align="center">
  <img src="https://img.shields.io/badge/Status-Live%20Radar-emerald?style=for-the-badge&logo=radar" alt="Live Status">
  <img src="https://img.shields.io/badge/Country-Iraq%20%F0%9F%87%AE%F0%9F%87%B6-blue?style=for-the-badge" alt="Iraq">
  <img src="https://img.shields.io/badge/Cost-100%25%20Free-green?style=for-the-badge" alt="Free Cost">
  <img src="https://img.shields.io/badge/PWA-Ready-orange?style=for-the-badge" alt="PWA Ready">
</p>

---

## 📖 حول المشروع
**دربك سالك** هو منصة وتطبيق ويب مجاني 100% وتشاركي، صُمم خصيصاً للتعامل مع واقع شوارع وازدحامات العراق:
* 🚨 **رصد السيطرات الأمنية:** (مفتوحة، تفتيش دقيق، أو طوابير شاحنات وسيارات).
* 📷 **رادارات السرعة والكاميرات الذكية:** التنبيه بالسرعة المحددة وكاميرات الإشارات.
* ⛔ **القطوعات والتحويلات المرورية:** أعمال الجسور والمشاريع والأنفاق.
* ⛽ **محطات الوقود الحية:** توفر بنزين سوبر ومحسن ومحطات الـ 24 ساعة.
* 🛣️ **الدرابين والطرق البديلة:** اختصارات سالكة لتجاوز الاختناقات.
* 🌉 **شريط مباشر لحالة جسور بغداد:** (الجادرية، السنك، 14 تموز، المعلق، سريع الدورة، سريع محمد القاسم).

---

## 🛠️ التقنيات المستخدمة (Tech Stack)
* **الواجهة:** HTML5 Semantic + Vanilla CSS (Glassmorphic Night-Drive Mode) + JavaScript (ES6+).
* **الخرائط:** [Leaflet.js](https://leafletjs.com/) مع طبقات خرائط مجانية مفتوحة المصدر من [CartoDB](https://carto.com/) و [OpenStreetMap](https://www.openstreetmap.org/).
* **التطبيق:** Progressive Web App (PWA) قابل للتثبيت على الهواتف مباشرة بدون متجر تطبيقات.
* **الصوت:** Web Audio API لتوليد أصوات التنبيه والرادار خفيفاً وبدون ملفات صوتية خارجية.

---

## 🚀 التشغيل السريع
يمكن تشغيل المشروع محلياً بمجرد فتح ملف `index.html` في أي متصفح، أو عبر أي خادم ويب بسيط:

```bash
# تشغيل باستخدام Python
python -m http.server 3000

# أو تشغيل باستخدام Node.js
npx serve .
```

---

## 🎓 تكامل حزمة الطلاب (GitHub Student Developer Pack)
تم تجهيز هذا المستودع للاستفادة الكاملة من خدمات الطلاب:
1. **GitHub Pages + Actions:** نشر واستضافة تلقائية مستمرة ومجانية فور دفع أي تحديث للكود.
2. **Namecheap / Name.com:** ربط دومين مخصص مجاني `.me` أو `.live` عبر ملف `CNAME`.
3. **DigitalOcean:** تجهيز سيرفر وبوت تيليجرام لنشر البلاغات الحية للمحافظات.

---

## 🤝 المساهمة
نرحب بمساهمات المطورين العراقيين والعرب لتحسين الخرائط وإضافة ميزات جديدة!

1. Fork للمستودع.
2. أنشئ فرع جديد (`git checkout -b feature/AmazingFeature`).
3. Commit لتعديلاتك (`git commit -m 'Add some AmazingFeature'`).
4. Push للفرع (`git push origin feature/AmazingFeature`).
5. افتح Pull Request.

---

<p align="center">
  صُنع بكل ❤️ من أجل تسهيل حركة السائقين في شوارع العراق 🇮🇶
</p>
