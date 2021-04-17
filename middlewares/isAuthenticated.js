// import model User pour la recherche via le token
const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  // Récupérer le token dans la requete
  const token = req.headers.authorization.replace("Bearer ", "");

  // Chercher le user qui possède ce token dans la BDD
  const user = await User.findOne({ token: token });

  if (user) {
    // ajouter à req l'objet user
    req.user = user;
    // poursuite du traitement dans la route
    next();
  } else {
    // Sinon ====> unauthorized
    res.status(401).json({ message: "Unauthorized" });
  }
};
module.exports = isAuthenticated;
