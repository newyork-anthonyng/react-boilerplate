const path = require("path");
const express = require("express");
const app = express();

app.use(`/`, express.static(path.resolve(__dirname, "dist")));

const listener = app.listen(process.env.HOST || 3000, () => {
  console.log(`Server listening on ${listener.address().port}`);
});
