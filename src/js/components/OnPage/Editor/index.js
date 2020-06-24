import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { renderToString } from 'react-dom/server'
import PropTypes from 'prop-types'
import { createEditor } from 'slate'
import { Slate, Editable, withReact } from 'slate-react'
import { withHistory } from 'slate-history'
// import InsertImages from 'slate-drop-or-paste-images'
// import PasteLinkify from 'slate-paste-linkify'
// import CollapseOnEscape from 'slate-collapse-on-escape'
import SelectionToolbar from './Toolbar/Selection'
import AutoSuggest from './AutoSuggest'
import { withShortcuts, keyHandler } from './key-handlers'
import { serialize, deserialize } from './converter'
// import suggestionPlugins from './suggestions'
import * as slateElements from './elements'
import Store from './store'
const allSlateElements = [
  ...slateElements.blocks,
  ...slateElements.marks,
  ...slateElements.inlines,
]

// TODO:
// - Autofills (blocks & mentions)
// - Pasting media
// - numbered lists
// - Maybe install other plugins? Will probably need to recode for new apis them from https://github.com/ianstormtaylor/slate-plugins
// - Maybe change alignment stuff to a generic plugin / function that can be used on any blocks
// - Make micropub functionality a plugin as well

const Element = ({ attributes, children, element }) => {
  const items = [...slateElements.blocks, ...slateElements.inlines]
  const item = Object.values(items).find((item) => item.name === element.type)
  if (item) {
    return item.render({ attributes, children, element })
  }
  // return (
  //   <p>
  //     <strong>Error:</strong> Unrecognized element <code>{element.type}</code>
  //   </p>
  // )
  return <span {...attributes}>{children}</span>
}

const Leaf = ({ attributes, children, leaf }) => {
  for (const mark of slateElements.marks) {
    if (leaf[mark.name]) {
      return mark.render({ attributes, children, leaf })
    }
  }
  return <span {...attributes}>{children}</span>
}

// const plugins = [
//   InsertImages({
//     insertImage: (editor, file) => {
//       if (file.type.startsWith('image/')) {
//         return editor
//           .insertBlock({
//             type: 'image',
//             data: {
//               file,
//               alt: '',
//               className: 'alignnone',
//               src: URL.createObjectURL(file),
//             },
//           })
//           .insertBlock('paragraph')
//       } else if (file.type.startsWith('audio/')) {
//         return editor
//           .insertBlock({
//             type: 'audio',
//             data: {
//               file,
//               src: URL.createObjectURL(file),
//             },
//           })
//           .insertBlock('paragraph')
//       } else if (file.type.startsWith('video/')) {
//         return editor
//           .insertBlock({
//             type: 'video',
//             data: {
//               file,
//               poster: '',
//               controls: true,
//               className: 'alignnone',
//               src: URL.createObjectURL(file),
//             },
//           })
//           .insertBlock('paragraph')
//       } else {
//         // TODO: This should use the notification module
//         alert(
//           'Sorry that file type is not supported in PostrChild at the moment'
//         )
//         return
//       }
//     },
//   }),
//   PasteLinkify(),
//   CollapseOnEscape(),
//   ...suggestionPlugins,
// ]

const PostrChildEditor = ({
  value: valueProp,
  onChange,
  rich,
  placeholder,
  autoFocus,
  ...editorProps
}) => {
  const store = Store.useStore()
  const renderElement = useCallback((props) => <Element {...props} />, [])
  const renderLeaf = useCallback((props) => <Leaf {...props} />, [])
  const [value, setValue] = useState([
    rich
      ? { type: 'paragraph', children: [{ text: '' }] }
      : { children: [{ text: '' }] },
  ])
  const editor = useMemo(() => {
    const hocs = allSlateElements
      .filter((item) => item.hoc)
      .map((item) => item.hoc)
    let createdEditor = withReact(withHistory(createEditor()))
    if (rich) {
      createdEditor = withShortcuts(createdEditor)
    }
    for (const hoc of hocs) {
      createdEditor = hoc(createdEditor)
    }
    return createdEditor
  }, [])
  const onKeyDown = useCallback(keyHandler({ editor, store }), [editor, store])

  if (editorProps.className) {
    editorProps.className += ' postrchild-inline-editor'
  } else {
    editorProps.className = 'postrchild-inline-editor'
  }

  // Load value from prop
  useEffect(() => {
    if (rich && valueProp) {
      setValue(deserialize(valueProp))
    }
  }, [rich, valueProp])

  const handleChange = (value) => {
    const last = value[value.length - 1]
    // If there's not a paragraph as the last item on a rich editor then add it.
    const newValue =
      rich && last.type !== 'paragraph'
        ? [...value, { type: 'paragraph', children: [{ text: '' }] }]
        : value
    setValue(newValue)

    if (rich) {
      const html = value ? serialize(value) : ''
      onChange(html)
    } else {
      // Only return plain text if not a rich editor
      const text = value[0].children[0].text
      onChange(text)
    }
  }

  return (
    <Slate editor={editor} value={value} onChange={handleChange}>
      <Editable
        spellCheck
        placeholder={placeholder}
        autoFocus={autoFocus}
        renderLeaf={renderLeaf}
        renderElement={renderElement}
        className="postrchild-inline-editor"
        onKeyDown={rich ? onKeyDown : null}
        {...editorProps}
      />
      {rich && <SelectionToolbar />}
      {rich && <AutoSuggest />}
    </Slate>
  )
}

PostrChildEditor.propTypes = {
  rich: PropTypes.bool.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string.isRequired,
  autoFocus: PropTypes.bool.isRequired,
}

PostrChildEditor.defaultProps = {
  rich: true,
  value: '',
  onChange: () => {},
  placeholder: 'Content...',
  autoFocus: false,
}

const Wrapper = (props) => (
  <Store.Container>
    <PostrChildEditor {...props} />
  </Store.Container>
)

export default Wrapper
