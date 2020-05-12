import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import PropTypes from 'prop-types'
import Editor from './Editor'

const EditorPortal = ({ el, ...editorProps }) => {
  const [mounted, setMounted] = useState(false)
  const [elProps, setElProps] = useState({})
  const [afterSiblings, setAfterSiblings] = useState([])
  const [parent] = useState(el.parentNode)

  // On mount get the sibling elements after the el to replace and delete the main element
  useEffect(() => {
    const siblings = [...parent.childNodes]
    const elIndex = siblings.findIndex((sibling) => sibling == el)
    const nextSiblings = siblings.slice(elIndex + 1)

    setElProps({
      as: el.tagName.toLowerCase(),
      className: el.className,
      id: el.id,
    })
    setMounted(true)
    setAfterSiblings(nextSiblings)
    el.remove()
  }, [])

  // Remove siblings after the editor and append them after the portal
  useEffect(() => {
    if (afterSiblings && afterSiblings.length) {
      afterSiblings.forEach((sibling) => {
        sibling.remove()
        parent.append(sibling)
      })
    }
  }, [afterSiblings])

  if (!mounted) {
    return null
  }

  //  Portal is created replacing the passed element
  return createPortal(<Editor {...editorProps} {...elProps} />, parent)
}

EditorPortal.propTypes = {
  el: PropTypes.any.isRequired,
}

export default EditorPortal
