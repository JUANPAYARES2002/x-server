const Like = require('../models/Like');
const Post = require('../models/Post');
const { nanoid } = require('nanoid');

exports.toggleLike = async (req, res) => {
  try {
    const { postId } = req.body;
    const existing = await Like.findOne({ userId: req.user.userId, postId });
    if (existing) {
      // Quitar like
      await existing.remove();
      await Post.findByIdAndUpdate(postId, { $pull: { likes: existing._id } });
      return res.json({ msg: 'Like removido' });
    }
    // Crear like
    const like = new Like({
      likeId: nanoid(10),
      userId: req.user.userId,
      postId
    });
    await like.save();
    await Post.findByIdAndUpdate(postId, { $push: { likes: like._id } });
    res.status(201).json({ msg: 'Like agregado', like });
  } catch (err) {
    res.status(500).json({ error: 'Error al togglear like', details: err.message });
  }
};
