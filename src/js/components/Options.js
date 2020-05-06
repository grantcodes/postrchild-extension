import React, { Component } from 'react'
import { hot } from 'react-hot-loader'
import Theme from './Theme'
import Settings from './Settings'

const Popup = () => (
  <Theme>
    <div style={{ minWidth: 280 }} p={3}>
      <Settings />
    </div>
  </Theme>
)

export default hot(module)(Popup)
