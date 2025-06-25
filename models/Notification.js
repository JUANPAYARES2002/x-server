const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  notificationId: { type: String, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },    // Quien recibe
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },   // Quien genera la acción
  type: { type: String, enum: ['like','comment','repost','follow'], required: true },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  commentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
  date: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
