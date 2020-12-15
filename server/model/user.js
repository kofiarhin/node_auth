const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// get user by credentials
userSchema.statics.getUser = async function (email, password) {
  const user = await User.findOne({ email });
  if (!user) throw new Error("unable to login");

  // compare password

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) throw new Error("unable to login");
  return user;
};

// generate auth token
userSchema.methods.genAuthToken = async function () {
  const user = this;
  const token = await jwt.sign({ _id: user._id }, "password123");
  user.tokens = user.tokens.concat({ token });

  await user.save();
  return token;
};

// hash password
userSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(user.password, salt);

    user.password = hash;
  }

  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
