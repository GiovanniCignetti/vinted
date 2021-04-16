const User = require("../models/User");
const isAuthenticated = async (req, res, next) => {
  // Récupérer le token
  const token = req.headers.authorization.replace("Bearer ", "");
  // Chercher le user qui possède ce token dans la BDD
  const user = await User.findOne({ token: token });
  if (user) {
    // ajouter à req l'objet user
    req.user = user;
    // S'il exsite =====> next()
    next();
  } else {
    // Sinon ====> unauthorized
    res.status(401).json({ message: "Unauthorized" });
  }
};
module.exports = isAuthenticated;
