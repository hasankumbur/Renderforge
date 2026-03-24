import Database from 'better-sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'renderforge.db');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

const starterTemplates = [
  {
    id: 'starter_social_news_post_v1',
    name: 'Sosyal Gonderi - Haber Karti',
    width: 1080,
    height: 1350,
    thumbnail:
      'https://images.unsplash.com/photo-1500674425229-f692875b0ab7?auto=format&fit=crop&w=1080&q=80',
    schema: {
      background: '#0b1020',
      width: 1080,
      height: 1350,
      layers: [
        {
          id: 'news_bg',
          name: 'Arka Plan Gorsel',
          type: 'image',
          x: 0,
          y: 0,
          width: 1080,
          height: 1350,
          opacity: 1,
          zIndex: 0,
          variable: 'coverImage',
          src: 'https://images.unsplash.com/photo-1500674425229-f692875b0ab7?auto=format&fit=crop&w=1080&q=80',
        },
        {
          id: 'news_overlay',
          name: 'Karanlik Katman',
          type: 'rect',
          x: 0,
          y: 0,
          width: 1080,
          height: 1350,
          fill: '#111827',
          opacity: 0.42,
          zIndex: 1,
          stroke: 'transparent',
          strokeWidth: 0,
          variable: '',
        },
        {
          id: 'news_topbar',
          name: 'Ust Bilgi Cubugu',
          type: 'rect',
          x: 36,
          y: 44,
          width: 1008,
          height: 92,
          fill: '#0f172a',
          opacity: 0.7,
          zIndex: 2,
          stroke: 'transparent',
          strokeWidth: 0,
          cornerRadius: 16,
          variable: '',
        },
        {
          id: 'news_brand_dot',
          name: 'Profil Rozeti',
          type: 'circle',
          x: 58,
          y: 62,
          width: 56,
          height: 56,
          fill: '#22d3ee',
          opacity: 1,
          zIndex: 3,
          stroke: '#ffffff',
          strokeWidth: 2,
          variable: '',
        },
        {
          id: 'news_brand',
          name: 'Marka Adi',
          type: 'text',
          x: 132,
          y: 66,
          width: 500,
          height: 44,
          opacity: 1,
          zIndex: 4,
          text: 'Bilim Rengi',
          fontSize: 38,
          fontFamily: 'Inter',
          fontWeight: 'bold',
          color: '#ffffff',
          textAlign: 'left',
          variable: 'brandName',
        },
        {
          id: 'news_menu',
          name: 'Menu Ikonu',
          type: 'text',
          x: 932,
          y: 62,
          width: 80,
          height: 44,
          opacity: 1,
          zIndex: 4,
          text: '...',
          fontSize: 44,
          fontFamily: 'Inter',
          fontWeight: 'bold',
          color: '#e5e7eb',
          textAlign: 'right',
          variable: 'menuText',
        },
        {
          id: 'news_title',
          name: 'Ana Baslik',
          type: 'text',
          x: 72,
          y: 792,
          width: 936,
          height: 290,
          opacity: 1,
          zIndex: 5,
          text: 'Bati Virginia da bir kadin, yildirim carpan agacin milyonluk anini yakaladi.',
          fontSize: 64,
          fontFamily: 'Inter',
          fontWeight: 'bold',
          color: '#ffffff',
          textAlign: 'left',
          variable: 'headline',
        },
        {
          id: 'news_subtitle',
          name: 'Aciklama',
          type: 'text',
          x: 74,
          y: 1096,
          width: 920,
          height: 100,
          opacity: 1,
          zIndex: 5,
          text: 'Dogada ayni familyadan birbirine benzeyen cok cicek var.',
          fontSize: 34,
          fontFamily: 'Inter',
          fontWeight: 'normal',
          color: '#d1d5db',
          textAlign: 'left',
          variable: 'description',
        },
        {
          id: 'news_bottombar',
          name: 'Alt Etkilesim Cubugu',
          type: 'rect',
          x: 0,
          y: 1220,
          width: 1080,
          height: 130,
          fill: '#020617',
          opacity: 0.85,
          zIndex: 6,
          stroke: 'transparent',
          strokeWidth: 0,
          variable: '',
        },
        {
          id: 'news_metrics',
          name: 'Etkilesim Metni',
          type: 'text',
          x: 54,
          y: 1264,
          width: 980,
          height: 52,
          opacity: 1,
          zIndex: 7,
          text: '322B   915   788   38,7B',
          fontSize: 42,
          fontFamily: 'Inter',
          fontWeight: 'bold',
          color: '#e5e7eb',
          textAlign: 'left',
          variable: 'engagementText',
        },
      ],
    },
  },
  {
    id: 'starter_social_story_flash_v1',
    name: 'Sosyal Story - Dikey Manset',
    width: 1080,
    height: 1920,
    thumbnail:
      'https://images.unsplash.com/photo-1470259078422-826894b933aa?auto=format&fit=crop&w=1080&q=80',
    schema: {
      background: '#0b1020',
      width: 1080,
      height: 1920,
      layers: [
        {
          id: 'story_bg',
          name: 'Story Arka Plan',
          type: 'image',
          x: 0,
          y: 0,
          width: 1080,
          height: 1920,
          opacity: 1,
          zIndex: 0,
          variable: 'storyImage',
          src: 'https://images.unsplash.com/photo-1470259078422-826894b933aa?auto=format&fit=crop&w=1080&q=80',
        },
        {
          id: 'story_overlay',
          name: 'Story Karanlik Katman',
          type: 'rect',
          x: 0,
          y: 0,
          width: 1080,
          height: 1920,
          fill: '#111827',
          opacity: 0.45,
          zIndex: 1,
          stroke: 'transparent',
          strokeWidth: 0,
          variable: '',
        },
        {
          id: 'story_progress_1',
          name: 'Ilerleme Cubugu 1',
          type: 'rect',
          x: 72,
          y: 68,
          width: 454,
          height: 10,
          fill: '#ffffff',
          opacity: 0.9,
          zIndex: 2,
          stroke: 'transparent',
          strokeWidth: 0,
          variable: '',
        },
        {
          id: 'story_progress_2',
          name: 'Ilerleme Cubugu 2',
          type: 'rect',
          x: 548,
          y: 68,
          width: 454,
          height: 10,
          fill: '#9ca3af',
          opacity: 0.5,
          zIndex: 2,
          stroke: 'transparent',
          strokeWidth: 0,
          variable: '',
        },
        {
          id: 'story_brand',
          name: 'Story Marka',
          type: 'text',
          x: 78,
          y: 116,
          width: 620,
          height: 62,
          opacity: 1,
          zIndex: 3,
          text: 'Bilim Rengi',
          fontSize: 46,
          fontFamily: 'Inter',
          fontWeight: 'bold',
          color: '#ffffff',
          textAlign: 'left',
          variable: 'brandName',
        },
        {
          id: 'story_handle',
          name: 'Story Kullanici',
          type: 'text',
          x: 82,
          y: 172,
          width: 620,
          height: 42,
          opacity: 1,
          zIndex: 3,
          text: 'biliminrengi',
          fontSize: 32,
          fontFamily: 'Inter',
          fontWeight: 'normal',
          color: '#d1d5db',
          textAlign: 'left',
          variable: 'handleText',
        },
        {
          id: 'story_menu',
          name: 'Story Menu',
          type: 'text',
          x: 948,
          y: 122,
          width: 70,
          height: 48,
          opacity: 1,
          zIndex: 3,
          text: '...',
          fontSize: 46,
          fontFamily: 'Inter',
          fontWeight: 'bold',
          color: '#e5e7eb',
          textAlign: 'right',
          variable: 'menuText',
        },
        {
          id: 'story_title',
          name: 'Story Baslik',
          type: 'text',
          x: 86,
          y: 1240,
          width: 902,
          height: 360,
          opacity: 1,
          zIndex: 4,
          text: 'Bati Virginia da bir kadin, yildirim carpan agacin milyonluk anini yakaladi.',
          fontSize: 84,
          fontFamily: 'Inter',
          fontWeight: 'bold',
          color: '#ffffff',
          textAlign: 'left',
          variable: 'headline',
        },
        {
          id: 'story_cta',
          name: 'Story CTA',
          type: 'text',
          x: 836,
          y: 1718,
          width: 180,
          height: 80,
          opacity: 1,
          zIndex: 4,
          text: '-->',
          fontSize: 78,
          fontFamily: 'Inter',
          fontWeight: 'bold',
          color: '#fb923c',
          textAlign: 'right',
          variable: 'ctaArrow',
        },
      ],
    },
  },
  {
    id: 'starter_social_quote_square_v1',
    name: 'Sosyal Kare - Gunun Sozu',
    width: 1080,
    height: 1080,
    thumbnail:
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1080&q=80',
    schema: {
      background: '#111827',
      width: 1080,
      height: 1080,
      layers: [
        {
          id: 'quote_bg',
          name: 'Arka Plan Gorsel',
          type: 'image',
          x: 0,
          y: 0,
          width: 1080,
          height: 1080,
          opacity: 1,
          zIndex: 0,
          variable: 'coverImage',
          src: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1080&q=80',
        },
        {
          id: 'quote_overlay',
          name: 'Karanlik Katman',
          type: 'rect',
          x: 0,
          y: 0,
          width: 1080,
          height: 1080,
          fill: '#0f172a',
          opacity: 0.55,
          zIndex: 1,
          stroke: 'transparent',
          strokeWidth: 0,
          variable: '',
        },
        {
          id: 'quote_panel',
          name: 'Metin Paneli',
          type: 'rect',
          x: 86,
          y: 210,
          width: 908,
          height: 560,
          fill: '#111827',
          opacity: 0.72,
          zIndex: 2,
          stroke: '#7c3aed',
          strokeWidth: 2,
          cornerRadius: 24,
          variable: '',
        },
        {
          id: 'quote_title',
          name: 'Ust Baslik',
          type: 'text',
          x: 138,
          y: 268,
          width: 812,
          height: 84,
          opacity: 1,
          zIndex: 3,
          text: 'Gunun Sozu',
          fontSize: 54,
          fontFamily: 'Inter',
          fontWeight: 'bold',
          color: '#a78bfa',
          textAlign: 'center',
          variable: 'title',
        },
        {
          id: 'quote_body',
          name: 'Soz Metni',
          type: 'text',
          x: 148,
          y: 390,
          width: 788,
          height: 280,
          opacity: 1,
          zIndex: 3,
          text: 'Bilim, dogru soruyu sorabildigimiz anda baslar.',
          fontSize: 60,
          fontFamily: 'Inter',
          fontWeight: 'bold',
          color: '#ffffff',
          textAlign: 'center',
          variable: 'quoteText',
        },
        {
          id: 'quote_author',
          name: 'Yazar',
          type: 'text',
          x: 198,
          y: 700,
          width: 680,
          height: 68,
          opacity: 1,
          zIndex: 3,
          text: 'Albert Einstein',
          fontSize: 42,
          fontFamily: 'Inter',
          fontWeight: 'normal',
          color: '#d1d5db',
          textAlign: 'center',
          variable: 'author',
        },
      ],
    },
  },
];

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS templates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      width INTEGER NOT NULL DEFAULT 1080,
      height INTEGER NOT NULL DEFAULT 1080,
      schema TEXT NOT NULL,
      thumbnail TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS renders (
      id TEXT PRIMARY KEY,
      template_id TEXT NOT NULL,
      output_type TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      input_data TEXT,
      output_path TEXT,
      output_url TEXT,
      error_msg TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(template_id) REFERENCES templates(id)
    );

    CREATE TABLE IF NOT EXISTS assets (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      original_name TEXT,
      path TEXT NOT NULL,
      url TEXT NOT NULL,
      size INTEGER,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
}

export function seedStarterTemplates() {
  const stmt = db.prepare(
    `INSERT OR IGNORE INTO templates (id, name, width, height, schema, thumbnail)
     VALUES (@id, @name, @width, @height, @schema, @thumbnail)`
  );

  let insertedCount = 0;
  for (const template of starterTemplates) {
    const result = stmt.run({
      id: template.id,
      name: template.name,
      width: template.width,
      height: template.height,
      schema: JSON.stringify(template.schema),
      thumbnail: template.thumbnail ?? null,
    });
    insertedCount += Number(result.changes || 0);
  }

  return insertedCount;
}

export function listTemplates() {
  const stmt = db.prepare(
    `SELECT id, name, width, height, schema, thumbnail, created_at, updated_at
     FROM templates
     ORDER BY datetime(updated_at) DESC`
  );
  return stmt.all();
}

export function getTemplateById(id) {
  const stmt = db.prepare(
    `SELECT id, name, width, height, schema, thumbnail, created_at, updated_at
     FROM templates
     WHERE id = ?`
  );
  return stmt.get(id);
}

export function createTemplate(template) {
  const stmt = db.prepare(
    `INSERT INTO templates (id, name, width, height, schema, thumbnail)
     VALUES (@id, @name, @width, @height, @schema, @thumbnail)`
  );
  stmt.run(template);
  return getTemplateById(template.id);
}

export function updateTemplate(id, data) {
  const existing = getTemplateById(id);
  if (!existing) {
    return null;
  }

  const merged = {
    ...existing,
    ...data,
    updated_at: new Date().toISOString(),
  };

  const stmt = db.prepare(
    `UPDATE templates
     SET name = @name,
         width = @width,
         height = @height,
         schema = @schema,
         thumbnail = @thumbnail,
         updated_at = @updated_at
     WHERE id = @id`
  );

  stmt.run({
    id,
    name: merged.name,
    width: merged.width,
    height: merged.height,
    schema: merged.schema,
    thumbnail: merged.thumbnail ?? null,
    updated_at: merged.updated_at,
  });

  return getTemplateById(id);
}

export function deleteTemplate(id) {
  const stmt = db.prepare('DELETE FROM templates WHERE id = ?');
  return stmt.run(id).changes > 0;
}

export function createAsset(asset) {
  const stmt = db.prepare(
    `INSERT INTO assets (id, filename, original_name, path, url, size)
     VALUES (@id, @filename, @original_name, @path, @url, @size)`
  );
  stmt.run(asset);
  return getAssetById(asset.id);
}

export function getAssetById(id) {
  const stmt = db.prepare(
    `SELECT id, filename, original_name, path, url, size, created_at
     FROM assets
     WHERE id = ?`
  );
  return stmt.get(id);
}

export function createRender(renderRow) {
  const stmt = db.prepare(
    `INSERT INTO renders (id, template_id, output_type, status, input_data, output_path, output_url, error_msg)
     VALUES (@id, @template_id, @output_type, @status, @input_data, @output_path, @output_url, @error_msg)`
  );
  stmt.run(renderRow);
  return getRenderById(renderRow.id);
}

export function updateRender(renderId, patch) {
  const existing = getRenderById(renderId);
  if (!existing) {
    return null;
  }

  const next = {
    ...existing,
    ...patch,
  };

  const stmt = db.prepare(
    `UPDATE renders
     SET status = @status,
         input_data = @input_data,
         output_path = @output_path,
         output_url = @output_url,
         error_msg = @error_msg
     WHERE id = @id`
  );

  stmt.run({
    id: renderId,
    status: next.status,
    input_data: next.input_data ?? null,
    output_path: next.output_path ?? null,
    output_url: next.output_url ?? null,
    error_msg: next.error_msg ?? null,
  });

  return getRenderById(renderId);
}

export function getRenderById(id) {
  const stmt = db.prepare(
    `SELECT id, template_id, output_type, status, input_data, output_path, output_url, error_msg, created_at
     FROM renders
     WHERE id = ?`
  );
  return stmt.get(id);
}

export function listRenders(filters = {}) {
  if (filters.templateId) {
    const stmt = db.prepare(
      `SELECT id, template_id, output_type, status, input_data, output_path, output_url, error_msg, created_at
       FROM renders
       WHERE template_id = ?
       ORDER BY datetime(created_at) DESC`
    );
    return stmt.all(filters.templateId);
  }

  const stmt = db.prepare(
    `SELECT id, template_id, output_type, status, input_data, output_path, output_url, error_msg, created_at
     FROM renders
     ORDER BY datetime(created_at) DESC`
  );
  return stmt.all();
}

export function markProcessingRendersAsError(message) {
  const stmt = db.prepare(
    `UPDATE renders
     SET status = 'error',
         error_msg = ?
     WHERE status = 'processing'`
  );
  return stmt.run(message).changes;
}

export { db };
