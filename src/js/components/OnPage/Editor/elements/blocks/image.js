import React, { useState, useEffect } from 'react'
import { Transforms } from 'slate'
import { useEditor, useSelected } from 'slate-react'
import Button from '../../../../util/Button'
import { PhotoSizeSelectActual as ImageIcon } from 'styled-icons/material'
import Overlay from '../../Toolbar/Overlay'
import AlignmentButtons from '../../Toolbar/AlignmentButtons'
import micropub from '../../../../../modules/micropub'
import { isUrl, updateElement } from '../../helpers'
import useMicropubUpload from '../../hooks/useMicropubUpload'

const withImages = (editor) => {
  const { insertData, isVoid } = editor

  editor.isVoid = (element) => {
    return element.type === 'image' ? true : isVoid(element)
  }

  editor.insertData = (data) => {
    const text = data.getData('text/plain')
    const { files } = data

    if (files && files.length > 0) {
      for (const file of files) {
        const reader = new FileReader()
        const [mime] = file.type.split('/')

        if (mime === 'image') {
          reader.addEventListener('load', () => {
            const url = reader.result
            insertImage(editor, url)
          })

          reader.readAsDataURL(file)
        }
      }
    } else if (isImageUrl(text)) {
      insertImage(editor, { src: text })
    } else {
      insertData(data)
    }
  }

  return editor
}

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

// const InsertImageButton = () => {
//   const editor = useEditor()
//   return (
//     <Button
//       onMouseDown={event => {
//         event.preventDefault()
//         const url = window.prompt('Enter the URL of the image:')
//         if (!url) return
//         insertImage(editor, url)
//       }}
//     >
//       <Icon>image</Icon>
//     </Button>
//   )
// }

const isImageUrl = (url) => {
  if (!url) return false
  if (!isUrl(url)) return false
  const ext = new URL(url).pathname.split('.').pop()
  // TODO: Figure out why i need this and fix it
  return false
  // return imageExtensions.includes(ext)
}

const Image = ({ attributes, children, element }) => {
  const editor = useEditor()
  const selected = useSelected()
  // const focused = useFocused()

  const { uploading, url: fileUrl } = useMicropubUpload(element.file)

  useEffect(() => {
    if (fileUrl) {
      updateElement(editor, element, { src: fileUrl, file: null })
    }
  }, [editor, element, fileUrl])

  console.log('image render', { element })

  return (
    <div
      {...attributes}
      style={{ position: 'relative', userSelect: 'none' }}
      className={element.class}
    >
      <div contentEditable={false}>
        <img
          src={element.src}
          alt={element.alt}
          className={element.class}
          style={{ opacity: uploading ? 0.5 : 1 }}
        />
        {selected && (
          <Overlay>
            <AlignmentButtons
              // alignment={(data.className || 'none').replace('align', '')}
              onChange={(alignment) => {
                updateElement(editor, element, { class: 'align' + alignment })
              }}
            />
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
      </div>
      {children}
    </div>
  )
}

export default {
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
    const el = document.createElement('input')
    el.type = 'file'
    el.accept = 'image/*'
    el.click()
    el.onchange = (e) => {
      for (const file of el.files) {
        insertImage(editor, {
          file,
          alt: '',
          class: 'alignnone',
          src: URL.createObjectURL(file),
        })

        // const { value } = editor
        // const { startBlock } = value
        // if (startBlock.type === 'paragraph' && startBlock.text === '') {
        //   editor.setBlocks(imageBlock)
        // } else {
        //   editor.moveToEndOfBlock().insertBlock(imageBlock)
        // }
        // editor.insertBlock('paragraph')
      }
    }
  },
  hoc: withImages,
}
