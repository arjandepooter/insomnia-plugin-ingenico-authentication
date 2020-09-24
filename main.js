const { createHmac, createHash } = require("crypto");
const { URL } = require("url");

const sortGCSHeaders = (headers) =>
  headers
    .map(({ name, value }) => ({ name: name.toLowerCase(), value }))
    .filter((header) => header.name.startsWith("x-gcs"))
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
    .map(({ name, value }) => `${name}:${value}\n`)
    .join("");

const getQueryString = (parameters) =>
  parameters.length > 0
    ? "?" + parameters.map(({ name, value }) => `${name}=${value}`).join("&")
    : "";

const sortOgoneParams = (params) =>
  params
    .filter(({ name }) => name !== "SHASIGN")
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));

const signOgoneParams = (params, hashAlgorithm, passphrase) =>
  createHash(hashAlgorithm)
    .update(
      params.map(({ name, value }) => `${name}=${value}${passphrase}`).join("")
    )
    .digest("hex");

module.exports.requestHooks = [
  ({ request, app }) => {
    const env = request.getEnvironment();
    const url = new URL(request.getUrl());
    const date = new Date().toUTCString();
    const contentType = request.getHeader("Content-Type") || "application/json";
    const method = request.getMethod();
    const path = `${url.pathname}${getQueryString(request.getParameters())}`;
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
  ({ request, app }) => {
    const env = request.getEnvironment();
    const url = new URL(request.getUrl());

    if (
      !env.ingenico ||
      (!url.hostname.includes("ogone.test.v-psp.com") &&
        !url.hostname.includes("secure.ogone.com"))
    ) {
      return;
    }

    const { params, mimeType } = request.getBody();
    const { shaPass, hashAlgorithm } = env.ingenico;

    if (mimeType !== "application/x-www-form-urlencoded") {
      return app.alert(
        "Ingenico authorization",
        "Please make sure to set the body mimetype to `Form URL encoded`."
      );
    }
    if (!["sha1", "sha256", "sha512"].includes(hashAlgorithm)) {
      return app.alert(
        "Ingenico authorization",
        "Please define one of the following hashing methods in ingenico.hashAlgorithm: `sha1`, `sha256` or `sha512`."
      );
    }

    const paramsToUse = sortOgoneParams(params);
    const hash = signOgoneParams(params, hashAlgorithm, shaPass);

    request.setBody({
      mimeType,
      params: [...paramsToUse, { name: "SHASIGN", value: hash }],
    });
  },
];
