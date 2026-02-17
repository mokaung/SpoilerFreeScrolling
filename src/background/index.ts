chrome.runtime.onInstalled.addListener(() => {});

chrome.runtime.onMessage.addListener((_message, _sender, sendResponse) => {
  sendResponse({ status: 'ok' });
  return true;
});