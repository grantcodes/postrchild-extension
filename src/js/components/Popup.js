import React, { Component } from 'react'
import { hot } from 'react-hot-loader'
import { Box } from 'rebass'
import Header from './Header'
import Tabs, { TabPane } from './PopupTabs'
import Settings from './Settings'
import Theme from './Theme'

class Popup extends Component {
  render() {
    return (
      <Theme>
        <Box style={{ minWidth: 256, maxWidth: 350 }} p={0}>
          <Header />
          <Tabs>
            <TabPane label="Settings">
              <Settings />
            </TabPane>
          </Tabs>
        </Box>
      </Theme>
    )
  }
}

export default hot(module)(Popup)
