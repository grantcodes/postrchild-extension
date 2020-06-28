import React, { Fragment, useState } from 'react'
import Button from './util/Button'
import styled from 'styled-components'

const Tabs = styled.nav`
  display: flex;
  justify-content: space-around;
  padding: 0;
  background: none;
`

const Tab = styled(Button)`
  border-radius: 0 !important;
  width: auto !important;
  background: none !important;
  border: none !important;
  font-size: 14px !important;
  padding: 6px 7px 3px 7px !important;
  color: ${(props) =>
    props.current
      ? props.theme.colors.main
      : props.theme.colors.disabled} !important;
  border-bottom: 3px solid
    ${(props) =>
      props.current
        ? props.theme.colors.main
        : props.theme.colors.disabled} !important;
  opacity: ${(props) => (props.current ? 1 : 0.7)} !important;

  :hover,
  :active,
  :focus {
    background: none !important;
    border-color: ${(props) => props.theme.colors.alt} !important;
    color: ${(props) => props.theme.colors.main} !important;
  }
`

const Container = styled.div`
  display: block;
`

const PopupTabs = ({ children }) => {
  const [currentTab, setTab] = useState(0)
  let tabs = Array.isArray(children) ? children : [children]

  return (
    <Fragment>
      <Tabs>
        {tabs.map((tab, i) => {
          if (!tab || !tab.props) {
            return null
          }
          return (
            <Tab
              key={`tab-${i}`}
              onClick={() => setTab(i)}
              current={currentTab === i}
            >
              {tab.props.label}
            </Tab>
          )
        })}
      </Tabs>

      <Container>{tabs[currentTab]}</Container>
    </Fragment>
  )
}

export default PopupTabs

export const TabPane = ({ children }) => <Fragment>{children}</Fragment>
