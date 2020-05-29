const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const setupMiddleware = require("./middlewares/index");

const app = express();
app.use(require("morgan")("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoose.connect("mongodb://localhost/passport-tutorial", {
  useNewUrlParser: true,
});
mongoose.set("debug", true);
mongoose.set("useUnifiedTopology", true);

require("./models/Users");
require("./config/passport");
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

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log(`Server listening on ${listener.address().port}`);
});
