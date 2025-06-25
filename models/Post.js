const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  postId: { type: String, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  foto: String,
  description: String,
  date: { type: Date, default: Date.now },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Like' }],
  repost: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Repost' }]
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);
