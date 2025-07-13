const express = require('express');
const router = express.Router();
const { toggleLike, getLikedPosts } = require('../controllers/likeController');
const auth = require('../middlewares/auth');

router.post('/', auth, toggleLike);
router.get("/liked-posts", auth, getLikedPosts)

module.exports = router;
