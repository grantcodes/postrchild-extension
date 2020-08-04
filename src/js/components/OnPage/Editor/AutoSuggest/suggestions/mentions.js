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
    const { supported, contacts, filter } = editor.postrChild.contacts

    const res = {
      match: false,
      target: null,
      suggestions: [],
    }

    if (!supported) {
      return res
    }

    const beforeRange = getBeforeRange(editor)

    if (beforeRange) {
      const beforeText = beforeRange && Editor.string(editor, beforeRange)
      const mentionMatch = beforeText && beforeText.match(/^@(\w+)$/)
      const matchText = mentionMatch ? mentionMatch[1] : null

      // TODO: Not sure this should always be run
      filter(matchText)

      // No match or same target
      res.match = true
      res.target = beforeRange

      res.suggestions = contacts.map((contact, i) => ({
        id: i,
        icon: (
          <img
            style={{ width: '1.5em', height: '1.5em', borderRadius: '50%' }}
            src={contact.photo}
          />
        ),
        text: contact.nickname || contact.name,
        contact,
      }))
    }

    return res
  },

  onSelect: ({ editor, suggestion }) => {
    const target = getBeforeRange(editor)
    Transforms.select(editor, target)
    const mention = {
      type: 'mention',
      contact: suggestion.contact,
      children: [{ text: '' }],
    }
    Transforms.insertNodes(editor, mention)
    Transforms.move(editor)
    editor.postrChild.suggest.reset()
  },
}

export default mentionsSuggestion
