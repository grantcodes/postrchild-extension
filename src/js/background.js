import browser from "webextension-polyfill";

const errorNotification = message => {
  browser.notifications.create("grantcodes-error", {
    type: "basic",
    iconUrl: browser.extension.getURL("icon-128.png"),
    title: "Error",
    message: message
  });
};
