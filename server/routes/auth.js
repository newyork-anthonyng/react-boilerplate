const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Users = mongoose.model("Users");

function addUserMiddleware(req, res, next) {
  const token = getTokenFromHeaders(req);

  if (token) {
    try {
      const { user } = jwt.verify(token, process.env.jwt_secret);
      req.user = user;
    } catch (err) {
      const refreshToken = getRefreshTokenFromHeaders(req);
      const newTokens = refreshTokens(token, refreshToken);

      if (newTokens.token && newTokens.refreshToken) {
        res.set("x-token", newTokens.token);
        res.set("x-refresh-token", newTokens.refreshToken);
      }
      req.user = newTokens.user;
    }
  }

  next();
}

const getTokenFromHeaders = (req) => {
  return req.headers["x-token"];
};

const getRefreshTokenFromHeaders = (req) => {
  return req.headers["x-refresh-token"];
};

async function refreshTokens(token, refreshToken) {
  let userId = -1;
  try {
    const {
      user: { id },
    } = jwt.verify(refreshToken, process.env.jwt_secret);
    userId = id;
  } catch (err) {
    return {};
  }

  const user = await Users.findById(userId);
  return {
    token: user.generateJWT(),
    refreshToken: user.generateRefreshToken(),
    user,
  };
}

module.exports = addUserMiddleware;
