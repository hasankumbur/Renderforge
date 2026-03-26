import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'renderforge_jwt_secret_dev_only';

export function requireApiKey(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const payload = jwt.verify(authHeader.slice(7), JWT_SECRET);
      req.userId = payload.userId;
      return next();
    } catch (_err) {
      return res.status(401).json({
        success: false,
        error: 'Oturum süresi dolmuş. Lütfen tekrar giriş yapın.',
        code: 'TOKEN_EXPIRED',
      });
    }
  }

  const key = req.headers['x-api-key'];
  const expected = process.env.API_KEY || 'rforge_dev_secret_change_me';

  if (key && key === expected) {
    return next();
  }

  return res.status(401).json({
    success: false,
    error: 'Oturum açmanız gerekiyor.',
    code: 'UNAUTHORIZED',
  });
}
