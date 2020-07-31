import browser from 'webextension-polyfill'
import React, { useState, useEffect, useCallback } from 'react'
import { useStoreState, useStoreActions } from 'easy-peasy'
import Popout from './Popout'
import PopoutForm from './PopoutForm'
import FloatingActions from './FloatingActions'
import EditorPortal from './EditorPortal'
import useLoadInitialPost from '../../hooks/load-initial-post'
import micropub from '../../modules/micropub'
import notification from '../../modules/notification'
import logger from '../../modules/logger'

const NewPost = ({ titleEl, contentEl, photoEl }) => {
  useLoadInitialPost()
  const [initialLoad, setInitialLoad] = useState(true)
  const [popoutOpen, setPopoutOpen] = useState(false)
  const [syndicationProviders, setSyndicationProviders] = useState([])

  const loading = useStoreState((state) => state.loading)
  const setLoading = useStoreActions((actions) => actions.setLoading)
  const setProperties = useStoreActions((actions) => actions.setPostProperties)
  const post = useStoreState((state) => state.post)
  const properties = useStoreState((state) => state.post.properties)
  const publishPost = useStoreActions((actions) => actions.publishPost)
  const content =
    properties.content && properties.content[0] && properties.content[0].html
      ? properties.content[0].html
      : ''
  const title = properties.name ? properties.name[0] : ''

  // TODO: Initial loading stuff can probably use react suspense
  useEffect(() => {
    const didMount = async () => {
      try {
        // Get media endpoint
        if (!micropub.options.mediaEndpoint) {
          const config = await micropub.query('config')
          if (config['media-endpoint']) {
            micropub.options.mediaEndpoint = config['media-endpoint']
          }
        }

        // Get syndication options
        const res = await micropub.query('syndicate-to')
        if (res['syndicate-to']) {
          const syndicationProviders = res['syndicate-to']
          setSyndicationProviders(syndicationProviders)
        }
      } catch (err) {
        logger.warn('[Error querying micropub endpoint]', err)
      }
      setInitialLoad(false)
      setLoading(false)
    }
    didMount()
  }, [])

  const handleSubmit = useCallback(async () => {
    setLoading(true)
    try {
      await publishPost()
      // Clear cache
      browser.storage.local.remove('newPostPropertiesCache')

      if (typeof url == 'string') {
        window.location.href = url
      } else {
        notification({ message: 'Unable to get the url of your new post' })
        window.location.reload()
      }
    } catch (err) {
      logger.error('[Error creating post]', err)
      notification({
        title: 'Error creating new post',
        message: err.message || 'Unknown error',
      })
    }
    setLoading(false)
  }, [post])

  // Cache properties when creating a new post
  useEffect(() => {
    // But only store properties with values
    const newPostPropertiesCache = {}
    for (const key in properties) {
      if (properties.hasOwnProperty(key)) {
        const value = properties[key]
        if (
          Array.isArray(value) &&
          typeof value[0] !== 'undefined' &&
          value[0] !== ''
        ) {
          newPostPropertiesCache[key] = value
        }
      }
    }

    if (Object.keys(newPostPropertiesCache).length) {
      browser.storage.local.set({ newPostPropertiesCache })
    } else {
      browser.storage.local.remove('newPostPropertiesCache')
    }
  }, [properties])

  const popoutProperties = { ...properties }
  delete popoutProperties.name
  delete popoutProperties.content

  return (
    <>
      <FloatingActions
        loading={loading || initialLoad}
        onPublish={handleSubmit}
        onClose={async () => {
          await browser.storage.local.remove('newPostPropertiesCache')
          window.location.reload()
        }}
        onOptions={() => setPopoutOpen(true)}
      />

      {!initialLoad && (
        <>
          <Popout open={popoutOpen} onClose={() => setPopoutOpen(false)}>
            <PopoutForm
              properties={popoutProperties}
              onChange={setProperties}
              syndication={syndicationProviders}
            />
          </Popout>

          <EditorPortal
            el={titleEl}
            onChange={(newTitle) => setProperties({ name: [newTitle] })}
            placeholder="Title..."
            rich={false}
            value={title}
          />

          <EditorPortal
            el={contentEl}
            onChange={(newContent) =>
              setProperties({ content: [{ html: newContent }] })
            }
            value={content}
            rich={true}
            onSubmit={handleSubmit}
            autoFocus
          />
        </>
      )}
    </>
  )
}

export default NewPost
