const path = require("path");
const fs = require("fs/promises");

const mimeTypes = {
  ".ico": "image/x-icon",
  ".html": "text/html",
  ".js": "text/javascript",
  ".json": "application/json",
  ".css": "text/css",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".wav": "audio/wav",
  ".mp3": "audio/mpeg",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".md": "text/plain",
  default: "application/octet-stream",
};

async function isDirectory(pathname) {
  const exists = await fileExists(pathname);
  if (!exists) return false;
  return exists.isDirectory;
}

async function fileExists(pathname) {
  try {
    return await fs.stat(pathname);
  } catch (err) {
    return false;
  }
}

async function manageRequest(request, response) {
  let targetPath = path.join("front", request.url);

  if (await isDirectory(targetPath)) {
    targetPath = path.join(targetPath, "index.html");
  }

  if (!(await fileExists(targetPath))) {
    response.statusCode = 404;
    response.setHeader("Content-Type", "text/html");
    response.end("<h1>Not Found</h1>");
    return;
  }

  let fileContent;
  try {
    fileContent = await fs.readFile(targetPath, { encoding: "utf-8" });
  } catch (err) {
    response.statusCode = 500;
    response.end(err.message);
    return;
  }

  const type = mimeTypes[path.parse(targetPath).ext];

  response.setHeader("Content-Type", type);
  response.write(fileContent);
  response.end();
}

module.exports = { manageRequest };
