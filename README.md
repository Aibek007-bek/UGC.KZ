# UGC.KZ — a creator for your brand

Сайт-платформа, которая объединяет бренды и креаторов Казахстана (18 қала). Чистый HTML + CSS + JavaScript, сборка не нужна.

## Құрылым

```
index.html            — каркас: шапка, мәзір, төменгі бөлім
js/i18n.js            — 3 тіл (қазақша, орысша, ағылшынша): аудармалар, t(), setLang()
css/style.css         — барлық стильдер (brand book түстері, Poppins + Inter)
js/data.js            — қалалар, санаттар, сақтау (localStorage / IndexedDB)
js/pages/home.js      — Главная
js/pages/catalog.js   — Креаторы (сүзгілер)
js/pages/creator.js   — креатор профилі, видео қосу, «Связаться»
js/pages/auth.js      — кіру және тіркелу
js/pages/brands.js    — Бренды
js/pages/about.js     — О нас
js/app.js             — роутер (#/catalog, #/brands …) және клик өңдеушілері
```

## Жергілікті іске қосу

`index.html` файлын браузерде ашу жеткілікті. Немесе:

```
python3 -m http.server 8000
```

## GitHub Pages

1. Репозиторий жасаңыз және осы файлдарды салыңыз.
2. **Settings → Pages → Build and deployment → Deploy from a branch → main / (root)**.
3. Бірнеше минуттан кейін сайт `https://<аты>.github.io/<репо>/` мекенжайында ашылады.

## Ескерту

Профильдер, таңдаулылар мен видеолар қазір тек пайдаланушы браузерінде сақталады (localStorage / IndexedDB), сервер жоқ.

## Тілдер

Хедердегі таңдау арқылы тіл ауыстырылады (kk / ru / en), таңдау `localStorage`-та сақталады. Алғашқы кіргенде браузер тілі қолданылады. Жаңа мәтін қосу үшін `js/i18n.js` ішіндегі үш сөздікке де кілт қосыңыз және кодта `t("кілт")` деп жазыңыз.
