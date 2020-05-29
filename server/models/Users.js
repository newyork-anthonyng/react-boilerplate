const mongoose = require("mongoose");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const { Schema } = mongoose;

const UsersSchema = new Schema({
  firstName: String,
  lastName: String,
  email: String,
  hash: String,
  salt: String,
});

UsersSchema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(16).toString("hex");
  this.hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 512, "sha512")
    .toString("hex");
};

UsersSchema.methods.validatePassword = function (password) {
  const hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 512, "sha512")
    .toString("hex");
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
    "secret"
  );
};

UsersSchema.methods.toAuthJSON = function () {
  return {
    id: this._id,
    email: this.email,
    token: this.generateJWT(),
  };
};

mongoose.model("Users", UsersSchema);
