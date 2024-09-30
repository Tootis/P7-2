const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

const storage = multer.memoryStorage()

const upload = multer({ storage }).single('image');


const resizeImage = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Aucun fichier image fourni.' });
  }

  const extension = MIME_TYPES[req.file.mimetype];
  const filename = req.file.originalname.split(' ').join('_') + Date.now() + '.' + extension;
  const outputDir = 'images';

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  const outputFileName = req.file.originalname.split(' ').join('_') + Date.now() + '.' + extension;
  const outputFilePath = path.join(outputDir, filename);

  try {
    await sharp(req.file.buffer)
    .resize(800)
    .jpeg({ quality: 80 })
    .png({quality: 80})
    .toFile(outputFilePath);

    req.file.filename = outputFileName;

    next();
  } catch (error) {
    console.error('Erreur lors du traitement de l’image:', error);
    return res.status(500).json({ error: 'Erreur lors du traitement de l’image.' });
  }
};

module.exports = { upload, resizeImage };