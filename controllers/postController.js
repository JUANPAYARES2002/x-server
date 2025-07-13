const Post = require('../models/Post');
const Comment = require("../models/Comment")
const { nanoid } = require('nanoid');
const Follow = require('../models/Follow');

// Crear nueva publicación
exports.createPost = async (req, res) => {
  try {
    const { description } = req.body;
    const file = req.file;

    const newPost = new Post({
      postId: nanoid(10),
      userId: req.user.userId,
      foto: file ? `/uploads/${file.filename}` : null,
      description
    });

    await newPost.save();
    res.status(201).json({ msg: 'Post creado', post: newPost });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear post', details: err.message });
  }
};


// Obtener todas las publicaciones
exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("userId", "nombre username foto")
      .populate({
        path: "comments",
        populate: {
          path: "userId",
          select: "nombre username foto",
        },
      })
      .populate({
        path: "likes",
        populate: {
          path: "userId",
          select: "nombre username",
        },
      })
      .populate({
        path: "repost",
        populate: {
          path: "userId",
          select: "nombre username",
        },
      })
      .sort({ date: -1 })

    res.json(posts)
  } catch (err) {
    console.error("Error getting posts:", err)
    res.status(500).json({ error: "Error al obtener posts", details: err.message })
  }
}

exports.getFollowingPosts = async (req, res) => {
  try {
    console.log("req.user:", req.user); // Agrega esto
    const userId = req.user.userId;

    const following = await Follow.find({ followerId: userId }).select("followingId");
    console.log("following:", following); // Agrega esto

    const followingIds = following.map((follow) => follow.followingId);
    followingIds.push(userId);
    console.log("followingIds:", followingIds); // Agrega esto

    const posts = await Post.find({ userId: { $in: followingIds } })
      .populate("userId", "nombre username foto")
      .populate({ path: "comments", populate: { path: "userId", select: "nombre username foto" } })
      .populate({ path: "likes", populate: { path: "userId", select: "nombre username" } })
      .populate({ path: "repost", populate: { path: "userId", select: "nombre username" } })
      .sort({ date: -1 });

    res.json(posts);
  } catch (err) {
    console.error("🔥 Error real:", err.message);
    console.error("🔍 Stack trace:", err.stack);
    res.status(500).json({ error: "Error al obtener posts de seguidos", details: err.message });
  }
};

// Obtener un post por ID
exports.getPostById = async (req, res) => {
  try {
    const { id } = req.params

    const post = await Post.findById(id)
      .populate("userId", "nombre username foto")
      .populate({
        path: "comments",
        populate: {
          path: "userId",
          select: "nombre username foto",
        },
      })
      .populate({
        path: "likes",
        populate: {
          path: "userId",
          select: "nombre username",
        },
      })
      .populate({
        path: "repost",
        populate: {
          path: "userId",
          select: "nombre username",
        },
      })

    if (!post) {
      return res.status(404).json({ error: "Post no encontrado" })
    }

    res.json(post)
  } catch (err) {
    console.error("Error getting post:", err)
    res.status(500).json({ error: "Error al obtener el post", details: err.message })
  }
}

// Obtnener todos los post de un ID usuario
exports.getPostsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Busca todos los posts cuyo campo userId coincida
    const posts = await Post.find({ userId })
      .populate('userId', 'username foto')
      .populate('comments')
      .populate('likes')
      .populate('repost')
      .sort({ createdAt: -1 });

    return res.json(posts);
  } catch (err) {
    console.error('Error en getPostsByUser:', err);
    return res
      .status(500)
      .json({ error: 'Error al listar posts de usuario', details: err.message });
  }
};

// Actualizar post
exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findOne({ postId: req.params.id });
    if (!post) return res.status(404).json({ error: 'Post no encontrado' });
    if (post.userId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'No autorizado para editar este post' });
    }

    const { foto, description } = req.body;
    if (foto) post.foto = foto;
    if (description) post.description = description;
    await post.save();

    res.json({ msg: 'Post actualizado', post });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar post', details: err.message });
  }
};

// Eliminar post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findOne({ postId: req.params.id });
    if (!post) return res.status(404).json({ error: 'Post no encontrado' });
    if (post.userId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'No autorizado para eliminar este post' });
    }
    await post.remove();
    res.json({ msg: 'Post eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar post', details: err.message });
  }
};
