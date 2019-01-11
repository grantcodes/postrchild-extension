import Html from 'slate-html-serializer'
import { marks, nodes, blocks, inlines } from './elements/index'

// Put in this order so the complicated stuff is handled first
const allElements = [...blocks, ...inlines, ...nodes, ...marks]

const rules = [
  {
    deserialize(el, next) {
      for (const element of allElements) {
        if (element.domRecognizer(el)) {
          return element.deserialize(el, next)
        }
      }
    },
    serialize(obj, children) {
      let searchElements = []
      switch (obj.object) {
        case 'block':
          searchElements = [...blocks, ...nodes]
          break
        case 'mark':
          searchElements = marks
          break
        case 'inline':
          searchElements = inlines
          break
        default:
          break
      }
      const node = Object.values(searchElements).find(
        node => node.name === obj.type
      )
      if (node) {
        return node.serialize(children, obj)
      }
    },
  },
]

export default new Html({ rules })
