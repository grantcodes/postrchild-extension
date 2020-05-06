import React from 'react'
import { hot } from 'react-hot-loader'
import styled from 'styled-components'
import Header from './Header'
import Tabs, { TabPane } from './PopupTabs'
import Settings from './Settings'
import Actions from './Actions'
import Theme from './Theme'
import useExtensionSettings from '../hooks/use-extension-settings'

const Wrapper = styled.div`
  box-sizing: border-box;
  min-width: 256px;
  max-width: 350px;
  width: 100%;
`

const Content = styled.div`
  width: 100%;
  max-height: 360px;
  padding: 10px;
  overflow: auto;
`

const Popup = () => {
  const [settings] = useExtensionSettings()

  return (
    <Theme>
      <Wrapper>
        <Header />
        <Content>
          {!settings.micropubToken ? (
            <Settings />
          ) : (
            <Tabs>
              <TabPane label="Actions">
                <Actions />
              </TabPane>
              <TabPane label="Settings">
                <Settings />
              </TabPane>
            </Tabs>
          )}
        </Content>
      </Wrapper>
    </Theme>
  )
}

export default hot(module)(Popup)
