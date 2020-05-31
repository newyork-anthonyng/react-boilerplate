const mongoose = require("mongoose");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const sendEmail = require("../mailer");

const { Schema } = mongoose;

const UsersSchema = new Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  isVerified: { type: Boolean, default: false },
  hash: String,
  salt: String,
});

UsersSchema.methods.setPassword = function (password) {
  this.salt = generateSalt();
  this.hash = generatePasswordHash(password, this.salt);
};

function generateSalt() {
  return crypto.randomBytes(16).toString("hex");
}

function generatePasswordHash(password, salt) {
  return crypto
    .pbkdf2Sync(password, salt, 10000, 512, "sha512")
    .toString("hex");
}

UsersSchema.methods.validatePassword = function (password) {
  const hash = generatePasswordHash(password, this.salt);
  return this.hash === hash;
};

function getExpirationDate() {
  const today = new Date();
  const thirtyMinutesInMs = 30 * 60000;
  const expirationDate = new Date(today.getTime() + thirtyMinutesInMs);

  return expirationDate;
}

UsersSchema.methods.generateJWT = function () {
  const expirationDate = getExpirationDate();

  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      exp: parseInt(expirationDate.getTime() / 1000, 10),
    },
    process.env.jwt_secret
  );
};

UsersSchema.methods.toAuthJSON = function () {
  return {
    id: this._id,
    email: this.email,
    token: this.generateJWT(),
  };
};

UsersSchema.methods.sendEmail = function (token) {
  sendEmail({
    firstName: this.firstName,
    email: this.email,
    token,
  });
};

mongoose.model("Users", UsersSchema);
