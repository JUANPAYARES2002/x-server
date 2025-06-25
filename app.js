const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');

// Rutas
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const likeRoutes    = require('./routes/likeRoutes');
const repostRoutes  = require('./routes/repostRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const bookmarkRoutes     = require('./routes/bookmarkRoutes');
const followRoutes       = require('./routes/followRoutes');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/likes',    likeRoutes);
app.use('/api/reposts',  repostRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/bookmarks',     bookmarkRoutes);
app.use('/api/follow',        followRoutes);
app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
