import browser from 'webextension-polyfill'
import React from 'react'
import { Reply as Icon } from 'styled-icons/material'
import Action from './Base'
import logger from '../../modules/logger'

const Reply = ({ tabId, url, newPostPage, ...props }) => (
  <Action
    title="Reply"
    onClick={async () => {
      try {
        if (newPostPage && url !== newPostPage) {
          // Add ?in-reply-to=url to the new post page
          const newUrl = new URL(newPostPage)
          const searchParams = newUrl.searchParams
          searchParams.set('in-reply-to', url)
          newUrl.search = searchParams.toString()

          const newTab = await browser.tabs.create({ url: newUrl.toString() })
          if (newTab && newTab.id) {
            tabId = newTab.id
          }
        }
        window.close()
      } catch (err) {
        logger.error('Error loading reply', err)
      }
    }}
    {...props}
  >
    <Icon /> Reply
  </Action>
)

export default Reply
