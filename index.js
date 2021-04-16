// La ligne suivante ne doit être utilisée qu'une seule fois et au tout début du projet. De préférence dans index.js
require("dotenv").config(); // Permet d'activer les variables d'environnement qui se trouvent dans le fichier `.env`
const cloudinary = require("cloudinary").v2;
const express = require("express");
// const cors = require("cors");
const formidable = require("express-formidable");
const mongoose = require("mongoose");

const app = express();
app.use(formidable());
// app.use(cors());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// import des routes
const userRoutes = require("./routes/user");
app.use(userRoutes);

const offerRoutes = require("./routes/offer");
app.use(offerRoutes);

app.all("*", (req, res) => {
  res.status(404).json({ error: "Cette route n'existe pas." });
});

app.listen(process.env.PORT, () => {
  console.log("Server Started");
});
