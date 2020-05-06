import React from 'react'
import { useSlate } from 'slate-react'
import Floater from '../Toolbar/Floater'
import List from './List'
import suggestionPlugins from './suggestions'

const AutoSuggester = () => {
  const editor = useSlate()
  const { type, suggestions, target, index } = editor.postrChildAutoSuggest

  if (!target || !type || suggestions.length === 0) {
    return null
  }

  return (
    <Floater vertical="bottom" horizontal="left" target={target}>
      <List
        selectedIndex={index}
        suggestions={suggestions}
        onSelect={(suggestion) =>
          suggestionPlugins
            .find((p) => p.id === type)
            .onSelect({ editor, suggestion })
        }
      />
    </Floater>
  )
}

export default AutoSuggester
