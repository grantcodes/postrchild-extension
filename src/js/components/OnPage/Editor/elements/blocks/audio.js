import React, { useEffect } from 'react'
import { Transforms } from 'slate'
import { useEditor } from 'slate-react'
import { MusicVideo as AudioIcon } from 'styled-icons/material'
import { updateElement, requestFiles } from '../../helpers'
import useMicropubUpload from '../../hooks/useMicropubUpload'

const insertAudio = (editor, properties) => {
  const data = {
    src: '',
    ...properties,
  }
  const text = { text: '' }
  const audio = { type: 'audio', ...data, children: [text] }
  Transforms.insertNodes(editor, audio)
}

const Audio = ({ attributes, children, element }) => {
  const editor = useEditor()
  const { uploading, url: fileUrl } = useMicropubUpload(element.file)

  useEffect(() => {
    if (fileUrl) {
      updateElement(editor, element, { src: fileUrl, file: null })
    }
  }, [editor, element, fileUrl])

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
    requestFiles({
      accept: 'audio/*',
      handleFile: (file) => {
        insertAudio({
          file,
          src: URL.createObjectURL(file),
        })
      },
    })
  },
}
