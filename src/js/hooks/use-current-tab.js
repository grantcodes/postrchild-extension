import browser from 'webextension-polyfill'
import { useState, useEffect } from 'react'

export default function () {
  const [tab, setTab] = useState({ url: null, title: null })

  useEffect(() => {
    const getTab = async () => {
      const tabs = await browser.tabs.query({
        active: true,
        windowId: browser.windows.WINDOW_ID_CURRENT,
      })
      if (tabs && tabs.length === 1) {
        const tabData = tabs[0]
        setTab(tabData)
      }
      // Doesn't work in popups / background process
      // const tabData = await browser.tabs.getCurrent()
      // console.log(tabData)
      // if (tabData) {
      //   setTab(tabData)
      // }
    }
    getTab()
    browser.tabs.onActivated.addListener(getTab)
    return () => browser.tabs.onActivated.removeListener(getTab)
  }, [])

  return tab
}
