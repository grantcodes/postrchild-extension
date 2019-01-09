import React from 'react'
const basicMark = (name, El, icon) => {
  const data = {
    name,
    icon,
    render: ({ attributes, children }) => <El {...attributes}>{children}</El>,
    serialize: children => <El>{children}</El>,
    deserialize: (el, next) => ({
      object: 'mark',
      type: name,
      nodes: next(el.childNodes),
    }),
    onButtonClick: editor => {
      editor.toggleMark(name)
    },
  }
  return data
}

export default basicMark
