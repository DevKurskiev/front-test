const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://77.223.107.162:3000",
      changeOrigin: true,
      pathRewrite: { "^/api": "" },
    })
  );
};
