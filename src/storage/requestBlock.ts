export interface RequestBlockConfig {
  blockImageStatusRequest: boolean;
}

const STORAGE_KEY = "requestBlockConfig";

const DEFAULT_CONFIG: RequestBlockConfig = {
  blockImageStatusRequest: false,
};

export async function getRequestBlockConfig(): Promise<RequestBlockConfig> {
  return new Promise((resolve) => {
    chrome.storage.local.get(STORAGE_KEY, (result) => {
      resolve(result[STORAGE_KEY] || DEFAULT_CONFIG);
    });
  });
}

export async function setRequestBlockConfig(
  config: RequestBlockConfig,
): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEY]: config }, () => {
      resolve();
    });
  });
}

