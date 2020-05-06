import React from 'react'
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  Code,
} from 'styled-icons/material'
import basicMark from './basic'

const code = basicMark({
  name: 'code',
  element: 'code',
  icon: <Code />,
})

const strong = basicMark({
  name: 'bold',
  element: 'strong',
  icon: <FormatBold />,
  showIcon: true,
})

const u = basicMark({
  name: 'underline',
  element: 'u',
  icon: <FormatUnderlined />,
})

const em = basicMark({
  name: 'italic',
  element: 'em',
  icon: <FormatItalic />,
})

export default [code, strong, u, em]
