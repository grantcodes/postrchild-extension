import React, { Component } from 'react'
import { Button } from 'rebass'
import { MdMovie } from 'react-icons/md'
import Overlay from '../../Toolbar/Overlay'
import AlignmentButtons from '../../Toolbar/AlignmentButtons'
import micropub from '../../../../../modules/micropub'

class Video extends Component {
  constructor(props) {
    super(props)
    this.state = {
      uploading: true,
    }
  }

  async componentDidMount() {
    const { editor, node } = this.props
    const file = node.data.get('file')
    if (file) {
      try {
        const fileUrl = await micropub.postMedia(file)
        let data = node.data.toJS()
        delete data.file
        data.src = fileUrl
        editor.setNodeByKey(node.key, { data })
      } catch (err) {
        alert('Error uploading file')
        console.log('Error uploading file', err)
      }
      this.setState({ uploading: false })
    }
  }

  render() {
    const { loading } = this.state
    const { attributes, node, isSelected, editor } = this.props
    const data = node.data.toJS()

    return isSelected ? (
      <div {...attributes} style={{ position: 'relative' }}>
        <video
          {...data}
          {...attributes}
          style={{ opacity: loading ? 0.5 : 1 }}
        />
        <Overlay>
          <AlignmentButtons
            alignment={(data.className || 'none').replace('align', '')}
            onChange={alignment => {
              data.className = 'align' + alignment
              editor.setNodeByKey(node.key, { data })
            }}
          />
          {!data.poster ? (
            <Button
              onClick={e => {
                e.preventDefault()
                const el = document.createElement('input')
                el.type = 'file'
                el.accept = 'image/*'
                el.click()
                el.onchange = async e => {
                  const file = el.files[0]
                  if (!file) {
                    return
                  }
                  try {
                    const fileUrl = await micropub.postMedia(file)
                    data.poster = fileUrl
                    editor.setNodeByKey(node.key, { data })
                  } catch (err) {
                    alert('Error uploading file')
                    console.log('Error uploading poster file', err)
                  }
                }
              }}
            >
              Add Poster
            </Button>
          ) : (
            <Button
              onClick={e => {
                data.poster = ''
                editor.setNodeByKey(node.key, { data })
              }}
            >
              Remove Poster
            </Button>
          )}
          <Button
            onClick={e => {
              e.preventDefault()
              data.controls = !data.controls
              editor.setNodeByKey(node.key, { data })
            }}
          >
            {data.controls ? 'Controls' : 'No Controls'}
          </Button>
        </Overlay>
      </div>
    ) : (
      <video {...data} {...attributes} style={{ opacity: loading ? 0.5 : 1 }} />
    )
  }
}

export default {
  name: 'video',
  icon: <MdMovie />,
  showIcon: true,
  schema: {
    isVoid: true,
  },
  render: props => <Video {...props} />,
  domRecognizer: el => el.tagName.toLowerCase() === 'video',
  serialize: (children, obj) => {
    return (
      <video
        controls={obj.data.get('controls')}
        poster={obj.data.get('poster')}
        src={obj.data.get('src')}
        className={obj.data.get('className')}
      />
    )
  },
  deserialize: el => ({
    object: 'block',
    type: 'video',
    data: {
      className: el.getAttribute('class'),
      src: el.getAttribute('src'),
      poster: el.getAttribute('poster'),
      controls: el.getAttribute('controls'),
    },
  }),
  onButtonClick: editor => {
    const el = document.createElement('input')
    el.type = 'file'
    el.accept = 'video/*'
    el.click()
    el.onchange = e => {
      for (const file of el.files) {
        const videoBlock = {
          type: 'video',
          data: {
            file,
            poster: '',
            className: 'alignnone',
            controls: true,
            src: URL.createObjectURL(file),
          },
        }

        const { value } = editor
        const { startBlock } = value
        if (startBlock.type === 'paragraph' && startBlock.text === '') {
          editor.setBlocks(videoBlock)
        } else {
          editor.moveToEndOfBlock().insertBlock(videoBlock)
        }
        editor.insertBlock('paragraph')
      }
    }
  },
}
