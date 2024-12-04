const path = require("path");

module.exports = (on, config) => {
  on("file:preprocessor", require("@cypress/webpack-preprocessor")({
    webpackOptions: {
      resolve: {
        alias: {
          '@': path.resolve(__dirname, "../../src"), // Adjust based on your project structure
        },
      },
    },
  }));
  return config;
};
