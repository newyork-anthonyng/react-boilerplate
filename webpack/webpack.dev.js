const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const baseWebpackConfig = require("./webpack.base");

module.exports = baseWebpackConfig({
  mode: "development",
  entry: [
    "webpack-hot-middleware/client?reload=true",
    path.join(process.cwd(), "./src/app.js"),
  ],
  output: {
    filename: "[name].bundle.js",
  },
  devtool: "inline-source-map",
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      inject: true,
    }),
  ],
});
