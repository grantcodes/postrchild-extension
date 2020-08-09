import React, { useEffect } from 'react'
import { Transforms } from 'slate'
import { useEditor, useSelected } from 'slate-react'
import imageExtensions from 'image-extensions'
import Button from '../../../../util/Button'
import { PhotoSizeSelectActual as ImageIcon } from 'styled-icons/material'
import Overlay from '../../Toolbar/Overlay'
// import AlignmentButtons from '../../Toolbar/AlignmentButtons'
import { isUrl, updateElement, requestFiles } from '../../helpers'
import withAlignment from '../with-alignment'
import Wrapper from '../Wrapper'
import useMicropubUpload from '../../hooks/useMicropubUpload'

const insertImage = (editor, properties) => {
  const data = {
    src: '',
    alt: '',
    class: '',
    ...properties,
  }
  const text = { text: '' }
  const image = { type: 'image', ...data, children: [text] }
  Transforms.insertNodes(editor, image)
}

const isImageUrl = (url) => {
  if (!url) return false
  if (!isUrl(url)) return false
  const ext = new URL(url).pathname.split('.').pop()
  return imageExtensions.includes(ext)
}

const withImages = (editor) => {
  const { insertData, isVoid } = editor

  editor.isVoid = (element) => {
    return element.type === 'image' ? true : isVoid(element)
  }

  editor.insertData = (data) => {
    const text = data.getData('text/plain')
    const { files } = data
    let hasInsertedImage = false

    if (files && files.length > 0) {
      for (const file of files) {
        const reader = new FileReader()
        const [mime] = file.type.split('/')

        if (mime === 'image') {
          hasInsertedImage = true

          reader.addEventListener('load', () => {
            const url = reader.result
            insertImage(editor, { src: url })
          })

          reader.readAsDataURL(file)
        }
      }
    } else if (isImageUrl(text)) {
      hasInsertedImage = true
      insertImage(editor, { src: text })
    }

    if (!hasInsertedImage) {
      insertData(data)
    }
  }

  return editor
}

const Image = ({ attributes, children, element, AlignmentButtons }) => {
  const editor = useEditor()
  const selected = useSelected()
  const { uploading, url: fileUrl } = useMicropubUpload(element.file)

  useEffect(() => {
    if (fileUrl) {
      updateElement(editor, element, { src: fileUrl, file: null })
    }
  }, [editor, element, fileUrl])

  return (
    <Wrapper attributes={attributes} element={element}>
      <img
        src={element.src}
        alt={element.alt}
        className={element.class}
        style={{ opacity: uploading ? 0.5 : 1 }}
      />
      {selected && (
        <Overlay>
          <AlignmentButtons />
          <Button
            onClick={(e) => {
              e.preventDefault()
              const alt = window.prompt('Enter alt text', element.alt)
              updateElement(editor, element, { alt: alt ? alt : '' })
            }}
          >
            Alt
          </Button>
        </Overlay>
      )}
      {children}
    </Wrapper>
  )
}

export default withAlignment({
  name: 'image',
  keywords: ['image', 'photo', 'img'],
  icon: <ImageIcon />,
  showIcon: true,
  render: (props) => <Image {...props} />,
  domRecognizer: (el) => el.tagName.toLowerCase() === 'img',
  serialize: (children, node) =>
    `<img alt="${node.alt}" src="${node.src}" class="${node.class}" />`,
  deserialize: (el) => ({
    type: 'image',
    alt: el.getAttribute('alt'),
    src: el.getAttribute('src'),
    class: el.className,
    children: [{ text: '' }],
  }),
  onButtonClick: (editor) => {
    requestFiles({
      accept: 'image/*',
      handleFile: (file) => {
        insertImage(editor, {
          file,
          alt: '',
          class: '',
          src: URL.createObjectURL(file),
        })
      },
    })
  },
  hoc: withImages,
})
