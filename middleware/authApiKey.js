// middleware/authApiKey.js
module.exports = function authApiKey(req, res, next) {
  if (req.path === '/status' || req.path === '/panel') return next();

  const key = process.env.API_KEY;
  if (!key) {
    if (!authApiKey.warned) {
      console.warn('API_KEY not set; skipping auth');
      authApiKey.warned = true;
    }
    return next();
  }

  const auth = req.get('Authorization');
  if (auth !== `Bearer ${key}`) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  next();
};
