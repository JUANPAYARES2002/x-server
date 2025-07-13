const Follow = require("../models/Follow")
const { createNotification } = require("./notificationController")
const { nanoid } = require("nanoid")

exports.toggleFollow = async (req, res) => {
  try {
    const userId = req.params.targetUserId// Usuario a seguir
    const followerId = req.user.userId // Usuario que sigue

    if (userId === followerId) {
      return res.status(400).json({ error: "No puedes seguirte a ti mismo" })
    }

    // Verificar si ya sigue al usuario
    const existingFollow = await Follow.findOne({
      followerId,
      followingId: userId,
    })

    if (existingFollow) {
      // Dejar de seguir
      await Follow.findByIdAndDelete(existingFollow._id)
      res.json({ msg: "Dejaste de seguir al usuario", following: false })
    } else {
      // Seguir usuario
      const newFollow = new Follow({
        followId: nanoid(10),
        followerId,
        followingId: userId,
      })

      await newFollow.save()

      // Crear notificación
      await createNotification({
        userId: userId,
        actorId: followerId,
        type: "follow",
      })

      res.json({ msg: "Ahora sigues al usuario", following: true })
    }
  } catch (err) {
    res.status(500).json({ error: "Error al procesar seguimiento", details: err.message })
  }
}

exports.getFollowers = async (req, res) => {
  try {
    const userId = req.user.userId

    const followers = await Follow.find({ followingId: userId }).populate("followerId", "nombre username foto")

    res.json(followers)
  } catch (err) {
    res.status(500).json({ error: "Error al obtener seguidores", details: err.message })
  }
}

exports.getFollowing = async (req, res) => {
  try {
    const userId = req.user.userId

    const following = await Follow.find({ followerId: userId }).populate("followingId", "nombre username foto")

    res.json(following)
  } catch (err) {
    res.status(500).json({ error: "Error al obtener seguidos", details: err.message })
  }
}

