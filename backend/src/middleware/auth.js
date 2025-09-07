import jwt from 'jsonwebtoken';
import env from '../config/env.js';

function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ ok: false, error: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = { id: payload.sub, email: payload.email, name: payload.name };
    next();
  } catch (e) {
    res.status(401).json({ ok: false, error: 'Invalid token' });
  }
}

export const requireAuth = auth;
export default auth;
