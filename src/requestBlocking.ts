export const BLOCKED_IMAGE_STATUS_URL =
  "https://dd.gildata.com/api/getAllImagesByStatus1";

export const BLOCK_IMAGE_STATUS_RULE_ID = 1001;

export const SYNC_REQUEST_BLOCKING_MESSAGE = "gilbling:sync-request-blocking";

export type SyncRequestBlockingMessage = {
  type: typeof SYNC_REQUEST_BLOCKING_MESSAGE;
  enabled: boolean;
};

