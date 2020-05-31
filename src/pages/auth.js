import jwt from "jsonwebtoken";

function getJWT() {
  const token = localStorage.getItem("token");
  const refreshToken = localStorage.getItem("refreshToken");

  return { token, refreshToken };
}

const auth = {
  isAuthenticated: false,
  token: null,
  refreshToken: null,
  saveJWT,
  inspectHeaders,
};

function saveJWT({ token, refreshToken }) {
  if (token) {
    localStorage.setItem("token", token);
  }
  if (refreshToken) {
    localStorage.setItem("refreshToken", refreshToken);
  }

  auth.isAuthenticated = !!(token || refreshToken);
  auth.token = token;
  auth.refreshToken = refreshToken;
}

function inspectHeaders(header) {
  const token = header.get("x-token");
  const refreshToken = header.get("x-refresh-token");

  auth.saveJWT({ token, refreshToken });
}

function initialize() {
  const { token, refreshToken } = getJWT();

  if (token) {
    auth.token = token;
  }
  if (refreshToken) {
    auth.refreshToken = refreshToken;
  }

  if (auth.token) {
    const isExpired = isTokenExpired(auth.token);
    if (!isExpired) {
      auth.isAuthenticated = true;
      return;
    }
  }

  if (auth.refreshToken) {
    const isExpired = isTokenExpired(auth.refreshToken);
    if (!isExpired) {
      auth.isAuthenticated = true;
      return;
    }
  }
}

function isTokenExpired(token) {
  const tokenPayload = jwt.decode(token);
  const expirationDate = new Date(tokenPayload.exp * 1000);
  const isExpired = expirationDate < Date.now();

  return isExpired;
}

initialize();
console.log("is authenticated", auth.isAuthenticated);

export default auth;
