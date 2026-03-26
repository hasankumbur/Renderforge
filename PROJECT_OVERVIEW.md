# RenderForge MVP - Projenin A-Z Tam Teknik Dokumantasyonu

> Bu dokuman, projenin tum isleyis mantigi, mimarisi, dosya yapisi, veri akisi ve her bir bileseni madde madde aciklar.
> Amac: Baska bir AI modeline projeyi sanki kendi olusturmus gibi tamamen aktarmak.

---

## 1. Proje Kimlik Bilgisi

- **Proje Adi:** RenderForge MVP
- **Amac:** Template tabanli gorsel (image) ve video uretim platformu. Kullanici bir template tasarlar (canvas editor ile), degiskenleri (variable) belirler ve API uzerinden render talep eder. Cikti olarak PNG/JPEG/WEBP gorsel veya MP4/GIF video uretilir.
- **Hedef Kullanim:** Sosyal medya gorselleri, story'ler, quote kartlari gibi tekrarli icerikleri otomatik uretmek. n8n gibi otomasyon araclari ile API uzerinden toplu icerik uretimi yapilabilir.
- **Dil:** Tum UI ve backend hata mesajlari Turkce.
- **Monorepo:** Tek repo icinde `client/` (frontend) ve `server/` (backend) birlikte yasar.

---

## 2. Teknoloji Yigini (Tech Stack)

| Katman | Teknoloji | Detay |
|--------|-----------|-------|
| **Package Manager** | pnpm | Workspace destekli, `pnpm-workspace.yaml` ile native build izinleri |
| **Runtime** | Node.js >= 20 | ES Modules (`"type": "module"`) |
| **Frontend** | React + Vite | JSX (TypeScript YOK), port 5173, HMR |
| **State Yonetimi** | Zustand | Tek store: `editorStore.js` |
| **Canvas Kutuphanesi** | Fabric.js | Editor icerisinde gorsel layer manipulasyonu |
| **Routing** | React Router DOM v6+ | `BrowserRouter`, nested routes |
| **Backend** | Express.js | REST API, JSON body parser (5MB limit), CORS |
| **Veritabani** | SQLite (better-sqlite3) | WAL modu, dosya: `server/renderforge.db` |
| **Gorsel Render** | Puppeteer | HTML sablonu olusturup screenshot alir |
| **Video Render** | Remotion | `@remotion/bundler` + `@remotion/renderer`, Webpack bundle |
| **Dosya Upload** | Multer | Disk storage, `uploads/` klasoru |
| **ID Uretimi** | nanoid | 8-14 karakter benzersiz ID'ler |
| **Dev Arac** | concurrently | Server ve client ayni anda calistirir |
| **Styling** | Vanilla CSS | Tek global dosya, CSS Variables, responsive (mobile-first) |

---

## 3. Dosya Yapisi (Tam Agac)

```
renderforge-mvp/
├── package.json                  # Root: monorepo scripts, tum bagimliliklar
├── pnpm-lock.yaml                # Lockfile
├── pnpm-workspace.yaml           # Native build izinleri (better-sqlite3, canvas, puppeteer vs)
├── .env.example                  # Ornek env degiskenleri
├── .gitignore                    # node_modules, dist, db, uploads, outputs haric
├── README.md                     # Kurulum ve API dokumantasyonu
├── PROJECT_PLAN.md               # Faz bazli gelistirme plani
│
├── client/                       # FRONTEND (React + Vite)
│   ├── index.html                # Vite entry HTML (<div id="root">)
│   ├── vite.config.js            # React plugin, proxy ayarlari
│   └── src/
│       ├── main.jsx              # React mount noktasi, BrowserRouter wrapper
│       ├── App.jsx               # Router tanimlamalari, session yonetimi, layout (AppArea)
│       ├── styles.css            # Tum CSS (global, responsive, editor, dashboard vs)
│       ├── lib/
│       │   └── api.js            # Merkezi API istemcisi (fetch wrapper, X-API-Key header)
│       ├── store/
│       │   └── editorStore.js    # Zustand store (template, layers, undo/redo, selection)
│       ├── pages/
│       │   ├── Login.jsx         # Giris ekrani (localStorage tabanli, sahte auth)
│       │   ├── Dashboard.jsx     # Ana sayfa: arama, kategori grid, son template'ler
│       │   ├── Editor.jsx        # Canvas editor sayfasi: toolbar, layers, canvas, properties
│       │   ├── Templates.jsx     # Template listesi: listeleme, silme, editore yonlendirme
│       │   ├── Renders.jsx       # Render gecmisi: tablo/kart goruntuleme, indirme linkleri
│       │   └── Profile.jsx       # Kullanici profili: avatar, istatistikler, hizli linkler
│       └── components/
│           ├── shared/
│           │   ├── Header.jsx    # Ust bar: avatar, menu toggle, premium buton
│           │   └── Sidebar.jsx   # Yan menu (desktop) + alt navigasyon (mobile)
│           └── editor/
│               ├── Canvas.jsx    # Fabric.js canvas: layer cizimi, secim, zoom, resize
│               ├── Toolbar.jsx   # Arac cubugu: isim, kaydet, undo/redo, sekliller, upload, preset boyutlar
│               ├── LayerPanel.jsx    # Katman listesi: drag-drop siralama, secim, variable toggle
│               ├── PropertiesPanel.jsx # Secili layer ozellikleri: text/image/shape alanlari
│               └── RenderModal.jsx   # Render dialog: output tipi, format, degisken override, API cagrisi
│
├── server/                       # BACKEND (Express + SQLite)
│   ├── index.js                  # Express sunucu baslangici, middleware, route montaji
│   ├── db.js                     # SQLite sema, seed data, CRUD fonksiyonlari
│   ├── middleware/
│   │   └── auth.js               # requireApiKey middleware (X-API-Key header kontrolu)
│   ├── routes/
│   │   ├── templates.js          # CRUD: GET/POST/PUT/DELETE /api/templates
│   │   ├── render.js             # POST /api/render (image/video), GET /api/render/history
│   │   └── assets.js             # POST /api/assets/upload (multer ile dosya yukleme)
│   ├── services/
│   │   ├── imageRenderer.js      # Puppeteer ile HTML -> screenshot (PNG/JPEG/WEBP)
│   │   ├── videoRenderer.js      # Remotion ile schema -> video (MP4/GIF)
│   │   ├── renderQueue.js        # In-memory kuyruk sistemi (concurrency limiti)
│   │   └── schemaUtils.js        # Schema parse, override uygulama, format normalizasyonu
│   ├── remotion/
│   │   ├── entry.jsx             # Remotion root: Composition tanimlamasi
│   │   └── RenderForgeComposition.jsx  # React component: layer'lari video frame'e cizer
│   └── tests/
│       └── schema-utils.test.mjs # schemaUtils icin unit testler
│
├── templates-html/               # HTML template varliklari icin ayrilmis klasor
│   └── base-template.html        # Placeholder HTML
│
├── uploads/                      # (runtime, gitignore) Yuklenen dosyalar
└── outputs/                      # (runtime, gitignore) Render ciktilari
```

---

## 4. Ortam Degiskenleri (.env)

| Degisken | Varsayilan | Aciklama |
|----------|-----------|----------|
| `PORT` | `3001` | Express sunucu portu |
| `API_KEY` | `rforge_dev_secret_change_me` | API istekleri icin paylasilan gizli anahtar |
| `HOST_URL` | `http://localhost:3001` | Render ciktilarinin tam URL prefix'i |
| `RENDER_CONCURRENCY` | `1` | Ayni anda islenebilecek render sayisi |
| `CHROMIUM_PATH` | (bos) | Puppeteer icin ozel Chromium yolu (opsiyonel) |

---

## 5. Calistirma Komutlari

| Komut | Aciklama |
|-------|----------|
| `pnpm dev` | Server (node --watch) + Client (vite) ayni anda calistirir |
| `pnpm dev:server` | Sadece backend (port 3001) |
| `pnpm dev:client` | Sadece frontend (port 5173) |
| `pnpm build` | Client uretim build'i (client/dist) |
| `pnpm start` | Build + production server |
| `pnpm test` | `server/tests/*.test.mjs` testlerini calistirir |

---

## 6. Auth Sistemi (Kimlik Dogrulama)

### 6a. UI Tarafinda (Frontend Login)

- **Tip:** localStorage uzerinden gecici/sahte login sistemi. Gercek bir backend auth endpoint'i YOKTUR.
- **Akis:**
  1. Kullanici `/login` sayfasinda Ad, E-posta, Sifre alanlarini doldurur.
  2. `Login.jsx` icerisinde form submit edildiginde sadece email ve password bos olmadigini kontrol eder.
  3. Herhangi bir backend cagrisi YAPILMAZ. Dogrudan `onLogin({ name, email, role: 'Owner' })` cagirilir.
  4. `App.jsx`'teki `authApi.login()` fonksiyonu session objesini `localStorage`'a `renderforge_session` anahtariyla JSON olarak kaydeder.
  5. `session` state'i React'te guncellenir ve kullanici `/app/dashboard`'a yonlendirilir.
- **Session Objesi:** `{ name: string, email: string, role: string }`
- **Oturum Kontrolu:** `App.jsx`'te `getInitialSession()` sayfa yuklendiginde localStorage'dan session okur. Session varsa `/app/*` route'larina erisim acilir, yoksa `/login`'e yonlendirilir.
- **Logout:** `authApi.logout()` fonksiyonu tanimli ancak HICBIR UI bilesenine baglanmamis (logout butonu yok).
- **Varsayilan Degerler:** Login formu onceden `name: 'RenderForge User'`, `email: 'user@renderforge.app'`, `password: 'demo1234'` ile dolu gelir.

### 6b. API Tarafinda (Backend Auth)

- **Tip:** Statik API Key (shared secret) ile basit header-based dogrulama.
- **Middleware:** `server/middleware/auth.js` icindeki `requireApiKey` fonksiyonu.
- **Calisma Mantigi:**
  1. Gelen istekte `X-API-Key` header'i alinir.
  2. `process.env.API_KEY` (veya varsayilan `rforge_dev_secret_change_me`) ile karsilastirilir.
  3. Eslesmezse `401 { success: false, error: 'Gecersiz API key', code: 'INVALID_API_KEY' }` dondurulur.
- **Korunan Route'lar:** `/api/templates/*` ve `/api/render/*`
- **Korunmayan Route'lar:** `/api/assets/upload` ve `/api/health`
- **Client Tarafi:** `api.js` her istekte `localStorage.getItem('renderforge_api_key')` veya `import.meta.env.VITE_API_KEY` degerini `X-API-Key` header'ina ekler.
- **ONEMLI NOT:** UI login session'i ile API key bagimsizdir. Biri kullanici oturumu icin, digeri API guvenlik anahtari icindir. Ikisi arasinda baginti yoktur.

---

## 7. Routing (Sayfa Yonlendirme)

### 7a. React Router Yapisi

- `main.jsx`: `<BrowserRouter>` ile tum uygulamayi sarar.
- `App.jsx`: Uc ana route grubu:

| Route Pattern | Kosul | Sonuc |
|---------------|-------|-------|
| `/login` | Session yoksa | `Login` sayfasi gosterilir |
| `/login` | Session varsa | `/app/dashboard`'a yonlendirir |
| `/app/*` | Session varsa | `AppArea` layout + nested routes |
| `/app/*` | Session yoksa | `/login`'e yonlendirir |
| `*` (diger hersey) | Session varsa | `/app/dashboard`'a yonlendirir |
| `*` (diger hersey) | Session yoksa | `/login`'e yonlendirir |

### 7b. AppArea Nested Routes

| Path | Component | Aciklama |
|------|-----------|----------|
| `/app/dashboard` | `Dashboard` | Ana sayfa |
| `/app/templates` | `Templates` | Template listesi |
| `/app/editor` | `Editor` | Bos editor (yeni template) |
| `/app/editor/:id` | `Editor` | Mevcut template duzenleme |
| `/app/renders` | `Renders` | Render gecmisi |
| `/app/profile` | `Profile` | Kullanici profili |
| `/app/*` | — | `/app/dashboard`'a redirect |

### 7c. Layout Mantigi (AppArea)

- Editor route'larinda (`/app/editor*`) ozel davranis: Header gizlenir, sidebar gizlenir, layout class'i `editor-route` olur.
- Diger route'larda: Header + Sidebar + Main icerigi gosterilir.
- Mobile menu toggle: Header'daki avatar butonu `onToggleMenu` ile Sidebar'in `open` state'ini toggle eder.

---

## 8. Dashboard Sayfasi

- **Dosya:** `client/src/pages/Dashboard.jsx` (~535 satir)
- **Veri Kaynagi:** Sayfa yuklendiginde `api.getTemplates()` ve `api.getRenderHistory()` API cagrilari yapilir.
- **Ana Bilesenler:**
  1. **Hero Section:** Gradient baslik ("Icerik Fabrikasi"), aciklama metni, KPI istatistik etiketleri (toplam template, render, basari orani).
  2. **Arama Cubugu:** Template adi veya platform etiketine gore filtreleme. `toSearchText()` helper ile normalize edilen arama.
  3. **Platform Chip'leri:** "Tumunu Gor", "Instagram", "YouTube", "X/Twitter", "TikTok", "LinkedIn", "E-Ticaret" secenekleri. Secili platforma gore template'ler filtrelenir.
  4. **Hizli Olustur Grid'i (Kategori Grid):** 3x2 (mobil 3x) buton grid'i. Her buton farkli preset boyut ve isimle editore yonlendirir:
     - Instagram Post (1080x1080)
     - Story/Reels (1080x1920)
     - YouTube Thumbnail (1280x720)
     - X/Twitter Banner (1500x500)
     - LinkedIn Banner (1584x396)
     - Ozel Boyut (varsayilan 1080x1080)
  5. **Son Template'ler:** Yatay kaydirilan kart sirasi. Her kart template adini, boyutunu ve thumbnail/preview gosterir. Tiklandiginda `/app/editor/:id`'ye gider.
- **Platform Tespiti:** `detectPlatform(template)` fonksiyonu template adina ve boyutuna bakarak platformu tespit eder (instagram, youtube, x/twitter, linkedin, tiktok, ecommerce).
- **Bos Durum:** Template yoksa "Henuz template yok" mesaji ve "Yeni Template Olustur" butonu gosterilir.

---

## 9. Editor Sayfasi (Canvas Editor)

- **Dosya:** `client/src/pages/Editor.jsx`
- **Amac:** Template tasariminin yapildigi ana ekran. Fabric.js canvas uzerinde gorsel duzenleme.
- **Sayfa Yuklenme Akisi:**
  1. URL'den `id` parametresi varsa `api.getTemplate(id)` ile mevcut template yuklenir ve `editorStore.setTemplate()` ile store'a yazilir.
  2. URL'de `?preset=...` query varsa JSON parse edilip bos template meta bilgisi olarak ayarlanir (isim, boyut).
  3. Ne id ne preset yoksa `editorStore.resetTemplate()` ile varsayilan bos template olusturulur (1080x1080, beyaz arka plan).
- **Layout:**
  - Desktop: 3 kolonlu grid (LayerPanel | Canvas | PropertiesPanel)
  - Mobile: Tab bazli gorunum (Katmanlar / Canvas / Ozellikler arasi gecis)
- **Alt Bilesenler:**
  - **Toolbar:** En ustte, 2 satirlik arac cubugu
  - **LayerPanel:** Sol panel (katman listesi)
  - **Canvas:** Orta alan (Fabric.js canvas)
  - **PropertiesPanel:** Sag panel (secili layer ozellikleri)
  - **RenderModal:** Render butonuna basildiginda acilan modal
- **Undo/Redo:** Ctrl+Z / Ctrl+Y (Mac: Cmd+Z/Y) klavye kisayollari dinlenir, `editorStore.undo()` / `editorStore.redo()` cagirilir.
- **Mobile Ozel Davranis:**
  - Editor route'unda Header ve Sidebar gizlenir.
  - Ozel mobile header gosterilir (geri butonu, template adi, render butonu).
  - Floating action butonlari (undo, render) sag altta gosterilir.
  - Tab sistemi ile Layer/Canvas/Properties arasi gecilir.

---

## 10. Editor Bilesenleri (Detay)

### 10a. Toolbar (`components/editor/Toolbar.jsx`)

- **Template Adi:** Duzenlenebilir input alani. Degistiginde `setTemplateMeta({ name })`.
- **Undo/Redo Butonlari:** `editorStore.undo()` / `editorStore.redo()`. History bossa disable.
- **Kaydet Butonu:** 
  - Template'in `id`'si varsa `api.updateTemplate(id, body)` (PUT)
  - Yoksa `api.createTemplate(body)` (POST) ve donen id ile URL guncellenir (`/app/editor/:id`)
  - Body: `{ name, width, height, schema: { background, layers, width, height } }`
- **Render Butonu:** `onOpenRender` callback ile RenderModal'i acar.
- **Sekil Ekleme Butonlari:** Text, Dikdortgen (rect), Daire (circle). Her biri `editorStore.addLayer(type)` cagirir.
- **Gorsel Yukleme:** File input ile resim secilir, `api.uploadAsset(file)` ile sunucuya yuklenir, donen URL ile `addLayer('image', { src: url })` cagirilir.
- **Canvas Boyut Preset'leri:** Instagram Post, Story, YouTube, X, LinkedIn, Ozel boyut secenekleri. Secildiginde `setTemplateMeta({ width, height, name })`.
- **Ozel Boyut:** Width ve Height icin sayi input'lari. "Uygula" butonu ile `setTemplateMeta` cagirilir.
- **Arka Plan Rengi:** Renk secici (color input). `setTemplateMeta({ background })`.
- **Hata Gosterimi:** API hatalari toolbar icerisinde kirmizi mesaj olarak gosterilir.

### 10b. Canvas (`components/editor/Canvas.jsx`)

- **Fabric.js Entegrasyonu:**
  - `useEffect` ile `new fabric.Canvas()` olusturulur.
  - Template degistiginde canvas temizlenir ve tum layer'lar yeniden cizilir.
  - Her layer tipi icin farkli Fabric objesi: `fabric.Textbox` (text), `fabric.Image` (image), `fabric.Rect` (rect), `fabric.Circle` (circle).
- **Senkronizasyon (Store <-> Canvas):**
  - Canvas'ta obje secildiginde `editorStore.setSelectedLayerId(id)` cagirilir.
  - Canvas'ta obje tasindinda/boyutlandirildiginda `editorStore.updateLayer(id, { x, y, width, height })` cagirilir.
  - Store'da secim degistiginde canvas'taki ilgili obje programatik olarak secilir.
- **Zoom:** Mouse wheel ile zoom in/out (canvas viewport transform).
- **Resize:** Pencere boyutu degistiginde canvas boyutlari yeniden hesaplanir ve fit edilir.
- **Grid Arka Plan:** CSS ile kareli grid pattern gosterilir (opsiyonel gorsel).
- **Canvas Boyutu:** Template'in `width` x `height` degerlerine gore ayarlanir.

### 10c. LayerPanel (`components/editor/LayerPanel.jsx`)

- **Katman Listesi:** Template'in `layers` dizisi ters sirada (en ustteki layer en ustte) gosterilir.
- **Secim:** Bir katmana tiklandiginda `setSelectedLayerId` cagirilir, `.selected` class'i eklenir.
- **Drag & Drop Siralama:** HTML5 drag events ile layer'lar suruklenerek siralama degistirilir. `editorStore.reorderLayers(sourceId, targetId)` cagirilir.
- **Katman Bilgileri:** Her satirda layer adi, tipi, variable toggle.
- **Variable Toggle:** Checkbox ile layer'a degisken adi atanabilir. Aktif edildiginde text input gosterilir, `updateLayer(id, { variable })` ile kaydedilir.
- **Silme:** Her katmanin yaninda silme butonu, `editorStore.removeLayer(id)`.

### 10d. PropertiesPanel (`components/editor/PropertiesPanel.jsx`)

- **Kosullu Gorunum:** Secili layer yoksa "Bir katman secin" mesaji gosterilir.
- **Ortak Alanlar (tum tipler):**
  - Ad (name): text input
  - X, Y pozisyon: sayi input
  - Genislik, Yukseklik: sayi input
  - Opacity: 0-1 arasi range slider
  - Variable: text input (otomasyon degiskeni)
- **Text Layer Ozellikleri:**
  - Metin icerigi (textarea)
  - Font buyuklugu (fontSize)
  - Font ailesi (fontFamily) - select: Inter, Arial, Georgia, monospace vs
  - Font aginligi (fontWeight) - select: normal, bold, 100-900
  - Renk (color) - color picker
  - Metin hizalama (textAlign) - left/center/right
- **Image Layer Ozellikleri:**
  - Gorsel URL (src) - text input
- **Rect Layer Ozellikleri:**
  - Dolgu rengi (fill) - color picker
  - Cerceve rengi (stroke) - color picker
  - Cerceve kalinligi (strokeWidth) - sayi
  - Kose yuvarlakligi (cornerRadius) - sayi
- **Circle Layer Ozellikleri:**
  - Dolgu rengi (fill) - color picker
  - Cerceve rengi (stroke) - color picker
  - Cerceve kalinligi (strokeWidth) - sayi
- **Z-Order Butonlari:** "One Getir" (`bringForward`) ve "Arkaya Gonder" (`sendBackward`).
- **Tum degisiklikler:** `editorStore.updateLayer(id, patch)` ile aninda store'a yazilir.

### 10e. RenderModal (`components/editor/RenderModal.jsx`)

- **Acilma:** Editor'deki "Render" butonuna basildiginda.
- **Secenekler:**
  - Output Tipi: Image / Video (select)
  - Image Format: PNG / JPEG / WEBP
  - Video Format: MP4 / GIF
  - Video FPS: 10-60 arasi (varsayilan 30)
  - Video Sure: 1-30 saniye (varsayilan 10)
- **Degisken Override'lari:**
  - Template'teki `variable` alani dolu olan layer'lar otomatik listelenir.
  - Her degisken icin input alani gosterilir.
  - Kullanici bu alanlari doldurup render sirasinda layer iceriklerini degistirebilir.
- **Render Akisi:**
  1. "Render Baslat" butonuna basilir.
  2. Template oncelikle kaydedilir (yoksa create, varsa update).
  3. `api.render({ templateId, outputType, format, overrides, fps?, durationSeconds? })` cagirilir.
  4. Basarili olursa sonuc URL'i `editorStore.setRenderResult(result)` ile kaydedilir ve gosterilir.
  5. Hata olursa modal icinde hata mesaji gosterilir.
- **Kapatma:** Overlay'e veya "Kapat" butonuna tiklanarak.

---

## 11. Templates Sayfasi

- **Dosya:** `client/src/pages/Templates.jsx`
- **Veri:** `api.getTemplates()` ile tum template'ler listelenir.
- **Gorunum:** Grid seklinde kart listesi.
- **Her Kartta:** Template adi, boyut bilgisi, thumbnail (varsa).
- **Islemler:**
  - "Duzenle" butonu: `/app/editor/:id` sayfasina yonlendirir.
  - "Sil" butonu: Onay sonrasi `api.deleteTemplate(id)` cagirilir, liste guncellenir.
- **Yeni Template:** "Yeni Template" butonu `/app/editor` sayfasina (id'siz) yonlendirir.

---

## 12. Renders Sayfasi

- **Dosya:** `client/src/pages/Renders.jsx`
- **Veri:** `api.getRenderHistory()` ile tum render kayitlari listelenir.
- **Desktop Gorunum:** HTML tablo: Render ID, Template ID, Output Tipi, Durum, Tarih, Indirme linki.
- **Mobile Gorunum:** Kart bazli liste (`.renders-mobile-cards`).
- **Durum Renkleri:** `done` = yesil, `error` = kirmizi, `processing` = sari, `pending` = gri.
- **Indirme:** `output_url` alanindaki linke tiklanarak cikti indirilir.

---

## 13. Profile Sayfasi

- **Dosya:** `client/src/pages/Profile.jsx`
- **Veri Kaynagi:** `session` prop'u uzerinden (localStorage'daki kullanici bilgileri).
- **Bilesenler:**
  - Avatar: Ismin bas harfleri gradient daire icinde.
  - Ad ve e-posta.
  - Istatistik kartlari (placeholder degerler): Toplam Template, Toplam Render, Basari Orani, Aktif Gun.
  - Hizli Linkler: Editore Git, Template'ler, Render Gecmisi.
- **NOT:** Bu sayfa tamamen statik/placeholder. Gercek istatistik verisi API'den cekilmiyor.

---

## 14. Shared Bilesenler

### 14a. Header (`components/shared/Header.jsx`)

- **Gorunum:** Sticky ust bar, 3 kolonlu grid: Avatar (sol) | Spacer (orta) | Premium buton (sag).
- **Avatar:** Session'daki `name`'in bas harfleri veya `avatarUrl` gorseli.
- **Toggle Menu:** Tiklayinca `onToggleMenu` callback cagirilir (mobile sidebar acma).
- **Premium Buton:** Tac ikonu (dekoratif, fonksiyonu yok).

### 14b. Sidebar (`components/shared/Sidebar.jsx`)

- **Desktop (>430px):** Sol kenar cubugu, NavLink'ler: Dashboard, Template'ler, Editor, Render Gecmisi, Profil.
- **Mobile (<=430px):** Alt sabit navigasyon cubugu (bottom tab bar). Ayni linkler ikon + etiket olarak.
- **Aktif Link:** `NavLink` ile otomatik `.active` class'i, mor renk vurgusu.
- **Overlay:** Mobile'da sidebar acikken arkaplan overlay gosterilir, tiklayinca kapanir.
- **Editor Route'unda:** `hideDesktopSidebar` ve `hideMobileNav` prop'lari ile tamamen gizlenir.

---

## 15. Zustand Store (editorStore.js) - State Yonetimi

### 15a. State Yapisi

```
{
  template: {
    id: string | null,
    name: string,
    width: number,
    height: number,
    background: string (hex),
    layers: Layer[]
  },
  selectedLayerId: string | null,
  renderResult: object | null,
  history: Template[],     // undo stack (max 80)
  future: Template[]       // redo stack (max 80)
}
```

### 15b. Layer Yapisi

```
{
  id: string,              // "layer_" + timestamp
  name: string,            // "text_1234", "rect_5678" vs
  type: "text" | "image" | "rect" | "circle",
  x: number,
  y: number,
  width: number,
  height: number,
  opacity: number,         // 0-1
  zIndex: number,          // siralama
  variable: string,        // otomasyon degisken adi (bos ise override edilmez)
  
  // Text ozellikleri:
  text?: string,
  fontSize?: number,
  fontFamily?: string,
  fontWeight?: string,
  color?: string,
  textAlign?: string,
  italic?: boolean,
  underline?: boolean,
  
  // Image ozellikleri:
  src?: string,
  
  // Rect/Circle ozellikleri:
  fill?: string,
  stroke?: string,
  strokeWidth?: number,
  cornerRadius?: number,    // sadece rect
}
```

### 15c. Store Aksiyonlari

| Aksiyon | Aciklama | History Kaydeder Mi? |
|---------|----------|---------------------|
| `resetTemplate()` | Bos template'e sifirlar, tum state temizlenir | Hayir |
| `setTemplate(payload)` | API'den gelen template verisini normalize edip yukler | Hayir (history sifirlanir) |
| `setTemplateMeta(meta, options)` | Template meta (name, width, height, background) gunceller | Evet (opsiyonel) |
| `setSelectedLayerId(id)` | Secili layer'i degistirir | Hayir |
| `addLayer(type, preset)` | Yeni layer ekler, otomatik secilir | Evet |
| `updateLayer(id, patch, options)` | Layer ozelliklerini gunceller | Evet (opsiyonel) |
| `removeLayer(id)` | Layer'i siler | Evet |
| `reorderLayers(sourceId, targetId)` | iki layer'in sirasini degistirir (drag-drop) | Evet |
| `bringForward(id)` | Layer'i bir kademe one getirir (zIndex arttirir) | Evet |
| `sendBackward(id)` | Layer'i bir kademe arkaya gonderir (zIndex dusurur) | Evet |
| `setRenderResult(result)` | Render sonucunu kaydeder | Hayir |
| `undo()` | History'den bir onceki duruma doner | - |
| `redo()` | Future'dan bir sonraki duruma gecer | - |

### 15d. Undo/Redo Mekanizmasi

- `history` dizisi: Her template degisikliginden once mevcut template'in deep clone'u eklenir (max 80).
- `future` dizisi: Undo yapildiginda mevcut template future'a eklenir. Yeni bir degisiklik yapildiginda future temizlenir.
- `clone()` fonksiyonu: `JSON.parse(JSON.stringify(value))` ile deep clone.
- `normalizeLayerOrder()`: Layer'lari `zIndex`'e gore siralar ve 0'dan baslayarak yeniden numaralandirir.

---

## 16. API Istemcisi (client/src/lib/api.js)

### 16a. Genel Yapi

- `request(path, options)`: Merkezi fetch wrapper.
  - `Content-Type: application/json` otomatik eklenir (FormData haric).
  - `X-API-Key` header'i `localStorage.getItem('renderforge_api_key')` veya `import.meta.env.VITE_API_KEY`'den alinir.
  - Yanit JSON parse edilir. `response.ok` degilse veya `payload.success === false` ise Error firlatilir.
  - Error objesine `error.code` alani eklenir (API hata kodu).

### 16b. API Metotlari

| Metot | HTTP | Endpoint | Body |
|-------|------|----------|------|
| `api.getTemplates()` | GET | `/api/templates` | - |
| `api.getTemplate(id)` | GET | `/api/templates/:id` | - |
| `api.createTemplate(body)` | POST | `/api/templates` | `{ name, width, height, schema, thumbnail? }` |
| `api.updateTemplate(id, body)` | PUT | `/api/templates/:id` | `{ name?, width?, height?, schema?, thumbnail? }` |
| `api.deleteTemplate(id)` | DELETE | `/api/templates/:id` | - |
| `api.uploadAsset(file)` | POST | `/api/assets/upload` | FormData (`file` alani) |
| `api.render(body)` | POST | `/api/render` | `{ templateId, outputType, format, overrides?, fps?, durationSeconds? }` |
| `api.getRenderHistory()` | GET | `/api/render/history` | - |

---

## 17. Backend API Endpointleri

### 17a. Health Check

- `GET /api/health` → `{ success: true, status: 'ok' }` (Auth gerektirmez)

### 17b. Assets (Dosya Yukleme)

- `POST /api/assets/upload` (Auth GEREKTIRMEZ - middleware baglanmamis)
  - Multer ile `file` alanindaki dosya `uploads/` klasorune kaydedilir.
  - Dosya adi: `{timestamp}_{nanoid(8)}{uzanti}` formatinda.
  - DB'ye asset kaydi olusturulur (`assets` tablosu).
  - Yanit: `{ success: true, data: { id, filename, original_name, path, url, size, created_at } }`

### 17c. Templates CRUD

- `GET /api/templates` → Tum template'ler (guncelleme tarihine gore ters sirada)
- `GET /api/templates/:id` → Tek template
- `POST /api/templates` → Yeni template olustur
  - Zorunlu: `name`
  - Opsiyonel: `width` (def 1080), `height` (def 1080), `schema`, `thumbnail`
  - Schema string veya obje olabilir, her durumda normalize edilir.
- `PUT /api/templates/:id` → Template guncelle (partial update destekli)
- `DELETE /api/templates/:id` → Template sil

### 17d. Render

- `POST /api/render` → Render islemi baslat
  - Zorunlu: `templateId`
  - Opsiyonel: `outputType` (image|video, def 'image'), `format` (png|jpeg|webp|mp4|gif), `overrides` (key-value obje), `fps`, `durationSeconds`
  - Akis:
    1. Template DB'den getirilir.
    2. Render kaydi `pending` olarak DB'ye yazilir.
    3. `renderQueue.enqueue()` ile kuyruga eklenir.
    4. Kuyruk isleme aldiginda status `processing` olur.
    5. Image ise `renderTemplateToImage()`, video ise `renderTemplateToVideo()` cagirilir.
    6. Basarili olursa status `done`, URL kaydedilir.
    7. Hata olursa status `error`, hata mesaji kaydedilir.
  - Yanit (basarili): `{ success: true, renderId, url, outputType, templateId, createdAt }`
  - Yanit (hata): `{ success: false, error, code: 'RENDER_FAILED', detail }`
- `GET /api/render/history` → Tum render kayitlari (opsiyonel `?templateId` filtresi)
- `GET /api/render/:id` → Tek render kaydi

---

## 18. Veritabani Semasi (SQLite)

### 18a. Tablolar

**templates:**
| Kolon | Tip | Aciklama |
|-------|-----|----------|
| id | TEXT PK | nanoid(12) |
| name | TEXT NOT NULL | Template adi |
| width | INTEGER | Genislik (px), varsayilan 1080 |
| height | INTEGER | Yukseklik (px), varsayilan 1080 |
| schema | TEXT NOT NULL | JSON string: { background, layers[], width, height } |
| thumbnail | TEXT | Thumbnail URL (opsiyonel) |
| created_at | TEXT | ISO datetime |
| updated_at | TEXT | ISO datetime |

**renders:**
| Kolon | Tip | Aciklama |
|-------|-----|----------|
| id | TEXT PK | nanoid(14) |
| template_id | TEXT FK | Template referansi |
| output_type | TEXT NOT NULL | 'image' veya 'video' |
| status | TEXT | 'pending', 'processing', 'done', 'error' |
| input_data | TEXT | JSON: { overrides, format, fps?, durationSeconds?, durationInFrames? } |
| output_path | TEXT | Dosya yolu: /outputs/render_xxx.png |
| output_url | TEXT | Tam URL |
| error_msg | TEXT | Hata mesaji |
| created_at | TEXT | ISO datetime |

**assets:**
| Kolon | Tip | Aciklama |
|-------|-----|----------|
| id | TEXT PK | nanoid(12) |
| filename | TEXT NOT NULL | Sunucudaki dosya adi |
| original_name | TEXT | Orijinal yukleme adi |
| path | TEXT NOT NULL | Relatif yol: /uploads/xxx.jpg |
| url | TEXT NOT NULL | Tam URL |
| size | INTEGER | Dosya boyutu (byte) |
| created_at | TEXT | ISO datetime |

### 18b. Seed Data (Starter Templates)

Sunucu ilk basladiginda `seedStarterTemplates()` fonksiyonu 3 hazir template ekler (INSERT OR IGNORE - sadece yoksa):

1. **"Sosyal Gonderi - Haber Karti"** (1080x1350): Arka plan gorsel, karanlik overlay, ust bilgi cubugu, profil rozeti, marka adi, baslik, aciklama, alt etkilesim cubugu. Degiskenler: coverImage, brandName, headline, description, engagementText, menuText.
2. **"Sosyal Story - Dikey Manset"** (1080x1920): Story arka plan, overlay, ilerleme cubuklari, marka, kullanici adi, baslik, CTA ok. Degiskenler: storyImage, brandName, handleText, headline, ctaArrow, menuText.
3. **"Sosyal Kare - Gunun Sozu"** (1080x1080): Arka plan gorsel, overlay, metin paneli, baslik, soz metni, yazar adi. Degiskenler: coverImage, title, quoteText, author.

Her template'in layer'lari detayli x/y/width/height/zIndex/font bilgileri ile tanimlanmistir.

---

## 19. Gorsel Render Pipeline (Puppeteer)

- **Dosya:** `server/services/imageRenderer.js`
- **Akis:**
  1. `parseTemplateSchema(template)`: Template'in schema'sini JSON parse eder, width/height/background/layers cikarir.
  2. `applyOverridesToSchema(schema, overrides)`: `variable` alani dolu olan layer'larda override degerlerini uygular (text -> text, image -> src).
  3. `schemaToHtml(schema)`: Layer'lari HTML elementlerine cevirir:
     - Text → `<div>` (inline CSS: position, font, color vs)
     - Image → `<img>` (src, object-fit)
     - Rect → `<div>` (background, border, border-radius)
     - Circle → `<div>` (border-radius: 9999px)
     - Tum elementler absolute positioned, zIndex'e gore siralanir.
  4. Puppeteer baslatilir (`headless: true`, no-sandbox).
  5. Viewport template boyutuna ayarlanir.
  6. HTML set edilir (`waitUntil: 'networkidle0'` ile resimler yuklenir).
  7. Screenshot alinir (format: png/jpeg/webp, jpeg/webp icin quality: 90).
  8. `outputs/render_{renderId}.{format}` olarak kaydedilir.
  9. Browser kapatilir.

---

## 20. Video Render Pipeline (Remotion)

- **Dosyalar:** `server/services/videoRenderer.js`, `server/remotion/entry.jsx`, `server/remotion/RenderForgeComposition.jsx`
- **Akis:**
  1. Schema parse ve override islemleri ayni (schemaUtils).
  2. Video opsiyonlari normalize edilir: fps (10-60), durationSeconds (1-30), durationInFrames hesaplanir.
  3. `@remotion/bundler` ile Remotion entry dosyasi Webpack bundle edilir (ilk seferde, sonra cache).
  4. `selectComposition()` ile "RenderForgeComposition" secilir, `inputProps` olarak schema, fps, durationInFrames, width, height verilir.
  5. `renderMedia()` ile video render edilir (codec: h264 veya gif).
  6. Cikti `outputs/render_{renderId}.{format}` olarak kaydedilir.
- **RenderForgeComposition React Bileseneri:**
  - `AbsoluteFill` ile arka plan rengi.
  - Layer'lar zIndex sirasina gore cizilir.
  - Her layer icin `interpolate()` ile fade-in animasyonu: `[index*3, index*3+8]` frame araliginda opacity 0'dan layer opacity degerine.
  - Layer tipleri: TextLayer (div), ImageLayer (img), ShapeLayer (div with border-radius).
  - Hidden layer'lar atlanir.

---

## 21. Render Queue (Kuyruk Sistemi)

- **Dosya:** `server/services/renderQueue.js`
- **Tip:** In-memory (bellekte), Promise-based kuyruk.
- **Concurrency:** `RENDER_CONCURRENCY` env degiskeninden (varsayilan 1).
- **Timeout:** Image icin 5 dakika, video icin 20 dakika.
- **Mekanizma:**
  - `enqueue(task, { timeoutMs })`: Gorevi kuyruga ekler, Promise dondurur.
  - `#drain()`: Calisma sayisi < concurrency ise kuyruktaki sonraki gorevi baslatir.
  - Timeout: `Promise.race` ile timeout promise ve task promise yaristirilir.
  - Gorev tamamlandiginda (basarili veya hata) `running` azaltilir ve `#drain()` tekrar cagirilir.
- **Dayaniklilik:** Sunucu yeniden basladiginda `markProcessingRendersAsError()` ile `processing` durumundaki kayitlar `error` olarak guncellenir.

---

## 22. Schema Utility Fonksiyonlari

- **Dosya:** `server/services/schemaUtils.js`

| Fonksiyon | Aciklama |
|-----------|----------|
| `parseTemplateSchema(template)` | Template objesinden schema cikarir: background, width, height, layers |
| `applyOverridesToSchema(schema, overrides)` | Variable alani dolu layer'lara override degerlerini uygular |
| `safeImageFormat(format)` | Format'i normalize eder: jpg->jpeg, gecersiz->png. Gecerli: png, jpeg, webp |
| `safeVideoFormat(format)` | Format'i normalize eder: gecersiz->mp4. Gecerli: mp4, gif |
| `normalizeVideoOptions({ fps, durationSeconds })` | fps (10-60) ve durationSeconds (1-30) sinirlandirir, durationInFrames hesaplar |

---

## 23. Express Sunucu Baslangic Akisi

`server/index.js` baslatildiginda sirasiyla:

1. `.env` dosyasi yuklenir (`dotenv`).
2. `uploads/` ve `outputs/` klasorleri olusturulur (yoksa).
3. `initDb()` cagirilir: SQLite tablolari (templates, renders, assets) olusturulur.
4. `seedStarterTemplates()`: 3 hazir template eklenir (ilk baslangicta).
5. `markProcessingRendersAsError()`: Onceki calismalarda `processing` kalan render kayitlari `error` olarak guncellenir.
6. Express middleware'leri baglanir: CORS, JSON body parser (5MB limit).
7. Statik dosya serve: `/uploads` ve `/outputs` klasorleri.
8. Route'lar monte edilir:
   - `/api/health` (auth'suz)
   - `/api/assets` (auth'suz)
   - `/api/templates` (requireApiKey ile korumali)
   - `/api/render` (requireApiKey ile korumali)
9. Client dist klasoru statik olarak serve edilir.
10. SPA fallback: Bilinmeyen GET/HEAD istekleri `index.html`'e yonlendirilir.
11. Hata yakalama middleware'i: 404 ve 500 hatalari JSON veya fallback HTML olarak dondurulur.
12. Sunucu dinlemeye baslar (varsayilan port 3001).

---

## 24. Vite Proxy Ayarlari

`client/vite.config.js` icerisinde dev modunda 3 proxy tanimli:

| Path | Hedef | Aciklama |
|------|-------|----------|
| `/api` | `http://localhost:3001` | Tum API istekleri backend'e yonlendirilir |
| `/uploads` | `http://localhost:3001` | Yuklenen dosyalar |
| `/outputs` | `http://localhost:3001` | Render ciktilari |

---

## 25. CSS / Styling Yaklasimi

- **Tek Global Dosya:** `client/src/styles.css` (1255 satir)
- **CSS Degiskenleri (Custom Properties):**
  - Renkler: `--bg-primary` (#0a0a0f), `--bg-secondary` (#12121a), `--bg-card` (#1a1a2e)
  - Accent: `--accent-purple` (#7c3aed), `--accent-cyan` (#06b6d4), `--accent-pink` (#ec4899)
  - Text: `--text-primary` (#ffffff), `--text-secondary` (#9ca3af), `--text-muted` (#4b5563)
  - Efektler: `--shadow-hover`, `--glow-hero`, `--hero-title-gradient`
  - Boyutlar: `--radius-card` (16px), `--radius-pill` (50px), `--content-x` (16px)
- **Tema:** Koyu (dark) tema, mor/cyan/pembe vurgu renkleri ile. Acik tema YOKTUR.
- **Responsive Tasarim:** Mobile-first yaklasim.
  - Mobile (<=430px): Alt navigasyon, tek kolonlu layout, editor tab sistemi, floating action butonlari.
  - Desktop (>430px): Sol sidebar, cok kolonlu layout, editor 3 kolonlu grid.
- **Animasyonlar:** `@keyframes heroGlow`, `searchGlowPulse`, `sectionFadeIn` animasyonlari.
- **Tailwind/CSS Modules/Styled-Components:** KULLANILMIYOR. Tamamen vanilla CSS.

---

## 26. Testler

- **Dosya:** `server/tests/schema-utils.test.mjs`
- **Framework:** Node.js native test runner (`node --test`)
- **Komut:** `pnpm test`
- **Kapsam:** `schemaUtils.js` fonksiyonlari icin unit testler (parseTemplateSchema, applyOverridesToSchema, safeImageFormat, safeVideoFormat, normalizeVideoOptions).

---

## 27. Mevcut Eksiklikler / Gelisim Alanlari

1. **Gercek Auth Yok:** Login tamamen sahte, backend session dogrulamasi yok.
2. **Logout Butonu Yok:** `authApi.logout()` tanimli ama UI'da bagli degil.
3. **API Key Yonetimi:** Client tarafinda API key'in nasil set edilecegi acik degil (localStorage'a manuel yazmak gerekiyor).
4. **Assets Route Korumasiz:** `/api/assets/upload` endpoint'i `requireApiKey` middleware'i ile korunmuyor.
5. **Profil Sayfasi Statik:** Istatistikler placeholder, API'den veri cekilmiyor.
6. **Template Thumbnail:** Kaydedilen template'lerin thumbnail'i otomatik olusturulmuyor.
7. **Font Destegi:** Sadece sistem fontlari kullanilabiliyor, ozel font yukleme yok.
8. **Render Kuyrugu Bellekte:** Sunucu restart'inda kuyruk sifirlanir (Redis/DB tabanli degil).
9. **Kullanici Yonetimi Yok:** Tek kullanici, multi-user/rol sistemi yok.
10. **Video Render Placeholder Nitelikli:** Calisir durumda ancak basit fade-in animasyonu ile sinirli.
11. **Error Handling:** Frontend'de genel try-catch, detayli kullanici bilgilendirmesi sinirli.
12. **Remotion Bundle Cache:** `serveUrlPromise` bellekte tutuluyor, sunucu restart'inda yeniden bundle edilir.

---

## 28. Veri Akis Diyagrami (Ozetle)

```
[Kullanici] 
    |
    v
[Login.jsx] --localStorage--> session objesi
    |
    v
[Dashboard.jsx] --api.getTemplates()--> Template listesi goster
    |                                        |
    v                                        v
[Editor.jsx] <-- api.getTemplate(id)   [Templates.jsx] (listeleme/silme)
    |
    |-- editorStore (Zustand) <--> Canvas.jsx (Fabric.js)
    |                          <--> LayerPanel.jsx
    |                          <--> PropertiesPanel.jsx
    |                          <--> Toolbar.jsx
    |
    |-- "Kaydet" --> api.createTemplate() / api.updateTemplate()
    |-- "Render" --> RenderModal.jsx --> api.render()
    |                                       |
    v                                       v
[Express Server]                    [renderQueue.enqueue()]
    |                                       |
    |-- /api/templates (CRUD)              |-- Image: Puppeteer (HTML->Screenshot)
    |-- /api/assets/upload (Multer)        |-- Video: Remotion (React->MP4/GIF)
    |-- /api/render (render baslat)         |
    |                                       v
    v                               [outputs/render_xxx.png|mp4]
[SQLite DB]                                 |
  - templates                               v
  - renders                         [Renders.jsx] --> api.getRenderHistory()
  - assets                                          --> Indirme linki
```

---

## 29. Ozet: Projenin Tek Cumlelik Tanimi

RenderForge MVP, kullanicinin tarayici uzerinde Fabric.js canvas editor ile template tasarlamasini, bu template'lerdeki degiskenleri (variable) API uzerinden dinamik olarak degistirip Puppeteer (gorsel) veya Remotion (video) ile toplu render almasini saglayan, Express + SQLite + React tabanli, koyu temali, mobil uyumlu bir icerik otomasyon platformudur.
