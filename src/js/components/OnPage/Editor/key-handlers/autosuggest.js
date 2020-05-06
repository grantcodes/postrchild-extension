import { Editor } from 'slate'
import suggestPlugins from '../AutoSuggest/suggestions'

/**
 * Reset the editor.postrChildAutoSuggest object
 * @param {Editor} editor
 */
const reset = (editor) => {
  editor.postrChildAutoSuggest = {
    type: null,
    suggestions: [],
    index: 0,
    shown: false,
    target: null,
  }
  return editor
}

/**
 * Update the editor.postrChildAutoSuggest object by merging in the passed update
 * @param {Editor} editor
 * @param {Object} update
 */
const updateSuggestions = (editor, update) => {
  editor.postrChildAutoSuggest = Object.assign({
    ...editor.postrChildAutoSuggest,
    ...update,
  })
}

/**
 * Get suggestions from suggestion plugins
 * @param {Editor} editor
 */
const getSuggestions = (editor) => {
  for (const plugin of suggestPlugins) {
    const res = plugin.getSuggestions({ editor })

    if (res.match) {
      return {
        type: plugin.id,
        target: res.target,
        suggestions: res.suggestions,
      }
    }
  }
  return { type: null, suggestions: [], target: null }
}

const hoc = (editor) => {
  const { onChange } = editor

  // Define default state variables
  if (!editor.postrChildAutoSuggest) {
    editor = reset(editor)
    editor.postrChildAutoSuggestReset = reset
  }

  // Run autosuggestions on text change
  editor.onChange = (...args) => {
    const { type, suggestions, target } = getSuggestions(editor)

    if (type && suggestions && target && suggestions.length) {
      // Keep index the same if the number of suggestions hasn't changed
      const index =
        suggestions.length === editor.postrChildAutoSuggest.suggestions.length
          ? editor.postrChildAutoSuggest.index
          : 0
      updateSuggestions(editor, {
        type,
        suggestions,
        index,
        target,
        shown: true,
      })
    }

    onChange(args)
  }

  return editor
}

const keyHandler = ({ event, editor }) => {
  const { shown, index, suggestions, type } = editor.postrChildAutoSuggest

  if (shown) {
    // Use a fake event to render the editor again so the autosuggest is updated
    const fakeEvent = () => {
      Editor.addMark(editor, 'postrChildAutoSuggest', true)
      Editor.removeMark(editor, 'postrChildAutoSuggest')
    }

    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault()
        editor.postrChildAutoSuggest.index = index + 1
        fakeEvent()
        break
      }
      case 'ArrowUp': {
        event.preventDefault()
        editor.postrChildAutoSuggest.index = index < 2 ? 0 : index - 1
        fakeEvent()
        break
      }
      case 'Tab':
      case 'Enter':
        event.preventDefault()
        suggestPlugins
          .find((p) => p.id === type)
          .onSelect({ editor, suggestion: suggestions[index] })
        reset(editor)
        fakeEvent()
        break
      case 'Escape':
        // TODO: Get escape event working
        console.log('Escape event')
        event.preventDefault()
        reset(editor)
        fakeEvent()
        break
      default:
        break
    }
  }
}

export { hoc }
export default keyHandler
