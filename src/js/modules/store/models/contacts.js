import { action, thunk } from 'easy-peasy'
import micropub from '../../micropub'
import logger from '../../logger'

// Create a store with an initial value.
export default {
  supported: null,
  contacts: [],
  setSupported: action((state, supported) => {
    state.supported = supported
  }),
  reset: action((state, { event, editor }) => {
    state.contacts = []
  }),
  setContacts: action((state, contacts) => {
    state.contacts = contacts
  }),
  init: thunk(async (actions, payload) => {
    try {
      const res = await micropub.query('contact')
      if (res.contacts && res.contacts.length) {
        actions.setContacts(res.contacts)
        actions.setSupported(true)
      } else {
        actions.setSupported(false)
      }
    } catch (err) {
      logger.log('Error initializing contacts', err)
      actions.setSupported(false)
    }
  }),
  filter: thunk(async (actions, filter) => {
    try {
      // TODO: This isn't supported in micropub-helper yet
      const res = await micropub.query('contact', { filter })
      if (res.contacts) {
        actions.setContacts(res.contacts)
      }
    } catch (err) {
      logger.log('Error getting filtered contacts', err)
    }
  }),
}
