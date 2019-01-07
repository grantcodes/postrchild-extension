import React, { Fragment } from 'react'
import { MdTitle, MdFormatListBulleted } from 'react-icons/md'
import basicNode from './basic'

const HeadingIcon = ({ level }) => (
  <Fragment>
    <MdTitle />
    <span
      style={{
        fontSize: 11,
        fontWeight: 'bold',
        lineHeight: 1,
        marginLeft: -4,
        verticalAlign: 'text-bottom',
      }}
    >
      {level}
    </span>
  </Fragment>
)

export const p = basicNode('paragraph', 'p', null)
export const h1 = basicNode('heading-one', 'h1', null)
export const h2 = basicNode('heading-two', 'h2', <HeadingIcon level={2} />)
export const h3 = basicNode('heading-three', 'h3', <HeadingIcon level={3} />)
export const h4 = basicNode('heading-four', 'h4', null)
export const h5 = basicNode('heading-five', 'h5', null)
export const blockquote = basicNode('blockquote', 'blockquote', null)
export const ul = basicNode('unordered-list', 'ul', <MdFormatListBulleted />)
export const ol = basicNode('ordered-list', 'ol', null)
export const li = basicNode('list-item', 'li', null)
export const pre = basicNode(
  'code-block',
  ({ children, ...props }) => (
    <pre {...props}>
      {children}
      <code />
    </pre>
  ),
  null
)
