const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const baseWebpackConfig = require("./webpack.base");

module.exports = baseWebpackConfig({
  mode: "production",
  entry: [path.join(process.cwd(), "./src/app.js")],
  output: {
    filename: "[name].bundle.js",
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      inject: true,
    }),
  ],
});
