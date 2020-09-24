# Insomnia Plugin: Ingenico Authentication

Automatically adds the correct authorization for Ingenico requests in [Insomnia](https://insomnia.rest/). Works for both Ingenico Connect and the traditional Ogone platform.

## Installation

Open the Plugins menu in the Insomnia client and add `insomnia-plugin-ingenico-authentication`.

## Usage

### Ingenico Connect

Make sure an `ingenico` key is defined in the environment and add the `apiKeyId` and `apiKeySecret` as can be found in your Ingenico account:

```json
{
  "ingenico": {
    "apiKeyId": "<apiKeyId>",
    "apiKeySecret": "<apiKeySecret>"
  }
}
```

### Ogone

Make sure an `ingenico` key is defined in the environment and add the `hashAlgorithm` as defined in your backoffice configuration. This should be one of the values `sha1`, `sha256` or `sha512`. Add your SHA-IN pass as `shaPass` in the `ingenico` environment:

```json
{
  "ingenico": {
    "hashAlgorithm": "sha512",
    "shaPass": "<SHA-IN passphrase>"
  }
}
```
