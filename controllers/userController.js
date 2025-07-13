const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { nanoid } = require('nanoid');

// Registro
exports.createUser = async (req, res) => {
  try {
    const { nombre, username, telefono, fecha, password } = req.body;
    const file = req.file;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'El nombre de usuario ya existe' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      nombre,
      username,
      telefono,
      fecha,
      password: hashedPassword,
      foto: file ? `/uploads/${file.filename}` : null,
      userId: `${username}${Date.now()}`,
      followCount: 0
    });

    await newUser.save();

    const token = jwt.sign(
      { userId: newUser._id, username: newUser.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      msg: 'Usuario creado exitosamente',
      token,
      user: {
        nombre: newUser.nombre,
        username: newUser.username,
        foto: newUser.foto,
        userId: newUser.userId
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar usuario', details: err.message });
  }
};

// Login
exports.loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      msg: "Login exitoso",
      token,
      user: {
        _id: user._id,
        nombre: user.nombre,
        username: user.username,
        foto: user.foto,
        userId: user.userId
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Error en el login", details: error.message });
  }
};

// Obtener perfil
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId; // Obtenido del token decodificado
    const user = await User.findById(userId).select('-password'); // Excluye la contraseña

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener perfil', details: error.message });
  }
};

// Obtneer perfil por username
exports.getUserByUsername = async (req, res) => {
  try {
    const { username } = req.params
    const user = await User.findOne({ username })

    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' })

    res.json(user)
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuario', details: err.message })
  }
}

exports.updateUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const file = req.file;
    const { nombre, telefono, fecha } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    if (nombre) user.nombre = nombre;
    if (telefono) user.telefono = telefono;
    if (fecha) user.fecha = fecha;
    if (file) user.foto = `/uploads/${file.filename}`;

    await user.save();

    res.json({
      msg: 'Perfil actualizado correctamente',
      user: {
        nombre: user.nombre,
        username: user.username,
        telefono: user.telefono,
        fecha: user.fecha,
        foto: user.foto
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar perfil', details: err.message });
  }
};