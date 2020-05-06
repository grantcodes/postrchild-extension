import React from 'react'
import { jsx } from 'slate-hyperscript'
import { toggleMark } from '../../helpers'

const required = [
  'name',
  'icon',
  'render',
  'serialize',
  'deserialize',
  'domRecognizer',
]

const basicMark = ({ element: El, ...opts }) => {
  const defaultData = {
    showIcon: false,
    domRecognizer: (el) => el.tagName.toLowerCase() === El.toLowerCase(),
    render: ({ attributes, children }) => <El {...attributes}>{children}</El>,
    serialize: (children) => `<${El}>${children}</${El}>`,
    deserialize: (el, children) => jsx('text', { [opts.name]: true }, children),
    onButtonClick: (editor) => {
      toggleMark(editor, opts.name)
    },
  }
  const data = Object.assign({}, defaultData, opts)

  for (const key of required) {
    if (!data[key]) {
      console.log(data)
      throw new Error(`Mark missing ${key} property`)
    }
  }

  return data
}

export default basicMark
