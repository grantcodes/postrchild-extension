import React, { Component } from 'react'
import { createPortal } from 'react-dom'
import PropTypes from 'prop-types'
import Editor from './Editor'

class EditorPortal extends Component {
  constructor(props) {
    super(props)
    if (props.el) {
      props.el.innerHTML = ''
    }
  }
  render() {
    const { el, ...editorProps } = this.props
    editorProps.className = 'postrchild-editor'
    return createPortal(<Editor {...editorProps} />, el)
  }
}

EditorPortal.propTypes = {
  el: PropTypes.node.isRequired,
}

export default EditorPortal
