const app = require("../server/app");
const mongoose = require("mongoose");
const request = require("supertest");
const User = require("../server/model/user");
const jwt = require("jsonwebtoken");

const userOneId = mongoose.Types.ObjectId();
const userOneToken = jwt.sign({ _id: userOneId }, "password123");
const userOne = {
  _id: userOneId,
  name: "kofi arhin",
  email: "kofiarhin@gmail.com",
  password: "password123",
  tokens: [
    {
      token: userOneToken,
    },
  ],
};

const userTwo = {
  name: "lebron james",
  email: "lebron@gmail.com",
  password: "password123",
};
// setup teardown
beforeEach(async () => {
  await User.deleteMany();
  await new User(userOne).save();
});

afterAll(async () => {
  await mongoose.connection.close();
});

test("pass", () => {});

// create user
test("create user", async () => {
  const response = await request(app).post("/users").send(userTwo).expect(201);
});

test("get user profile", async () => {
  const response = await request(app)
    .get("/users/me")
    .send()
    .set("Authorization", `Bearer ${userOneToken}`)
    .expect(200);

  expect(response.body).toHaveProperty("user");
  expect(response.body.user.name).toEqual(userOne.name);
});

test("login user ", async () => {
  const response = await request(app)
    .post("/users/login")
    .send({
      email: userOne.email,
      password: userOne.password,
    })
    .expect(200);

  expect(response.body).toHaveProperty("token");
  expect(response.body).toHaveProperty("user");
});

test("cannot login with invalid credentials", async () => {
  const response = await request(app)
    .post("/users/login")
    .send({
      email: "x",
      password: "x",
    })
    .expect(400);
});

test("update user details", async () => {
  const response = await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOneToken}`)
    .send({
      name: "joshua obu",
      password: "newpassword",
    })
    .expect(200);
});

// logout user
test("logout user", async () => {
  const response = await request(app)
    .post("/users/logout")
    .set("Authorization", `Bearer ${userOneToken}`)
    .expect(200);
});

test("logout all", async () => {
  const response = await request(app)
    .post("/users/logoutAll")
    .set("Authorization", `Bearer ${userOneToken}`)
    .send()
    .expect(200);

  expect(response.body.tokens).toBe(undefined);
});

test("delete user", async () => {
  const response = await request(app)
    .delete("/users/me")
    .set("Authorization", `Bearer ${userOneToken}`)
    .send()
    .expect(200);

  const user = await User.findOne({ email: userOne.email });
  expect(user).toBe(null);
});
