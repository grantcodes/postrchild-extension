import { Editor, Transforms, Range, Point } from 'slate'

/**
 * On space, if it was after an auto-markdown shortcut, convert the current
 * node into the shortcut's corresponding type.
 *
 * @param {Event} event
 * @param {Editor} editor
 */

const MARKDOWN_SHORTCUTS = {
  '*': 'unordered-list',
  '-': 'unordered-list',
  '+': 'unordered-list',
  '>': 'block-quote',
  '#': 'heading-one',
  '##': 'heading-two',
  '###': 'heading-three',
  '####': 'heading-four',
  '#####': 'heading-five',
  '######': 'heading-six',
  '1': 'ordered-list',
  '1.': 'ordered-list',
  '---': 'hr',
  ___: 'hr',
  '***': 'hr',
  '```': 'code-block',
}

const onSpace = (editor) => {
  const { insertText } = editor

  editor.insertText = (text) => {
    const { selection } = editor

    if (text === ' ' && selection && Range.isCollapsed(selection)) {
      const { anchor } = selection
      const block = Editor.above(editor, {
        match: (n) => Editor.isBlock(editor, n),
      })
      const path = block ? block[1] : []
      const start = Editor.start(editor, path)
      const range = { anchor, focus: start }
      const beforeText = Editor.string(editor, range)
      const type = MARKDOWN_SHORTCUTS[beforeText]

      if (type) {
        Transforms.select(editor, range)
        Transforms.delete(editor)

        // Special handling for lists
        if (type === 'ordered-list' || type === 'unordered-list') {
          const list = { type, children: [] }
          Transforms.wrapNodes(editor, list)
          Transforms.setNodes(editor, { type: 'list-item' })
          return
        }

        // Handle hrs

        if (type === 'hr') {
          Transforms.setNodes(editor, { type })
          Transforms.insertNodes(editor, {
            type: 'paragraph',
            children: [{ text: '' }],
          })
          return
        }

        Transforms.setNodes(
          editor,
          { type },
          { match: (n) => Editor.isBlock(editor, n) }
        )

        return
      }
    }

    insertText(text)
  }

  return editor
}

export { MARKDOWN_SHORTCUTS }
export default onSpace
