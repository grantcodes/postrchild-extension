import styled from 'styled-components'
import { normalize, textInputs } from 'polished'

// TODO: Use theme colors
const CssReset = styled.div`
  /* all: unset; */
  /* all: revert; */
  color: ${(props) => props.theme.colors.text};

  &,
  & *,
  & *::after,
  & *::before {
    box-sizing: border-box;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
      Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans',
      'Helvetica Neue', sans-serif;
    font-size: 16px;
  }

  /* ${normalize()} */
`

export default CssReset
