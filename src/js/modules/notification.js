import browser from "webextension-polyfill";

export default function(message, title = "Success!") {
  browser.notifications.create("postrchild-notification", {
    type: "basic",
    iconUrl: browser.extension.getURL("icon-128.png"),
    title: title,
    message: message
  });
}
