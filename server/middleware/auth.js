export function requireApiKey(req, res, next) {
  const key = req.headers['x-api-key'];
  const expected = process.env.API_KEY || 'rforge_dev_secret_change_me';

  if (!key || key !== expected) {
    return res.status(401).json({
      success: false,
      error: 'Geçersiz API key',
      code: 'INVALID_API_KEY',
    });
  }

  return next();
}
