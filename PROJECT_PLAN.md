# RenderForge MVP - Baslangic Plani

## Hedef
Render endpoint'i n8n'den cagrilabilir, SQLite tabanli ve tek komutla (`pnpm start`) calisan MVP temelini kurmak.

## Faz 1 (Bu iterasyonda baslatildi)
1. Monorepo dosya yapisi olusturuldu.
2. Express + SQLite backend cekirdegi kuruldu.
3. API key middleware ve temel CRUD endpointleri eklendi.
4. Puppeteer tabanli image render servisi eklendi.
5. React + Vite arayuz iskeleti, editor panelleri ve render modal baslatildi.

## Faz 2 (Tamamlandi)
1. Fabric.js ile gercek canvas manipulasyonu eklendi.
2. Layer panelde drag-drop z-order siralama aktif edildi.
3. Undo/Redo (toolbar + kisayol Ctrl+Z / Ctrl+Y) eklendi.
4. Toolbar uzerinden asset upload edip image layer olusturma eklendi.
5. Properties paneli text/image/shape tipleri icin genisletildi.

## Faz 3 (Sonraki adim)
1. Remotion video render pipeline
2. Render queue/dayaniklilik iyilestirmeleri
3. Testler ve deployment hardening

## Kritik notlar
- `/api/templates` ve `/api/render` API key ile korunuyor.
- UI'da API key header localStorage uzerinden yonetiliyor.
- Bu baslangic paketinde video render sadece placeholder olarak birakildi.
- `.gitignore` runtime DB/output/artifact dosyalarini dislayacak sekilde guncellendi.
