import React from 'react'
import { MdLink } from 'react-icons/md'
import Icon from '../../Toolbar/Icon'

export default {
  name: 'link',
  icon: <MdLink />,
  render: ({ attributes, children, node }) => (
    <a {...attributes} href={node.data.get('href')}>
      {children}
    </a>
  ),
  serialize: (children, obj) => <a href={obj.data.get('href')}>{children}</a>,
  deserialize: (el, next) => ({
    object: 'inline',
    type: 'link',
    data: {
      href: el.getAttribute('href'),
    },
    nodes: next(el.childNodes),
  }),
  onButtonClick: editor => e => {
    e.preventDefault()
    if (editor.query('isLinkActive', editor.value)) {
      editor.command('unwrapLink')
    } else {
      const href = window.prompt('What is the link?')
      if (href) {
        editor.command('wrapLink', href)
      }
    }
  },
}
