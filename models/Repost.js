const mongoose = require("mongoose");

const RepostSchema = new mongoose.Schema({
  repostId: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
}, { timestamps: true });

module.exports = mongoose.model("Repost", RepostSchema);
