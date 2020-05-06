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
  border-radius: 0;
  width: auto;
  background: none;
  border: none;
  font-size: 9px;
  padding: 6px 7px 3px 7px;
  color: ${(props) =>
    props.current ? props.theme.colors.main : props.theme.colors.disabled};
  border-bottom: 3px solid
    ${(props) =>
      props.current ? props.theme.colors.main : props.theme.colors.disabled};
  opacity: ${(props) => (props.current ? 1 : 0.7)};

  :hover,
  :active,
  :focus {
    background: none;
    border-color: ${(props) => props.theme.colors.alt};
    color: ${(props) => props.theme.colors.main};
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
