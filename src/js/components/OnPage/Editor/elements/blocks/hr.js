import React from 'react'

export default {
  name: 'hr',
  icon: null,
  render: ({ attributes, children }) => <hr {...attributes} />,
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
