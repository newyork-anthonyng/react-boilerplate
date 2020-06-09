import jwt from "jsonwebtoken";

// TODO: Refactor this. Should this be a class?

function getJWT() {
  const token = localStorage.getItem("token");
  const refreshToken = localStorage.getItem("refreshToken");

  return { token, refreshToken };
}

const auth = {
  isAuthenticated,
  token: null,
  refreshToken: null,
  saveJWT,
  inspectHeaders,
  logout,
};

function isAuthenticated() {
  if (auth.token) {
    const isExpired = isTokenExpired(auth.token);
    if (!isExpired) {
      return true;
    }
  }

  if (auth.refreshToken) {
    const isExpired = isTokenExpired(auth.refreshToken);
    if (!isExpired) {
      return true;
    }
  }

  return false;
}

function saveJWT({ token, refreshToken }) {
  if (token) {
    auth.token = token;
    localStorage.setItem("token", token);
  }
  if (refreshToken) {
    auth.refreshToken = refreshToken;
    localStorage.setItem("refreshToken", refreshToken);
  }
}

function inspectHeaders(header) {
  const token = header.get("x-token");
  const refreshToken = header.get("x-refresh-token");

  auth.saveJWT({ token, refreshToken });
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  auth.token = null;
  auth.refreshToken = null;
}

function initialize() {
  const { token, refreshToken } = getJWT();

  if (token) {
    auth.token = token;
  }
  if (refreshToken) {
    auth.refreshToken = refreshToken;
  }
}

function isTokenExpired(token) {
  const tokenPayload = jwt.decode(token);
  const expirationDate = new Date(tokenPayload.exp * 1000);
  const isExpired = expirationDate < Date.now();

  return isExpired;
}

initialize();

export default auth;
