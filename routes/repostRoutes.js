const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { createRepost, deleteRepost, getUserReposts } = require('../controllers/repostController');

router.post('/', auth, createRepost);
router.delete('/:id', auth, deleteRepost);
router.get("/user", auth, getUserReposts)

module.exports = router;
