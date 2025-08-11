import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import env from '../config/env.js';

function signToken(user) {
  return jwt.sign({ sub: user._id, email: user.email, name: user.name }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

export async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ ok: false, error: 'Missing fields' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ ok: false, error: 'Email already registered' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash });
    const token = signToken(user);
    res.status(201).json({ ok: true, token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'Registration failed' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ ok: false, error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ ok: false, error: 'Invalid credentials' });
    const token = signToken(user);
    res.json({ ok: true, token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'Login failed' });
  }
}

export async function me(req, res) {
  res.json({ ok: true, user: req.user });
}
