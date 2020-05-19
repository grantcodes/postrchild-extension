import browser from 'webextension-polyfill'
import React from 'react'
import { Add as Icon } from 'styled-icons/material'
import Action from './Base'

const New = ({ tabId, url, newPostPage, ...props }) => (
  <Action
    title="New Post"
    onClick={async () => {
      if (newPostPage && url !== newPostPage) {
        const newTab = await browser.tabs.create({ url: newPostPage })
        if (newTab && newTab.id) {
          tabId = newTab.id
        }
      }
      browser.tabs.sendMessage(tabId, { action: 'showNewPost' })
      window.close()
    }}
    {...props}
  >
    <Icon /> New Post
  </Action>
)

export default New
