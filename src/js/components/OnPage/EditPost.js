import React, { Fragment, useState, useEffect } from 'react'
import Popout from './Popout'
import FloatingActions from './FloatingActions'
import PopoutForm from './PopoutForm'
import EditorPortal from './EditorPortal'
import micropub, { uploadMf2FilesToMediaEndpoint } from '../../modules/micropub'
import * as templateUtils from '../../modules/template-utils'
import notification from '../../modules/notification'

const baseProperties = {
  'mp-slug': [],
  featured: [],
  photo: [],
  visibility: [],
  'post-status': [],
}

const EditPost = ({ postEl }) => {
  const [initialLoad, setInitialLoad] = useState(true)
  const [loading, setLoading] = useState(false)
  const [popoutOpen, setPopoutOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [originalProperties, setOriginalProperties] = useState({})
  const [syndicationProviders, setSyndicationProviders] = useState([])
  const [properties, setProperties] = useState(
    Object.assign({}, baseProperties)
  )

  const load = async () => {
    await loadSource()
    try {
      if (!micropub.options.mediaEndpoint) {
        const config = await micropub.query('config')
        if (config['media-endpoint']) {
          micropub.options.mediaEndpoint = config['media-endpoint']
        }
      }

      const res = await micropub.query('syndicate-to')
      if (res['syndicate-to']) {
        setSyndicationProviders(['syndicate-to'])
      }
    } catch (err) {
      console.warn('[Error querying micropub endpoint]', err)
    }
    setInitialLoad(false)
  }

  useEffect(() => {
    load()
  }, [])

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this?')) {
      try {
        await micropub.delete(window.location.href)
        window.location.reload()
      } catch (err) {
        console.error('[Error deleting]', err)
        notification({ message: 'Error deleting post' })
      }
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    let mf2 = { type: ['h-entry'], properties: { ...properties } }
    if (title) {
      mf2.properties.name = [title]
    }
    if (content) {
      mf2.properties.content = [{ html: content }]
    }

    try {
      mf2 = await uploadMf2FilesToMediaEndpoint(mf2)
    } catch (err) {
      return notification({
        title: 'Error uploading files to media endpoint',
        message: err.message,
      })
    }

    let update = {
      replace: {},
    }

    for (const key in mf2.properties) {
      if (mf2.properties.hasOwnProperty(key)) {
        const value = mf2.properties[key]
        const ogValue = originalProperties[key]
        if (
          value &&
          value[0] &&
          (!ogValue || !ogValue[0] || ogValue != value)
        ) {
          update.replace[key] = value
        }
      }
    }

    if (Object.keys(update.replace).length) {
      try {
        await micropub.update(window.location.href, update)
        window.location.reload()
      } catch (err) {
        console.error('[Error updating post]', err)
        notification({ title: 'Error updating post', message: err.message })
      }
    } else {
      notification({ message: 'Nothing appears to be updated' })
    }
    setLoading(false)
  }

  const loadSource = async () => {
    try {
      const {
        title: titleEl,
        content: contentEl,
      } = templateUtils.getEditorElements(postEl)

      const post = await micropub.querySource(window.location.href)

      let title = titleEl.innerText || ''
      if (post.properties && post.properties.name && post.properties.name[0]) {
        title = post.properties.name[0]
        delete post.properties.name
      }
      setTitle(title.trim())

      let content = contentEl.innerHTML || ''
      if (
        post.properties &&
        post.properties.content &&
        post.properties.content[0]
      ) {
        let content = post.properties.content[0]
        if (typeof content == 'object' && (content.html || content.value)) {
          content = content.html || content.value
        }
        delete post.properties.content
      }
      setContent(content.trim())

      if (post && post.properties) {
        setOriginalProperties(Object.assign({}, post.properties))
        setProperties(Object.assign({}, baseProperties, post.properties))
      }

      setLoading(false)
    } catch (err) {
      console.warn('[Query error]', err)
      notification({
        title: 'Error running query source on your post',
        message:
          'You can still edit the post, but there is potential for data loss or unintended changes',
      })
    }
  }

  const {
    title: titleEl,
    content: contentEl,
  } = templateUtils.getEditorElements(postEl)

  console.log('EditPost', { titleEl, contentEl })

  return (
    <Fragment>
      <FloatingActions
        loading={loading}
        onClose={window.location.reload}
        onDelete={handleDelete}
        onOptions={() => setPopoutOpen(true)}
        onPublish={handleSubmit}
        publishText="Save Post"
      />

      {!initialLoad && (
        <Fragment>
          <Popout open={popoutOpen} onClose={() => setPopoutOpen(false)}>
            <PopoutForm
              onChange={setProperties}
              properties={properties}
              syndication={syndicationProviders}
            />
          </Popout>
          {titleEl && (
            <EditorPortal
              el={titleEl}
              value={title}
              placeholder="Title..."
              rich={false}
              onChange={(title) => setTitle(title)}
            />
          )}
          {contentEl && (
            <EditorPortal
              el={contentEl}
              value={content}
              onChange={(content) => setContent(content)}
            />
          )}
        </Fragment>
      )}
    </Fragment>
  )
}

export default EditPost
