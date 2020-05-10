import '../img/icon-34.png'
import '../img/icon-128.png'

import browser from 'webextension-polyfill'
import notification from './modules/notification'
import micropub, { setOptions as setMicropubOptions } from './modules/micropub'
import Bookmark from './modules/bookmarks'
import logger from './modules/logger'

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
        notification({ message: url, title: 'Micropub bookmark created' })
      } else {
        notification({ message: 'Micropub bookmark created' })
      }
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
    try {
      bookmark = new Bookmark(bookmark)
      const update = {
        replace: {
          category: bookmark.mf2.properties.category,
        },
      }
      const url = await micropub.update(mf2Bookmarks[id], update)
      if (url) {
        notification({
          title: 'Moved Bookmark',
          message: 'Successfully updated bookmark post categories',
        })
      }
    } catch (err) {
      console.error('[Error moving bookmark]', err)
    }
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
    case 'getToken': {
      const { code, state } = request
      const store = await browser.storage.local.get()
      micropub.options.me = store.setting_micropubMe
      micropub.options.tokenEndpoint = store.setting_tokenEndpoint
      micropub.options.micropubEndpoint = store.setting_micropubEndpoint

      if (code && state && state == micropub.options.state) {
        const token = await micropub.getToken(code)
        await browser.storage.local.set({ setting_micropubToken: token })
        return token
      }

      throw new Error('Error with code or state params')
    }
    case 'notification': {
      const { title, message } = request
      notification({ title, message })
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
    console.error('[Error initializing page action]', err)
  }
}

// On first load check all tabs to enable the page action
browser.tabs.query({}).then((tabs) => {
  for (const tab of tabs) {
    // initializePageAction(tab)
  }
})

// Whenever a tab is updated we need to check if the page action should be shown
browser.tabs.onUpdated.addListener((id, changeInfo, tab) => {
  // initializePageAction(tab)
})

// Watches for a click on the page action button and either loads the new post creator or editor
if (browser && browser.pageAction && browser.pageAction.onClicked) {
  browser.pageAction.onClicked.addListener(async (tab) => {
    browser.pageAction.openPopup()
    // const actionTitle = await browser.pageAction.getTitle({ tabId: tab.id })
    // console.log('checking actions')
    // switch (actionTitle) {
    //   case 'Edit Post':
    //     console.log('sending show editor')
    //     browser.tabs.sendMessage(tab.id, { action: 'showEditor' })
    //     break
    //   case 'New Post':
    //     console.log('sending show new')
    //     browser.tabs.sendMessage(tab.id, { action: 'showNewPost' })
    //     break
    // }
  })
}

if (browser && browser.contextMenus) {
  console.log('Creating send to media endpoint context menu')
  browser.contextMenus.create({
    id: 'send-to-media-endpoint',
    title: 'Send to media endpoint',
    contexts: ['link', 'video', 'audio'],
  })

  browser.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === 'send-to-media-endpoint') {
      if (info.srcUrl) {
        notification({ message: 'Sending to media endpoint' })
        try {
          await setMicropubOptions()
          if (!micropub.options.mediaEndpoint) {
            const config = await micropub.query('config')
            if (config['media-endpoint']) {
              micropub.options.mediaEndpoint = config['media-endpoint']
              await browser.storage.local.set({
                setting_mediaEndpoint: config['media-endpoint'],
              })
            } else {
              throw new Error('Could not find media endpoint')
            }
          }
          const res = await fetch(info.srcUrl)
          const blob = await res.blob()
          const file = new File(
            [blob],
            info.srcUrl.split('/').pop().split('?')[0]
          )
          const url = await micropub.postMedia(file)
          notification({
            title: 'Saved to media endpoint',
            message: url || 'Url unknown',
            url,
          })
        } catch (err) {
          logger.error('Error sending to media endpoint', err)
          notification({ message: 'Error saving to media endpoint' })
        }
      }
    } else {
      notification({
        title: 'Error sending to media endpoint',
        message: 'Unable to retrieve file',
      })
    }
  })
} else {
  logger.warn('browser context menu api not available', browser)
}

if (browser && browser.notifications && browser.notifications.onClicked) {
  browser.notifications.onClicked.addListener((notificationId) => {
    if (notificationId.startsWith('postrchild-notification-url-')) {
      const url = notificationId.replace('postrchild-notification-url-', '')
      browser.tabs.create({ url })
    }
  })
}
