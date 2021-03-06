import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { Editor } from 'slate-react'
import InsertImages from 'slate-drop-or-paste-images'
import PasteLinkify from 'slate-paste-linkify'
import CollapseOnEscape from 'slate-collapse-on-escape'
import SelectionToolbar from './Toolbar/Selection'
import keyHandler from './key-handler'
import converter from './converter'
import suggestionPlugins from './suggestions'
import { marks, nodes, blocks, inlines } from './elements/index'

const blocksSchema = {}
for (const block of blocks) {
  if (block.schema) {
    blocksSchema[block.name] = block.schema
  }
}

const inlinesSchema = {}
for (const inline of inlines) {
  if (inline.schema) {
    inlinesSchema[inline.name] = inline.schema
  }
}

const plugins = [
  InsertImages({
    insertImage: (editor, file) => {
      if (file.type.startsWith('image/')) {
        return editor
          .insertBlock({
            type: 'image',
            data: {
              file,
              alt: '',
              className: 'alignnone',
              src: URL.createObjectURL(file),
            },
          })
          .insertBlock('paragraph')
      } else if (file.type.startsWith('audio/')) {
        return editor
          .insertBlock({
            type: 'audio',
            data: {
              file,
              src: URL.createObjectURL(file),
            },
          })
          .insertBlock('paragraph')
      } else if (file.type.startsWith('video/')) {
        return editor
          .insertBlock({
            type: 'video',
            data: {
              file,
              poster: '',
              controls: true,
              className: 'alignnone',
              src: URL.createObjectURL(file),
            },
          })
          .insertBlock('paragraph')
      } else {
        alert(
          'Sorry that file type is not supported in PostrChild at the moment'
        )
        return
      }
    },
  }),
  PasteLinkify(),
  CollapseOnEscape(),
  ...suggestionPlugins,
]

// Stored outside of state to prevent updates
let menuPosition = null
let hasSelection = false

class PostrChildEditor extends Component {
  constructor(props) {
    super(props)
    this.state = {
      value: converter.deserialize(props.value),
      // menuPosition: null,
    }
    this.editor = React.createRef()
  }

  componentDidMount = () => {
    this.updateMenuPosition()
  }

  componentDidUpdate = () => {
    this.updateMenuPosition()
  }

  /**
   * Update the menu's absolute position.
   */
  updateMenuPosition = () => {
    const { value } = this.state
    const { rich } = this.props
    const { fragment, selection } = value
    // TODO: Instead of checking if rich, should check if is the actual current editor
    hasSelection = !(selection.isCollapsed || fragment.text === '') && rich

    const native = window.getSelection()
    if (!native || !native.getRangeAt) {
      return
    }
    try {
      const range = native.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      const top = rect.top + window.pageYOffset
      const left = rect.left + window.pageXOffset + rect.width / 2
      menuPosition = { top, left }
    } catch (err) {
      // Error getting selection area
    }
  }

  handleChange = ({ value }) => {
    const { rich } = this.props
    this.setState({ value })
    const html = converter.serialize(value)
    if (rich) {
      this.props.onChange(html)
    } else {
      // Only return plain text if not a rich editor
      const tmpEl = document.createElement('div')
      tmpEl.innerHTML = html
      const text = tmpEl.innerText
      this.props.onChange(text)
    }
  }

  commands = {
    wrapLink(change, href) {
      change.wrapInline({ type: 'link', data: { href } })
    },
    unwrapLink(change) {
      change.unwrapInline('link')
    },
  }

  queries = {
    isLinkActive(editor, value) {
      const active = value.inlines.some(i => i.type === 'link')
      return active
    },
  }

  schema = {
    blocks: blocksSchema,
    inlines: inlinesSchema,
  }

  render() {
    const { rich, value: unusedValue, onChange, ...editorProps } = this.props
    const { value } = this.state
    return (
      <Fragment>
        <Editor
          spellCheck
          schema={this.schema}
          value={value}
          onChange={this.handleChange}
          onKeyDown={keyHandler}
          plugins={plugins} // TODO: Disable plugins if not rich
          ref={this.editor}
          commands={this.commands}
          queries={this.queries}
          renderNode={this.renderNode}
          renderMark={this.renderMark}
          {...editorProps}
        />
        {hasSelection && rich && (
          <SelectionToolbar
            editor={this.editor.current}
            position={menuPosition}
          />
        )}
        {rich &&
          suggestionPlugins.map((plugin, i) => (
            <plugin.SuggestionPortal
              value={value}
              key={`suggestion-portal-${i}`}
            />
          ))}
      </Fragment>
    )
  }

  renderNode = (props, editor, next) => {
    const node =
      Object.values(nodes).find(node => node.name === props.node.type) ||
      Object.values(blocks).find(block => block.name === props.node.type) ||
      Object.values(inlines).find(inline => inline.name === props.node.type)
    if (node) {
      return node.render(props)
    }

    return next()
  }

  /**
   * Render a Slate mark.
   *
   * @param {Object} props
   * @return {Element}
   */

  renderMark = (props, editor, next) => {
    const mark = Object.values(marks).find(
      mark => mark.name === props.mark.type
    )
    if (mark) {
      return mark.render(props)
    }

    return next()
  }
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

export default PostrChildEditor
