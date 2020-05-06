import React from 'react'
import { Remove as HrIcon } from 'styled-icons/material'

export default {
  name: 'hr',
  keywords: ['hr', 'horizontal', 'rule', 'break'],
  icon: <HrIcon />,
  showIcon: false,
  render: ({ attributes, children, element }) => <hr {...attributes} />,
  domRecognizer: (el) => el.tagName.toLowerCase() === 'hr',
  serialize: (children, node) => `<hr />`,
  deserialize: (el) => ({
    type: 'hr',
    children: [{ text: '' }],
  }),
  onButtonClick: (editor) => {
    // TODO: Don't think this will work
    editor.moveToEndOfBlock().insertBlock('hr').insertBlock('paragraph')
  },
}
