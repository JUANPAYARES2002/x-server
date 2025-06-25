const Notification = require('../models/Notification');
const { nanoid } = require('nanoid');

// Obtener notificaciones del usuario
exports.getNotifications = async (req, res) => {
  try {
    const notes = await Notification.find({ userId: req.user.userId })
      .populate('actorId', 'username foto')
      .sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: 'Error al listar notificaciones', details: err.message });
  }
};

// Marcar como leída
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params; // notificationId
    const note = await Notification.findOneAndUpdate(
      { notificationId: id, userId: req.user.userId },
      { read: true },
      { new: true }
    );
    if (!note) return res.status(404).json({ error: 'Notificación no encontrada' });
    res.json({ msg: 'Notificación leída', notification: note });
  } catch (err) {
    res.status(500).json({ error: 'Error al marcar notificación', details: err.message });
  }
};

// Crear notificación (se invocará desde controllers de like/comment/repost/follow)
exports.createNotification = async ({ userId, actorId, type, postId, commentId }) => {
  const note = new Notification({
    notificationId: nanoid(10),
    userId,
    actorId,
    type,
    postId,
    commentId
  });
  await note.save();
  return note;
};
