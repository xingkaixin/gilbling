import { defineManifest } from "@crxjs/vite-plugin";

export default defineManifest({
  manifest_version: 3,
  name: "聚美美",
  version: "1.0.4",
  description: "美化聚源数据字典",
  permissions: ["activeTab"],
  content_scripts: [
    {
      matches: ["https://dd.gildata.com/*"],
      js: ["src/contentScript/index.tsx"],
      run_at: "document_idle",
    },
  ],
});
