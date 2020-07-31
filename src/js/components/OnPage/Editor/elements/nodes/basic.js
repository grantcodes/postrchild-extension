import React from 'react'
import { jsx } from 'slate-hyperscript'
import { toggleBlock } from '../../helpers'

const required = [
  'name',
  'icon',
  'render',
  'serialize',
  'deserialize',
  'domRecognizer',
]

const basicNode = ({ element: El, ...opts }) => {
  const defaultData = {
    showIcon: false,
    render: ({ attributes, children }) => <El {...attributes}>{children}</El>,
    domRecognizer: (el) => el.tagName.toLowerCase() === El.toLowerCase(),
    serialize: (children) => `<${El}>${children}</${El}>`,
    deserialize: (el, children) => {
      if (children.length === 0) {
        children = [{ text: '' }]
      }
      return jsx('element', { type: opts.name }, children)
    },
    onButtonClick: (editor) => {
      toggleBlock(editor, opts.name)
    },
  }

  const data = Object.assign({}, defaultData, opts)

  for (const key of required) {
    if (!data[key]) {
      console.log(data)
      throw new Error(`Node missing ${key} property`)
    }
  }

  return data
}

export default basicNode
