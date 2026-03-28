import { defineConfig } from "wxt";
import packageJson from "./package.json";

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  outDir: "dist",
  manifestVersion: 3,
  manifest: {
    name: "聚美美",
    version: packageJson.version,
    description: "美化聚源数据字典",
    permissions: ["activeTab", "storage", "declarativeNetRequest"],
    host_permissions: ["https://dd.gildata.com/*"],
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
    },
  },
});
