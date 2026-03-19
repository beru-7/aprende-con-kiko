const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();


// Configura donde y como se guardan las fotos
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'kiko_avatars', 
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'], 
    transformation: [{ width: 250, height: 250, crop: 'fill' }] 
  },
});

const upload = multer({ storage: storage });

module.exports = { upload, cloudinary };