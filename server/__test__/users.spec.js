const dbHandler = require("./db-handler");
require("../models/index");
const bodyParser = require("body-parser");
jest.mock("../mailer");
const mailer = require("../mailer");
const userService = require("../routes/api/users");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Users = mongoose.model("Users");
const VerificationTokens = mongoose.model("VerificationTokens");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(userService);

const supertest = require("supertest");
const request = supertest(app);

beforeAll(async () => await dbHandler.connect());

afterEach(async () => await dbHandler.clearDatabase());

afterAll(async () => await dbHandler.closeDatabase());

describe("/", () => {
  let newUser;

  beforeEach(() => {
    newUser = {
      firstName: "John",
      lastName: "Doe",
      email: "johndoe@gmail.com",
      password: "Thisisastrongpassword1",
    };
  });

  it("should create user", async (done) => {
    const response = await request.post("/").send({
      user: newUser,
    });
    expect(response.status).toEqual(200);
    expect(response.body).toMatchInlineSnapshot(`
      Object {
        "status": "ok",
      }
    `);

    const user = await Users.findOne({ email: newUser.email });
    expect(user.firstName).toEqual(newUser.firstName);
    expect(user.lastName).toEqual(newUser.lastName);
    expect(user.email).toEqual(newUser.email);
    expect(user.isVerified).toEqual(false);

    const verificationToken = await VerificationTokens.findOne({
      _userId: user._id,
    });
    expect(verificationToken).not.toEqual(null);
    expect(mailer).toHaveBeenCalledTimes(1);
    expect(mailer.mock.calls[0][0].email).toEqual(newUser.email);
    expect(mailer.mock.calls[0][0].firstName).toEqual(newUser.firstName);
    expect(mailer.mock.calls[0][0].token).toBeTruthy();

    done();
  });

  it("should not create user if first name is missing", async (done) => {
    delete newUser.firstName;
    const response = await request.post("/").send({
      user: newUser,
    });
    expect(response.status).toEqual(422);
    expect(response.body).toMatchInlineSnapshot(`
      Object {
        "errors": Object {
          "firstName": "is required",
        },
      }
    `);

    const user = await Users.findOne({ email: newUser.email });
    expect(user).toEqual(null);

    done();
  });

  it("should not create user if last name is missing", async (done) => {
    delete newUser.lastName;
    const response = await request.post("/").send({
      user: newUser,
    });
    expect(response.status).toEqual(422);
    expect(response.body).toMatchInlineSnapshot(`
      Object {
        "errors": Object {
          "lastName": "is required",
        },
      }
    `);

    const user = await Users.findOne({ email: newUser.email });
    expect(user).toEqual(null);

    done();
  });

  it("should not create user if email is missing", async (done) => {
    delete newUser.email;
    const response = await request.post("/").send({
      user: newUser,
    });
    expect(response.status).toEqual(422);
    expect(response.body).toMatchInlineSnapshot(`
      Object {
        "errors": Object {
          "email": "is required",
        },
      }
    `);

    const user = await Users.findOne({ email: newUser.email });
    expect(user).toEqual(null);

    done();
  });

  it("should not create user if password is missing", async (done) => {
    delete newUser.password;
    const response = await request.post("/").send({
      user: newUser,
    });
    expect(response.status).toEqual(422);
    expect(response.body).toMatchInlineSnapshot(`
      Object {
        "errors": Object {
          "password": "is required",
        },
      }
    `);

    const user = await Users.findOne({ email: newUser.email });
    expect(user).toEqual(null);

    done();
  });

  it("should not create user if password is weak", async (done) => {
    newUser.password = "password";
    const response = await request.post("/").send({
      user: newUser,
    });
    expect(response.status).toEqual(422);
    expect(response.body).toMatchInlineSnapshot(`
      Object {
        "errors": Object {
          "password": Array [
            "The password must be at least 10 characters long.",
            "The password must contain at least one uppercase letter.",
            "The password must contain at least one number.",
            "The password must contain at least one special character.",
          ],
        },
      }
    `);

    const user = await Users.findOne({ email: newUser.email });
    expect(user).toEqual(null);

    done();
  });

  it("should not create user if user with email already exists", async (done) => {
    const existingUser = new Users(newUser);
    await existingUser.save();

    newUser.firstName = "Javier";
    const response = await request.post("/").send({
      user: newUser,
    });
    expect(response.status).toEqual(422);
    expect(response.body).toMatchInlineSnapshot(`
      Object {
        "errors": Object {
          "email": "is taken",
        },
      }
    `);

    const user = await Users.findOne({ email: newUser.email });
    expect(user.firstName).not.toEqual("Javier");

    done();
  });
});

describe("/confirmation", () => {
  it("should verify user with valid token");
  it("should return error if user is already verified");
  it("should return error if no valid user is found");
});
