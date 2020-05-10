import browser from 'webextension-polyfill'
import Micropub from 'micropub-helper'

const micropub = new Micropub({
  clientId: 'https://postrchild.com',
  redirectUri: 'https://postrchild.com/auth',
  state: 'This should be a super secret or randomly generated per user',
})

const setOptions = async () => {
  try {
    let store = {}
    if (browser.storage && browser.storage.local && browser.storage.local.get) {
      store = await browser.storage.local.get()
    } else {
      store = await browser.runtime.sendMessage({ action: 'getSettings' })
    }
    micropub.options.me = store.setting_micropubMe
    micropub.options.token = store.setting_micropubToken
    micropub.options.tokenEndpoint = store.setting_tokenEndpoint
    micropub.options.micropubEndpoint = store.setting_micropubEndpoint
    micropub.options.mediaEndpoint = store.setting_mediaEndpoint
    return true
  } catch (err) {
    console.warn('[Error getting micropub options from browser]', err)
  }
}
setOptions()

browser.storage.onChanged.addListener((changes, area) => {
  if (area == 'local') {
    Object.keys(changes).forEach((key) => {
      const value = changes[key].newValue
      if (key.indexOf('setting_') === 0) {
        key = key.replace('setting_', '')
        micropub.options[key] = value
      }
    })
  }
})

/**
 * Loops through a mf2 object and uploads any File objects, replacing them with the returned url.
 *
 * @param {object} mf2 Microformats 2 object with potential File properties
 */
const uploadMf2FilesToMediaEndpoint = async (mf2) => {
  for (const key in mf2.properties) {
    if (mf2.properties.hasOwnProperty(key)) {
      const values = mf2.properties[key]
      let propertyIndex = -1
      for (const value of values) {
        propertyIndex++
        if (typeof value === 'object' && value.constructor === File) {
          // Need to upload file to media endpoint
          try {
            const fileUrl = await micropub.postMedia(value)
            if (!fileUrl) {
              throw Error(
                'No url returned for file uploaded to the media endpoint'
              )
            }
            mf2.properties[key][propertyIndex] = fileUrl
          } catch (err) {
            console.log('[Error uploading to media endpoint]', err)
            throw Error('Error uploading files to media endpoint')
          }
        }
      }
    }
  }
  return mf2
}

export default micropub
export { uploadMf2FilesToMediaEndpoint, setOptions }
