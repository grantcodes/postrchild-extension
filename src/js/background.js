import "../img/icon-34.png";
import "../img/icon-128.png";

import browser from "webextension-polyfill";

const errorNotification = message => {
  browser.notifications.create("grantcodes-error", {
    type: "basic",
    iconUrl: browser.extension.getURL("icon-128.png"),
    title: "Error",
    message: message
  });
};
