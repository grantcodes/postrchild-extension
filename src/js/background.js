import "../img/icon-34.png";
import "../img/icon-128.png";

import browser from "webextension-polyfill";
import notification from "./modules/notification";
import micropub from "./modules/micropub";
import Bookmark from "./modules/bookmarks";

// browser.tabs.onCreated.addListener(tab => {
//   if (tab.active && tab.url.indexOf("http") !== 1) {
//     console.log("New tab page please");
//   }
// });

const shouldAutoPushBookmarks = () =>
  new Promise((resolve, reject) => {
    browser.storage.local
      .get("setting_bookmarkAutoSync")
      .then(store => {
        if (store.setting_bookmarkAutoSync) {
          resolve();
        } else {
          reject();
        }
      })
      .catch(err => {
        console.log("Error getting auto sync setting", err);
        reject();
      });
  });

let mf2Bookmarks = {};
browser.bookmarks.onCreated.addListener((id, bookmark) => {
  shouldAutoPushBookmarks()
    .then(() => {
      if (bookmark.url && bookmark.title) {
        bookmark = new Bookmark(bookmark);
        // New bookmark created. Let's check if it we are syncing the bookmarks or not before pushing it online
        browser.runtime
          .sendMessage({ action: "isSyncing" })
          .then(isSyncing => {
            if (!isSyncing) {
              bookmark
                .createMicropub()
                .then(url => {
                  mf2Bookmarks[bookmark.browser.id] = url;
                  if (typeof url === "string") {
                    notification(url, "Micropub bookmark created");
                  } else {
                    notification("Micropub bookmark created");
                  }
                })
                .catch(err => {
                  console.log("Error creating micropub bookmark", err);
                  notification("Error creating micropub bookmark", "Error");
                });
            } else {
              console.log(
                "Bookmarks are currently syncing so this should be ignored"
              );
            }
          })
          .catch(err => {
            // If there was an error then they probably are not syncing
            bookmark
              .createMicropub()
              .then(url => {
                // TODO: Really need to figure out why this won't return the actual url in chrome
                if (typeof url === "string") {
                  mf2Bookmarks[bookmark.browser.id] = url;
                  notification(url, "Micropub bookmark created");
                } else {
                  notification("Micropub bookmark created");
                }
              })
              .catch(err => {
                notification("Error creating micropub bookmark", "Error");
              });
          });
      }
    })
    .catch(() => {});
});

// Need to look for updates as a lot of browsers will update the bookmark when you change folders
browser.bookmarks.onMoved.addListener((id, bookmark) => {
  shouldAutoPushBookmarks()
    .then(() => {
      if (mf2Bookmarks[id]) {
        bookmark = new Bookmark(bookmark);
        const update = {
          replace: {
            category: bookmark.mf2.properties.category
          }
        };
        micropub
          .update(mf2Bookmarks[id], update)
          .then(url => {
            notification(
              "Successfully updated bookmark post categories",
              "Moved Bookmark"
            );
          })
          .catch(err => {
            console.log(err);
            errorNotification(err.message);
          });
      }
    })
    .catch(() => {});
});

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
    case "getSettings": {
      return browser.storage.local.get();
      break;
    }
    default: {
      break;
    }
  }
});

// Checks the given tab and enables the page action
// If it is the users url with more than 0 h-entries then it is enabled
// If there is a single h-entry is will load the editor
// If there is more than one h-entry it will load the new post creator
function initializePageAction(tab) {
  browser.storage.local.get("setting_micropubMe").then(res => {
    if (res && res.setting_micropubMe) {
      const me = res.setting_micropubMe;
      if (tab.url.indexOf(me) === 0) {
        browser.tabs
          .sendMessage(tab.id, { action: "getEntryCount" })
          .then(res => {
            if (res && res.count) {
              console.log("Showing the page action", tab.url);
              browser.pageAction.show(tab.id);
            }
            if (res && res.count === 1) {
              browser.pageAction.setTitle({
                tabId: tab.id,
                title: "Edit Post"
              });
            } else if (res && res.count > 1) {
              browser.pageAction.setTitle({ tabId: tab.id, title: "New Post" });
            }
          })
          .catch(err => {
            // console.log(
            //   "Error sending message to onpage js, probably just not loaded",
            //   err
            // );
          });
      }
    }
  });
}

// On first load check all tabs to enable the page action
browser.tabs.query({}).then(tabs => {
  for (let tab of tabs) {
    initializePageAction(tab);
  }
});

// Whenever a tab is updated we need to check if the page action should be shown
browser.tabs.onUpdated.addListener((id, changeInfo, tab) => {
  initializePageAction(tab);
});

// Watches for a click on the page action button and either loads the new post creator or editor
browser.pageAction.onClicked.addListener(tab => {
  browser.tabs
    .sendMessage(tab.id, { action: "getEntryCount" })
    .then(res => {
      if (res && res.count === 1) {
        browser.tabs.sendMessage(tab.id, { action: "showEditor" });
      } else if (res && res.count > 1) {
        browser.tabs.sendMessage(tab.id, { action: "showNewPost" });
      }
    })
    .catch(err => {
      // console.log(
      //   "Error sending message to onpage js, probably just not loaded",
      //   err
      // );
    });
});
