import React from 'react'
import { Editor, Transforms, Range } from 'slate'
import { useEditor, useSelected } from 'slate-react'
import Overlay from '../../Toolbar/Overlay'
import AlignmentButtons from '../../Toolbar/AlignmentButtons'
import Button from '../../../../util/Button'
import { updateElement } from '../../helpers'
import { Code as CodeIcon } from 'styled-icons/material'

const withCodeBlock = (editor) => {
  const { insertBreak } = editor

  editor.insertBreak = (...args) => {
    const { selection } = editor
    if (selection && Range.isCollapsed(selection)) {
      const [block] = Editor.above(editor, {
        match: (n) => Editor.isBlock(editor, n),
      })

      // Escape list item if hitting enter on an empty item
      if (block && block.type === 'code-block') {
        const blockText = block.children[0].text

        if (blockText.endsWith('\n\n')) {
          // Delete empty lines
          editor.deleteBackward('character')
          editor.deleteBackward('character')
          // Insert standard break
          insertBreak()
          // Convert new heading block to paragraph
          Transforms.setNodes(editor, { type: 'paragraph' })
          return
        }

        editor.insertText('\n')
        return
      }
    }

    insertBreak(args)
  }

  return editor
}

const Code = ({ attributes, element, children }) => {
  const editor = useEditor()
  const selected = useSelected()
  console.log({ children })

  return (
    <pre className={element.class} {...attributes}>
      <code className={`language-${element.language}`}>
        {children}
        {selected && (
          <Overlay>
            <AlignmentButtons
              alignment={(element.class || 'none').replace('align', '')}
              onChange={(alignment) =>
                updateElement(editor, element, { class: 'align' + alignment })
              }
            />
            <Button
              onClick={(e) => {
                e.preventDefault()
                const language = window.prompt(
                  'Enter language name',
                  element.language
                )
                updateElement(editor, element, {
                  language: language ? language : '',
                })
              }}
            >
              Language
            </Button>
          </Overlay>
        )}
      </code>
    </pre>
  )
}

export default {
  name: 'code-block',
  keywords: ['code', 'pre', 'syntax'],
  icon: <CodeIcon />,
  showIcon: true,
  render: (props) => <Code {...props} />,
  serialize: (children, element) =>
    `<pre class="${element.class}"><code class="language-${
      element.language || 'none'
    }">${children}</code></pre>`,
  domRecognizer: (el) =>
    el.tagName.toLowerCase() === 'pre' &&
    el.children.length === 1 &&
    el.children[0].tagName.toLowerCase() === 'code',
  deserialize: (el) => {
    console.log('deserializing children', el.children[0].children)
    return {
      type: 'code-block',
      class: el.className,
      language: el.children[0].className.replace('language-', ''),
      children: [{ text: el.children[0].innerText, placeholder: 'Code block' }],
    }
  },
  onButtonClick: (editor) => {
    const codeBlock = {
      type: 'code-block',
      class: 'alignnone',
      language: '',
      children: [{ text: '', placeholder: 'Code block' }],
    }

    Transforms.insertNodes(editor, codeBlock)
  },
  hoc: withCodeBlock,
}
