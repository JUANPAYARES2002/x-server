const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

bookmarkSchema.index({ userId: 1, postId: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', bookmarkSchema);
