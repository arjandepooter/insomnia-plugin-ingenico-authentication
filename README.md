# Insomnia Plugin: Ingenico Authentication

Automatically adds the Authorization header for Ingenico requests in [Insomnia](https://insomnia.rest/).

## Installation

Open the Plugins menu in the Insomnia client and add `insomnia-plugin-ingenico-authentication`.

## Usage

Make sure an `ingenico` key is defined in the environment and add the `apiKeyId` and `apiKeySecret` as can be found in your Ingenico account:

```json
{
  "ingenico": {
    "apiKeyId": "<apiKeyId>",
    "apiKeySecret": "<apiKeySecret>"
  }
}
```
