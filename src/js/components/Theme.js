import React from 'react'
import { Provider, Base } from 'rebass'
import { createColors } from 'rebass/src/colors'
import CssReset from './CssReset'

const theme = {
  colors: createColors('#6142a5')
}
theme.colors.blue = '#6142a5'

const Theme = props => (
  <Provider theme={theme}>
    <CssReset theme={theme} />
    <Base>{props.children}</Base>
  </Provider>
)

export default Theme
