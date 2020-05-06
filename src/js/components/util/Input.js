import styled from 'styled-components'

export default styled.input`
  display: block;
  width: 100%;
  color: inherit;
  border: 1px solid ${(props) => props.theme.colors.text};
  border-radius: 4px;
  text-transform: none;
  letter-spacing: 0;
  font-weight: normal;
  font-size: inherit;
  padding: 6px 10px;
  background-color: transparent;
  box-shadow: none;
  margin-bottom: 10px;

  :hover,
  :focus,
  :active {
    border-color: ${(props) => props.theme.colors.main};
  }

  :disabled {
    border-color: ${(props) => props.theme.colors.disabled} !important;
    cursor: not-allowed !important;
  }
`
