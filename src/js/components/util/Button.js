import styled from 'styled-components'
import Input from './Input'

const Button = styled(Input).attrs((props) => ({ as: 'button' }))`
  cursor: pointer;
  background-color: ${(props) =>
    props.selected ? props.theme.colors.alt : props.theme.colors.main};
  color: ${(props) => props.theme.colors.background};
  font-weight: bold;
  border: none;
  text-align: center;
  transition: background 0.2s, color 0.2s;

  :hover,
  :focus,
  :active {
    background-color: ${(props) => props.theme.colors.alt};
    color: ${(props) => props.theme.colors.background};
  }

  :disabled {
    background-color: ${(props) => props.theme.colors.disabled} !important;
    cursor: not-allowed !important;
  }

  svg {
    height: 1em;
    width: auto;
  }
`

export default Button
