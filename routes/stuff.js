const express = require('express');
const router = express.Router();
const stuffCtrl = require('../controllers/stuff');
const auth = require('../middleware/auth');
const { upload, resizeImage } = require('../middleware/multer-config');

router.get('/', stuffCtrl.getAllThing);
router.post('/', auth, upload, resizeImage, stuffCtrl.createThing);
router.get('/bestrating', stuffCtrl.getBestRatedThing);
router.get('/:id', stuffCtrl.getOneThing);
router.put('/:id', auth, upload, resizeImage, stuffCtrl.modifyThing);
router.delete('/:id', auth, stuffCtrl.deleteThing);
router.post('/:id/rating', auth, stuffCtrl.postRating);

module.exports = router;