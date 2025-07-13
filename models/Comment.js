const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  commentId: { type: String, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  description: { type: String},
  date: { type: Date, default: Date.now },
  foto: String,
  parentCommentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null }
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);
