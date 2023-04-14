const User = require("../models/UserModel");
const Review = require('../models/ReviewModel')
const Product = require('../models/ProductModel')
const { hashPassword, comparePasswords } = require("../utils/hashPassword");
const generateAuthToken = require("../utils/generateAuthToken");

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select("-password");
    return res.json(users);
  } catch (err) {
    next(err);
  }
};

const registerUser = async (req, res, next) => {
  try {
    const { name, lastName, email, password } = req.body;
    if (!(name && lastName && email && password)) {
      return res.status(400).send("All inputs are required");
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).send("user exists");
    } else {
      const hashedPassword = hashPassword(password);
      const user = await User.create({
        name,
        lastName,
        email: email.toLowerCase(),
        password: hashedPassword,
      });
      res
        .cookie(
          "access_token",
          generateAuthToken(
            user._id,
            user.name,
            user.lastName,
            user.email,
            user.isAdmin
          ),
          {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
          }
        )
        .status(201)
        .json({
          success: "User created",
          userCreated: {
            _id: user._id,
            name: user.name,
            lastName: user.lastName,
            email: user.email,
            isAdmin: user.isAdmin,
          },
        });
    }
  } catch (err) {
    next(err);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password, doNotLogout } = req.body;
    if (!(email && password)) {
      return res.status(400).send("All inputs are required");
    }

    const user = await User.findOne({ email }).orFail();
    if (user && comparePasswords(password, user.password)) {
      let cookieParams = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      };

      if (doNotLogout) {
        cookieParams = { ...cookieParams, maxAge: 1000 * 60 * 60 * 24 * 7}; // 1000=1ms
      }

      return res.cookie(
        "access_token",
        generateAuthToken(
          user._id,
          user.name,
          user.lastName,
          user.email,
          user.isAdmin
        ),
        cookieParams
      ).json({
        success: "user logged in",
        userLoggedIn: { _id: user._id, name: user.name, lastName: user.lastName, email: user.email, isAdmin: user.isAdmin, doNotLogout }
      });
    } else {
      return res.status(401).send("wrong credentials")
    }
  } catch (err) {
    next(err);
  }
};

const updateUserProfile = async (req, res, next) => {
  try {

    //Find user by ID
    const user = await User.findById(req.user._id).orFail();

    user.name = req.body.name || user.name; // Required
    user.lastName = req.body.lastName || user.lastName; // Required
    //user.email = req.body.email || user.email; Required
    user.phoneNumber = req.body.phoneNumber;
    user.address = req.body.address;
    user.country = req.body.country;
    user.zipCode = req.body.zipCode;
    user.city = req.body.city;
    user.state = req.body.state;

    //Required password en el body
    if (req.body.password !== user.password) {
      user.password = hashPassword(req.body.password);
    }
    await user.save();

    res.json({
      success: "user updated",
      userUpdated: {
        _id: user._id,
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (err) {
    next(err);
  }
};

const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).orFail();
    return res.send(user);
  } catch (err) {
    next(err)
  }
}

//Un usuario puede escribir un review por producto 
const writeReview = async (req, res, next) => {
  try {
    //Crear transacción de review entre review y producto que haya  una coherencia en los datos 
    const session = await Review.startSession();


    // solicitar datos de comment, rating del request.body:
    const { comment, rating } = req.body;
    // Validar que introducimos comment y rating
    if (!(comment && rating)) {
      return res.status(400).send("All inputs are required");
    }

    // crear id al review necesaria para guardar en la colección de productos 
    const ObjectId = require("mongodb").ObjectId;
    let reviewId = new ObjectId();

    //Será llamada antes de crearse la review
    session.startTransaction();
    await Review.create([
      {
        _id: reviewId,
        comment: comment,
        rating: Number(rating),
        user: { _id: req.user._id, name: req.user.name + " " + req.user.lastName },
      }
    ], { session: session })

    //Buscar producto por id 
    const product = await Product.findById(req.params.productId).populate("reviews").session(session);

    // un usuario solo puede crear una única review por producto
    const alreadyReviewed = product.reviews.find((r) => r.user._id.toString() === req.user._id.toString());
    if (alreadyReviewed) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).send("Este producto ya tuvo una review");
    }

    // res.send(product)
    let prc = [...product.reviews];
    prc.push({ rating: rating });
    product.reviews.push(reviewId);
    if (product.reviews.length === 1) {
      product.rating = Number(rating);
      product.reviewsNumber = 1;
    } else {
      product.reviewsNumber = product.reviews.length;

      //Sacamos la media del rating de productos 
      let ratingCalc = prc.map((item) => Number(item.rating)).reduce((sum, item) => sum + item, 0) / product.reviews.length;
            product.rating = Math.round(ratingCalc)
    }
    await product.save();

    await session.commitTransaction();
    session.endSession();
    res.send('review created')
} catch (err) {
    await session.abortTransaction();
    next(err)   
}
}

//Obtener datos para añadir un user por parte Admin (Email, name, lastName)
const getUser = async (req, res, next) => {
  try {
      const user = await User.findById(req.params.id).select("name lastName email isAdmin").orFail();
      return res.send(user);
  } catch (err) {
     next(err); 
  }
}

//Actualizar datos usuario
const updateUser = async (req, res, next) => {
  try {
     const user = await User.findById(req.params.id).orFail(); 

      user.name = req.body.name || user.name;
      user.lastName = req.body.lastName || user.lastName;
      user.email = req.body.email || user.email;
      user.isAdmin = req.body.isAdmin || user.isAdmin;

      await user.save();

      res.send("Datos del usuario actualizado");

  } catch (err) {
     next(err); 
  }
}

//Eliminar usuario por Admin
const deleteUser = async (req, res, next) => {
  try {
     const user = await User.findById(req.params.id).orFail();
     await user.deleteOne(); 
     res.send("EL usuario ha sido eliminado");
  } catch (err) {
      next(err);
  }
}

module.exports = { getUsers, registerUser, loginUser, updateUserProfile, getUserProfile, writeReview, getUser, updateUser, deleteUser };
