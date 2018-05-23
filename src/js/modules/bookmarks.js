import browser from "webextension-polyfill";
import micropub from "./micropub";

const defaultFolders = ["other bookmarks", "unfiled bookmarks", "favorites"];

export const getLocal = () =>
  new Promise((resolve, reject) => {
    browser.bookmarks.getTree().then(tree => {
      let bookmarks = [];
      const flatten = (items, parentName = null) => {
        items.forEach(item => {
          bookmarks.push(item);
          if (item.children) {
            // This is a folder
            if (
              parentName &&
              defaultFolders.indexOf(parentName.toLowerCase()) === -1
            ) {
              // Sub folder
              item.title = parentName + "/" + item.title;
            }
            flatten(item.children, item.title);
            delete item.children;
          }
        });
      };
      flatten(tree);
      resolve(bookmarks);
    });
  });

export const getOnline = () => {
  const search = {
    "properties.bookmark": { $exists: true }
  };
  let query = "mongo&limit=-1&mongo=" + JSON.stringify(search);
  micropub
    .query(query)
    .then(bookmarks => {
      console.log(bookmarks);
    })
    .catch(err => console.log(err));
};

export const create = (name, url, folder = null, parentId = null) =>
  new Promise((resolve, reject) => {
    let newBookmark = {
      title: name,
      url: url
    };
    getLocal().then(bookmarks => {
      new Promise((resolve, reject) => {
        if (parentId) {
          newBookmark.parentId = parentId;
          return resolve(newBookmark);
        } else if (folder) {
          // Need to create a folder structure
          let folderIndex = 0;
          const folders = folder.split("/");
          const createFolder = (name, parentId = null) => {
            let newFolder = {
              title: name
            };
            if (parentId) {
              newFolder.parentId = parentId;
            }
            const next = id => {
              folderIndex++;
              if (folderIndex >= folders.length) {
                // create the bookmark
                newBookmark.parentId = id;
                resolve(newBookmark);
              } else {
                createFolder(folders[folderIndex], id);
              }
            };
            const existingFolder = bookmarks.find(bookmark => {
              if (bookmark.url) {
                return false;
              }
              if (parentId === null && bookmark.title == name) {
                return true;
              }
              if (bookmark.parentId == parentId && bookmark.title == name) {
                return true;
              }
              return false;
            });
            if (existingFolder) {
              // Folder exists, create the next level
              next(existingFolder.id);
            } else {
              // Folder doesn't exist so let's create it
              browser.bookmarks.create(newFolder).then(res => {
                next(res.id);
              });
            }
          };
          createFolder(folders[0]);
        }
      }).then(bookmark => {
        browser.bookmarks.create(bookmark).then(res => {
          resolve();
        });
      });
    });
  });

export const toMf2 = (url, name, folder = null) => {
  let mf2 = {
    type: ["h-entry"],
    properties: {
      name: [name],
      "bookmark-of": [url]
    }
  };
  let categories = [];
  if (folder) {
    if (tab.folder.indexOf("/") > -1) {
      categories.push(tab.folder);
    }
    tab.folder.split("/").forEach(cat => categories.push(cat));
  }
  if (categories.length) {
    mf2.properties.category = categories;
  }
  return mf2;
};

export const sync = () =>
  new Promise((resolve, reject) => {
    let localBookmarks = [];
    getLocal()
      .then(bookmarks => {
        localBookmarks = bookmarks;
        // TODO: replace with micropub query bookmarks here
        return micropub.query("bookmarks");
      })
      .then(siteBookmarks => {
        localBookmarks.forEach(localBookmark => {
          // Search to see if this bookmark exists on the site
          const siteBookmark = siteBookmarks.find(
            post => post.properties["bookmark-of"][0] == localBookmark.url
          );
          if (siteBookmark) {
            // There is a bookmark online, so check if the categories or title should be updated
          } else {
            // There is no bookmark online so create it
            // I feel this wont work because title is actually the path
            const mf2 = toMf2(
              localBookmark.url,
              localBookmark.title,
              localBookmark.folder
            );
            console.log(mf2);
            // micropub.create(mf2)
          }
        });
      });
  });
