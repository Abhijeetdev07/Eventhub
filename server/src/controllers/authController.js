const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

function createToken(user) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is missing in environment variables');
  }

  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
    },
    secret,
    { expiresIn: '7d' }
  );
}

function getSafeUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
  };
}

async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
    });

    const token = createToken(user);

    return res.status(201).json({
      token,
      user: getSafeUser(user),
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = createToken(user);

    return res.json({
      token,
      user: getSafeUser(user),
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  register,
  login,
};
