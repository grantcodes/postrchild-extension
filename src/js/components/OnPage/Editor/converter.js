// import { jsx } from 'slate-hyperscript'
// import escapeHtml from 'escape-html'
import { Node, Text } from 'slate'
import { jsx } from 'slate-hyperscript'
import { marks, nodes, blocks, inlines } from './elements/index'
import logger from '../../../modules/logger'

// Put in this order so the complicated stuff is handled first
const allElements = [...blocks, ...inlines, ...nodes, ...marks]
// logger.log({ allElements })

// const rules = [
//   {
//     deserialize(el, next) {
//       if (el && el.tagName) {
//         for (const element of allElements) {
//           if (element.domRecognizer(el)) {
//             return element.deserialize(el, next)
//           }
//         }
//       }
//     },
//     serialize(obj, children) {
//       let searchElements = []
//       switch (obj.object) {
//         case 'block':
//           searchElements = [...blocks, ...nodes]
//           break
//         case 'mark':
//           searchElements = marks
//           break
//         case 'inline':
//           searchElements = inlines
//           break
//         default:
//           break
//       }
//       const node = Object.values(searchElements).find(
//         node => node.name === obj.type
//       )
//       if (node) {
//         return node.serialize(children, obj)
//       }
//     },
//   },
// ]

// export default new Html({ rules })

const deserialize = (el) => {
  if (typeof el === 'string') {
    const div = document.createElement('div')
    div.innerHTML = el
    el = div
    logger.log('children', el, el.childNodes)
  }

  // logger.log('deserializing', el)

  if (el.nodeType === 3) {
    return el.textContent
  } else if (el.nodeType !== 1) {
    logger.warn('Unknown node type', el)
    return null
  }

  const children = Array.from(el.childNodes).map(deserialize)

  if (el && el.nodeName) {
    for (const element of allElements) {
      if (element.domRecognizer(el)) {
        const node = element.deserialize(el, children)
        // logger.log('Recognized & deserialized as element', element, node)
        return node
      }
    }
  }

  if (el.nodeName === 'DIV') {
    return jsx('fragment', {}, children)
  }

  logger.log('Not recognized', el)

  return null
}

const serialize = (node) => {
  // logger.log('serializing node', node)
  // First check if array of things to serialize
  if (Array.isArray(node)) {
    // Serialize each item and join as a string
    return node.map(serialize).join('')
  }

  // Handle plain text & marks
  if (Text.isText(node)) {
    // Check for marks
    for (const key in node) {
      const mark = marks.find((m) => m.name === key)
      if (mark) {
        return mark.serialize(node.text, node)
      }
    }

    // Serialize as plain text
    return node.text
  }

  // Serialize node children
  const children = node.children.map(serialize).join('')

  // Find element and serialize it
  const item = Object.values(allElements).find(
    (item) => item.name === node.type
  )
  if (item) {
    return item.serialize(children, node)
  }

  logger.warn('[Unable to serialize node]', node)
  return null
}

export { serialize, deserialize }
