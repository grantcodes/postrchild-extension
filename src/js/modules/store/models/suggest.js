import { action, thunk } from 'easy-peasy'
import suggestionPlugins from '../../../components/OnPage/Editor/AutoSuggest/suggestions'

// Create a store with an initial value.
export default {
  shown: false,
  suggestions: [],
  currentSuggestion: null,
  show: action((state) => {
    state.shown = true
  }),
  hide: action((state) => {
    state.shown = false
    state.suggestions = []
  }),
  up: action((state, { event, editor }) => {
    if (state.shown) {
      event.preventDefault()
      const newIndex = state.currentSuggestion
        ? state.currentSuggestion.index - 1
        : 0
      if (state.suggestions[newIndex]) {
        state.currentSuggestion = {
          id: state.suggestions[newIndex].id,
          index: newIndex,
        }
      }
    }
  }),
  down: action((state, { event, editor }) => {
    if (state.shown) {
      event.preventDefault()
      const newIndex = state.currentSuggestion
        ? state.currentSuggestion.index + 1
        : 0
      if (state.suggestions[newIndex]) {
        state.currentSuggestion = {
          id: state.suggestions[newIndex].id,
          index: newIndex,
        }
      }
    }
  }),
  reset: action((state, { event, editor }) => {
    state.suggestions = []
    state.shown = false
    state.currentSuggestion = null
  }),
  set: action((state, suggestions) => {
    if (suggestions.length === 0) {
      state.currentSuggestion = null
      state.shown = false
    } else if (!state.currentSuggestion && suggestions[0].id) {
      state.currentSuggestion = { id: suggestions[0].id, index: 0 }
    } else {
      if (suggestions[state.currentSuggestion.index]) {
        state.currentSuggestion.id =
          suggestions[state.currentSuggestion.index].id
      } else {
        state.currentSuggestion = { id: suggestions[0].id, index: 0 }
      }
    }

    state.suggestions = suggestions
  }),
  onSelect: thunk(
    async (actions, { suggestion, event, editor }, { getState }) => {
      const { currentSuggestion, suggestions, shown } = getState()
      if (shown) {
        if (event) {
          event.preventDefault()
        }
        const res = suggestion
          ? suggestion
          : suggestions.find((s) => s.id === currentSuggestion.id)
        actions.set([])
        actions.hide()
        suggestionPlugins
          .find((p) => p.id === res.type)
          .onSelect({ editor, suggestion: res })
      }
    }
  ),
}
