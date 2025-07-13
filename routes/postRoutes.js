const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const {
  createPost,
  getPosts,
  getPostById,
  getPostsByUser,
  updatePost,
  deletePost,
  getFollowingPosts
} = require('../controllers/postController');

router.post('/', auth, upload.single('foto'), createPost);
router.get('/', getPosts);
router.get("/following", auth, getFollowingPosts)
router.get('/:id', getPostById);
router.get('/user/:userId', getPostsByUser);
router.put('/:id', auth, updatePost);
router.delete('/:id', auth, deletePost);

module.exports = router;
