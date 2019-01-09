import React, { Component } from 'react'
import { Button } from 'rebass'
import { MdPhotoSizeSelectActual } from 'react-icons/md'
import Overlay from '../../Toolbar/Overlay'
import AlignmentButtons from '../../Toolbar/AlignmentButtons'
import micropub from '../../../../../modules/micropub'

class Image extends Component {
  constructor(props) {
    super(props)
    this.state = {
      uploading: true,
    }
    // this.ref = React.createRef()
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
        <img {...data} {...attributes} style={{ opacity: loading ? 0.5 : 1 }} />
        <Overlay>
          <AlignmentButtons
            alignment={(data.className || 'none').replace('align', '')}
            onChange={alignment => {
              data.className = 'align' + alignment
              editor.setNodeByKey(node.key, { data })
            }}
          />
          <Button
            onClick={e => {
              e.preventDefault()
              const alt = window.prompt('Enter alt text', data.alt)
              if (alt) {
                data.alt = alt
                editor.setNodeByKey(node.key, { data })
              }
            }}
          >
            Alt
            {/* <Input
              type="text"
              value={data.alt}
              onChange={alt => {
                data.alt = alt
                editor.setNodeByKey(node.key, { data })
              }}
            /> */}
          </Button>
        </Overlay>
      </div>
    ) : (
      <img {...data} {...attributes} style={{ opacity: loading ? 0.5 : 1 }} />
    )
  }
}

export default {
  name: 'image',
  icon: <MdPhotoSizeSelectActual />,
  showIcon: true,
  schema: {
    isVoid: true,
  },
  render: props => <Image {...props} />,
  domRecognizer: el => el.tagName.toLowerCase() === 'img',
  serialize: (children, obj) => {
    return (
      <img
        alt={obj.data.get('alt')}
        src={obj.data.get('src')}
        className={obj.data.get('className')}
      />
    )
  },
  deserialize: el => ({
    object: 'block',
    type: 'image',
    data: {
      className: el.getAttribute('class'),
      src: el.getAttribute('src'),
      alt: el.getAttribute('alt'),
    },
  }),
  onButtonClick: editor => {
    const el = document.createElement('input')
    el.type = 'file'
    el.accept = 'image/*'
    el.click()
    el.onchange = e => {
      for (const file of el.files) {
        const imageBlock = {
          type: 'image',
          data: {
            file,
            alt: '',
            className: 'alignnone',
            src: URL.createObjectURL(file),
          },
        }

        const { value } = editor
        const { startBlock } = value
        if (startBlock.type === 'paragraph' && startBlock.text === '') {
          editor.setBlocks(imageBlock)
        } else {
          editor.moveToEndOfBlock().insertBlock(imageBlock)
        }
        editor.insertBlock('paragraph')
      }
    }
  },
  // nodes:
}
