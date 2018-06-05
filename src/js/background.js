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

let mf2Bookmarks = {};
browser.bookmarks.onCreated.addListener((id, bookmark) => {
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
      });
  }
});

// Need to look for updates as a lot of browsers will update the bookmark when you change folders
browser.bookmarks.onMoved.addListener((id, bookmark) => {
  if (mf2Bookmarks[id]) {
    bookmarks.toMf2(...bookmark).then(mf2 => {
      const update = {
        replace: {
          category: mf2.properties.category
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
    });
  }
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
    default: {
      break;
    }
  }
});
