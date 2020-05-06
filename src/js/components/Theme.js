import React from 'react'
import { hot } from 'react-hot-loader'
import { ThemeProvider } from 'styled-components'
import CssReset from './CssReset'
import ErrorBoundary from './ErrorBoundary'

const theme = {
  colors: {
    main: '#6142a5',
    alt: '#df99d8',
    background: '#fafafa',
    text: '#0a0a0a',
    disabled: '#3a363f',
  },
}

const Theme = ({ children }) => (
  <ThemeProvider theme={theme}>
    <CssReset>
      <ErrorBoundary>{children}</ErrorBoundary>
    </CssReset>
  </ThemeProvider>
)

export default hot(module)(Theme)
