import { defineContentScript } from "wxt/utils/define-content-script";
import "../src/contentScript/index.css";
import { initEnhancement } from "../src/contentScript/enhance";

export default defineContentScript({
  matches: ["https://dd.gildata.com/*"],
  runAt: "document_idle",
  main() {
    initEnhancement();
  },
});
