// const mongoose = require("mongoose");
const dbHandler = require("./db-handler");
require("../models/index");
const bodyParser = require("body-parser");
// const userModel = require("../models/Users");
const userService = require("../routes/api/users");
const express = require("express");
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(userService);

const supertest = require("supertest");
const request = supertest(app);

beforeAll(async () => await dbHandler.connect());

afterEach(async () => await dbHandler.clearDatabase());

afterAll(async () => await dbHandler.closeDatabase());

describe("user", () => {
  it("should work", async (done) => {
    const response = await request.post("/").send({
      user: {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@gmail.com",
        password: "Thisisastrongpassword1",
      },
    });
    console.log(response.status);
    console.log(response.body);
    done();
  });
});
