const http = require("http");
const api = require("./api");
const files = require("./files");

http
  .createServer((request, response) => {
    const url = request.url;

    if (url.startsWith("/api")) {
      api.manageRequest(request, response);
    } else {
      files.manageRequest(request, response);
    }
  })
  .listen(8080, () => console.log("Server is started"));
