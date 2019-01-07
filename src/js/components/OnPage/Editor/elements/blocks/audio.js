import React, { Component } from 'react'
import { MdMusicVideo } from 'react-icons/md'
import micropub from '../../../../../modules/micropub'

class Audio extends Component {
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
    const { attributes, node } = this.props
    const data = node.data.toJS()
    return (
      <audio
        {...data}
        {...attributes}
        controls={true}
        style={{ opacity: loading ? 0.5 : 1 }}
      />
    )
  }
}

export default {
  name: 'audio',
  icon: <MdMusicVideo />,
  render: props => <Audio {...props} />,
  serialize: (children, obj) => {
    return <audio controls={true} src={obj.data.get('src')} />
  },
  deserialize: el => ({
    object: 'block',
    type: 'audio',
    data: {
      src: el.getAttribute('src'),
    },
  }),
  onButtonClick: editor => e => {
    e.preventDefault()
    const el = document.createElement('input')
    el.type = 'file'
    el.accept = 'audio/*'
    el.click()
    el.onchange = e => {
      for (const file of el.files) {
        const audioBlock = {
          type: 'audio',
          data: {
            file,
            src: URL.createObjectURL(file),
          },
        }

        const { value } = editor
        const { startBlock } = value
        if (startBlock.type === 'paragraph' && startBlock.text === '') {
          editor.setBlocks(audioBlock)
        } else {
          editor.moveToEndOfBlock().insertBlock(audioBlock)
        }
        editor.insertBlock('paragraph')
      }
    }
  },
}
