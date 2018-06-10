var webpack = require("webpack"),
  config = require("../webpack.config");

config.mode = "production";
delete config.chromeExtensionBoilerplate;
delete config.devtool;

webpack(config, function(err) {
  if (err) {
    console.log(err);
    throw err;
  }
});
