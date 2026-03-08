import { getRequestBlockConfig } from "../storage/requestBlock";
import {
  SYNC_REQUEST_BLOCKING_MESSAGE,
  type SyncRequestBlockingMessage,
} from "../requestBlocking";
import { syncBlockedRequests } from "./requestBlocking";

async function syncRequestBlockingFromStorage() {
  const config = await getRequestBlockConfig();
  await syncBlockedRequests(config.blockImageStatusRequest);
}

chrome.runtime.onInstalled.addListener(() => {
  void syncRequestBlockingFromStorage();
});

chrome.runtime.onStartup.addListener(() => {
  void syncRequestBlockingFromStorage();
});

chrome.runtime.onMessage.addListener(
  (
    message: SyncRequestBlockingMessage,
    _sender,
    sendResponse: (response: { success: boolean; error?: string }) => void,
  ) => {
    if (message.type !== SYNC_REQUEST_BLOCKING_MESSAGE) {
      return false;
    }

    void syncBlockedRequests(message.enabled)
      .then(() => {
        sendResponse({ success: true });
      })
      .catch((error: unknown) => {
        const errorMessage =
          error instanceof Error ? error.message : "同步请求拦截规则失败";
        sendResponse({ success: false, error: errorMessage });
      });

    return true;
  },
);

void syncRequestBlockingFromStorage();

