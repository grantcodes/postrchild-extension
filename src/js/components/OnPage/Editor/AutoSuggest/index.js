import React from 'react'
import { useStoreState, useStoreActions } from 'easy-peasy'
import { useSlate } from 'slate-react'
import Floater from '../Toolbar/Floater'
import List from './List'

const AutoSuggester = () => {
  const editor = useSlate()
  const { target } = editor.postrChild

  // Get suggestion store
  const suggestions = useStoreState((state) => state.suggest.suggestions)
  const shown = useStoreState((state) => state.suggest.shown)
  const onSelect = useStoreActions((actions) => actions.suggest.onSelect)
  const currentSuggestion = useStoreState(
    (state) => state.suggest.currentSuggestion
  )

  if (!target || !shown || suggestions.length === 0) {
    return null
  }

  return (
    <Floater vertical="bottom" horizontal="left" target={target}>
      <List
        selectedIndex={currentSuggestion ? currentSuggestion.index : 0}
        suggestions={suggestions}
        onSelect={({ suggestion }) => onSelect({ suggestion, editor })}
      />
    </Floater>
  )
}

export default AutoSuggester
