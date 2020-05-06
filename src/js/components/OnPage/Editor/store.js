import { createConnectedStore } from 'undux'

// Create a store with an initial value.
export default createConnectedStore({
  suggestType: null,
  suggestIndex: 0,
  suggestSelection: null,
  target: null,
  contacts: [],
})
