import React, { useState, useEffect } from 'react'
import { Transforms } from 'slate'
import { useEditor, useSelected } from 'slate-react'
import parseReact from 'html-react-parser'
import { WebAsset as OembedIcon } from 'styled-icons/material'
import Overlay from '../../Toolbar/Overlay'
import AlignmentButtons from '../../Toolbar/AlignmentButtons'
import { updateElement } from '../../helpers'
import notification from '../../../../../modules/notification'

const getEmbedHtml = async (url) => {
  const res = await fetch(
    `https://noembed.com/embed?url=${encodeURIComponent(url)}`
  )
  const data = await res.json()
  if (data.error) {
    throw new Error(data.error)
  }
  return data.html
}

const Oembed = ({ attributes, element, children }) => {
  const editor = useEditor()
  const selected = useSelected()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadEmbed = async () => {
      const url = element.url
      setLoading(true)
      try {
        const html = await getEmbedHtml(url)
        updateElement(editor, element, { html })
      } catch (err) {
        console.log('Error loading embed', err)
        // editor.setBlocks('paragraph')
        notification({
          message:
            'Sorry, either there was an error or that site is not supported.',
        })
      }
      setLoading(false)
    }
    loadEmbed()
  }, [editor, element, element.url])

  return (
    <div
      {...attributes}
      className={element.class}
      style={{ position: 'relative', opacity: loading ? 0.5 : 1 }}
      data-postrchild-oembed-url={element.url}
    >
      {element.html && parseReact(element.html)}
      {selected && (
        <Overlay>
          <AlignmentButtons
            alignment={(
              element.class.replace('postrchild-oembed', '').trim() || 'none'
            ).replace('align', '')}
            onChange={(alignment) =>
              updateElement(editor, element, {
                class: 'postrchild-oembed align' + alignment,
              })
            }
          />
        </Overlay>
      )}
    </div>
  )
}

export default {
  name: 'oembed',
  keywords: ['oembed', 'embed', 'youtube', 'external'],
  icon: <OembedIcon />,
  showIcon: true,
  render: (props) => <Oembed {...props} />,
  serialize: (children, element) =>
    `<div class="${element.class}" data-postrchild-oembed-url="${element.url}">${element.html}</div>`,
  domRecognizer: (el) =>
    el.tagName.toLowerCase() === 'div' && el.dataset.postrchildOembedUrl,
  deserialize: (el) => ({
    type: 'oembed',
    class: el.className,
    url: el.dataset.postrchildOembedUrl,
    html: el.innerHTML,
    children: [{ text: '' }],
  }),
  onButtonClick: (editor) => {
    const url = window.prompt('What url would you like to embed?')
    const oembedBlock = {
      type: 'oembed',
      url,
      class: 'postrchild-oembed alignnone',
      html: '',
      children: [{ text: '' }],
    }

    Transforms.insertNodes(editor, oembedBlock)
  },
}
