import React from 'react'
import {
  MdFormatBold,
  MdFormatItalic,
  MdFormatUnderlined,
  MdCode,
} from 'react-icons/md'
import basicMark from './basic'

const code = basicMark({
  name: 'code',
  element: 'code',
  icon: <MdCode />,
})

const strong = basicMark({
  name: 'bold',
  element: 'strong',
  icon: <MdFormatBold />,
  showIcon: true,
})

const u = basicMark({
  name: 'underline',
  element: 'u',
  icon: <MdFormatUnderlined />,
})

const em = basicMark({
  name: 'italic',
  element: 'em',
  icon: <MdFormatItalic />,
})

export default [code, strong, u, em]
