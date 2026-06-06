const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'loanflow-dev-secret-change-in-production';

const authenticate = (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'];
    const role   = req.headers['x-user-role'];
    if (userId && role) {
      req.user = { userId, role };
      return next();
    }
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({ error: 'Forbidden – insufficient permissions' });
  }
  next();
};

module.exports = { authenticate, authorize };
