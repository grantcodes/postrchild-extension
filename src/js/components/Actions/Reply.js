import browser from 'webextension-polyfill'
import React from 'react'
import { Reply as Icon } from 'styled-icons/material'
import Action from './Base'

const Reply = ({ tabId, url, newPostPage, ...props }) => (
  <Action
    title="Reply"
    onClick={async () => {
      if (newPostPage && url !== newPostPage) {
        const newTab = await browser.tabs.create({ url: newPostPage })
        if (newTab && newTab.id) {
          tabId = newTab.id
        }
      }
      browser.tabs.sendMessage(tabId, {
        action: 'showNewPost',
        properties: { 'in-reply-to': [url] },
      })
      window.close()
    }}
    {...props}
  >
    <Icon /> Reply
  </Action>
)

export default Reply
