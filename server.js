const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const mongoose = require("mongoose");

const webpack = require("webpack");
const webpackDevMiddleware = require("webpack-dev-middleware");
const webpackHotMiddleware = require("webpack-hot-middleware");
const config = require("./webpack.config.js");

const isProduction = process.env.NODE_ENV === "production";

const app = express();
app.use(require("morgan")("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  session({
    secret: "my-tutorial",
    cookie: { maxAge: 60000 },
    resave: false,
    saveUninitialized: false,
  })
);

mongoose.connect("mongodb://localhost/passport-tutorial", {
  useNewUrlParser: true,
});
mongoose.set("debug", true);
mongoose.set("useUnifiedTopology", true);

require("./models/Users");
require("./config/passport");
app.use(require("./routes"));

if (!isProduction) {
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, _) => {
    res.status(err.status || 500);

    res.json({
      errors: {
        message: err.message,
        error: err,
      },
    });
  });
}

if (!isProduction) {
  config.entry.app.unshift(
    "webpack-hot-middleware/client?reload=true&timeout=1000"
  );
  config.plugins.push(new webpack.HotModuleReplacementPlugin());
  const compiler = webpack(config);
  app.use(
    webpackDevMiddleware(compiler, {
      publicPath: config.output.publicPath,
    })
  );
  app.use(webpackHotMiddleware(compiler));
}

app.use(express.static(path.resolve(__dirname, "dist")));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _) => {
  res.status(err.status || 500);

  res.json({
    errors: {
      message: err.message,
      error: {},
    },
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log(`Server listening on ${listener.address().port}`);
});
