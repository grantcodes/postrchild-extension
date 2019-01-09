import React, { Component } from 'react'
import parseReact from 'html-react-parser'
import { MdWebAsset } from 'react-icons/md'
import Overlay from '../../Toolbar/Overlay'
import AlignmentButtons from '../../Toolbar/AlignmentButtons'

const getEmbedHtml = async url => {
  const res = await fetch(
    `https://noembed.com/embed?url=${encodeURIComponent(url)}`
  )
  const data = await res.json()
  if (data.error) {
    throw new Error(data.error)
  }
  return data.html
}

class Oembed extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false,
    }
  }

  loadEmbed = async () => {
    const { editor, node } = this.props
    const data = node.data.toJS()
    const url = data.url
    this.setState({ loading: true })
    try {
      data.html = await getEmbedHtml(url)
      editor.setNodeByKey(node.key, { data })
    } catch (err) {
      console.log('Error loading embed', err)
      editor.setBlocks('paragraph')
      alert('Sorry, either there was an error or that site is not supported.')
    }
    this.setState({ loading: false })
  }

  componentDidMount() {
    this.loadEmbed()
  }

  render() {
    const { loading } = this.state
    const { attributes, node, isSelected, editor } = this.props
    const data = node.data.toJS()

    return isSelected ? (
      <div
        {...attributes}
        className={data.className}
        style={{ position: 'relative', opacity: loading ? 0.5 : 1 }}
        data-postrchild-oembed-url={data.url}
      >
        {data.html && parseReact(data.html)}
        <Overlay>
          <AlignmentButtons
            alignment={(
              data.className.replace('postrchild-oembed', '').trim() || 'none'
            ).replace('align', '')}
            onChange={alignment => {
              data.className = 'postrchild-oembed align' + alignment
              editor.setNodeByKey(node.key, { data })
            }}
          />
        </Overlay>
      </div>
    ) : (
      <div
        ref={this.ref}
        {...data}
        {...attributes}
        style={{ opacity: loading ? 0.5 : 1 }}
        className={data.className}
        data-postrchild-oembed-url={data.url}
        dangerouslySetInnerHTML={{ __html: data.html }}
      />
    )
  }
}

export default {
  name: 'oembed',
  keywords: ['oembed', 'embed', 'youtube', 'external'],
  icon: <MdWebAsset />,
  showIcon: true,
  schema: {
    isVoid: true,
  },
  render: props => <Oembed {...props} />,
  serialize: (children, obj) => {
    return (
      <div
        className={obj.data.get('className')}
        data-postrchild-oembed-url={obj.data.get('url')}
        dangerouslySetInnerHTML={{ __html: obj.data.get('html') }}
      />
    )
  },
  domRecognizer: el =>
    el.tagName.toLowerCase() === 'div' && el.dataset.postrchildOembedUrl,
  deserialize: el => ({
    object: 'block',
    type: 'oembed',
    data: {
      className: el.getAttribute('class'),
      url: el.dataset.postrchildOembedUrl,
      html: el.innerHTML,
    },
  }),
  onButtonClick: editor => {
    const url = window.prompt('What url would you like to embed?')
    const oembedBlock = {
      type: 'oembed',
      data: {
        url,
        className: 'postrchild-oembed alignnone',
      },
    }

    const { value } = editor
    const { startBlock } = value
    if (startBlock.type === 'paragraph' && startBlock.text === '') {
      editor.setBlocks(oembedBlock)
    } else {
      editor.moveToEndOfBlock().insertBlock(oembedBlock)
    }
    editor.insertBlock('paragraph')
  },
}
