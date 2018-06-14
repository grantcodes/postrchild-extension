const webExt = require("web-ext").default;
const webpack = require("webpack");
const config = require("../webpack.config");

config.mode = "production";
delete config.chromeExtensionBoilerplate;
delete config.devtool;

webpack(config, err => {
  if (err) {
    console.log(err);
    throw err;
  } else {
    webExt.cmd.build({
      sourceDir: __dirname + "/../build",
      artifactsDir: __dirname + "/../build"
    });
  }
});
