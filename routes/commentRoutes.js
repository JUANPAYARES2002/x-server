const express = require('express');
const router = express.Router();
const { createComment, deleteComment } = require('../controllers/commentController');
const auth = require('../middlewares/auth');

router.post('/', auth, createComment);
router.delete('/:id', auth, deleteComment);

module.exports = router;
