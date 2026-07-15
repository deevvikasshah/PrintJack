const router = require('express').Router();
const { seed } = require('../controllers/seedController');

router.post('/', seed);

module.exports = router;
