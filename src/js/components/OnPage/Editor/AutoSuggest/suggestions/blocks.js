import { Editor, Transforms, Range } from 'slate'
import blocks from '../../elements/blocks'
import { isBlockActive, toggleBlock } from '../../helpers'

const getBeforeRange = (editor) => {
  const { selection } = editor

  if (selection && Range.isCollapsed(selection)) {
    const [start] = Range.edges(selection)
    const wordBefore = Editor.before(editor, start, { unit: 'word' })
    const before = wordBefore && Editor.before(editor, wordBefore)
    const beforeRange = before && Editor.range(editor, before, start)

    return beforeRange
  }
  return null
}

const blocksSuggestion = {
  id: 'blocks',

  getSuggestions: ({ editor }) => {
    const { selection } = editor
    const res = {
      match: false,
      target: null,
      suggestions: [],
    }

    const beforeRange = getBeforeRange(editor)

    if (beforeRange) {
      const [start, end] = Range.edges(selection)
      const wordBefore = Editor.before(editor, start, { unit: 'word' })
      const before = wordBefore && Editor.before(editor, wordBefore)
      const beforeText = beforeRange && Editor.string(editor, beforeRange)
      const blockMatch = beforeText && beforeText.match(/^\/(\w+)$/)
      const matchText = blockMatch ? blockMatch[1] : null

      // Only show block suggestions when inside a blank paragraph
      if (
        !matchText ||
        before.offset !== 0 ||
        !isBlockActive(editor, 'paragraph')
      ) {
        return res
      }

      const wordAfter = Editor.after(editor, start, { unit: 'word' })
      const after = wordAfter && Editor.before(editor, wordAfter)
      const afterRange = after && Editor.range(editor, after, end)
      const afterText = afterRange && Editor.string(editor, afterRange)

      if (afterText) {
        return res
      }
      res.match = true

      res.target = beforeRange

      res.suggestions = blocks
        .filter((b) => b.showIcon && b.keywords)
        .filter((b) =>
          b.keywords.find((keyword) =>
            keyword.startsWith(matchText.toLowerCase())
          )
        )
        .map((b) => ({
          id: b.name,
          icon: b.icon,
          text: b.name,
        }))
    }

    return res
  },

  onSelect: ({ editor, suggestion }) => {
    const block = blocks.find((b) => b.name === suggestion.id)
    const target = getBeforeRange(editor)
    Transforms.select(editor, target)
    Transforms.removeNodes(editor)
    block.onButtonClick(editor)
    editor.postrChild.suggest.reset()
  },
}

export default blocksSuggestion
