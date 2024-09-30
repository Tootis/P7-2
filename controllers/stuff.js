const Thing = require('../models/Thing')
const fs = require('fs');
const path = require('path');


exports.createThing = (req, res, next) => {
    const thingObject = JSON.parse(req.body.book);
    console.log(thingObject);
    
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier image fourni.' });
    }
  
    delete thingObject._id;
    delete thingObject._userId;
  
    const thing = new Thing({
      ...thingObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
  
    thing.save()
      .then(() => {
        console.log(`Objet enregistré avec URL d'image : ${thing.imageUrl}`);
        res.status(201).json({ message: "Objet enregistré !" });
      })
      .catch(error => {
        console.error('Erreur lors de l\'enregistrement de l\'objet :', error);
        res.status(400).json({ error });
      });
  };

exports.modifyThing = (req, res, next) => {
    const thingObject = req.file ? {
      ...JSON.parse(req.body.book),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  
    delete thingObject._userId;
  
    Thing.findOne({ _id: req.params.id })
      .then((thing) => {
        if (thing.userId != req.auth.userId) {
          return res.status(401).json({ message: 'Not authorized' });
        }
  
        if (req.file) {
        
          const oldImagePath = path.join(__dirname, '..', 'images',thing.imageUrl.split('/').pop());
          

          console.log('Chemin de l\'ancienne image :', oldImagePath);
          fs.unlink(oldImagePath, (err) => {
            if (err) {
              console.error('Erreur lors de la suppression de l\'ancienne image:', err);
              return res.status(500).json({ error: 'Erreur lors de la suppression de l\'ancienne image.' });
            }
  
            Thing.updateOne({ _id: req.params.id }, { ...thingObject, _id: req.params.id })
              .then(() => res.status(200).json({ message: 'Objet modifié!' }))
              .catch(error => res.status(400).json({ error }));
          });
        } else {
          Thing.updateOne({ _id: req.params.id }, { ...thingObject, _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Objet modifié!' }))
            .catch(error => res.status(400).json({ error }));
        }
      })
      .catch((error) => {
        res.status(400).json({ error });
      });
  };

exports.deleteThing = (req, res, next) => {
  Thing.findOne({ _id: req.params.id})
      .then(thing => {
          if (thing.userId != req.auth.userId) {
              res.status(401).json({message: 'Not authorized'});
          } else {
              const filename = thing.imageUrl.split('/images/')[1];
              fs.unlink(`images/${filename}`, () => {
                  Thing.deleteOne({_id: req.params.id})
                      .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
                      .catch(error => res.status(401).json({ error }));
              });
          }
      })
      .catch( error => {
          res.status(500).json({ error });
      });
};

exports.getOneThing = (req, res, next) => {
    Thing.findOne({ _id: req.params.id })
      .then(thing => res.status(200).json(thing))
      .catch(error => res.status(404).json({ error }));
}

exports.getAllThing = (req, res, next) => {
    Thing.find()
      .then(things => res.status(200).json(things))
      .catch(error => res.status(400).json({ error }));
}

exports.postRating = (req, res, next) => {

    console.log(req.body)
    const { userId, rating } = req.body;
    const user = req.body.userId;

    Thing.findById ({_id: req.params.id})
    .then(thing => {
        const userRating = thing.ratings.find(rating => rating.userId === userId);
        if (userRating) {
            return res.status(400).json({ error: "Vous avez déjà noté ce livre" });
        }
        else {
            let listRating = rating
            let numberOfRating = 1

            thing.ratings.forEach((item) => listRating = listRating + item.grade)
            numberOfRating = numberOfRating+thing.ratings.length

            listRating = listRating / numberOfRating

            listRating = parseFloat(listRating.toFixed(1));
            
            Thing.updateOne({_id: req.params.id}, {_id: req.params.id, $push: {ratings : {userId : req.body.userId, grade: req.body.rating}}, averageRating: listRating})
                .then(() => res.status(200).json({message}))
                .catch(error => {res.status(401).json({error})})
      }
    }).catch((error) => {
        res.status(400).json({ error });
    });
  }

exports.getBestRatedThing = (req, res, next) => {
    Thing.find().sort({averageRating:-1}).limit(3)
    .then(things => res.status(200).json(things))
    .catch(error => res.status(400).json({ error }));
}