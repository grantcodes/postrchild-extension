import '../img/icon-34.png'
import '../img/icon-128.png'

import browser from 'webextension-polyfill'
import notification from './modules/notification'
import micropub from './modules/micropub'
import Bookmark from './modules/bookmarks'

// browser.tabs.onCreated.addListener(tab => {
//   if (tab.active && tab.url.indexOf("http") !== 1) {
//     console.log("New tab page please");
//   }
// });

const shouldAutoPushBookmarks = async () => {
  const store = await browser.storage.local.get('setting_bookmarkAutoSync')
  return store.setting_bookmarkAutoSync
}

let mf2Bookmarks = {}
browser.bookmarks.onCreated.addListener(async (id, bookmark) => {
  const autoSyncEnabled = await shouldAutoPushBookmarks()
  if (
    autoSyncEnabled &&
    bookmark.url &&
    bookmark.title &&
    !bookmark.url.startsWith('javascript:')
  ) {
    bookmark = new Bookmark(bookmark)
    // New bookmark created. Let's check if it we are syncing the bookmarks or not before pushing it online
    const isSyncing = await browser.runtime.sendMessage({ action: 'isSyncing' })

    if (!isSyncing) {
      const url = await bookmark.createMicropub()

      mf2Bookmarks[bookmark.browser.id] = url
      if (typeof url === 'string') {
        notification(url, 'Micropub bookmark created')
      } else {
        notification('Micropub bookmark created')
      }

      // .catch(err => {
      //   console.log('Error creating micropub bookmark', err)
      //   notification('Error creating micropub bookmark', 'Error')
      // })
    } else {
      console.log('Bookmarks are currently syncing so this should be ignored')
    }
    // })
    // .catch(err => {
    //   // If there was an error then they probably are not syncing
    //   bookmark
    //     .createMicropub()
    //     .then(url => {
    //       // TODO: Really need to figure out why this won't return the actual url in chrome
    //       if (typeof url === 'string') {
    //         mf2Bookmarks[bookmark.browser.id] = url
    //         notification(url, 'Micropub bookmark created')
    //       } else {
    //         notification('Micropub bookmark created')
    //       }
    //     })
    //     .catch(err => {
    //       notification('Error creating micropub bookmark', 'Error')
    //     })
    // })
  }
})

// Need to look for updates as a lot of browsers will update the bookmark when you change folders
browser.bookmarks.onMoved.addListener(async (id, bookmark) => {
  const autoSyncEnabled = shouldAutoPushBookmarks()
  if (autoSyncEnabled && mf2Bookmarks[id]) {
    bookmark = new Bookmark(bookmark)
    const update = {
      replace: {
        category: bookmark.mf2.properties.category,
      },
    }
    const url = await micropub.update(mf2Bookmarks[id], update)
    if (url) {
      notification(
        'Successfully updated bookmark post categories',
        'Moved Bookmark'
      )
    }

    // .catch(err => {
    //   console.log(err)
    //   errorNotification(err.message)
    // })
  }
})

// Listen for messages.
browser.runtime.onMessage.addListener(async (request, sender) => {
  switch (request.action) {
    case 'getSettings': {
      return browser.storage.local.get()
    }
    case 'closeTab': {
      browser.tabs.remove(sender.tab.id)
    }
    default: {
      break
    }
  }
})

// Checks the given tab and enables the page action
// If it is the users url with more than 0 h-entries then it is enabled
// If there is a single h-entry is will load the editor
// If there is more than one h-entry it will load the new post creator
async function initializePageAction(tab) {
  try {
    const store = await browser.storage.local.get('setting_micropubMe')
    if (store && store.setting_micropubMe) {
      const me = store.setting_micropubMe
      if (tab.url.indexOf(me) === 0 || process.env.NODE_ENV === 'development') {
        const res = await browser.tabs.sendMessage(tab.id, {
          action: 'discoverPageAction',
        })
        if (tab && tab.id && res && res.action) {
          browser.pageAction.show(tab.id)
          if (res.action === 'edit') {
            browser.pageAction.setTitle({
              tabId: tab.id,
              title: 'Edit Post',
            })
          } else if (res.action === 'new') {
            browser.pageAction.setTitle({ tabId: tab.id, title: 'New Post' })
          }
        }
      }
    } else if (tab && tab.id) {
      browser.pageAction.show(tab.id)
      browser.pageAction.setTitle({
        tabId: tab.id,
        title: 'Login',
      })
    }
  } catch (err) {
    console.log('Error initializing page action', err)
  }
}

// On first load check all tabs to enable the page action
browser.tabs.query({}).then(tabs => {
  for (const tab of tabs) {
    initializePageAction(tab)
  }
})

// Whenever a tab is updated we need to check if the page action should be shown
browser.tabs.onUpdated.addListener((id, changeInfo, tab) => {
  initializePageAction(tab)
})

// Watches for a click on the page action button and either loads the new post creator or editor
browser.pageAction.onClicked.addListener(async tab => {
  const actionTitle = await browser.pageAction.getTitle({ tabId: tab.id })
  switch (actionTitle) {
    case 'Edit Post':
      browser.tabs.sendMessage(tab.id, { action: 'showEditor' })
      break
    case 'New Post':
      browser.tabs.sendMessage(tab.id, { action: 'showNewPost' })
      break
    default:
      browser.runtime.openOptionsPage()
      break
  }
})
