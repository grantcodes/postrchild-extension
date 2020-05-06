import React from 'react'
import styled from 'styled-components'
import icon from '../../img/icon-128.png'

const Header = styled.header`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  color: ${(props) => props.theme.colors.background};
  background-image: linear-gradient(
    25deg,
    ${(props) => props.theme.colors.main},
    ${(props) => props.theme.colors.alt}
  );
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2;
`

const Logo = styled.img`
  display: block;
  width: 25px;
  height: 25px;
  margin-right: 10px;
  margin-left: -25px;
`

const Title = styled.h1`
  font-weight: bold;
  font-size: 16px;
  color: inherit;
  margin: 0;
  line-height: 1;
`

export default () => (
  <Header>
    <Logo src={icon} />
    <Title>PostrChild</Title>
  </Header>
)
