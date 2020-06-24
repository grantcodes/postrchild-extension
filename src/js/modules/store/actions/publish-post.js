import { thunk } from 'easy-peasy'
import logger from '../../logger'
import notification from '../../notification'
import micropub, { uploadMf2FilesToMediaEndpoint } from '../../micropub'

export default thunk(async (actions, payload, { getState, getStoreState }) => {
  actions.setLoading(true)
  try {
    let { post: mf2 } = getState()
    mf2 = await uploadMf2FilesToMediaEndpoint(mf2)

    for (const key in mf2.properties) {
      if (mf2.properties.hasOwnProperty(key)) {
        const value = mf2.properties[key]
        if (
          !Array.isArray(value) ||
          value.length === 0 ||
          (value.length === 1 && value[0] === '')
        ) {
          // Empty or bad property
          delete mf2.properties[key]
        }
      }
    }

    logger.log('[Creating post]', mf2)

    if (!mf2.properties.content || !mf2.properties.content[0].html) {
      throw new Error('Missing content for post')
    }

    const url = await micropub.create(mf2)

    //   Redirect to new post
    if (typeof url == 'string') {
      window.location.href = url
    } else {
      notification({ message: 'Unable to get the url of your new post' })
      window.location.reload()
    }
    return url
    // actions.addedProduct(payload)
  } catch (err) {
    logger.error('[Error creating post]', err)
    notification({
      title: 'Error creating new post',
      message: err.message || 'Unknown error',
    })
  }
  actions.setLoading(false)
})
