import { defineManifest } from "@crxjs/vite-plugin";

const manifest = defineManifest({
  name: "Pihh's screen recorder",
  description: "A free chrome extension for screen recording :) ",
  version: "1.0.1",
  manifest_version: 3,
  icons: {
    16: "icons/icon16.png",
    32: "img/logo-34.png",
    48: "icons/icon48.png",
    128: "icons/icon128.png",
  },
  action: {
    default_popup: "popup.html",
    default_icon: "icons/icon48.png",
  },
  options_page: "options.html",
  background: {
    service_worker: "src/background/index.js",
    type: "module",
  },
  content_scripts: [
    {
      matches: ["http://*/*", "https://*/*"],
      js: ["src/content/index.js"],
    },
  ],
  web_accessible_resources: [
    {
      resources: [
        "icons/icon16.png",
        "img/logo-34.png",
        "icons/icon48.png",
        "icons/icon128.png",
      ],
      matches: [],
    },
  ],
  permissions: [],
});

console.log({ manifest });

export default manifest;
