# RenderForge MVP

RenderForge MVP, template tabanli gorsel uretimi icin Node.js + React + SQLite tabanli baslangic surumudur.

## Teknoloji
- Backend: Node.js 20, Express, better-sqlite3
- Frontend: React + Vite
- Render (image): Puppeteer
- Render (video): Remotion (`@remotion/bundler`, `@remotion/renderer`)
- Veri tabani: SQLite
- Depolama: Local filesystem (`uploads`, `outputs`)

## Proje yapisi

```text
renderforge-mvp/
├── server/
│   ├── index.js
│   ├── db.js
│   ├── routes/
│   │   ├── templates.js
│   │   ├── render.js
│   │   └── assets.js
│   ├── services/
│   │   ├── imageRenderer.js
│   │   └── videoRenderer.js
│   └── middleware/
│       └── auth.js
├── client/
│   ├── index.html
│   ├── vite.config.js
│   └── src/
├── uploads/
├── outputs/
├── templates-html/
├── .env.example
└── package.json
```

## Ubuntu kurulum

```bash
# 1) Gereksinimler
sudo apt update
sudo apt install -y nodejs npm chromium-browser
npm install -g pnpm

# 2) Repo ve kurulum
git clone <repo-url> renderforge-mvp
cd renderforge-mvp
pnpm install

# 3) Env olustur
cp .env.example .env
# HOST_URL degerini sunucu adresinize gore guncelleyin

# 4) Gelistirme
pnpm dev

# 5) Production baslat
pnpm start

# 6) Arka planda calistirma
npm install -g pm2
pm2 start "pnpm start" --name renderforge
pm2 save

# 7) Testler
pnpm test
```

## API notlari

### Auth
Asagidaki endpointler `X-API-Key` ister:
- `GET/POST/PUT/DELETE /api/templates`
- `POST /api/render`

### Baslica endpointler
- `POST /api/assets/upload` (multipart form-data: `file`)
- `GET /api/templates`
- `POST /api/templates`
- `POST /api/render`
- `GET /api/render/history`

`POST /api/render` artik image ve video ciktisi alir:
- Image formatlari: `png`, `jpeg`, `webp`
- Video formatlari: `mp4`, `gif`
- Video icin opsiyonel alanlar: `fps`, `durationSeconds`

## Baslangic durumu
Bu iterasyonda:
- Backend CRUD ve image render akisi hazirlandi.
- Frontend editor paneli Fabric.js canvas ile aktif hale getirildi.
- Layer drag-drop z-order, undo/redo ve gorsel upload akisi eklendi.
- Properties paneli text/image/shape alanlariyla gelistirildi.
- Remotion ile video render (MP4/GIF) ve render queue altyapisi eklendi.
