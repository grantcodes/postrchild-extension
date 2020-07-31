import { useEffect } from 'react'
import { useStoreState, useStoreActions } from 'easy-peasy'

const useContacts = (shouldInit = false) => {
  const contactsState = useStoreState((state) => ({
    supported: state.contacts.supported,
    contacts: state.contacts.contacts,
  }))
  const contactsInit = useStoreActions((actions) => actions.contacts.init)
  const contactsFilter = useStoreActions((actions) => actions.contacts.filter)
  const contacts = {
    init: contactsInit,
    filter: contactsFilter,
    ...contactsState,
  }

  // Initialize the contacts store
  useEffect(() => {
    if (shouldInit && contactsState.supported === null) {
      contactsInit()
    }
  }, [contactsInit, shouldInit])

  return contacts
}

export default useContacts
