import Database from 'better-sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'renderforge.db');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

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
