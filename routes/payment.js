require("dotenv").config();
const express = require("express");
const formidable = require("express-formidable");

const stripe = require("stripe")(process.env.STRIPE_API_KEY_SECRET);

const router = express.Router();
const app = express();
app.use(formidable());
const isAuthenticated = require("../middlewares/isAuthenticated");

const cors = require("cors");
app.use(cors());

router.post("/payment", isAuthenticated, async (req, res) => {
  // router.post("/payment", async (req, res) => {
  try {
    // Recup stripeToken
    // console.log(req.fields);
    const stripeToken = req.fields.stripeToken;

    // Appel API Stripe
    const response = await stripe.charges.create({
      amount: `${req.fields.price * 100}`,
      //   amount: 1000,
      currency: "eur",
      description: `Achat de l'utilisateur ${req.fields.userName} id de l'offre: ${req.fields.offerId}`,
      source: stripeToken,
    });
    // Test de la réponse de l'API Stripe
    // console.log(response);
    if (response.status === "succeeded") {
      // maj de l'annonce comme vendue

      res.status(200).json({ message: "Paiement validé" });
    } else {
      res.status(400).json({ message: "An error occured" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
