const express = require('express');
const router = express.Router();
const { toggleLike } = require('../controllers/likeController');
const auth = require('../middlewares/auth');

router.post('/', auth, toggleLike);

module.exports = router;
