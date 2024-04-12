const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();


mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("DB ka Connection is Successful"))
  .catch((error) => {
    console.log("Issue in DB Connection");
    console.error(error.message);
    process.exit(1);
  });



// Define schema
const UserSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxLength: 32,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxLength: 32,
  },
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    lowercase: true,
    minLength: 4,
    maxLength: 32,
  },

  password: {
    type: String,
    required: true,
    minLength: 6,
  },
});

// Method to generate a hash from plain text
UserSchema.methods.createHash = async function (plainTextPassword) {
	// Hashing user's salt and password with 10 iterations,
	const saltRounds = 10;

	// First method to generate a salt and then create hash
	const salt = await bcrypt.genSalt(saltRounds);

	//generates the hashPassword
	return await bcrypt.hash(plainTextPassword, salt);
};

//For validation, get the password from DB (this.password --> hashPassword) and compare it to the input Password provided by the client
//note: we dont implement this method
UserSchema.methods.validatePassword = async function (candidatePassword) {
	//returns a boolean indicating if passwords matches or not
	return await bcrypt.compare(candidatePassword, this.password);
};

const accountSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  balance: {
    type: Number,
    required: true,
  },
});

const User = mongoose.model("User", UserSchema);
const Account = mongoose.model("Account", accountSchema);

module.exports = { User, Account };
