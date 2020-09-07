const { createHmac } = require("crypto");
const { URL } = require("url");

const sortGCSHeaders = (headers) =>
  headers
    .map(({ name, value }) => ({ name: name.toLowerCase(), value }))
    .filter((header) => header.name.startsWith("x-gcs"))
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
    .map(({ name, value }) => `${name}:${value}\n`)
    .join("");

module.exports.requestHooks = [
  ({ request, app }) => {
    const env = request.getEnvironment();
    const url = new URL(request.getUrl());
    const date = new Date().toUTCString();
    const contentType = request.getHeader("Content-Type") || "application/json";
    const method = request.getMethod();
    const path = url.pathname;
    const gcsHeaders = sortGCSHeaders(request.getHeaders());

    if (!env.ingenico || !url.hostname.includes("api-ingenico.com")) {
      return;
    }

    if (!env.ingenico.apiKeySecret || !env.ingenico.apiKeyId) {
      app.alert(
        "Ingenico authorization",
        "Please make sure to set the apiKeySecret and apiKeyId in the environment."
      );
    }

    const content = `${method}\n${contentType}\n${date}\n${gcsHeaders}${path}\n`;
    const signature = createHmac("sha256", env.ingenico.apiKeySecret)
      .update(content)
      .digest("base64");

    request.setHeader("Date", date);
    request.setHeader(
      "Authorization",
      `GCS v1HMAC:${env.ingenico.apiKeyId}:${signature}`
    );

    if (!request.hasHeader("Content-Type")) {
      request.setHeader("Content-Type", contentType);
    }
  },
];
