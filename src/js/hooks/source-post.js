import { useEffect } from 'react'
import { useStoreActions } from 'easy-peasy'
import micropub from '../modules/micropub'
import notification from '../modules/notification'
import logger from '../modules/logger'

const sourcePost = () => {
  const setLoading = useStoreActions((actions) => actions.setLoading)
  const setProperties = useStoreActions((actions) => actions.setPostProperties)

  useEffect(() => {
    const didMount = async () => {
      setLoading(true)
      try {
        const post = await micropub.querySource(window.location.href)

        if (post && post.properties) {
          setProperties(post.properties)
        } else {
          throw new Error('No properties returned')
        }
      } catch (err) {
        logger.warn('[Error querying micropub endpoint]', err)
        notification({
          title: 'Error running query source on your post',
          message:
            'Your Micropub endpoint needs to support source queries to edit posts',
        })
      }
      setLoading(false)
    }
    didMount()
  }, [])
}

export default sourcePost
