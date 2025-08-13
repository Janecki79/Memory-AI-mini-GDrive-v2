let warned = false;

module.exports = (req, res, next) => {
  const { path } = req;
  if (path === '/status' || path.startsWith('/panel')) {
    return next();
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    if (!warned) {
      console.warn('API_KEY is not set; bypassing auth');
      warned = true;
    }
    return next();
  }

  const authHeader = req.get('authorization');
  if (!authHeader || authHeader !== `Bearer ${apiKey}`) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  next();
};
