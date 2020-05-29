const setupMiddleware = (app) => {
  const isProd = process.env.NODE_ENV === "production";

  if (isProd) {
    const addProdMiddleware = require("./prodMiddleware");
    addProdMiddleware(app);
  } else {
    const addDevMiddleware = require("./devMiddleware");
    addDevMiddleware(app);
  }
};

module.exports = setupMiddleware;
