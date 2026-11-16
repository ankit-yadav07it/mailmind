const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db, create, findOne, findById, updateById } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey_changeme';
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

function safeUser(u) {
  if (!u) return null;
  const { passwordHash, ...rest } = u;
  return rest;
}

const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role)
      return res.status(400).json({ success: false, message: 'Name, email, password and role are required' });
    if (!['assistant', 'client'].includes(role))
      return res.status(400).json({ success: false, message: 'Role must be assistant or client' });

    const existing = await findOne(db.users, { email: email.toLowerCase() });
    if (existing) return res.status(409).json({ success: false, message: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await create(db.users, { name, email: email.toLowerCase(), passwordHash, role });
    const token = signToken(user);
    const u = safeUser(user);
    return res.status(201).json({ success: true, token, user: u, data: { token, user: u } });
  } catch (e) {
    next(e);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password required' });

    const user = await findOne(db.users, { email: email.toLowerCase() });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const token = signToken(user);
    const u = safeUser(user);
    return res.json({ success: true, token, user: u, data: { token, user: u } });
  } catch (e) {
    next(e);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await findById(db.users, req.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const u = safeUser(user);
    return res.json({ success: true, user: u, data: { user: u } });
  } catch (e) {
    next(e);
  }
};

module.exports = { register, login, getMe };
