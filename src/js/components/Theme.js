import React from 'react'
import { Provider, Base } from 'rebass'
import { createColors } from 'rebass/src/colors'
import { IconContext } from 'react-icons'
import CssReset from './CssReset'

const theme = {
  colors: createColors('#6142a5'),
}
theme.colors.blue = '#6142a5'

const Theme = props => (
  <Provider theme={theme}>
    <CssReset theme={theme} />
    <IconContext.Provider
      value={{
        size: 20,
        style: {
          verticalAlign: 'middle',
          fill: 'currentColor',
          color: 'inherit',
        },
      }}
    >
      <Base>{props.children}</Base>
    </IconContext.Provider>
  </Provider>
)

export default Theme
export { theme }
