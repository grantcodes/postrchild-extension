import browser from 'webextension-polyfill'
import { useEffect } from 'react'
import { useStoreState, useStoreActions } from 'easy-peasy'
import logger from '../modules/logger'

const getInitialPost = () => {
  const setLoading = useStoreActions((actions) => actions.setLoading)
  const setProperties = useStoreActions((actions) => actions.setPostProperties)
  const properties = useStoreState((state) => state.post.properties)

  useEffect(() => {
    const didMount = async () => {
      setLoading(true)
      try {
        // Get post from local store
        const store = await browser.storage.local.get('newPostPropertiesCache')
        if (store.newPostPropertiesCache) {
          logger.log('[Loading from cache]', store.newPostPropertiesCache)
          setProperties(store.newPostPropertiesCache)
        }

        // Get properties from query params
        const params = new URLSearchParams(window.location.search)
        for (const key in properties) {
          const value = params.getAll(key)
          if (Array.isArray(value) && value.length) {
            logger.log(`Setting ${key} from url`, value)
            setProperties({ [key]: value })
          }
        }
      } catch (err) {
        logger.warn('[Error querying micropub endpoint]', err)
      }
      setLoading(false)
    }
    didMount()
  }, [])
}

export default getInitialPost
