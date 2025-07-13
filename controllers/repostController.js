const Repost = require('../models/Repost');
const Post = require('../models/Post');
const { nanoid } = require('nanoid');

exports.createRepost = async (req, res) => {
  try {
    const { postId } = req.body
    const userId = req.user.userId

    // Verificar si ya existe el repost
    const existingRepost = await Repost.findOne({ userId, postId })
    if (existingRepost) {
      return res.status(400).json({ error: "Ya has reposteado este tweet" })
    }

    const newRepost = new Repost({
      repostId: nanoid(10),
      userId,
      postId,
    })

    await newRepost.save()
    await Post.findByIdAndUpdate(postId, {
      $push: { repost: newRepost._id },
    })

    // Crear notificación (solo si no es el propio usuario)
    const post = await Post.findById(postId).populate("userId")
    if (post.userId._id.toString() !== userId) {
      await createNotification({
        userId: post.userId._id,
        actorId: userId,
        type: "repost",
        postId: postId,
      })
    }

    res.status(201).json({ msg: "Repost creado", repost: newRepost })
  } catch (err) {
    res.status(500).json({ error: "Error al crear repost", details: err.message })
  }
}

exports.deleteRepost = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("🔍 Eliminando repost con ID:", id);

    const repost = await Repost.findById(id); // Usa ID de Mongo
    if (!repost) {
      console.log("⚠️ Repost no encontrado con ID:", id);
      return res.status(404).json({ error: 'Repost no encontrado' });
    }

    if (repost.userId.toString() !== req.user.userId) {
      console.log("❌ No autorizado:", repost.userId, "!=", req.user.userId);
      return res.status(403).json({ error: 'No autorizado para eliminar este repost' });
    }

    console.log("✅ Eliminando repost:", repost._id);
    await Repost.deleteOne({ _id: repost._id });

    await Post.findByIdAndUpdate(repost.postId, { $pull: { repost: repost._id } });

    res.json({ msg: 'Repost eliminado' });
  } catch (err) {
    console.error("❌ Error al eliminar repost:", err.message, err.stack);
    res.status(500).json({ error: 'Error al eliminar repost', details: err.message });
  }
};

// Obtener reposts del usuario
exports.getUserReposts = async (req, res) => {
  try {
    const userId = req.user.userId

    const reposts = await Repost.find({ userId })
      .populate("userId", "nombre username foto") // quien hizo el repost
      .populate({
        path: "postId",
        populate: [
          { path: "userId", select: "nombre username foto" }, // autor del post original
          { path: "likes", populate: { path: "userId", select: "nombre username" } },
          { path: "repost", populate: { path: "userId", select: "nombre username" } },
          { path: "comments", populate: { path: "userId", select: "nombre username foto" } },
        ],
      })
      .sort({ createdAt: -1 })

    // Filtrar reposts donde el post aún existe
    const validReposts = reposts.filter((repost) => repost.postId)

    res.json(validReposts)
  } catch (error) {
    console.error("Error al obtener reposts del usuario:", error)
    res.status(500).json({ error: "Error al obtener reposts", details: error.message })
  }
}