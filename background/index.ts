import browser from "webextension-polyfill";

type Message = {
  action: string,
  value: string
}

type ResponseCallback = (data: any) => void

async function handleMessage({action, value}: Message, response: ResponseCallback) {
  // No need for the service worker for now. Keeping it for future features
  response({data: null, error: 'Unknown action'});
}

// @ts-ignore
browser.runtime.onMessage.addListener((msg, sender, response) => {
  handleMessage(msg, response);
  return true;
});
