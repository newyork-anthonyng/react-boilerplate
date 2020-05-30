const mongoose = require("mongoose");
const crypto = require("crypto");

const { Schema } = mongoose;

const VerificationTokensSchema = new Schema({
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
    expires: 43200, // 12 hours
  },
});

function generateRandomToken() {
  return crypto.randomBytes(16).toString("hex");
}

mongoose.model("VerificationTokens", VerificationTokensSchema);
