const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const authHeader = req.get('Authorization');

  if (!authHeader) {
    return res.status(401).json({ msg: 'No token, access denied' });
  }

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'Token format invalid' });
  }

  const token = authHeader.slice(7).trim(); // remove 'Bearer ' prefix

  if (!token) {
    return res.status(401).json({ msg: 'Token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach full payload
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Invalid token' });
  }
};
