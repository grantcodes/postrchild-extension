import React from 'react'
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
    domRecognizer: el => el.tagName.toLowerCase() === El.toLowerCase(),
    render: ({ attributes, children }) => <El {...attributes}>{children}</El>,
    serialize: children => <El>{children}</El>,
    deserialize: (el, next) => ({
      object: 'mark',
      type: opts.name,
      nodes: next(el.childNodes),
    }),
    onButtonClick: editor => {
      editor.toggleMark(opts.name)
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
