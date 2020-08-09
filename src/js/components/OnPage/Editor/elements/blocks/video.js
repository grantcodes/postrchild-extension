import React, { useEffect } from 'react'
import { Transforms } from 'slate'
import { useEditor, useSelected } from 'slate-react'
import videoExtensions from 'video-extensions'
import Button from '../../../../util/Button'
import { Movie as VideoIcon } from 'styled-icons/material'
import Overlay from '../../Toolbar/Overlay'
import { updateElement, requestFiles, isUrl } from '../../helpers'
import useMicropubUpload from '../../hooks/useMicropubUpload'
import Wrapper from '../Wrapper'
import withAlignment from '../with-alignment'

const isVideoUrl = (url) => {
  if (!url) return false
  if (!isUrl(url)) return false
  const ext = new URL(url).pathname.split('.').pop()
  return videoExtensions.includes(ext)
}

const insertVideo = (editor, properties) => {
  const data = {
    src: '',
    alt: '',
    class: '',
    ...properties,
  }
  const text = { text: '' }
  const video = { type: 'video', ...data, children: [text] }
  Transforms.insertNodes(editor, video)
}

const Video = ({ attributes, children, element, AlignmentButtons }) => {
  const editor = useEditor()
  const selected = useSelected()
  const { uploading, url: fileUrl } = useMicropubUpload(element.file)
  const { uploading: uploadingPoster, url: posterUrl } = useMicropubUpload(
    element.posterFile
  )

  useEffect(() => {
    if (fileUrl) {
      updateElement(editor, element, { src: fileUrl, file: null })
    }
  }, [editor, element, fileUrl])

  useEffect(() => {
    if (posterUrl) {
      updateElement(editor, element, { poster: posterUrl, posterFile: null })
    }
  }, [editor, element, posterUrl])

  return (
    <Wrapper attributes={attributes} element={element}>
      <video
        {...attributes}
        src={element.src}
        poster={element.poster}
        className={element.class}
        controls={element.controls}
        style={{ opacity: uploading ? 0.5 : 1 }}
      />
      {selected && (
        <Overlay>
          <AlignmentButtons />
          {!element.poster ? (
            <Button
              onClick={(e) => {
                e.preventDefault()
                requestFiles({
                  accept: 'video/*',
                  handleFile: (file) => {
                    updateElement(editor, element, { posterFile: file })
                  },
                })
              }}
            >
              Add Poster
            </Button>
          ) : (
            <Button
              onClick={(e) => updateElement(editor, element, { poster: '' })}
            >
              Remove Poster
            </Button>
          )}
          <Button
            onClick={(e) => {
              e.preventDefault()
              updateElement(editor, element, { controls: !element.controls })
            }}
          >
            {element.controls ? 'Controls' : 'No Controls'}
          </Button>
        </Overlay>
      )}
      {children}
    </Wrapper>
  )
}

export default withAlignment({
  name: 'video',
  keywords: ['video', 'film', 'movie'],
  icon: <VideoIcon />,
  showIcon: true,
  render: (props) => <Video {...props} />,
  domRecognizer: (el) => el.tagName.toLowerCase() === 'video',
  serialize: (children, element) =>
    `<video ${element.controls ? 'controls' : ''} poster="${
      element.poster
    }" src="${element.src}" class="${element.class}"></video>`,
  deserialize: (el) => ({
    type: 'video',
    class: el.className,
    src: el.getAttribute('src'),
    poster: el.getAttribute('poster'),
    controls: !!el.controls,
    children: [{ text: '' }],
  }),
  onButtonClick: (editor) => {
    requestFiles({
      accept: 'video/*',
      handleFile: (file) => {
        const videoBlock = {
          file,
          poster: '',
          class: '',
          src: URL.createObjectURL(file),
          controls: true,
        }
        insertVideo(editor, videoBlock)
      },
    })
  },
  hoc: (editor) => {
    const { insertData, isVoid } = editor

    editor.isVoid = (element) => {
      return element.type === 'video' ? true : isVoid(element)
    }

    editor.insertData = (data) => {
      const text = data.getData('text/plain')
      const { files } = data
      let hasInsertedVideo = false

      if (files && files.length > 0) {
        for (const file of files) {
          const reader = new FileReader()
          const [mime] = file.type.split('/')

          if (mime === 'video') {
            hasInsertedVideo = true

            reader.addEventListener('load', () => {
              const url = reader.result
              insertVideo(editor, { src: url })
            })

            reader.readAsDataURL(file)
          }
        }
      } else if (isVideoUrl(text)) {
        hasInsertedVideo = true
        insertVideo(editor, { src: text })
      }

      if (!hasInsertedVideo) {
        insertData(data)
      }
    }

    return editor
  },
})
