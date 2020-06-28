import React from 'react'
import { useEditor, useSelected } from 'slate-react'
import { Person as MentionIcon } from 'styled-icons/material'
import { updateElement } from '../../helpers'

const Mention = ({ attributes, element, children }) => {
  const selected = useSelected()

  const { hCard } = element

  return (
    <a
      {...attributes}
      className="h-card"
      href={hCard.properties.url[0]}
      style={selected ? { backgroundColor: 'rgba(109,160,255,0.2)' } : {}}
      onClick={(e) => {
        // Don't allow mentions to be clicked in the editor
        e.preventDefault()
      }}
      contentEditable={false}
    >
      @{hCard.properties.name[0]}
    </a>
  )
}

export default {
  name: 'mention',
  icon: <MentionIcon />,
  showIcon: false,
  render: Mention,
  serialize: (children, element) => {
    const { url, name } = element.hCard.properties
    return `<a className="h-card" href="${url[0]}">@${name[0]}</a>`
  },
  domRecognizer: (el) =>
    el.tagName.toLowerCase() === 'a' &&
    el.className === 'h-card' &&
    el.innerText === el.innerHTML,
  deserialize: (el, children) => ({
    type: 'mention',
    hCard: {
      type: ['h-card'],
      properties: {
        url: [el.href],
        name: [
          el.innerText.startsWith('@')
            ? el.innerText.substring(1)
            : el.innerText,
        ],
      },
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
