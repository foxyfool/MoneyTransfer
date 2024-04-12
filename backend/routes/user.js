const express = require("express");
const useRouter = express.Router();
const { z } = require("zod");
const { User } = require("../db");
const jwt = require("jsonwebtoken");

const { authMiddleware } = require("../middleware");
const { Account } = require("../db");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");

const UserSchema = z.object({
  username: z.string().email(),
  password: z
    .string()
    .min(6, { message: "minimum of 6 characters in length" })
    .max(22, { message: "maximum of 22 characters in length" }),
  firstName: z.string(),
  lastName: z.string(),
});

//to signUp
useRouter.post("/signup", async (req, res) => {
  const { username, password, firstName, lastName } = req.body;

  //safeparse return an object {success:true, data}
  const userValidation = UserSchema.safeParse({
    username,
    password,
    firstName,
    lastName,
  });

  if (!userValidation.success) {
    res.status(411).json({
      message: `Incorrect inputs have been entered`,
    });
    //handle error
  } else {
    const findUser = await User.findOne({ username });

    //only create a new user if we cant find a existingin one in database
    if (!findUser) {
      const newUser = new User({
        username,
        password,
        firstName,
        lastName,
      });

      //methods can only be accessed on the instances of the Model
      const hashPassword = await newUser.createHash(newUser.password);
      newUser.password = hashPassword;
      await newUser.save();
      const userId = newUser._id;

      //creating an account to the user, we can also use Account.create() method
      await Account.create({
        userId,
        balance: 1 + Math.random() * 10000,
      });

      const token = jwt.sign({ userId }, process.env.JWT_SECRET);
      res.status(200).json({
        message: `${userId} is the userId of the newly added user`,
        token,
      });
    } else {
      res.status(411).json({
        message: `User:${findUser?.username} already exists`,
      });
    }
  }
});

const LoginSchema = z.object({
  username: z.string().email(),
  password: z.string(),
});

//to sign in
useRouter.post("/signin", async (req, res) => {
  const { username, password } = req.body;

  //check if the username and password matches the record in the database
  const loginInputValidation = LoginSchema.safeParse({ username, password });

  if (!loginInputValidation.success) {
    res.status(411).json({
      message: "wrong type of inputs",
    });
  }

  //check the record from database
  const dbrecord = await User.findOne({ username });

  if (dbrecord) {
    const isPasswordMatching = await bcrypt.compare(
      password,
      dbrecord.password
    );

    if (isPasswordMatching) {
      const userId = dbrecord._id;
      const token = jwt.sign({ userId }, process.env.JWT_SECRET);
      res.status(200).json({
        token,
        message: `${userId} user with userId login is successful`,
      });
    }
  } else {
    res.status(411).json({
      messsage: `No such record has been found`,
    });
  }
});

useRouter.get("/bulk", async (req, res) => {
   let filter = req.query.filter || "";

   // Case-insensitive regular expression for filter
   filter = new RegExp(filter, "i");

  const users = await User.find({
    $or: [
      {
        firstName: {
          $regex: filter,
        },
      },
      {
        lastName: {
          $regex: filter,
        },
      },
    ],
  });

  res.json({
    user: users.map((user) => ({
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      _id: user._id,
    })),
  });
});
module.exports = useRouter;
