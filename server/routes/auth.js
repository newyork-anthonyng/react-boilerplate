const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Users = mongoose.model("Users");

async function addUserMiddleware(req, res, next) {
  const token = getTokenFromHeaders(req);

  if (token) {
    try {
      const { user } = jwt.verify(token, process.env.jwt_secret);
      req.user = user;
    } catch (err) {
      const refreshToken = getRefreshTokenFromHeaders(req);
      const refreshedInfo = await refreshTokens(refreshToken);

      if (refreshedInfo.token) {
        res.set("x-token", refreshedInfo.token);
      }
      req.user = refreshedInfo.user;
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

async function refreshTokens(refreshToken) {
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

  if (user === null) {
    return {};
  }

  return {
    token: user.generateJWT(),
    user: {
      id: user._id,
      email: user.email,
    },
  };
}

module.exports = addUserMiddleware;
