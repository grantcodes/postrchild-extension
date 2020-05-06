import React from 'react'
import { Editor, Transforms, Range } from 'slate'

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

const mentionsSuggestion = {
  id: 'mentions',

  getSuggestions: ({ editor }) => {
    const { selection } = editor
    const res = {
      match: false,
      target: null,
      suggestions: [],
    }

    const beforeRange = getBeforeRange(editor)

    if (beforeRange) {
      const beforeText = beforeRange && Editor.string(editor, beforeRange)
      const mentionMatch = beforeText && beforeText.match(/^@(\w+)$/)
      const matchText = mentionMatch ? mentionMatch[1] : null

      // No match or same target
      if (!matchText) {
        return res
      }
      res.match = true

      res.target = beforeRange

      // const contacts = store.get("contacts");
      // TODO: Get contacts
      const contacts = []

      res.suggestions = contacts
        .filter((c) => c.properties && c.properties.name && c.properties.url) // Only contacts with names + urls
        // Search by name & url
        .filter(
          (c) =>
            c.properties.name[0]
              .toLowerCase()
              .includes(matchText.toLowerCase()) ||
            c.properties.url[0].toLowerCase().includes(matchText.toLowerCase())
        )
        .map((hCard, i) => ({
          id: i,
          icon: (
            <img
              style={{ width: '1.5em', height: '1.5em', borderRadius: '50%' }}
              src={hCard.properties.photo[0]}
            />
          ),
          text: hCard.properties.name[0],
          hCard,
        }))
    }

    return res
  },

  onSelect: ({ editor, suggestion }) => {
    const target = getBeforeRange(editor)
    Transforms.select(editor, target)
    const mention = {
      type: 'mention',
      hCard: suggestion.hCard,
      children: [{ text: '' }],
    }
    Transforms.insertNodes(editor, mention)
    Transforms.move(editor)
    editor.postrChildAutoSuggestReset()
  },
}

export default mentionsSuggestion
