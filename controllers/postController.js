const Post = require('../models/Post');
const { nanoid } = require('nanoid');

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
exports.getPosts = async (_, res) => {
  try {
    const posts = await Post.find()
      .populate('userId', 'username foto')
      .populate('comments')
      .populate('likes')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Error al listar posts', details: err.message });
  }
};

// Obtener un post por ID
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findOne({ postId: req.params.id })
      .populate('userId', 'username foto')
      .populate('comments')
      .populate('likes');
    if (!post) return res.status(404).json({ error: 'Post no encontrado' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener post', details: err.message });
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
