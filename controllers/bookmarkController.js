const Bookmark = require('../models/Bookmark');

// Agregar/Quitar bookmark
exports.toggleBookmark = async (req, res) => {
  try {
    const { postId } = req.body;
    const exists = await Bookmark.findOne({ userId: req.user.userId, postId });
    if (exists) {
      await Bookmark.deleteOne({ _id: exists._id });
      return res.json({ msg: 'Bookmark removido' });
    }
    const bm = new Bookmark({ userId: req.user.userId, postId });
    await bm.save();
    res.status(201).json({ msg: 'Bookmark agregado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al togglear bookmark', details: err.message });
  }
};

// Listar bookmarks
exports.getBookmarks = async (req, res) => {
  try {
    const bms = await Bookmark.find({ userId: req.user.userId })
      .populate({
        path: 'postId',
        populate: {
          path: 'userId',
          select: 'nombre username foto'
        }
      })
      .sort({ createdAt: -1 });
      
    res.json(bms);
  } catch (err) {
    res.status(500).json({ error: 'Error al listar bookmarks', details: err.message });
  }
};

