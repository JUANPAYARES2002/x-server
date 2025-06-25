const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const { createUser, loginUser, getUserProfile, updateUser } = require('../controllers/userController');
const auth = require('../middlewares/auth');

router.post('/register', upload.single('foto'), createUser);
router.post('/login', loginUser);
router.get('/profile', auth, getUserProfile);
router.put('/update', auth, upload.single('foto'), updateUser);

module.exports = router;
