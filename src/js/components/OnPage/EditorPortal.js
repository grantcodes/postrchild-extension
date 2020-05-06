import React from 'react'
import { createPortal } from 'react-dom'
import PropTypes from 'prop-types'
import Editor from './Editor'

const EditorPortal = ({ el, ...editorProps }) =>
  createPortal(<Editor {...editorProps} />, el)

EditorPortal.propTypes = {
  el: PropTypes.any.isRequired,
}

export default EditorPortal
