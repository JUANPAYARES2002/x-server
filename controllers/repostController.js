const Repost = require('../models/Repost');
const Post = require('../models/Post');
const { nanoid } = require('nanoid');

exports.createRepost = async (req, res) => {
  try {
    const { postId } = req.body;
    // Evitar repost duplicado
    const exists = await Repost.findOne({ userId: req.user.userId, postId });
    if (exists) {
      return res.status(400).json({ error: 'Ya has hecho repost de este post' });
    }
    const repost = new Repost({
      repostId: nanoid(10),
      userId: req.user.userId,
      postId
    });
    await repost.save();
    await Post.findByIdAndUpdate(postId, { $push: { repost: repost._id } });
    res.status(201).json({ msg: 'Repost creado', repost });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear repost', details: err.message });
  }
};

exports.deleteRepost = async (req, res) => {
  try {
    const { id } = req.params; // repostId
    const repost = await Repost.findOne({ repostId: id });
    if (!repost) return res.status(404).json({ error: 'Repost no encontrado' });
    if (repost.userId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'No autorizado para eliminar este repost' });
    }
    await repost.remove();
    await Post.findByIdAndUpdate(repost.postId, { $pull: { repost: repost._id } });
    res.json({ msg: 'Repost eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar repost', details: err.message });
  }
};
