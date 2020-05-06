import { useEffect } from 'react'
import Store from '../store'
import micropub from '../../../../modules/micropub'

const useMicropubContacts = (file = null) => {
  const store = Store.useStore()
  const contacts = store.get('contacts')
  const setContacts = store.set('contacts')

  useEffect(() => {
    const getContacts = async () => {
      try {
        // TODO: Use micropub contacts instead
        const url = 'http://indieweb-directory.glitch.me/api/hcards'
        const res = await fetch(url)
        const directoryContacts = await res.json()
        if (directoryContacts && directoryContacts.length) {
          setContacts(directoryContacts)
        }
      } catch (err) {
        console.error('Error getting contacts', err)
      }
    }

    if (!contacts.length) {
      getContacts()
    }
  }, [contacts.length, setContacts])

  return contacts
}

export default useMicropubContacts
