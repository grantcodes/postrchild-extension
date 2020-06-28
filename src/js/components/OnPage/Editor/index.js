import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import PropTypes from 'prop-types'
import { useStoreState, useStoreActions } from 'easy-peasy'
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

const PostrChildEditor = ({
  initialValue = '',
  onChange,
  rich,
  placeholder,
  autoFocus,
  onSubmit,
  ...editorProps
}) => {
  const publishPost = useStoreActions((actions) => actions.publishPost)
  const suggestActions = useStoreActions((actions) => actions.suggest)
  const suggestShown = useStoreState((state) => state.suggest.shown)
  const renderElement = useCallback((props) => <Element {...props} />, [])
  const renderLeaf = useCallback((props) => <Leaf {...props} />, [])

  const [value, setValue] = useState([
    rich
      ? { type: 'paragraph', children: [{ text: '' }] }
      : { children: [{ text: '' }] },
    // rich && initialValue
    //   ? deserialize(initialValue)
    //   : rich
    //   ? { type: 'paragraph', children: [{ text: '' }] } // TODO: Serialize initialValue
    //   : { children: [{ text: initialValue }] }, // TODO: use initial value
  ])
  const editor = useMemo(() => {
    let createdEditor = withReact(withHistory(createEditor()))
    // Make store actions available in the editor
    createdEditor.postrChild = {
      target: null,
      submit: publishPost,
      suggest: {
        ...suggestActions,
        shown: false,
      },
    }

    const hocs = allSlateElements
      .filter((item) => item.hoc)
      .map((item) => item.hoc)
    if (rich) {
      createdEditor = withShortcuts(createdEditor)
    }
    for (const hoc of hocs) {
      createdEditor = hoc(createdEditor)
    }

    return createdEditor
  }, [])
  const onKeyDown = useCallback(keyHandler({ editor }), [editor])

  if (editorProps.className) {
    editorProps.className += ' postrchild-inline-editor'
  } else {
    editorProps.className = 'postrchild-inline-editor'
  }

  const handleChange = (value) => {
    const last = value[value.length - 1]
    // If there's not a paragraph as the last item on a rich editor then add it.
    const newValue =
      rich && last && last.type !== 'paragraph'
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
    <>
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
      {/* <button
        onClick={(e) => {
          e.preventDefault()
          onSubmit()
        }}
      >
        Submit?
      </button> */}
    </>
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

const Wrapper = (props) => <PostrChildEditor {...props} />

export default Wrapper
