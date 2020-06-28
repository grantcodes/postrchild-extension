import { Editor } from 'slate'
import suggestPlugins from '../AutoSuggest/suggestions'

/**
 * Reset the editor.postrChildAutoSuggest object
 * @param {Editor} editor
 */
const reset = (editor) => {
  editor.postrChild.suggest.set([])
  editor.postrChild.suggest.hide()
  editor.postrChildAutoSuggest = {
    type: null,
    target: null,
  }
  return editor
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
      editor.postrChild.suggest.set(
        suggestions.map((suggestion) => ({ ...suggestion, type }))
      )
      editor.postrChild.suggest.show()
      editor.postrChild.target = target
    }

    onChange(args)
  }

  return editor
}

const keyHandler = ({ event, editor }) => {
  switch (event.key) {
    case 'ArrowDown': {
      editor.postrChild.suggest.down({ event, editor })
      break
    }
    case 'ArrowUp': {
      editor.postrChild.suggest.up({ event, editor })
      break
    }
    case 'Tab':
    case 'Enter':
      // event.preventDefault()
      editor.postrChild.suggest.onSelect({ event, editor })
      // suggestPlugins
      //   .find((p) => p.id === type)
      //   .onSelect({ editor, suggestion: suggestions[index] })
      reset(editor)
      break
    case 'Escape':
      // TODO: Get escape event working
      console.log('Escape event')
      editor.postrChild.suggest.reset({ event, editor })
      break
    default:
      break
  }
}

export { hoc }
export default keyHandler
