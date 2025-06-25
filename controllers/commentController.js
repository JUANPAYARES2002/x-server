const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { nanoid } = require('nanoid');

exports.createComment = async (req, res) => {
  try {
    const { postId, description } = req.body;
    const comment = new Comment({
      commentId: nanoid(10),
      userId: req.user.userId,
      postId,
      description
    });
    await comment.save();
    // Agregar la referencia al post
    await Post.findByIdAndUpdate(postId, { $push: { comments: comment._id } });
    res.status(201).json({ msg: 'Comentario creado', comment });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear comentario', details: err.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params; // commentId
    const comment = await Comment.findOne({ commentId: id });
    if (!comment) return res.status(404).json({ error: 'Comentario no encontrado' });
    if (comment.userId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'No autorizado para eliminar este comentario' });
    }
    await comment.remove();
    // Quitar referencia del post
    await Post.findByIdAndUpdate(comment.postId, { $pull: { comments: comment._id } });
    res.json({ msg: 'Comentario eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar comentario', details: err.message });
  }
};
