import {
  BLOCKED_IMAGE_STATUS_URL,
  BLOCK_IMAGE_STATUS_RULE_ID,
} from "../requestBlocking";

const blockedRequestRule: chrome.declarativeNetRequest.Rule = {
  id: BLOCK_IMAGE_STATUS_RULE_ID,
  priority: 1,
  action: {
    type: chrome.declarativeNetRequest.RuleActionType.BLOCK,
  },
  condition: {
    urlFilter: `|${BLOCKED_IMAGE_STATUS_URL}|`,
    resourceTypes: [chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST],
    requestMethods: [chrome.declarativeNetRequest.RequestMethod.GET],
  },
};

export async function syncBlockedRequests(enabled: boolean): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    chrome.declarativeNetRequest.updateDynamicRules(
      {
        removeRuleIds: [BLOCK_IMAGE_STATUS_RULE_ID],
        addRules: enabled ? [blockedRequestRule] : [],
      },
      () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }

        resolve();
      },
    );
  });
}
