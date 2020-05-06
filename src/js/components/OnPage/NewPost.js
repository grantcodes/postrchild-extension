import browser from 'webextension-polyfill'
import React, { Fragment, useState, useEffect } from 'react'
import Popout from './Popout'
import PopoutForm from './PopoutForm'
import FloatingActions from './FloatingActions'
import EditorPortal from './EditorPortal'
import micropub, { uploadMf2FilesToMediaEndpoint } from '../../modules/micropub'
import * as templateUtils from '../../modules/template-utils'
import notification from '../../modules/notification'

const baseProperties = {
  'mp-slug': [],
  summary: [],
  featured: [],
  photo: [],
  'mp-syndicate-to': [],
  visibility: [],
  'post-status': [],
}

const NewPost = ({ titleEl, contentEl, photoEl }) => {
  const [initialLoad, setInitialLoad] = useState(true)
  const [loading, setLoading] = useState(true)
  const [popoutOpen, setPopoutOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [properties, setProperties] = useState(baseProperties)
  const [syndicationProviders, setSyndicationProviders] = useState([])

  // TODO: Initial loading stuff can probably use react suspense
  useEffect(() => {
    const didMount = async () => {
      try {
        if (!micropub.options.mediaEndpoint) {
          const config = await micropub.query('config')
          if (config['media-endpoint']) {
            micropub.options.mediaEndpoint = config['media-endpoint']
          }
        }

        const res = await micropub.query('syndicate-to')
        if (res['syndicate-to']) {
          const syndicationProviders = res['syndicate-to']
          setSyndicationProviders(syndicationProviders)
        }

        const store = await browser.storage.local.get('newPostCache')
        if (store.newPostCache) {
          console.log('[Loading from cache]', store.newPostCache)
          if (store.newPostCache.title) {
            setTitle(store.newPostCache.title)
          }
          if (
            store.newPostCache.content &&
            store.newPostCache.content !== '<p></p>'
          ) {
            setContent(store.newPostCache.content)
          }
          if (store.newPostCache.properties) {
            setProperties(store.newPostCache.properties)
          }
        }
      } catch (err) {
        console.warn('[Error querying micropub endpoint]', err)
      }
      setInitialLoad(false)
      setLoading(false)
    }
    didMount()
  }, [])

  useEffect(() => {
    if (
      title ||
      (content && content !== '<p></p>') ||
      properties !== baseProperties
    ) {
      browser.storage.local.set({
        newPostCache: {
          title,
          content,
          properties,
        },
      })
    }
  }, [properties, content, title])

  const handleSubmit = async () => {
    setLoading(true)
    try {
      let mf2 = { type: ['h-entry'], properties: { ...properties } }
      mf2 = await uploadMf2FilesToMediaEndpoint(mf2)

      if (title) {
        mf2.properties.name = [title]
      }

      if (content) {
        mf2.properties.content = [{ html: content }]
      }

      for (const key in mf2.properties) {
        if (mf2.properties.hasOwnProperty(key)) {
          const value = mf2.properties[key]
          if (!Array.isArray(value) || value.length === 0) {
            // Empty or bad property
            delete mf2.properties[key]
          }
        }
      }

      const url = await micropub.create(mf2)

      // Clear cache
      browser.storage.local.remove('newPostCache')

      if (typeof url == 'string') {
        window.location.href = url
      } else {
        notification({ message: 'Unable to get the url of your new post' })
        window.location.reload()
      }
    } catch (err) {
      console.error('[Error creating post]', err)
      notification({ title: 'Error creating new post', message: err.message })
    }
    setLoading(false)
  }

  return (
    <Fragment>
      <FloatingActions
        loading={loading || initialLoad}
        onPublish={handleSubmit}
        onClose={async () => {
          await browser.storage.local.remove('newPostCache')
          window.location.reload()
        }}
        onOptions={() => setPopoutOpen(true)}
      />

      {!initialLoad && (
        <Fragment>
          <Popout open={popoutOpen} onClose={() => setPopoutOpen(false)}>
            <PopoutForm
              properties={properties}
              onChange={setProperties}
              syndication={syndicationProviders}
            />
          </Popout>

          <EditorPortal
            el={titleEl}
            onChange={setTitle}
            placeholder="Title..."
            rich={false}
            // value={title}
          />

          <EditorPortal
            el={contentEl}
            onChange={setContent}
            // value={content}
            rich={true}
            autoFocus
          />
        </Fragment>
      )}
    </Fragment>
  )
}

export default NewPost
