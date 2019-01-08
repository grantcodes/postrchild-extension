import React from 'react'
import Html from 'slate-html-serializer'
import { marks, nodes, blocks, inlines } from './elements/index'

const rules = [
  {
    deserialize(el, next) {
      const type = nodes[el.tagName.toLowerCase()]
      if (type) {
        return type.deserialize(el, next)
      }
    },
    serialize(obj, children) {
      if (obj.object == 'block') {
        const node = Object.values(nodes).find(node => node.name === obj.type)
        if (node) {
          return node.serialize(children, obj)
        }
      }
    },
  },
  // Add a new rule that handles marks...
  {
    deserialize(el, next) {
      const type = el.tagName.toLowerCase()
      if (marks[type]) {
        return marks[type].deserialize(el, next)
      }
    },
    serialize(obj, children) {
      if (obj.object == 'mark') {
        const mark = Object.values(marks).find(mark => mark.name === obj.type)
        if (mark) {
          return mark.serialize(children, obj)
        }
      }
    },
  },
  // Add another for blocks...
  {
    deserialize(el, next) {
      let type = el.tagName.toLowerCase()
      for (const blockName in blocks) {
        if (blocks.hasOwnProperty(blockName)) {
          const block = blocks[blockName]
          if (block.domRecognizer && block.domRecognizer(el)) {
            type = blockName
          }
        }
      }
      if (blocks[type]) {
        return blocks[type].deserialize(el, next)
      }
    },
    serialize(obj, children) {
      if (obj.object == 'block') {
        const block = Object.values(blocks).find(
          block => block.name === obj.type
        )
        if (block) {
          return block.serialize(children, obj)
        }
      }
    },
  },
  // And another for inlines...
  {
    deserialize(el, next) {
      const type = el.tagName.toLowerCase()
      if (inlines[type]) {
        return inlines[type].deserialize(el, next)
      }
    },
    serialize(obj, children) {
      if (obj.object == 'inline') {
        const inline = Object.values(inlines).find(
          inline => inline.name === obj.type
        )
        if (inline) {
          return inline.serialize(children, obj)
        }
      }
    },
  },
]

export default new Html({ rules })
