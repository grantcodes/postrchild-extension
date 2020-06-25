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
      logger.log('Bookmarks are currently syncing so this should be ignored')
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
      logger.error('[Error moving bookmark]', err)
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
    case 'saveNewPostPage': {
      const {
        setting_newPostPage: newPostPage,
      } = await browser.storage.local.get()
      if (!newPostPage && sender && sender.url) {
        logger.log(`Setting new post page to ${sender.url}`)
        await browser.storage.local.set({ setting_newPostPage: sender.url })
      }
    }
    default: {
      break
    }
  }
})

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
