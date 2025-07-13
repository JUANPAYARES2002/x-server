const Like = require('../models/Like');
const Post = require('../models/Post');
const { nanoid } = require('nanoid');

exports.toggleLike = async (req, res) => {
  try {
    const { postId } = req.body;
    const userId = req.user.userId;

    // Verifica si ya existe un like
    const existing = await Like.findOne({ userId, postId });

    if (existing) {
      // Quitar like
      await Post.findByIdAndUpdate(postId, { $pull: { likes: existing._id } });
      await existing.deleteOne(); // Mejor que .remove()
      return res.json({ msg: 'Like removido' });
    }

    // Crear nuevo like
    const like = new Like({
      likeId: nanoid(10),
      userId,
      postId,
    });
    await like.save();

    await Post.findByIdAndUpdate(postId, { $addToSet: { likes: like._id } }); // evita duplicados

    // Crear notificación (solo si no es el propio usuario)
    const post = await Post.findById(postId).populate("userId")
    if (post.userId._id.toString() !== userId) {
      await createNotification({
        userId: post.userId._id,
        actorId: userId,
        type: "like",
        postId: postId,
      })
    }

    return res.status(201).json({ msg: 'Like agregado', like });

  } catch (err) {
    console.error('Error en toggleLike:', err);
    res.status(500).json({ error: 'Error al togglear like', details: err.message });
  }
};

// Obtener posts que el usuario ha dado like
exports.getLikedPosts = async (req, res) => {
  try {
    const userId = req.user.userId

    const likes = await Like.find({ userId })
      .populate({
        path: "postId",
        populate: [
          { path: "userId", select: "nombre username foto" },
          { path: "likes", populate: { path: "userId", select: "nombre username" } },
          { path: "repost", populate: { path: "userId", select: "nombre username" } },
          { path: "comments", populate: { path: "userId", select: "nombre username foto" } },
        ],
      })
      .sort({ createdAt: -1 })

    // Filtrar likes donde el post aún existe
    const validLikes = likes.filter((like) => like.postId)
    const likedPosts = validLikes.map((like) => like.postId)

    res.json(likedPosts)
  } catch (err) {
    res.status(500).json({ error: "Error al obtener posts con like", details: err.message })
  }
}