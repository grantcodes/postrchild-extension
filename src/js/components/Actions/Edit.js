import React from 'react'
import { Edit as Icon } from 'styled-icons/material'
import Action from './Base'

const Edit = ({ tabId, ...props }) => (
  <Action
    title="Edit Post"
    onClick={() => browser.tabs.sendMessage(tabId, { action: 'showEditor' })}
    {...props}
  >
    <Icon /> Edit
  </Action>
)

export default Edit
