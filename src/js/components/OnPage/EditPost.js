import React, { Component, Fragment } from 'react'
import { Group, Button } from 'rebass'
import Popout from './Popout'
import PopoutForm from './PopoutForm'
import EditorPortal from './EditorPortal'
import micropub, { uploadMf2FilesToMediaEndpoint } from '../../modules/micropub'
import * as templateUtils from '../../modules/template-utils'

class PostEditor extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      popoutOpen: false,
      title: '',
      content: '',
      mf2: {
        properties: {},
      },
      originalProperties: {},
    }
    this.handleDelete = this.handleDelete.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.loadSource = this.loadSource.bind(this)
  }

  async componentDidMount() {
    this.loadSource()
    try {
      if (!micropub.options.mediaEndpoint) {
        const config = await micropub.query('config')
        if (config['media-endpoint']) {
          micropub.options.mediaEndpoint = config['media-endpoint']
        }
      }

      const res = await micropub.query('syndicate-to')
      if (res['syndicate-to']) {
        this.setState({ syndicationProviders: res['syndicate-to'] })
      }
    } catch (err) {
      console.log('Error querying micropub endpoint', err)
    }
  }

  async handleDelete() {
    if (window.confirm('Are you sure you want to delete this?')) {
      try {
        await micropub.delete(window.location.href)
        window.location.reload()
      } catch (err) {
        console.log('Error deleting', err)
        alert('Error deleting post')
      }
    }
  }

  async handleSubmit() {
    this.setState({ loading: true })
    let mf2 = this.state.mf2
    const title = this.state.title
    const content = this.state.content
    if (title) {
      mf2.properties.name = [title]
    }
    if (content) {
      mf2.properties.content = [{ html: content }]
    }

    try {
      mf2 = await uploadMf2FilesToMediaEndpoint(mf2)
    } catch (err) {
      return alert(err.message)
    }

    let update = {
      replace: {},
    }

    Object.keys(mf2.properties).forEach(key => {
      const value = mf2.properties[key]
      const ogValue = this.state.originalProperties[key]
      if (value && value[0] && (!ogValue || !ogValue[0] || ogValue != value)) {
        update.replace[key] = value
      }
    })

    if (Object.keys(update.replace).length) {
      try {
        await micropub.update(window.location.href, update)
        window.location.reload()
      } catch (err) {
        console.log('Error updating post', err)
        alert('Error updating post: ' + err.message)
      }
    } else {
      alert('Nothing appears to be updated')
    }
    this.setState({ loading: false })
  }

  async loadSource() {
    try {
      const {
        title: titleEl,
        content: contentEl,
      } = templateUtils.getEditorElements(this.props.post)

      let newState = { loading: false }

      const post = await micropub.querySource(window.location.href)

      if (post && post.properties) {
        newState.mf2 = post
        newState.originalProperties = Object.assign({}, post.properties)
      }

      let title = titleEl.innerText || ''
      if (post.properties && post.properties.name && post.properties.name[0]) {
        title = post.properties.name[0]
      }
      newState.title = title

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
      }
      newState.content = content

      this.setState(newState)
    } catch (err) {
      console.log('Query error', err)
      alert(
        'Error running query source on your post, you can still edit the post, but it might might be missing something if this page hides some content or something like that'
      )
    }
  }

  render() {
    const shownProperties = Object.keys(this.state.mf2.properties).filter(
      key => key != 'name' && key != 'content'
    )
    shownProperties.push(
      'post-status',
      'photo',
      'featured',
      'visibility',
      'mp-slug'
    )

    const { popoutOpen, mf2, title, content, loading } = this.state
    const {
      title: titleEl,
      content: contentEl,
    } = templateUtils.getEditorElements(this.props.post)

    return (
      <Fragment>
        <Group>
          <Button onClick={this.handleSubmit} disabled={loading}>
            Save Post
          </Button>
          <Button
            onClick={() => this.setState({ popoutOpen: true })}
            disabled={loading}
            title="Post Settings"
          >
            ⚙️
          </Button>
          <Button onClick={this.handleDelete} title="Delete" disabled={loading}>
            🗑️
          </Button>
          <Button
            onClick={() => window.location.reload()}
            title="Cancel"
            disabled={loading}
          >
            ❌
          </Button>
        </Group>

        <Popout
          open={popoutOpen}
          onClose={() => this.setState({ popoutOpen: false })}
        >
          <PopoutForm
            onChange={mf2 => this.setState({ mf2 })}
            properties={mf2.properties}
            shownProperties={shownProperties}
          />
        </Popout>

        {loading === false && (
          <Fragment>
            {titleEl && (
              <EditorPortal
                el={titleEl}
                value={title}
                placeholder="Title..."
                rich={false}
                onChange={title => this.setState({ title })}
              />
            )}
            {contentEl && (
              <EditorPortal
                el={contentEl}
                value={content}
                onChange={content => this.setState({ content })}
              />
            )}
          </Fragment>
        )}
      </Fragment>
    )
  }
}

export default PostEditor
