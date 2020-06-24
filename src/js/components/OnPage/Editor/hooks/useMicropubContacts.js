import { useEffect } from 'react'
import { useStoreState, useStoreActions } from 'easy-peasy'
// import micropub from '../../../../modules/micropub'

const useMicropubContacts = (file = null) => {
  const contacts = useStoreState((state) => state.contacts)
  const setContacts = useStoreActions((state) => state.setContacts)

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
