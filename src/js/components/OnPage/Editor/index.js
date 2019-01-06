import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { Editor } from 'slate-react'
import InsertImages from 'slate-drop-or-paste-images'
import PasteLinkify from 'slate-paste-linkify'
import CollapseOnEscape from 'slate-collapse-on-escape'
import SelectionToolbar from './Toolbar/Selection'
import NewBlockToolbar from './Toolbar/NewBlock'
import keyHandler from './key-handler'
import converter from './converter'
import { marks, nodes, blocks, inlines } from './elements/index'

const plugins = [
  InsertImages({
    // extensions: ['png'],
    insertImage: (change, file) => {
      return change
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
    },
  }),
  PasteLinkify(),
  CollapseOnEscape(),
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
    blocks: {
      image: {
        isVoid: true,
        data: {
          className: v => typeof v === 'string',
          src: v => typeof v === 'string',
          alt: v => typeof v === 'string',
        },
      },
    },
  }

  render() {
    const { rich, value: unusedValue, onChange, ...editorProps } = this.props
    const { value } = this.state
    const { startBlock } = value
    const isBlankParagraph =
      startBlock && startBlock.type === 'paragraph' && startBlock.text === ''
    return (
      <Fragment>
        <Editor
          spellCheck
          schema={this.schema}
          value={value}
          onChange={this.handleChange}
          onKeyDown={keyHandler}
          plugins={plugins}
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
        {/* {rich && isBlankParagraph && (
          // Disabled for now as only has images and images can be drag and dropped.
          // <NewBlockToolbar
          //   editor={this.editor.current}
          //   position={menuPosition}
          // />
        )} */}
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
