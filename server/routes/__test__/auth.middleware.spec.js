require("dotenv").config();
const dbHandler = require("./db-handler");
require("../../models/index");
const mongoose = require("mongoose");
const Users = mongoose.model("Users");
const addUserMiddleware = require("../auth");

beforeAll(async () => await dbHandler.connect());

afterEach(async () => await dbHandler.clearDatabase());

afterAll(async () => await dbHandler.closeDatabase());

let user;
let mockRequest;
let mockResponse;
let mockNext;

beforeEach(async () => {
  user = new Users({
    firstName: "John",
    lastName: "Doe",
    email: "johndoe@gmail.com",
    isVerified: true,
  });
  await user.save();

  mockRequest = {
    headers: {},
  };
  mockResponse = {
    set: function (key, value) {
      this[key] = value;
    },
  };
  mockNext = jest.fn();
});

it("should set user if token is valid", async () => {
  mockRequest.headers = { "x-token": user.generateJWT() };
  await addUserMiddleware(mockRequest, mockResponse, mockNext);

  expect(mockRequest.user).toBeDefined();
  expect(mockNext).toHaveBeenCalledTimes(1);
});

it("should set user if refresh token is valid", async () => {
  mockRequest.headers = {
    "x-token": "shortLivedT",
    "x-refresh-token": user.generateRefreshToken(),
  };

  await addUserMiddleware(mockRequest, mockResponse, mockNext);

  expect(mockRequest.user).toBeDefined();
  expect(mockNext).toHaveBeenCalledTimes(1);
});

it("should send new token if refresh token is used", async () => {
  mockRequest.headers = {
    "x-token": "shortLived",
    "x-refresh-token": user.generateRefreshToken(),
  };
  await addUserMiddleware(mockRequest, mockResponse, mockNext);

  expect(mockResponse["x-token"]).toBeDefined();
});

it("should do nothing if tokens are not valid", async () => {
  mockRequest.headers = {
    "x-token": "invalid-token",
  };
  await addUserMiddleware(mockRequest, mockResponse, mockNext);

  expect(mockNext).toHaveBeenCalledTimes(1);
  expect(mockRequest.user).toBeUndefined();
  expect(mockResponse["x-token"]).toBeUndefined();
});

it("should do nothing if tokens are missing", async () => {
  mockRequest.headers = {};

  await addUserMiddleware(mockRequest, mockResponse, mockNext);

  expect(mockNext).toHaveBeenCalledTimes(1);
  expect(mockRequest.user).toBeUndefined();
});
