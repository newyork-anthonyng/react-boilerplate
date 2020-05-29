const express = require("express");
const path = require("path");

const middleware = (app) => {
  const publicPath = "/";
  const outputPath = path.resolve(process.cwd(), "build");

  app.use(publicPath, express.static(outputPath));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(outputPath, "index.html"));
  });
};

module.exports = middleware;
