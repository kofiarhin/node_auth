const User = require("../model/user");
const jwt = require("jsonwebtoken");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const payload = await jwt.verify(token, "password123");

    const user = await User.findOne({
      _id: payload._id,
      "tokens.token": token,
    });

    req.user = user;
    req.token = token;
    next();
  } catch (e) {
    throw new Error("please authenticate");
  }
};

module.exports = auth;
