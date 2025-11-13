import { defineManifest } from "@crxjs/vite-plugin";

export default defineManifest({
  manifest_version: 3,
  name: "聚美美",
  version: "1.3.0",
  description: "美化聚源数据字典",
  permissions: ["activeTab", "storage"],
  icons: {
    16: "icons/icon16.png",
    32: "icons/icon32.png",
    48: "icons/icon48.png",
    128: "icons/icon128.png",
  },
  action: {
    default_icon: {
      16: "icons/icon16.png",
      32: "icons/icon32.png",
      48: "icons/icon48.png",
    },
    default_popup: "src/popup/index.html",
  },
  content_scripts: [
    {
      matches: ["https://dd.gildata.com/*"],
      js: ["src/contentScript/index.tsx"],
      run_at: "document_idle",
    },
  ],
});
