const mongoose = require("mongoose");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { sendMail, sendResetPassword } = require("../mailer");

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

UsersSchema.methods.generateJWT = function () {
  return jwt.sign(
    {
      user: {
        id: this._id,
        email: this.email,
      },
    },
    process.env.jwt_secret,
    {
      expiresIn: "15m",
    }
  );
};

UsersSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      user: {
        id: this._id,
        email: this.email,
      },
    },
    process.env.jwt_secret,
    {
      expiresIn: "7d",
    }
  );
};

UsersSchema.methods.sendEmail = function (verificationToken) {
  sendMail({
    firstName: this.firstName,
    email: this.email,
    token: verificationToken,
  });
};

UsersSchema.methods.sendResetPassword = function (resetPasswordToken) {
  sendResetPassword({
    firstName: this.firstName,
    email: this.email,
    token: resetPasswordToken,
  });
};

module.exports = mongoose.model("Users", UsersSchema);
