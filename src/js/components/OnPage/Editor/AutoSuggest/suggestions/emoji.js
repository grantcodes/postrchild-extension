import { Editor, Transforms, Range } from 'slate'
import emoji from 'emojilib'

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

const emojiSuggestion = {
  id: 'emoji',

  getSuggestions: ({ editor }) => {
    const res = {
      match: false,
      target: null,
      suggestions: [],
    }
    const beforeRange = getBeforeRange(editor)

    if (beforeRange) {
      const beforeText = beforeRange && Editor.string(editor, beforeRange)
      const emojiMatch = beforeText && beforeText.match(/^:(\w+)$/)
      const matchText = emojiMatch ? emojiMatch[1] : null

      if (!matchText) {
        return res
      }
      res.match = true

      const emojiNames = Object.keys(emoji.lib).filter((name) =>
        name.startsWith(matchText)
      )

      res.target = beforeRange

      res.suggestions = emojiNames.map((name) => ({
        id: name,
        icon: emoji.lib[name].char,
        text: name,
      }))
    }

    return res
  },

  onSelect: ({ editor, suggestion }) => {
    const target = getBeforeRange(editor)
    Transforms.select(editor, target)
    Transforms.insertText(editor, suggestion.icon)
    editor.postrChildAutoSuggestReset(editor)
  },
}

export default emojiSuggestion
