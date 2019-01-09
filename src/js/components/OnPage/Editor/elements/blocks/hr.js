import React from 'react'
import { MdRemove } from 'react-icons/md'

export default {
  name: 'hr',
  icon: <MdRemove />,
  showIcon: false,
  schema: {
    isVoid: true,
  },
  render: ({ attributes, children }) => <hr {...attributes} />,
  domRecognizer: el => el.tagName.toLowerCase() === 'hr',
  serialize: children => <hr />,
  deserialize: el => ({
    object: 'block',
    type: 'hr',
    data: {
      className: el.getAttribute('class'),
    },
  }),
  onButtonClick: editor => {
    editor
      .moveToEndOfBlock()
      .insertBlock('hr')
      .insertBlock('paragraph')
  },
}
