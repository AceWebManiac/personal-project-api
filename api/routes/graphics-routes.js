const router = require('express').Router();

const GraphicController = require('../controllers/graphics-contorller');

router.get('/daily', GraphicController.dailyValues);

module.exports = router;