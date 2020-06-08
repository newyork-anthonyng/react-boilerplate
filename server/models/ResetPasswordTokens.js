const mongoose = require("mongoose");
const crypto = require("crypto");

const { Schema } = mongoose;

const ResetPasswordTokensSchema = new Schema({
  _userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  token: {
    type: String,
    default: generateRandomToken,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
    expires: 3600, // 1 hour
  },
});

function generateRandomToken() {
  return crypto.randomBytes(16).toString("hex");
}

mongoose.model("ResetPasswordTokens", ResetPasswordTokensSchema);
