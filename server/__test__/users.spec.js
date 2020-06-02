require("../models/index");
// const express = require("express");
// const app = express();
// const routes = require("../routes/index");
// const bodyParser = require("body-parser");
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());
// app.use(routes);
const app = require("../index");
const supertest = require("supertest");
const request = supertest(app);
const mongoose = require("mongoose");

const Users = mongoose.model("Users");

beforeAll(async (done) => {
  // const url = `mongodb://127.0.0.1/test`;
  // await mongoose.connect(url, { useNewUrlParser: true });
  await Users.deleteMany();
  done();
});

beforeEach(async (done) => {
  try {
    console.log("deleting all users");
    await Users.deleteMany();
  } catch (e) {
    console.log("error inside beforeEach");
    console.error(e);
  } finally {
    done();
  }
});

afterAll(async (done) => {
  try {
    console.log("closing all db connections");
    await mongoose.connection.close();
  } catch (e) {
    console.log("error inside afterAll");
    console.error(e);
  } finally {
    done();
  }
});

describe("Users", () => {
  it("should create new user", async (done) => {
    try {
      const response = await request.post("/api/users").send({
        user: {
          firstName: "John",
          lastName: "Doe",
          email: "johndoe@gmail.com",
          password: "Thisisastrongpassword1$",
        },
      });
      console.log(response.body);
      const user = await Users.findOne({ email: "johndoe@gmail.com" });
      console.log("user", user);
      done();
    } catch (e) {
      console.error("Error inside test", e);
    } finally {
      done();
    }

    // expect(user.firstName).toEqual("John");
    // expect(user.lastName).toEqual("Doe");
    // expect(user.email).toEqual("johndoe@gmail.com");
    // expect(response.status).toBe(200);
    // expect(response.body.status).toBe("ok");

    // done();
  });
});
