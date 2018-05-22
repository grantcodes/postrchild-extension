import "../img/icon-34.png";
import "../img/icon-128.png";

import browser from "webextension-polyfill";
import micropub from "./modules/micropub";

const errorNotification = message => {
  browser.notifications.create("grantcodes-error", {
    type: "basic",
    iconUrl: browser.extension.getURL("icon-128.png"),
    title: "Error",
    message: message
  });
};

// Need to watch for headers from the micropub & media endpoint because they cannot be read by default.
let lastLocation = null;
browser.webRequest.onHeadersReceived.addListener(
  e => {
    const locationHeader = e.responseHeaders.find(
      header => header.name.toLowerCase() == "location"
    );
    if (locationHeader) {
      lastLocation = locationHeader.value;
    } else {
      lastLocation = null;
    }
    return Promise.resolve({ responseHeaders: e.responseHeaders });
  },
  {
    urls: [
      "https://grant.codes/micropub/micropub",
      "https://grant.codes/micropub/media"
    ]
  },
  ["blocking", "responseHeaders"]
);

// Listen for messages.
browser.runtime.onMessage.addListener((request, sender) => {
  switch (request.action) {
    case "getLastLocation": {
      return Promise.resolve({ location: lastLocation });
      break;
    }
    default: {
      break;
    }
  }
});
