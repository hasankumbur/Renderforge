import express from 'express';
import { nanoid } from 'nanoid';
import {
  createTemplate,
  deleteTemplate,
  getTemplateById,
  listTemplates,
  updateTemplate,
} from '../db.js';

const router = express.Router();

function normalizeSchema(schema, width, height) {
  if (!schema) {
    return JSON.stringify({ background: '#ffffff', layers: [], width, height });
  }

  if (typeof schema === 'string') {
    JSON.parse(schema);
    return schema;
  }

  return JSON.stringify({ ...schema, width, height });
}

router.get('/', (_req, res) => {
  const rows = listTemplates().map((row) => ({
    ...row,
    schema: typeof row.schema === 'string' ? JSON.parse(row.schema) : row.schema,
  }));

  return res.json({ success: true, data: rows });
});

router.get('/:id', (req, res) => {
  const template = getTemplateById(req.params.id);

  if (!template) {
    return res.status(404).json({
      success: false,
      error: 'Template bulunamadi',
      code: 'TEMPLATE_NOT_FOUND',
    });
  }

  return res.json({
    success: true,
    data: {
      ...template,
      schema: typeof template.schema === 'string' ? JSON.parse(template.schema) : template.schema,
    },
  });
});

router.post('/', (req, res) => {
  try {
    const width = Number(req.body.width || 1080);
    const height = Number(req.body.height || 1080);

    if (!req.body.name) {
      return res.status(400).json({
        success: false,
        error: 'Template adi zorunlu',
        code: 'NAME_REQUIRED',
      });
    }

    const created = createTemplate({
      id: nanoid(12),
      name: req.body.name,
      width,
      height,
      schema: normalizeSchema(req.body.schema, width, height),
      thumbnail: req.body.thumbnail ?? null,
    });

    return res.status(201).json({
      success: true,
      data: {
        ...created,
        schema: JSON.parse(created.schema),
      },
    });
  } catch (_error) {
    return res.status(400).json({
      success: false,
      error: 'Template olusturulamadi. Schema gecersiz olabilir.',
      code: 'INVALID_TEMPLATE_PAYLOAD',
    });
  }
});

router.put('/:id', (req, res) => {
  try {
    const existing = getTemplateById(req.params.id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Template bulunamadi',
        code: 'TEMPLATE_NOT_FOUND',
      });
    }

    const width = Number(req.body.width ?? existing.width);
    const height = Number(req.body.height ?? existing.height);

    const updated = updateTemplate(req.params.id, {
      name: req.body.name ?? existing.name,
      width,
      height,
      schema: normalizeSchema(req.body.schema ?? existing.schema, width, height),
      thumbnail: req.body.thumbnail ?? existing.thumbnail,
    });

    return res.json({
      success: true,
      data: {
        ...updated,
        schema: JSON.parse(updated.schema),
      },
    });
  } catch (_error) {
    return res.status(400).json({
      success: false,
      error: 'Template guncellenemedi. Schema gecersiz olabilir.',
      code: 'INVALID_TEMPLATE_PAYLOAD',
    });
  }
});

router.delete('/:id', (req, res) => {
  const deleted = deleteTemplate(req.params.id);

  if (!deleted) {
    return res.status(404).json({
      success: false,
      error: 'Template bulunamadi',
      code: 'TEMPLATE_NOT_FOUND',
    });
  }

  return res.json({ success: true });
});

export default router;
