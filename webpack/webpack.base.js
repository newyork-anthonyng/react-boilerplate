const webpack = require("webpack");
const path = require("path");

module.exports = (options) => ({
  mode: options.mode,
  entry: options.entry,
  output: Object.assign(
    {
      path: path.resolve(process.cwd(), "build"),
      publicPath: "/",
    },
    options.output
  ),
  devtool: options.devtool,
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
          },
        },
      },
      {
        test: /\.css$/i,
        use: [
          "style-loader",
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              ident: "postcss",
              plugins: [require("tailwindcss"), require("autoprefixer")],
            },
          },
        ],
      },
    ],
  },
  plugins: options.plugins.concat([
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      },
    }),
  ]),
});
