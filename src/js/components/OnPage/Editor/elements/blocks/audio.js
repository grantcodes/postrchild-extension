import React, { useEffect } from 'react'
import { Transforms } from 'slate'
import { useEditor } from 'slate-react'
import audioExtensions from 'audio-extensions'
import { MusicVideo as AudioIcon } from 'styled-icons/material'
import { updateElement, requestFiles, isUrl } from '../../helpers'
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

const isAudioUrl = (url) => {
  if (!url) return false
  if (!isUrl(url)) return false
  const ext = new URL(url).pathname.split('.').pop()
  return audioExtensions.includes(ext)
}

const withAudio = (editor) => {
  const { insertData, isVoid } = editor

  editor.isVoid = (element) => {
    return element.type === 'audio' ? true : isVoid(element)
  }

  editor.insertData = (data) => {
    const text = data.getData('text/plain')
    const { files } = data
    let hasInsertedAudio = false

    if (files && files.length > 0) {
      for (const file of files) {
        const reader = new FileReader()
        const [mime] = file.type.split('/')

        if (mime === 'audio') {
          hasInsertedAudio = true

          reader.addEventListener('load', () => {
            const url = reader.result
            insertAudio(editor, { src: url })
          })

          reader.readAsDataURL(file)
        }
      }
    } else if (isAudioUrl(text)) {
      hasInsertedAudio = true
      insertAudio(editor, { src: text })
    }

    if (!hasInsertedAudio) {
      insertData(data)
    }
  }

  return editor
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
    >
      {children}
    </audio>
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
  hoc: withAudio,
}
