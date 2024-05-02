const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cors = require('cors');

const { UserModel } = require("../model/user.model");
const { blacklistModel } = require("../model/blacklist.model");
const { auth } = require("../middleware/auth");

const userRouter = express.Router();
userRouter.use(cors());
userRouter.post("/signup", async (req, res) => {
  try {
    const { email, password} = req.body;
    const Exuser = await UserModel.findOne({ email });
    if (Exuser) {
      res.status(200).send({ msg: "User is already register please login" });
    } else {
      const confirmPassword = req.body.confirmPassword;
      if (password !== confirmPassword) {
        res.status(501).send({ msg: "password and confirm password not match" });
      }
     else{ bcrypt.hash(password, 8, async (err, hash) => {
        try {
          if (hash) {
            const user = new UserModel({
              email,
              password: hash,
            });
            await user.save();
            res.status(201).send({ msg: "User created", user });
          } else {
            console.log(err);
            res
              .status(501)
              .send({ Error: "error occured while hashing while password" });
          }
        } catch (err) {
          console.log(err);
          res.status(501).send({ Error: "error occured while bcrypt" });
        }
      });
    }
    }
  } catch (err) {
    console.log(err);
    res.status(400).send({ Error: "error occured while registring user" });
  }
});

userRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });
    if (user) {
      bcrypt.compare(password, user.password, (err, result) => {
        if (result) {
          const token = jwt.sign({ userId: user._id }, "abhay", {
            expiresIn: "3d",
          });
          const refreshToken = jwt.sign({ userId: user._id }, "abhay", {
            expiresIn: "24h",
          });
          res
            .status(201)
            .send({ msg: "Login successful", token, refreshToken });
        } else {
          res.status(501).send({ msg: "Wrong password" });
        }
      });
    } else {
      res.status(200).send({ msg: "user is not register please login " });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({ Error: "error occured while login user" });
  }
});

userRouter.get("/logout", auth, async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const blacklistToken = new blacklistModel({
      token: token,
    });
    await blacklistToken.save();
    res.status(200).send({ msg: "User logged out successfully" });
  } catch (err) {
    console.log(err);
    res
      .status(500) 
      .send({ error: "An error occurred while logging out the user" });
  }
});

userRouter.get("/details", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await UserModel.findById(userId);
    if (user) {
      res.status(200).send({ msg: "User details", user });
    } else {
      res.status(404).send({ msg: "User not found" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: "Error while fetching user details" });
  }
});



module.exports = {
  userRouter,
};
