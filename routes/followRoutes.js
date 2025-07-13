const express = require('express');
const router = express.Router();
const { toggleFollow, getFollowers, getFollowing } = require('../controllers/followController');
const auth = require('../middlewares/auth');

router.post('/:targetUserId', auth, toggleFollow);
router.get('/followers', auth, getFollowers);
router.get('/following', auth, getFollowing);

module.exports = router;
