import { Editor } from 'slate'
import suggestPlugins from '../AutoSuggest/suggestions'

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

  // Run autosuggestions on text change
  editor.onChange = (...args) => {
    const { type, suggestions, target } = getSuggestions(editor)

    if (type && suggestions && target && suggestions.length) {
      editor.postrChild.suggest.setTarget(target)
      editor.postrChild.suggest.set(
        suggestions.map((suggestion) => ({ ...suggestion, type }))
      )
      editor.postrChild.suggest.show()
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
      editor.postrChild.suggest.reset()
      break
    case 'Escape':
      // TODO: Get escape event working
      console.log('Escape event')
      editor.postrChild.suggest.reset()
      break
    default:
      break
  }
}

export { hoc }
export default keyHandler
