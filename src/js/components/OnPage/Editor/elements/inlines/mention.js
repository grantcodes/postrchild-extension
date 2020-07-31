import React from 'react'
import { useEditor, useSelected } from 'slate-react'
import { Person as MentionIcon } from 'styled-icons/material'
import { updateElement } from '../../helpers'

const Mention = ({ attributes, element, children }) => {
  const selected = useSelected()

  const { url, nickname, name } = element.contact

  return (
    <a
      {...attributes}
      className="h-card"
      href={url}
      style={selected ? { backgroundColor: 'rgba(109,160,255,0.2)' } : {}}
      onClick={(e) => {
        // Don't allow mentions to be clicked in the editor
        e.preventDefault()
      }}
      contentEditable={false}
    >
      @{nickname || name}
    </a>
  )
}

export default {
  name: 'mention',
  icon: <MentionIcon />,
  showIcon: false,
  render: Mention,
  serialize: (children, element) => {
    const { url, name, nickname } = element.contact
    return `<a className="h-card" href="${url}">@${nickname || name}</a>`
  },
  domRecognizer: (el) =>
    el.tagName.toLowerCase() === 'a' &&
    el.className === 'h-card' &&
    el.innerText === el.innerHTML,
  deserialize: (el, children) => ({
    type: 'mention',
    contact: {
      url: el.href,
      name: el.innerText.startsWith('@')
        ? el.innerText.substring(1)
        : el.innerText,
    },
    children: [{ text: '' }],
  }),
  onButtonClick: (editor) => null,
  hoc: (editor) => {
    const { isInline, isVoid } = editor

    editor.isInline = (element) => {
      return element.type === 'mention' ? true : isInline(element)
    }

    editor.isVoid = (element) => {
      return element.type === 'mention' ? true : isVoid(element)
    }

    return editor
  },
}
