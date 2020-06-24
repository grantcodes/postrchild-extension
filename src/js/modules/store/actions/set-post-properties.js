import browser from 'webextension-polyfill'
import { action } from 'easy-peasy'
import logger from '../../logger'

const setPostProperties = action((state, properties) => {
  const newProperties = { ...state.post.properties, ...properties }
  // TODO: Validate this cache when creating
  // browser.storage.local
  //   .set({ newPostCache: newProperties })
  //   .catch((err) => logger.warn('Error setting post cache', err))
  state.post.properties = newProperties
})

export default setPostProperties
