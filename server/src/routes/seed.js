const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { seed } = require('../controllers/seedController');

const requireSeedKey = (req, res, next) => {
  const seedKey = process.env.SEED_SECRET_KEY;
  if (!seedKey) {
    return res.status(503).json({
      success: false,
      message: 'Seeding is disabled: SEED_SECRET_KEY is not configured on the server.',
    });
  }

  const provided =
    req.headers['x-seed-key'] ||
    req.body?.seedKey ||
    req.query.seedKey;

  if (provided !== seedKey) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or missing seed secret key.',
    });
  }

  next();
};

router.post('/', protect, authorize('super_admin'), requireSeedKey, seed);

module.exports = router;
