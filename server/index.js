import dotenv from 'dotenv';
import cors from 'cors';
import express from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initDb, markProcessingRendersAsError, seedStarterTemplates } from './db.js';
import { requireApiKey } from './middleware/auth.js';
import assetsRouter from './routes/assets.js';
import renderRouter from './routes/render.js';
import templatesRouter from './routes/templates.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../');
dotenv.config({ override: true });

const uploadsDir = path.join(rootDir, 'uploads');
const outputsDir = path.join(rootDir, 'outputs');
const clientDistDir = path.join(rootDir, 'client', 'dist');

async function ensureRuntimeDirs() {
  await fs.mkdir(uploadsDir, { recursive: true });
  await fs.mkdir(outputsDir, { recursive: true });
}

async function startServer() {
  await ensureRuntimeDirs();
  initDb();
  const seededCount = seedStarterTemplates();
  const recoveredCount = markProcessingRendersAsError(
    'Sunucu yeniden baslatildi. Render islemi yarida kaldi.'
  );

  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '5mb' }));

  app.use('/uploads', express.static(uploadsDir));
  app.use('/outputs', express.static(outputsDir));

  app.get('/api/health', (_req, res) => {
    return res.json({ success: true, status: 'ok' });
  });

  app.use('/api/assets', assetsRouter);
  app.use('/api/templates', requireApiKey, templatesRouter);
  app.use('/api/render', requireApiKey, renderRouter);

  app.use(express.static(clientDistDir));

  app.use('/api', (_req, res) => {
    return res.status(404).json({
      success: false,
      error: 'Kaynak bulunamadi',
      code: 'NOT_FOUND',
    });
  });

  app.use((req, res, next) => {
    if (!['GET', 'HEAD'].includes(req.method) || req.path.startsWith('/api/')) {
      return next();
    }

    const indexPath = path.join(clientDistDir, 'index.html');
    return res.sendFile(indexPath, (error) => {
      if (error) {
        return next(error);
      }
      return undefined;
    });
  });

  app.use((err, req, res, _next) => {
    const statusCode = Number(err?.status || err?.statusCode || 500);

    if (
      statusCode === 404 &&
      ['GET', 'HEAD'].includes(req.method) &&
      !req.path.startsWith('/api/')
    ) {
      const indexPath = path.join(clientDistDir, 'index.html');
      return res.sendFile(indexPath, (fallbackError) => {
        if (fallbackError) {
          return res.status(500).json({
            success: false,
            error: 'Sunucu hatasi',
            detail:
              fallbackError instanceof Error ? fallbackError.message : String(fallbackError),
          });
        }
        return undefined;
      });
    }

    return res.status(statusCode).json({
      success: false,
      error: statusCode >= 500 ? 'Sunucu hatasi' : 'Istek hatasi',
      detail: err instanceof Error ? err.message : String(err),
    });
  });

  const port = Number(process.env.PORT || 3001);
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`RenderForge MVP hazir: http://localhost:${port}`);
    if (recoveredCount > 0) {
      // eslint-disable-next-line no-console
      console.log(`Yarida kalan ${recoveredCount} render kaydi error durumuna alindi.`);
    }
    if (seededCount > 0) {
      // eslint-disable-next-line no-console
      console.log(`${seededCount} hazir starter template eklendi.`);
    }
  });
}

startServer().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Sunucu baslatilamadi:', error);
  process.exit(1);
});
