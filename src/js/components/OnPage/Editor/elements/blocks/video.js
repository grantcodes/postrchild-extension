import React, { useEffect } from 'react'
import { Transforms } from 'slate'
import { useEditor, useSelected } from 'slate-react'
import Button from '../../../../util/Button'
import { Movie as VideoIcon } from 'styled-icons/material'
import Overlay from '../../Toolbar/Overlay'
import AlignmentButtons from '../../Toolbar/AlignmentButtons'
import { updateElement, requestFiles } from '../../helpers'
import useMicropubUpload from '../../hooks/useMicropubUpload'

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

const Video = ({ attributes, children, element }) => {
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
    <div {...attributes} style={{ position: 'relative' }}>
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
          <AlignmentButtons
            alignment={(element.class || 'none').replace('align', '')}
            onChange={(alignment) =>
              updateElement(editor, element, { class: 'align' + alignment })
            }
          />
          {!element.poster ? (
            <Button
              onClick={(e) => {
                e.preventDefault()
                requestFiles({
                  accept: 'image/*',
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
    </div>
  )
}

export default {
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
          class: 'alignnone',
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

      if (files && files.length > 0) {
        for (const file of files) {
          const reader = new FileReader()
          const [mime] = file.type.split('/')

          if (mime === 'video') {
            reader.addEventListener('load', () => {
              const url = reader.result
              insertVideo(editor, url)
            })

            reader.readAsDataURL(file)
          }
        }
        // TODO: Check if is a video url
        // } else if (isImageUrl(text)) {
        //   insertVideo(editor, { src: text })
      } else {
        insertData(data)
      }
    }

    return editor
  },
}
