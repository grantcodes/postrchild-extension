import { Editor, Transforms, Range, Point, Node } from 'slate'

const onBackspace = (editor) => {
  const { deleteBackward } = editor

  editor.deleteBackward = (...args) => {
    const { selection } = editor

    if (selection && Range.isCollapsed(selection)) {
      const match = Editor.above(editor, {
        match: (n) => Editor.isBlock(editor, n),
      })

      if (match) {
        const [block, path] = match
        const start = Editor.start(editor, path)

        if (
          block.type !== 'paragraph' &&
          Point.equals(selection.anchor, start)
        ) {
          if (block.type === 'list-item') {
            const parent = Node.parent(editor, path)
            const [listParent, listParentPath] = Editor.above(editor, {
              match: (n) =>
                n.type === 'unordered-list' || n.type === 'ordered-list',
            })
            console.log('Want to jump back to parent list', {
              block,
              path,
              start,
              selection,
              listParent,
            })

            Transforms.unwrapNodes(editor, {
              match: (n) =>
                n.type === 'unordered-list' || n.type === 'ordered-list',
              split: true,
            })
            if (
              parent &&
              (parent.type === 'unordered-list' ||
                parent.type === 'ordered-list')
            ) {
              Transforms.setNodes(editor, { type: 'list-item' })
            } else {
              Transforms.setNodes(editor, { type: 'paragram' })
            }
            return
          }

          Transforms.setNodes(editor, { type: 'paragraph' })
          return
        }
      }

      deleteBackward(...args)
    }
  }

  return editor
}

export default onBackspace
