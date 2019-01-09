import React from 'react'
import { rgba } from 'polished'
// import { MdPerson } from 'react-icons/md'

export default {
  name: 'mention',
  // icon: <MdPerson />,
  icon: null,
  render: ({ attributes, node, isSelected }) => {
    const hCard = node.data.get('hCard')
    return (
      <a
        {...attributes}
        className="h-card"
        href={hCard.properties.url[0]}
        style={isSelected ? { backgroundColor: 'rgba(109,160,255,0.2)' } : null}
      >
        @{hCard.properties.name[0]}
      </a>
    )
  },
  serialize: (children, obj) => {
    const hCard = obj.data.get('hCard')
    return (
      <a className="h-card" href={hCard.properties.url[0]}>
        @{hCard.properties.name[0]}
      </a>
    )
  },
  domRecognizer: el =>
    el.tagName.toLowerCase() === 'a' &&
    el.className === 'h-card' &&
    el.innerText === el.innerHTML,
  deserialize: (el, next) => ({
    object: 'inline',
    type: 'mention',
    data: {
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
    },
    nodes: next(el.childNodes),
  }),
  onButtonClick: editor => null,
}
