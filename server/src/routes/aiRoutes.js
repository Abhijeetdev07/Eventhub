const express = require('express');

const { enhanceDescription } = require('../controllers/aiController');

const router = express.Router();

router.post('/enhance-description', enhanceDescription);

module.exports = router;
