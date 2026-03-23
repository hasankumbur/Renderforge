# RenderForge MVP - Baslangic Plani

## Hedef
Render endpoint'i n8n'den cagrilabilir, SQLite tabanli ve tek komutla (`pnpm start`) calisan MVP temelini kurmak.

## Faz 1 (Bu iterasyonda baslatildi)
1. Monorepo dosya yapisi olusturuldu.
2. Express + SQLite backend cekirdegi kuruldu.
3. API key middleware ve temel CRUD endpointleri eklendi.
4. Puppeteer tabanli image render servisi eklendi.
5. React + Vite arayuz iskeleti, editor panelleri ve render modal baslatildi.

## Faz 2 (Sonraki adim)
1. Fabric.js ile gercek canvas manipulasyonu
2. Layer drag-drop z-order
3. Undo/Redo
4. Asset upload entegrasyonunu toolbar uzerinden tamamlama
5. Editor UX ince ayarlari

## Faz 3 (Sonraki adim)
1. Remotion video render pipeline
2. Render queue/dayaniklilik iyilestirmeleri
3. Testler ve deployment hardening

## Kritik notlar
- `/api/templates` ve `/api/render` API key ile korunuyor.
- UI'da API key header localStorage uzerinden yonetiliyor.
- Bu baslangic paketinde video render sadece placeholder olarak birakildi.
