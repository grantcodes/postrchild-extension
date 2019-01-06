import React, { Component } from 'react'
import { Button, Input, Label } from 'rebass'
import Icon from '../../Toolbar/Icon'
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

  // getFloaterPosition = () => {
  //   let position = { left: 50, top: 50 }
  //   if (this.ref.current) {
  //     const rect = this.ref.current.getBoundingClientRect()
  //     const top = rect.top + window.pageYOffset
  //     const left = rect.left + window.pageXOffset + rect.width / 2
  //     position = { top, left }
  //   }
  //   return position
  // }

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
  icon: (
    <Icon size={24}>
      <path d="M0,0h24v24H0V0z" fill="none" />
      <path d="m19 5v14h-14v-14h14m0-2h-14c-1.1 0-2 0.9-2 2v14c0 1.1 0.9 2 2 2h14c1.1 0 2-0.9 2-2v-14c0-1.1-0.9-2-2-2z" />
      <path d="m14.14 11.86l-3 3.87-2.14-2.59-3 3.86h12l-3.86-5.14z" />
    </Icon>
  ),
  render: props => <Image {...props} />,
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
  onButtonClick: editor => e => {
    e.preventDefault()
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
