import React from 'react'
import { Link as LinkIcon } from 'styled-icons/material'
import { Transforms, Editor, Range } from 'slate'
import { jsx } from 'slate-hyperscript'
import { isUrl } from '../../helpers'

const isLinkActive = (editor) => {
  const [link] = Editor.nodes(editor, { match: (n) => n.type === 'link' })
  return !!link
}

const unwrapLink = (editor) => {
  Transforms.unwrapNodes(editor, { match: (n) => n.type === 'link' })
}

const wrapLink = (editor, href) => {
  if (isLinkActive(editor)) {
    unwrapLink(editor)
  }

  const { selection } = editor
  const isCollapsed = selection && Range.isCollapsed(selection)
  const link = {
    type: 'link',
    href,
    children: isCollapsed ? [{ text: href }] : [],
  }

  if (isCollapsed) {
    Transforms.insertNodes(editor, link)
  } else {
    Transforms.wrapNodes(editor, link, { split: true })
    Transforms.collapse(editor, { edge: 'end' })
  }
}

export default {
  name: 'link',
  icon: <LinkIcon />,
  showIcon: true,
  render: ({ attributes, children, element }) => (
    <a {...attributes} href={element.href}>
      {children}
    </a>
  ),
  domRecognizer: (el) => el.tagName.toLowerCase() === 'a',
  serialize: (children, node) =>
    children ? `<a href="${node.href}">${children}</a>` : '',
  deserialize: (el, children) =>
    jsx('element', { type: 'link', href: el.getAttribute('href') }, children),
  onButtonClick: (editor) => {
    if (isLinkActive(editor)) {
      unwrapLink(editor)
    } else {
      const href = window.prompt('What is the link?')
      if (href) {
        wrapLink(editor, href)
      }
    }
  },
  hoc: (editor) => {
    const { insertData, insertText, isInline } = editor

    editor.isInline = (element) => {
      return element.type === 'link' ? true : isInline(element)
    }

    // Auto link pasted urls

    editor.insertText = (text) => {
      if (text && isUrl(text)) {
        wrapLink(editor, text)
      } else {
        insertText(text)
      }
    }

    editor.insertData = (data) => {
      const text = data.getData('text/plain')

      if (text && isUrl(text)) {
        wrapLink(editor, text)
      } else {
        insertData(data)
      }
    }

    return editor
  },
}
