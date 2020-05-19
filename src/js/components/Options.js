import React, { Component } from 'react'
import Theme from './Theme'
import Settings from './Settings'

const Popup = () => (
  <Theme>
    <div style={{ minWidth: 280 }} p={3}>
      <Settings />
    </div>
  </Theme>
)

export default Popup
