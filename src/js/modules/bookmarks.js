import browser from "webextension-polyfill";
import micropub from "./micropub";

const defaultFolders = ["other bookmarks", "unfiled bookmarks", "favorites"];

export default class Bookmark {
  constructor(data) {
    this.mf2 = null;
    this.browser = null;
    if (data.browser && data.mf2) {
      // This is already a completed bookmark object
      this.mf2 = data.mf2;
      this.browser = data.browser;
    } else if (!data.properties && data.id && data.url) {
      // This is a browser bookmark
      this.browser = data;
      this.mf2 = {
        type: ["h-entry"],
        properties: {
          name: [data.title],
          "bookmark-of": [data.url],
          visibility: ["unlisted"]
        }
      };
      if (data.folder) {
        let cats = [];
        data.folder.split("/").forEach(cat => cats.push(cat));
        if (data.folder.indexOf("/") > -1) {
          cats.push(data.folder);
        }
        cats = cats.filter(
          cat => defaultFolders.indexOf(cat.toLowerCase()) === -1
        );
        if (cats.length) {
          this.mf2.properties.category = cats;
        }
      } else {
        this.browser.folder = "";
      }
    } else if (
      data.properties &&
      data.properties["bookmark-of"] &&
      data.properties["bookmark-of"][0]
    ) {
      // This is a mf2 bookmark
      this.mf2 = data;
      this.browser = {
        title: data.properties["bookmark-of"][0],
        url: data.properties["bookmark-of"][0],
        folder: ""
      };
      if (data.properties.name && data.properties.name[0]) {
        this.browser.title = data.properties.name[0];
      }
      if (data.properties.category && data.properties.category[0]) {
        this.browser.folder =
          data.properties.category.find(cat => cat.indexOf("/") > -1) ||
          data.properties.category[0];
      }
    } else {
      // This is a broken bookmark
      throw new Error("Error instantiating that bookmark");
    }

    this.setFolder = this.setFolder.bind(this);
    this.createLocal = this.createLocal.bind(this);
    this.createLocalFolder = this.createLocalFolder.bind(this);
    this.createMicropub = this.createMicropub.bind(this);
    this.deleteLocal = this.deleteLocal.bind(this);
    this.deleteMicropub = this.deleteMicropub.bind(this);
  }

  setFolder(folder) {
    this.browser.folder = folder;
    let cats = [];
    if (folder.indexOf("/") > -1) {
      cats.push(folder);
    }
    folder.split("/").forEach(cat => cats.push(cat));
    if (cats.length) {
      this.mf2.properties.category = cats;
    }
  }

  async createLocalFolder() {
    const flatten = array => {
      let result = [];
      array.forEach(a => {
        result.push(a);
        if (a.children && Array.isArray(a.children)) {
          result = result.concat(flatten(a.children));
        }
      });
      return result;
    };

    return new Promise((resolve, reject) => {
      let folderIndex = 0;
      const folders = this.browser.folder.split("/").filter(folder => folder);
      if (!folders || !folders.length) {
        return resolve();
      }

      browser.bookmarks
        .getTree()
        .then(tree => {
          const self = this;
          let existingFolders = flatten(tree).filter(item =>
            Array.isArray(item.children)
          );

          async function createFolder(name, parentId = false) {
            return new Promise((createFolderResolve, createFolderReject) => {
              let newFolder = {
                title: name
              };

              if (parentId) {
                newFolder.parentId = parentId;
              }

              const existingFolder = existingFolders.find(folder => {
                const oldTitle = folder.title.trim().toLowerCase();
                const newTitle = name.trim().toLowerCase();
                if (
                  parentId &&
                  oldTitle == newTitle &&
                  folder.parentId == parentId
                ) {
                  return true;
                }
                if (!parentId && oldTitle == newTitle) {
                  return true;
                }
                return false;
              });
              if (existingFolder) {
                // Folder exists, create the next level
                return createFolderResolve(existingFolder.id);
              } else {
                // Folder doesn't exist so let's create it
                browser.bookmarks.create(newFolder).then(res => {
                  existingFolders.push(res);
                  return createFolderResolve(res.id);
                });
              }
            });
          }

          async function createFolders(folders) {
            let parentId = null;
            for (const folder of folders) {
              parentId = await createFolder(folder, parentId);
            }
            self.browser.parentId = parentId;
            resolve();
          }

          createFolders(folders);
        })
        .catch(err => reject(err));
    });
  }

  createLocal() {
    return this.createLocalFolder().then(() => {
      let browserBookmark = this.browser;
      delete browserBookmark.folder;
      return browser.bookmarks.create(browserBookmark);
    });
  }

  createMicropub() {
    // TODO: Would like to check that this doesn't already exist first
    return micropub.create(this.mf2);
  }

  deleteLocal() {
    if (this.browser.id) {
      return browser.bookmarks.remove(this.browser.id);
    }
    return Promise.resolve();
  }

  deleteMicropub() {
    if (this.mf2.properties.url && this.mf2.properties.url[0]) {
      return micropub.delete(this.mf2.properties.url[0]);
    } else {
      return Promise.reject("Missing the permalink for the online bookmark");
    }
  }
}

export const getLocalFolders = () =>
  new Promise((resolve, reject) => {
    browser.bookmarks.getTree().then(tree => {
      let folders = [];
      const flatten = (items, parentName = null) => {
        items.filter(item => item.children).forEach(folder => {
          if (
            parentName &&
            defaultFolders.indexOf(parentName.toLowerCase()) === -1
          ) {
            // Sub folder
            folder.title = parentName + "/" + folder.title;
          }
          folders.push(folder.title);
          flatten(folder.children, folder.title);
        });
      };
      flatten(tree);
      resolve(folders);
    });
  });

export const getLocal = () =>
  new Promise((resolve, reject) => {
    browser.bookmarks.getTree().then(tree => {
      let bookmarks = [];
      const flatten = (items, folder = null) => {
        items.forEach(item => {
          if (folder) {
            item.folder = folder;
          }
          if (item.children) {
            // This is a folder
            if (folder && defaultFolders.indexOf(folder.toLowerCase()) === -1) {
              // Sub folder
              item.title = folder + "/" + item.title;
            }
            flatten(item.children, item.title);
            delete item.children;
          } else {
            bookmarks.push(new Bookmark(item));
          }
        });
      };
      flatten(tree);
      resolve(bookmarks);
    });
  });

export const getOnline = () =>
  new Promise((resolve, reject) => {
    const search = {
      "properties.bookmark-of": { $exists: true }
    };
    const query = "mongo&limit=9999&mongo=" + JSON.stringify(search);

    const url = `${micropub.options.micropubEndpoint}?q=${query}`;

    const request = {
      method: "GET",
      headers: {
        Authorization: "Bearer " + micropub.options.token,
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        Accept: "application/json"
      }
    };

    fetch(url, request)
      .then(res => {
        if (!res.ok) {
          console.log(
            "Error querying micropub bookmarks, probably because the query is not supported"
          );
          return resolve([]);
        }
        return res.json();
      })
      .then(bookmarks => resolve(bookmarks.map(data => new Bookmark(data))))
      .catch(err => {
        console.log(
          "Error querying micropub bookmarks, probably because the query is not supported",
          err
        );
        resolve([]);
      });
  });

// NOTE: This deletes all online bookmarks, should probably never be used except for testing
export const deleteAllMicropub = () =>
  new Promise((resolve, reject) => {
    console.log("Deleting all online bookmarks");
    getOnline()
      .then(browserBookmarks => {
        browserBookmarks.forEach(bookmark => {
          bookmark
            .deleteMicropub()
            .then(res => console.log("Deleted bookmark", res))
            .catch(err => console.log("Error deleting bookmark", err));
        });
        resolve();
      })
      .catch(err => console.log("error or somthing", err));
  });

export const sync = () =>
  new Promise((resolve, reject) => {
    let browserBookmarks = [];
    console.log("Beginning bookmark sync");
    getLocal()
      .then(bookmarks => {
        browserBookmarks = bookmarks;
        return getOnline();
      })
      .then(onlineBookmarks => {
        async function makeOnlineBookmarks(browserBookmarks, onlineBookmark) {
          for (const browserBookmark of browserBookmarks) {
            // Search to see if this bookmark exists on the site
            const onlineBookmark = onlineBookmarks.find(
              bookmark => bookmark.browser.url == browserBookmark.browser.url
            );
            if (onlineBookmark) {
              // There is a bookmark online, so check if the categories or title should be updated
              if (
                onlineBookmark.browser.title != browserBookmark.browser.title ||
                onlineBookmark.browser.folder.trim().toLowerCase() !=
                  browserBookmark.browser.folder.trim().toLowerCase()
              ) {
                console.log(
                  "Online bookmark exists but the title or folder is incorrect: " +
                    onlineBookmark.browser.url
                );
                onlineBookmark
                  .deleteLocal()
                  .then(onlineBookmark.createLocal)
                  .then(() =>
                    console.log(
                      "recreated the local bookmark from an update on your site"
                    )
                  )
                  .catch(err =>
                    console.log("Error recreating local bookmark", err)
                  );
              }
            } else {
              // There is no bookmark online so create it
              console.log("Creating online bookmark", browserBookmark.mf2);
              try {
                const url = await browserBookmark.createMicropub();
                console.log("Micropub bookmark created", url);
              } catch (err) {
                console.log("error creating online bookmark", err);
              }
            }
          }
          console.log("Created online bookmarks");
        }

        async function makeLocalBookmarks(onlineBookmarks) {
          for (const onlineBookmark of onlineBookmarks) {
            const browserBookmark = browserBookmarks.find(
              bookmark => onlineBookmark.browser.url == bookmark.browser.url
            );
            if (!browserBookmark) {
              console.log("Creating local bookmark", onlineBookmark.browser);
              await onlineBookmark.createLocal();
            }
          }
          console.log("Created local bookmarks");
        }

        async function makeBookmarks(onlineBookmarks, browserBookmarks) {
          await makeOnlineBookmarks(browserBookmarks, onlineBookmarks);
          await makeLocalBookmarks(onlineBookmarks);
          console.log("Syncing complete");
          resolve();
        }
        makeBookmarks(onlineBookmarks, browserBookmarks);
      });
  });
