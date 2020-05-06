import { Editor, Transforms, Range, Point } from 'slate'

const onEnter = (editor) => {
  const { insertBreak } = editor

  editor.insertBreak = (...args) => {
    const { selection } = editor

    if (selection && Range.isCollapsed(selection)) {
      const [block, path] = Editor.above(editor, {
        match: (n) => Editor.isBlock(editor, n) || Editor.isMar,
      })
      const mark = Object.keys(Editor.marks(editor))[0] || null

      // Clear mark on enter
      if (mark) {
        Editor.removeMark(editor, mark)
      }

      // Escape list item if hitting enter on an empty item
      if (
        block &&
        block.type === 'list-item' &&
        block.children.length === 1 &&
        block.children[0].text === ''
      ) {
        // Unwrap from list
        Transforms.unwrapNodes(editor, {
          match: (n) => {
            return n.type === 'unordered-list' || n.type === 'ordered-list'
          },
          split: true,
        })
        // Change current li item to paragraph
        Transforms.setNodes(editor, { type: 'paragraph' })
        return
      }

      // Exit out of heading when hitting enter
      if (block && block.type.startsWith('heading-')) {
        // Insert standard break
        insertBreak()
        // Convert new heading block to paragraph
        Transforms.setNodes(editor, { type: 'paragraph' })
        return
      }
    }

    insertBreak(...args)
  }

  return editor
}

export default onEnter
