const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nombre: String,
  username: { type: String, unique: true },
  telefono: String,
  fecha: Date,
  password: String,
  foto: String,
  userId: String,
  followCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);