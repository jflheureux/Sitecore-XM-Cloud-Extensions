# Sitecore XM Cloud Extensions

Sitecore XM Cloud Extensions is a browser extension that improves Sitecore XM Cloud user experience.

It is a work in progress with only one feature for the moment.

## Features

- Connecting XM Cloud Pages to your local XM Cloud instance

## Download

Download the extension on the marketplaces:

- Chrome: [https://chromewebstore.google.com/detail/sitecore-xm-cloud-extensi/pkonhbljhhbhbdjkacgmafheaebijmjh](https://chromewebstore.google.com/detail/sitecore-xm-cloud-extensi/pkonhbljhhbhbdjkacgmafheaebijmjh)

Support for other browsers will be added in the future.

## Author

[Jeff L'Heureux](https://www.jflh.ca/aboutme)

## Contributions

Questions, suggestions and contributions are welcome in the form of GitHub issues and pull requests. Please sync with the author before starting any feature in case they already started a similar feature.

## Development

The NPM scripts are adapted to work on Windows.

### Setup

Install dependencies via:

```sh
npm install
```

then start a browser with the web extension installed:

```sh
# run Chrome
npm run start:chrome
```

or

```sh
# run Firefox
npm run start:firefox
```

This will build the extension and start a browser with it being loaded in it. After making changes, Vite automatically will re-compile the files and you can reload the extension to apply them in the browser.

### Build

Bundle the extension by running:

```sh
npm run build
```

This script will bundle the extension as `web-extension-chrome-vX.X.X.crx` and `web-extension-firefox-vX.X.X.zip`. The generated files are in `dist/`. You can also grab a version from the [latest test](https://github.com/stateful/web-extension-starter-kit/actions/workflows/test.yml) run on the `main` branch.

### Load in the Browser

#### Load in Firefox

To load the extension in Firefox go to `about:debugging#/runtime/this-firefox` or `Firefox > Preferences > Extensions & Themes > Debug Add-ons > Load Temporary Add-on...`. Here locate the `dist/` directory and open `manifestv2.json`

#### Load in Chrome

To load the extensions in Google Chrome go to `chrome://extensions/` and click `Load unpacked`. Locate the dist directory and select `manifest.json`.

### Test

This project tests the extension files using component tests and the extension integration via e2e test with WebdriverIO.

Run unit/component tests:

```sh
npm run test:component
```

Run e2e tests:

```sh
npm run test:e2e
```

## Files

- background\background.ts - Background script/Service worker
- popup\index.html - popup UI
