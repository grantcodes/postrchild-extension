import browser from "webextension-polyfill";

import "../img/icon-128.png";
import "../img/icon-34.png";

const errorNotification = message => {
  browser.notifications.create("grantcodes-error", {
    type: "basic",
    iconUrl: browser.extension.getURL("icon-128.png"),
    title: "Error",
    message: message
  });
};
