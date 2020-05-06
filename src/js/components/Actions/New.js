import React from 'react'
import { Add as Icon } from 'styled-icons/material'
import Action from './Base'

const New = ({ tabId, ...props }) => (
  <Action
    title="New Post"
    onClick={() => browser.tabs.sendMessage(tabId, { action: 'showNewPost' })}
    {...props}
  >
    <Icon /> New Post
  </Action>
)

export default New
