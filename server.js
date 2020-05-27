const path = require("path");
const express = require("express");
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const errorHandler = require('errorhandler');

const isProduction = process.env.NODE_ENV === 'production';

const app = express();
app.use(require('morgan')('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
  secret: 'my-tutorial',
  cookie: { maxAge: 60000 },
  resave: false,
  saveUninitialized: false
}));

if (!isProduction) {
  app.use(errorHandler);
}

mongoose.connect('mongodb://localhost/passport-tutorial');
mongoose.set('debug', true);

if (!isProduction) {
  app.use((err, req, res) => {
    res.status(err.status || 500);

    res.json({
      errors: {
        message: err.message,
        error: err
      }
    });
  })
}

app.use(`/`, express.static(path.resolve(__dirname, "dist")));

app.use((err, req, res) => {
  res.status(err.status || 500);

  res.json({
    errors: {
      message: err.message,
      error: {}
    }
  })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log(`Server listening on ${listener.address().port}`);
});
