import React, { useState, useEffect } from 'react'
import { useEditor } from 'slate-react'
import { MusicVideo as AudioIcon } from 'styled-icons/material'
import micropub from '../../../../../modules/micropub'
import { updateElement } from '../../helpers'

const Audio = ({ attributes, children, element }) => {
  const editor = useEditor()
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const upload = async () => {
      const file = element.file
      if (file) {
        try {
          setUploading(true)
          const fileUrl = await micropub.postMedia(file)
          updateElement(editor, element, { src: fileUrl, file: null })
        } catch (err) {
          alert('Error uploading file')
          console.error('Error uploading file', err)
        }
        setUploading(false)
      }
    }
    upload()
  }, [editor, element])

  return (
    <audio
      {...attributes}
      controls={true}
      src={element.src}
      style={{ opacity: uploading ? 0.5 : 1 }}
    />
  )
}

export default {
  name: 'audio',
  keywords: ['audio', 'music', 'song'],
  icon: <AudioIcon />,
  showIcon: true,
  render: (props) => <Audio {...props} />,
  domRecognizer: (el) => el.tagName.toLowerCase() === 'audio',
  serialize: (children, node) => `<audio controls src="${node.src}"></audio>`,
  deserialize: (el) => ({
    type: 'audio',
    src: el.getAttribute('src'),
    children: [{ text: '' }],
  }),
  onButtonClick: (editor) => {
    const el = document.createElement('input')
    el.type = 'file'
    el.accept = 'audio/*'
    el.click()
    el.onchange = (e) => {
      for (const file of el.files) {
        const audioBlock = {
          type: 'audio',
          file,
          src: URL.createObjectURL(file),
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
