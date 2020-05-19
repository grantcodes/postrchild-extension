import browser from 'webextension-polyfill'
import { useState, useEffect, useCallback } from 'react'

export default function () {
  const [settings, setSettings] = useState({
    micropubMe: '',
    micropubToken: '',
    micropubEndpoint: '',
    newPostTemplate: '',
    newPostPage: '',
    bookmarkAutoSync: false,
  })

  useEffect(() => {
    // Get local settings
    browser.storage.local.get().then((store) => {
      setSettings({
        micropubMe: store.setting_micropubMe,
        micropubToken: store.setting_micropubToken,
        micropubEndpoint: store.setting_micropubEndpoint,
        newPostTemplate: store.setting_newPostTemplate,
        newPostPage: store.setting_newPostPage,
        bookmarkAutoSync: store.setting_bookmarkAutoSync ? true : false,
      })
    })
  }, [])

  const setAndSaveSettings = useCallback((update) => {
    // Update the state
    const state = { ...settings, ...update }
    setSettings(state)

    // And store in the browser storage
    let browserUpdate = {}
    for (const key in update) {
      if (update.hasOwnProperty(key)) {
        const value = update[key]
        browserUpdate['setting_' + key] = value
      }
    }
    browser.storage.local.set(browserUpdate)
  }, [])

  return [settings, setAndSaveSettings]
}
