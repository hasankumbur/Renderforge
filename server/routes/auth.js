import crypto from 'node:crypto';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { createUser, getUserByEmail } from '../db.js';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'renderforge_jwt_secret_dev_only';
const JWT_EXPIRES_IN = '7d';

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  const computed = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(computed, 'hex'));
}

function generateToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    created_at: user.created_at,
  };
}

router.post('/register', (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Ad, e-posta ve şifre zorunludur.',
      code: 'MISSING_FIELDS',
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      error: 'Şifre en az 6 karakter olmalıdır.',
      code: 'WEAK_PASSWORD',
    });
  }

  const existing = getUserByEmail(email);
  if (existing) {
    return res.status(409).json({
      success: false,
      error: 'Bu e-posta adresi zaten kayıtlı.',
      code: 'EMAIL_EXISTS',
    });
  }

  const id = crypto.randomUUID();
  const password_hash = hashPassword(password);

  const user = createUser({ id, name, email, password_hash });
  const token = generateToken(user);

  return res.status(201).json({
    success: true,
    data: { user: sanitizeUser(user), token },
  });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'E-posta ve şifre zorunludur.',
      code: 'MISSING_FIELDS',
    });
  }

  const user = getUserByEmail(email);
  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'E-posta veya şifre hatalı.',
      code: 'INVALID_CREDENTIALS',
    });
  }

  const valid = verifyPassword(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({
      success: false,
      error: 'E-posta veya şifre hatalı.',
      code: 'INVALID_CREDENTIALS',
    });
  }

  const token = generateToken(user);

  return res.json({
    success: true,
    data: { user: sanitizeUser(user), token },
  });
});

router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Oturum bulunamadı.',
      code: 'NO_TOKEN',
    });
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = getUserByEmail(payload.email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Kullanıcı bulunamadı.',
        code: 'USER_NOT_FOUND',
      });
    }
    return res.json({ success: true, data: sanitizeUser(user) });
  } catch (_err) {
    return res.status(401).json({
      success: false,
      error: 'Oturum süresi dolmuş. Lütfen tekrar giriş yapın.',
      code: 'TOKEN_EXPIRED',
    });
  }
});

router.post('/logout', (_req, res) => {
  return res.json({ success: true });
});

export default router;
export { JWT_SECRET };
