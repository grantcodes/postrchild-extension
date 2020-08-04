import React, { useState, useEffect, useCallback } from 'react'
import Popout from './Popout'
import FloatingActions from './FloatingActions'
import PopoutForm from './PopoutForm'
import EditorPortal from './EditorPortal'
import isEqual from 'lodash.isequal'
import notification from '../../modules/notification'
import { useStoreState, useStoreActions } from 'easy-peasy'
import useSourcePost from '../../hooks/source-post'
import micropub from '../../modules/micropub'
import logger from '../../modules/logger'

const formatContent = (properties) => {
  let content = ''
  if (properties.content && properties.content[0]) {
    content = properties.content[0]
    if (typeof content === 'string') {
      content = `<p>${content}</p>`
    } else if (typeof content === 'object') {
      content = content.html || `<p>${content.value}</p>`
    }
  }
  return content
}

const EditPost = ({ titleEl, contentEl, photoEl }) => {
  useSourcePost(window.location.href)
  const [initialLoad, setInitialLoad] = useState(true)
  const [popoutOpen, setPopoutOpen] = useState(false)

  const loading = useStoreState((state) => state.loading)
  const setLoading = useStoreActions((actions) => actions.setLoading)
  const setProperties = useStoreActions((actions) => actions.setPostProperties)
  const post = useStoreState((state) => state.post)
  const properties = useStoreState((state) => state.post.properties)
  const content = formatContent(properties)
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
      } catch (err) {
        logger.warn('[Error querying micropub endpoint]', err)
      }
      setInitialLoad(false)
      setLoading(false)
    }
    didMount()
  }, [])

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this?')) {
      try {
        await micropub.delete(window.location.href)
        window.location.reload()
      } catch (err) {
        logger.error('[Error deleting]', err)
        notification({ message: 'Error deleting post' })
      }
    }
  }

  const handleSubmit = useCallback(async () => {
    setLoading(true)
    try {
      const original = await micropub.querySource(window.location.href)

      let update = {
        replace: {},
      }

      for (const key in post.properties) {
        if (post.properties.hasOwnProperty(key)) {
          const value = post.properties[key]
          const ogValue = original.properties[key]

          if (
            value &&
            value[0] &&
            (!ogValue || !ogValue[0] || !isEqual(value, ogValue))
          ) {
            update.replace[key] = value
          }
        }
      }

      if (Object.keys(update.replace).length) {
        try {
          logger.log('Sending update', update)
          await micropub.update(window.location.href, update)
          window.location.reload()
        } catch (err) {
          console.error('[Error updating post]', err)
          notification({ title: 'Error updating post', message: err.message })
        }
      } else {
        notification({ message: 'Nothing appears to be updated' })
      }
    } catch (err) {
      logger.error('[Error updating post]', err)
      notification({
        title: 'Error updating post',
        message: err.message || 'Unknown error',
      })
    }
    setLoading(false)
  }, [post])

  const popoutProperties = { ...properties }
  delete popoutProperties.name
  delete popoutProperties.content

  return (
    <>
      <FloatingActions
        loading={loading || initialLoad}
        onPublish={handleSubmit}
        onClose={window.location.reload}
        onDelete={handleDelete}
        onOptions={() => setPopoutOpen(true)}
        publishText="Save Post"
      />

      {!initialLoad && (
        <>
          <Popout open={popoutOpen} onClose={() => setPopoutOpen(false)}>
            <PopoutForm
              properties={popoutProperties}
              onChange={setProperties}
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
            onSubmit={handleSubmit}
            value={content}
            rich={true}
            autoFocus
          />
        </>
      )}
    </>
  )
}

export default EditPost
