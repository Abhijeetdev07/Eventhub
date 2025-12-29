const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      return res.status(500).json({ message: 'JWT_SECRET is not configured' });
    }

    const payload = jwt.verify(token, secret);

    req.user = {
      id: payload.id,
      email: payload.email,
    };

    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

module.exports = authMiddleware;
