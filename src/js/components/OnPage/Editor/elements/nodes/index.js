import React, { Fragment } from 'react'
import {
  Title,
  FormatListBulleted,
  TextFormat,
  FormatQuote,
  FormatListNumbered,
  Code,
} from 'styled-icons/material'
import basicNode from './basic'

const HeadingIcon = ({ level }) => (
  <Fragment>
    <Title />
    <span
      style={{
        fontSize: 11,
        fontWeight: 'bold',
        lineHeight: 1,
        marginLeft: -4,
        verticalAlign: 'text-bottom',
        position: 'absolute',
      }}
    >
      {level}
    </span>
  </Fragment>
)

const p = basicNode({
  name: 'paragraph',
  element: 'p',
  icon: <TextFormat />,
})

const h1 = basicNode({
  name: 'heading-one',
  element: 'h1',
  icon: <HeadingIcon level={1} />,
})

const h2 = basicNode({
  name: 'heading-two',
  element: 'h2',
  icon: <HeadingIcon level={2} />,
  showIcon: true,
})

const h3 = basicNode({
  name: 'heading-three',
  element: 'h3',
  icon: <HeadingIcon level={3} />,
  showIcon: true,
})

const h4 = basicNode({
  name: 'heading-four',
  element: 'h4',
  icon: <HeadingIcon level={4} />,
})

const h5 = basicNode({
  name: 'heading-five',
  element: 'h5',
  icon: <HeadingIcon level={5} />,
})

const h6 = basicNode({
  name: 'heading-six',
  element: 'h6',
  icon: <HeadingIcon level={6} />,
})

const blockquote = basicNode({
  name: 'blockquote',
  element: 'blockquote',
  icon: <FormatQuote />,
})

const ul = basicNode({
  name: 'unordered-list',
  element: 'ul',
  icon: <FormatListBulleted />,
  showIcon: true,
})

const ol = basicNode({
  name: 'ordered-list',
  element: 'ol',
  icon: <FormatListNumbered />,
})

const li = basicNode({
  name: 'list-item',
  element: 'li',
  icon: <FormatListBulleted />,
})

const pre = basicNode({
  name: 'code-block',
  element: ({ children, ...props }) => (
    <pre {...props}>
      <code>{children}</code>
    </pre>
  ),
  domRecognizer: (el) => el.tagName.toLowerCase() === 'pre',
  icon: <Code />,
})

export default [p, h1, h2, h3, h4, h5, h6, blockquote, ul, ol, li, pre]
