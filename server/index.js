require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const setupMiddleware = require("./middlewares/index");

const app = express();
app.use(require("morgan")("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
});
mongoose.set("debug", true);
mongoose.set("useUnifiedTopology", true);

require("./models/index");
app.use("/api", require("./routes"));

setupMiddleware(app);

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

module.exports = app;
