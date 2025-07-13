const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { nanoid } = require('nanoid');

exports.createComment = async (req, res) => {
  try {
    const { postId, description, parentCommentId } = req.body;
    const file = req.file;

    const newComment = new Comment({
      commentId: nanoid(10),
      userId: req.user.userId,
      postId,
      description,
      parentCommentId: parentCommentId || null,
      foto: file ? `/uploads/comments/${file.filename}` : null
    });

    await newComment.save();

    if (!parentCommentId) {
      await Post.findByIdAndUpdate(postId, {
        $push: { comments: newComment._id }
      });
    }

    // Populate para devolver la información completa
    await newComment.populate('userId', 'nombre username foto');

    res.status(201).json(newComment);
  } catch (err) {
    console.error('Error creating comment:', err);
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

exports.getCommentsByParent = async (req, res) => {
  try {
    const replies = await Comment.find({ parentCommentId: req.params.parentId })
      .populate('userId', 'nombre username foto')
      .sort({ createdAt: 1 });
    res.json(replies);
  } catch (err) {
    res.status(500).json({ error: 'Error al listar respuestas', details: err.message });
  }
};

exports.getCommentById = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)
      .populate('userId', 'nombre username foto');
    if (!comment) return res.status(404).json({ error: 'Comentario no encontrado' });
    res.json(comment);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener comentario', details: err.message });
  }
};

exports.getUserComments = async (req, res) => {
  try {
    const userId = req.user.userId

    const comments = await Comment.find({ userId })
      .populate({
        path: "postId",
        populate: [
          { path: "userId", select: "nombre username foto" },
          { path: "likes", populate: { path: "userId", select: "nombre username" } },
          { path: "repost", populate: { path: "userId", select: "nombre username" } },
          { path: "comments", populate: { path: "userId", select: "nombre username foto" } },
        ],
      })
      .populate("userId", "nombre username foto")
      .sort({ createdAt: -1 })

    // Filtrar comentarios donde el post aún existe
    const validComments = comments.filter((comment) => comment.postId)

    res.json(validComments)
  } catch (err) {
    res.status(500).json({ error: "Error al obtener comentarios del usuario", details: err.message })
  }
}