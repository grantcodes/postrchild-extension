import React from 'react'

const DEFAULT_NODE_NAME = 'paragraph'

const basicNode = (name, El, icon) => {
  const data = {
    name,
    icon,
    render: ({ attributes, children }) => <El {...attributes}>{children}</El>,
    serialize: children => <El>{children}</El>,
    deserialize: (el, next) => ({
      object: 'block',
      type: name,
      data: {
        className: el.getAttribute('class'),
      },
      nodes: next(el.childNodes),
    }),
    onButtonClick: editor => e => {
      e.preventDefault()
      const { value } = editor
      const { document } = value

      const hasBlock = type => {
        if (!editor) {
          return null
        }
        const { value } = editor
        return value.blocks.some(node => node.type == type)
      }

      // Handle everything but the wrapping nodes.
      if (name !== 'ordered-list' && name !== 'unordered-list') {
        const isActive = hasBlock(name)
        const isList = hasBlock('list-item')

        if (isList) {
          editor
            .setBlocks(isActive ? DEFAULT_NODE_NAME : name)
            .unwrapBlock('ordered-list')
            .unwrapBlock('unordered-list')
        } else {
          editor.setBlocks(isActive ? DEFAULT_NODE_NAME : name)
        }
      } else {
        // Handle the extra wrapping required for list buttons.
        const isList = hasBlock('list-item')
        const isType = value.blocks.some(block => {
          return !!document.getClosest(block.key, parent => parent.name == name)
        })

        if (isList && isType) {
          editor
            .setBlocks(DEFAULT_NODE_NAME)
            .unwrapBlock('ordered-list')
            .unwrapBlock('unordered-list')
        } else if (isList) {
          editor
            .unwrapBlock(
              name == 'unordered-list' ? 'ordered-list' : 'unordered-list'
            )
            .wrapBlock(name)
        } else {
          editor.setBlocks('list-item').wrapBlock(name)
        }
      }
    },
  }
  return data
}

export default basicNode
