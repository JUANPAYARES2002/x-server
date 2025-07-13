const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const multer = require('multer');
const {
  createComment,
  deleteComment,
  getCommentsByParent,
  getCommentById,
} = require('../controllers/commentController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/comments/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

router.post('/', auth, upload.single('foto'), createComment);
router.get('/:id', getCommentById);
router.get('/thread/:parentId', getCommentsByParent);
router.delete('/:id', auth, deleteComment);

module.exports = router;
