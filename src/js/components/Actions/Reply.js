import React from 'react'
import { Reply as Icon } from 'styled-icons/material'
import Action from './Base'

const Reply = ({ tabId, ...props }) => (
  <Action
    title="Reply"
    onClick={(e) => console.log('TODO: Something with reply')}
    {...props}
  >
    <Icon /> Reply
  </Action>
)

export default Reply
