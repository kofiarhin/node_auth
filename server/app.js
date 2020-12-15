const express = require("express");
const app = express();
const mongoose = require("mongoose");
const auth = require("./middleware/auth");
const User = require("./model/user");

// connect to database
mongoose
  .connect(process.env.mongo_url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => console.log("connected to database!"))
  .catch((e) => {
    console.log("cannot connect to database", e.message);
  });

// setup middlewares
app.use(express.json());

// create user
app.post("/users", async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    const token = await user.genAuthToken();

    res.status(201).send();
  } catch (e) {
    res.status(500).send();
  }
});

app.get("/users/me", auth, async (req, res) => {
  res.send({ user: req.user, token: req.token });
});

// login user
app.post("/users/login", async (req, res) => {
  try {
    const user = await User.getUser(req.body.email, req.body.password);
    // generate token
    const token = await user.genAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send();
  }
});

// logout user
app.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });

    await req.user.save();
    res.send(req.user);
  } catch (e) {
    res.status(500);
  }
});

// logout all users
app.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = undefined;
    await req.user.save();
    res.send(req.user);
  } catch (e) {
    res.status(500).send();
  }
});

// update user
app.patch("/users/me", auth, async (req, res) => {
  // update user details
  const allowedfields = ["name", "email", "password"];
  const fields = Object.keys(req.body);

  const isAllowed = fields.every((field) => allowedfields.includes(field));

  fields.forEach((field) => {
    req.user[field] = req.body[field];
  });

  await req.user.save();

  res.send({ user: req.user });
});

app.delete("/users/me", auth, async (req, res) => {
  try {
    await req.user.remove();
    res.send();
  } catch (e) {
    res.status(500);
  }
});
module.exports = app;
