const express = require("express");
const formidable = require("express-formidable");
const cloudinary = require("cloudinary").v2;
const router = express.Router();
require("dotenv").config();

const app = express();
app.use(formidable());

const Offer = require("../models/Offer");
const User = require("../models/User");

const isAuthenticated = require("../middlewares/isAuthenticated");

router.post("/offer/publish", isAuthenticated, async (req, res) => {
  try {
    // récupération fields
    const {
      title,
      description,
      price,
      condition,
      city,
      brand,
      color,
      size,
    } = req.fields;

    // création de l'annonce avant l'upload afin d'avoir l'id
    const user = await User.findOne({ email: "giovanni@lereacteur.io" });

    const newOffer = new Offer({
      product_name: title,
      product_description: description,
      product_price: price,
      product_details: [
        {
          MARQUE: brand,
        },
        {
          TAILLE: size,
        },
        {
          ÉTAT: condition,
        },
        {
          COULEUR: color,
        },
        {
          EMPLACEMENT: city,
        },
      ],
      product_image: null,
      owner: user,
    });
    await newOffer.save();

    // Upload photo vers cloudinary
    const result = await cloudinary.uploader.upload(req.files.picture.path, {
      folder: `/vinted/offers/${newOffer.id}/`,
    });

    //mise à jour de l'offre
    //user = await User.findOne({ email: "giovanni@lereacteur.io" });
    newOffer.product_image = result;
    await newOffer.save();

    // Etape4 : répondre au client
    res.status(200).json({
      _id: newOffer.id,
      product_name: newOffer.product_name,
      product_description: newOffer.product_description,
      product_price: newOffer.product_price,
      product_details: newOffer.product_details,
      owner: {
        account: user.account,
        _id: user.id,
      },
      product_image: {
        // ...
        // informations sur l'image du produit
        secure_url: result.secure_url,
        // ...
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/offers", async (req, res) => {
  try {
    const { title, priceMin, priceMax, sort, page } = req.query;

    const filter = {};
    if (title) {
      filter.product_name = new RegExp(title, "i");
      //   }
    }

    if (priceMin) {
      filter.product_price = { $gte: Number(priceMin) };
    }

    if (priceMax) {
      if (filter.product_price) {
        filter.product_price.$lte = Number(priceMax);
      } else {
        filter.product_price = { $lte: Number(priceMax) };
      }
    }

    const numberOffersPerPage = 50;
    let numberSkip = 0;
    if (page > 1) {
      numberSkip = page * numberOffersPerPage;
    }

    //trie par prix
    const sortPrice = {};
    if (sort === "price-desc") {
      sortPrice.product_price = -1;
    } else if (sort === "price-asc") {
      sortPrice.product_price = 1;
    }

    const results = await Offer.find(filter)
      .populate("owner")
      .skip(numberSkip)
      .limit(numberOffersPerPage)
      .sort(sortPrice);

    const count = results.length;
    const returnTab = [];
    let offer = {};
    // boucle sur le tableau pour mla mise en forme
    for (let i = 0; i <= results.length - 1; i++) {
      //mise en forme offer retour
      offer = {
        _id: results[i].id,
        product_name: results[i].product_name,
        product_description: results[i].product_description,
        product_price: results[i].product_price,
        product_details: results[i].product_details,
        owner: results[i].owner.account,
        product_image: {
          // ...
          // informations sur l'image du produit
          secure_url: results[i].product_image.secure_url,
          // ...
        },
      };
      returnTab.push(offer);
    }

    //console.log(result);
    res.status(200).json({ count: count, offers: returnTab });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/offer/:id", async (req, res) => {
  try {
    const offer = await Offer.findById({ _id: req.params.id }).populate(
      "owner"
    );
    res.status(200).json(offer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
