import browser from 'webextension-polyfill'
import { useState, useEffect } from 'react'

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
    let mounted = false
    const didMount = async () => {
      mounted = true
      // Get local settings
      const store = await browser.storage.local.get()
      setSettings({
        micropubMe: store.setting_micropubMe,
        micropubToken: store.setting_micropubToken,
        micropubEndpoint: store.setting_micropubEndpoint,
        newPostTemplate: store.setting_newPostTemplate,
        newPostPage: store.setting_newPostPage,
        bookmarkAutoSync: store.setting_bookmarkAutoSync ? true : false,
      })
    }
    if (!mounted) {
      didMount()
    }
  }, [])

  const setAndSaveSettings = (state) => {
    // Update the state
    const update = { ...settings, ...state }
    setSettings(update)

    // And store in the browser storage
    let browserUpdate = {}
    for (const key in update) {
      if (update.hasOwnProperty(key)) {
        const value = update[key]
        browserUpdate['setting_' + key] = value
      }
    }
    browser.storage.local.set(browserUpdate)
  }

  return [settings, setAndSaveSettings]
}
