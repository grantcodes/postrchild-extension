import styled from 'styled-components'

export default styled.input`
  display: block !important;
  width: 100% !important;
  color: inherit !important;
  border: 1px solid ${(props) => props.theme.colors.text} !important;
  border-radius: 4px !important;
  text-transform: none !important;
  letter-spacing: 0 !important;
  font-weight: normal !important;
  font-size: 16px !important;
  padding: 6px 10px !important;
  background-color: transparent !important;
  box-shadow: none !important;
  margin-bottom: 10px !important;

  :hover,
  :focus,
  :active {
    border-color: ${(props) => props.theme.colors.main} !important;
  }

  :disabled {
    border-color: ${(props) => props.theme.colors.disabled} !important;
    cursor: not-allowed !important;
  }
`
