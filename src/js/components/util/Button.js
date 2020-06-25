import styled from 'styled-components'
import Input from './Input'

const Button = styled(Input).attrs((props) => ({ as: 'button' }))`
  width: auto !important;
  cursor: pointer !important;
  background-color: ${(props) =>
    props.selected
      ? props.theme.colors.alt
      : props.theme.colors.main} !important;
  color: ${(props) => props.theme.colors.background} !important;
  font-weight: bold !important;
  border: none !important;
  text-align: center !important;
  transition: background 0.2s, color 0.2s !important;

  :hover,
  :focus,
  :active {
    background-color: ${(props) => props.theme.colors.alt} !important;
    color: ${(props) => props.theme.colors.background} !important;
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
