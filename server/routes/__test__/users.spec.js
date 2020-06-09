require("dotenv").config();
const dbHandler = require("./db-handler");
require("../../models/index");
const bodyParser = require("body-parser");
jest.mock("../../mailer");
const { sendMail, sendResetPassword } = require("../../mailer");
const userService = require("../api/users");
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

beforeEach(() => {
  sendMail.mockClear();
  sendResetPassword.mockClear();
});

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
    expect(sendMail).toHaveBeenCalledTimes(1);
    expect(sendMail.mock.calls[0][0].email).toEqual(newUser.email);
    expect(sendMail.mock.calls[0][0].firstName).toEqual(newUser.firstName);
    expect(sendMail.mock.calls[0][0].token).toBeTruthy();

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
  let user;
  let verificationToken;

  beforeEach(async () => {
    user = new Users({
      firstName: "John",
      lastName: "Doe",
      email: "johndoe@gmail.com",
      password: "Thisisastrongpassword1",
    });
    await user.save();

    verificationToken = new VerificationTokens({ _userId: user.id });
    await verificationToken.save();
  });

  it("should verify user with valid token", async () => {
    const response = await request.post("/confirmation").send({
      token: verificationToken.token,
    });
    expect(response.status).toEqual(200);
    expect(response.body).toMatchInlineSnapshot(`
      Object {
        "status": "ok",
      }
    `);

    const foundToken = await VerificationTokens.findOne({ _userId: user._id });
    expect(foundToken).toEqual(null);
  });

  it("should return error if user is already verified", async () => {
    user.isVerified = true;
    await user.save();

    const response = await request.post("/confirmation").send({
      token: verificationToken.token,
    });
    expect(response.status).toEqual(400);
    expect(response.body).toMatchInlineSnapshot(`
      Object {
        "error": "User already verified",
      }
    `);
  });

  it("should return error if no valid user is found", async () => {
    await Users.deleteOne({ email: user.email });

    const response = await request.post("/confirmation").send({
      token: verificationToken.token,
    });
    expect(response.status).toEqual(400);
    expect(response.body).toMatchInlineSnapshot(`
      Object {
        "error": "User not found",
      }
    `);
  });

  it("should return error if no token is found", async () => {
    const token = verificationToken.token;
    await VerificationTokens.deleteOne({ _userId: user._id });

    const response = await request.post("/confirmation").send({
      token,
    });
    expect(response.status).toEqual(400);
    expect(response.body).toMatchInlineSnapshot(`
      Object {
        "error": "Token not found",
      }
    `);
  });
});

describe("/resend-token", () => {
  let user;
  let verificationToken;

  beforeEach(async () => {
    user = new Users({
      firstName: "John",
      lastName: "Doe",
      email: "johndoe@gmail.com",
      password: "Thisisastrongpassword1",
    });
    await user.save();

    verificationToken = new VerificationTokens({ _userId: user.id });
    await verificationToken.save();
  });

  it("should create a new token", async (done) => {
    const response = await request.post("/resend-token").send({
      email: user.email,
    });
    expect(response.status).toEqual(200);
    expect(response.body).toMatchInlineSnapshot(`
      Object {
        "status": "ok",
      }
    `);

    const oldToken = await VerificationTokens.findById(verificationToken._id);
    expect(oldToken).toEqual(null);

    const newToken = await VerificationTokens.findOne({ _userId: user._id });
    expect(newToken).not.toEqual(null);

    expect(sendMail).toHaveBeenCalledTimes(1);
    expect(sendMail.mock.calls[0][0].email).toEqual(user.email);
    expect(sendMail.mock.calls[0][0].firstName).toEqual(user.firstName);
    expect(sendMail.mock.calls[0][0].token).toBeTruthy();

    done();
  });

  it("should send error if user is not found", async (done) => {
    const userEmail = user.email;
    await Users.deleteOne({ email: user.email });

    const response = await request.post("/resend-token").send({
      email: userEmail,
    });
    expect(response.status).toEqual(400);
    expect(response.body).toMatchInlineSnapshot(`
      Object {
        "message": "User not found",
      }
    `);

    expect(sendMail).not.toHaveBeenCalled();
    done();
  });

  it("should send error if user is already verified", async (done) => {
    user.isVerified = true;
    await user.save();

    const response = await request.post("/resend-token").send({
      email: user.email,
    });
    expect(response.status).toEqual(400);
    expect(response.body).toMatchInlineSnapshot(`
      Object {
        "message": "User already verified",
      }
    `);

    expect(sendMail).not.toHaveBeenCalled();
    done();
  });
});

describe("/forgot-password", () => {
  it("should send error if user is not verified", async (done) => {
    const user = new Users({
      firstName: "John",
      lastName: "Doe",
      email: "johndoe@gmail.com",
      password: "Thisisastrongpassword1",
    });
    await user.save();
    const response = await request.post("/forgot-password").send({
      user: {
        email: "johndoe@gmail.com",
      },
    });

    expect(response.status).toEqual(422);
    expect(response.body.error).toEqual("User is not verified");

    done();
  });

  it("should send email if user exists", async (done) => {
    const user = new Users({
      firstName: "John",
      lastName: "Doe",
      email: "johndoe@gmail.com",
      password: "Thisisastrongpassword1",
      isVerified: true,
    });
    await user.save();
    const response = await request.post("/forgot-password").send({
      user: {
        email: "johndoe@gmail.com",
      },
    });

    expect(response.status).toEqual(200);
    expect(response.body.status).toEqual("ok");
    expect(sendResetPassword).toHaveBeenCalledTimes(1);
    expect(sendResetPassword.mock.calls[0][0].email).toEqual(
      "johndoe@gmail.com"
    );
    expect(sendResetPassword.mock.calls[0][0].firstName).toEqual("John");
    expect(sendResetPassword.mock.calls[0][0].token).toBeTruthy();

    done();
  });

  it("should not send email if user doesn't exist", async (done) => {
    const response = await request.post("/forgot-password").send({
      user: {
        email: "unknown@gmail.com",
      },
    });

    expect(response.status).toEqual(200);
    expect(response.body.status).toEqual("ok");
    expect(sendResetPassword).not.toHaveBeenCalled();

    done();
  });
});

describe("/login", () => {
  let user;
  let verificationToken;
  let password;

  beforeEach(async () => {
    password = "Thisisastrongpassword1";
    user = new Users({
      firstName: "John",
      lastName: "Doe",
      email: "johndoe@gmail.com",
      isVerified: true,
    });
    user.setPassword(password);
    await user.save();

    verificationToken = new VerificationTokens({ _userId: user.id });
    await verificationToken.save();
  });

  it("should create tokens", async (done) => {
    const response = await request.post("/login").send({
      user: {
        email: user.email,
        password,
      },
    });

    expect(response.status).toEqual(200);
    expect(response.body.user.email).toEqual(user.email);
    expect(response.body.user.refreshToken).not.toEqual(undefined);
    expect(response.body.user.token).not.toEqual(undefined);

    done();
  });

  it("should return error if email is missing", async (done) => {
    const response = await request.post("/login").send({
      user: {
        password,
      },
    });

    expect(response.status).toEqual(422);
    expect(response.body).toMatchInlineSnapshot(`
      Object {
        "errors": Object {
          "email": "is required",
        },
      }
    `);

    done();
  });

  it("should return error if password is missing", async (done) => {
    const response = await request.post("/login").send({
      user: {
        email: user.email,
      },
    });

    expect(response.status).toEqual(422);
    expect(response.body).toMatchInlineSnapshot(`
      Object {
        "errors": Object {
          "password": "is required",
        },
      }
    `);

    done();
  });

  it("should return error if email/password is not valid", async (done) => {
    const response = await request.post("/login").send({
      user: {
        email: user.email,
        password: "invalid-password",
      },
    });

    expect(response.status).toEqual(422);
    expect(response.body).toMatchInlineSnapshot(`
      Object {
        "errors": Object {
          "email": "Email/password combination is invalid",
        },
      }
    `);

    done();
  });

  it("should return error if user is not verified", async (done) => {
    user.isVerified = false;
    await user.save();
    const response = await request.post("/login").send({
      user: {
        email: user.email,
        password,
      },
    });

    expect(response.status).toEqual(401);
    expect(response.body).toMatchInlineSnapshot(`
      Object {
        "errors": Object {
          "verified": "user not verified",
        },
      }
    `);

    done();
  });
});

describe("/me", () => {
  let user;
  let password;

  beforeEach(async () => {
    password = "Thisisastrongpassword1";
    user = new Users({
      firstName: "John",
      lastName: "Doe",
      email: "johndoe@gmail.com",
      isVerified: true,
    });
    user.setPassword(password);
    await user.save();
  });

  it("should return user data", async (done) => {
    let response = await request.post("/login").send({
      user: {
        email: user.email,
        password,
      },
    });
    const jwtToken = response.body.user.token;

    response = await request.get("/me").set("x-token", jwtToken);

    expect(response.status).toEqual(200);
    expect(response.body.user).not.toEqual(null);
    expect(response.body.user.email).not.toEqual(null);
    expect(response.body.user.firstName).not.toEqual(null);
    expect(response.body.user.lastName).not.toEqual(null);
    done();
  });

  it("should return error if token is invalid", async (done) => {
    const response = await request
      .get("/me")
      .set("x-token", "someinvalid.json.token");

    expect(response.status).toEqual(400);
    expect(response.body).toMatchInlineSnapshot(`
      Object {
        "errors": "Token expired",
      }
    `);
    done();
  });

  it("should return error if user is not found", async (done) => {
    let response = await request.post("/login").send({
      user: {
        email: user.email,
        password,
      },
    });
    const jwtToken = response.body.user.token;
    await Users.findByIdAndDelete(user._id);

    response = await request.get("/me").set("x-token", jwtToken);

    expect(response.status).toEqual(400);
    expect(response.body).toMatchInlineSnapshot(`
      Object {
        "errors": "User not found",
      }
    `);

    done();
  });
});
