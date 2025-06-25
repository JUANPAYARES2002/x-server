const express = require('express');
const router = express.Router();
const { createRepost, deleteRepost } = require('../controllers/repostController');
const auth = require('../middlewares/auth');

router.post('/', auth, createRepost);
router.delete('/:id', auth, deleteRepost);

module.exports = router;
