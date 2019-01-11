import browser from 'webextension-polyfill'
import React, { Component, Fragment } from 'react'
import { Group, Button } from 'rebass'
import { MdClose, MdSettings } from 'react-icons/md'
import Popout from './Popout'
import PopoutForm from './PopoutForm'
import micropub, { uploadMf2FilesToMediaEndpoint } from '../../modules/micropub'
import * as templateUtils from '../../modules/template-utils'
import EditorPortal from './EditorPortal'

class PostCreator extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      popoutOpen: false,
      editorOpen: true,
      title: '',
      content: '',
    }

    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
    this.handleMf2Change = this.handleMf2Change.bind(this)
  }

  async componentDidMount() {
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
        this.setState({ syndicationProviders })
        if (syndicationProviders && syndicationProviders.length) {
          this.sidebarProperties.push('mp-syndicate-to')
        }
      }
    } catch (err) {
      console.log('Error querying micropub endpoint', err)
    }
  }

  mf2 = {
    type: ['h-entry'],
    properties: {},
  }

  sidebarProperties = [
    'summary',
    'mp-slug',
    'visibility',
    'post-status',
    'photo',
    'featured',
  ]

  handleMf2Change(mf2) {
    this.mf2 = mf2
  }

  async handleSubmit() {
    this.setState({ loading: true })
    try {
      const { title, content } = this.state
      let mf2 = this.mf2

      mf2 = await uploadMf2FilesToMediaEndpoint(mf2)

      if (title) {
        mf2.properties.name = [title]
      }

      if (content) {
        mf2.properties.content = [{ html: content }]
      }

      const url = await micropub.create(mf2)
      if (typeof url == 'string') {
        window.location.href = url
      } else {
        alert('Unable to get the url of your new post')
        window.location.reload()
      }
    } catch (err) {
      console.log('Error creating post', err)
      alert('Error creating new post: ' + err.message)
    }
    this.setState({ loading: false })
  }

  handleCancel() {
    window.location.reload()
  }

  render() {
    const { syndicationProviders, popoutOpen, editorOpen, loading } = this.state
    const { template } = this.props

    const {
      title: titleEl,
      content: contentEl,
      photo: photoEl,
    } = templateUtils.getEditorElements(template)
    return (
      <Fragment>
        <Group>
          <Button onClick={this.handleSubmit} disabled={loading}>
            Publish
          </Button>
          <Button
            onClick={() => this.setState({ popoutOpen: true })}
            title="Post options"
            disabled={loading}
          >
            <MdSettings />
          </Button>
          <Button onClick={this.handleCancel} title="Cancel" disabled={loading}>
            <MdClose />
          </Button>
        </Group>
        <Popout
          open={popoutOpen}
          onClose={() => this.setState({ popoutOpen: false })}
        >
          <PopoutForm
            properties={this.mf2.properties}
            shownProperties={this.sidebarProperties}
            onChange={this.handleMf2Change}
            syndication={syndicationProviders}
          />
        </Popout>
        {editorOpen && (
          <Fragment>
            <EditorPortal
              el={titleEl}
              onChange={title => this.setState({ title })}
              placeholder="Title..."
              rich={false}
            />

            <EditorPortal
              el={contentEl}
              onChange={content => this.setState({ content })}
              autoFocus
            />
          </Fragment>
        )}
      </Fragment>
    )
  }
}

export default PostCreator
