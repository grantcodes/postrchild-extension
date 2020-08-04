import React from 'react'
import { useStoreState, useStoreActions } from 'easy-peasy'
import { useSlate } from 'slate-react'
import Floater from '../Toolbar/Floater'
import List from './List'

const AutoSuggester = () => {
  const editor = useSlate()
  // Get suggestion store
  const { target, suggestions, shown, currentSuggestion } = useStoreState(
    (state) => state.suggest
  )
  const onSelect = useStoreActions((actions) => actions.suggest.onSelect)

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
