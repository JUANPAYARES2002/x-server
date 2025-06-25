const Follow = require('../models/Follow');
const User = require('../models/User');

exports.toggleFollow = async (req, res) => {
  try {
    const { targetUserId } = req.body; // El userId a seguir/dejar de seguir
    if (targetUserId === req.user.userId) {
      return res.status(400).json({ error: 'No puedes seguirte a ti mismo' });
    }

    // Verificar usuario existe
    const target = await User.findById(targetUserId);
    if (!target) {
      return res.status(404).json({ error: 'Usuario a seguir no existe' });
    }

    const exists = await Follow.findOne({
      followerId: req.user.userId,
      followingId: targetUserId
    });

    if (exists) {
      await exists.remove();
      // Actualizar contador
      await User.findByIdAndUpdate(targetUserId, { $inc: { followCount: -1 } });
      return res.json({ msg: 'Unfollowed' });
    }

    // Crear follow
    await new Follow({
      followerId: req.user.userId,
      followingId: targetUserId
    }).save();
    // Incrementar contador en target
    await User.findByIdAndUpdate(targetUserId, { $inc: { followCount: 1 } });
    res.status(201).json({ msg: 'Followed' });
  } catch (err) {
    res.status(500).json({ error: 'Error al togglear follow', details: err.message });
  }
};

exports.getFollowers = async (req, res) => {
  try {
    const followers = await Follow.find({ followingId: req.user.userId })
      .populate('followerId', 'username foto');
    res.json(followers);
  } catch (err) {
    res.status(500).json({ error: 'Error al listar followers', details: err.message });
  }
};

exports.getFollowing = async (req, res) => {
  try {
    const following = await Follow.find({ followerId: req.user.userId })
      .populate('followingId', 'username foto');
    res.json(following);
  } catch (err) {
    res.status(500).json({ error: 'Error al listar following', details: err.message });
  }
};
