import React, { useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import styled from 'styled-components'
import { Editor, Range } from 'slate'
import { ReactEditor, useSlate, useEditor } from 'slate-react'

const Wrapper = styled.div`
  position: absolute;
  top: -100px;
  left: -900px;
  opacity: 0;
  transition: opacity 0.2s;
`

const Floater = ({
  vertical = 'top',
  horizontal = 'center',
  target = null,
  children,
}) => {
  const ref = useRef(null)
  const editor = useEditor()

  useEffect(() => {
    const el = ref.current
    let rect = null

    if (!el) {
      return
    }

    try {
      const domSelection = window.getSelection()

      if (target) {
        const domRange = ReactEditor.toDOMRange(editor, target)
        rect = domRange.getBoundingClientRect()
      } else if (!target && domSelection.type === 'Range') {
        const domRange = domSelection.getRangeAt(0)
        rect = domRange.getBoundingClientRect()
      }
    } catch (err) {
      console.warn('[Error finding position for floating menu]', err)
    }

    if (!rect) {
      el.removeAttribute('style')
    } else {
      let left =
        rect.left + window.pageXOffset - el.offsetWidth / 2 + rect.width / 2
      let top = rect.top + window.pageYOffset - el.offsetHeight

      if (vertical === 'bottom') {
        top += rect.height + el.offsetHeight
      } else if (vertical === 'middle') {
        top += rect.height / 2 + el.offsetHeight / 2
      }

      if (target) {
        left += rect.width / 2
      }

      if (horizontal === 'right') {
        left += el.offsetWidth / 2
      } else if (horizontal === 'left') {
        left = rect.left
      }

      el.style.opacity = 1
      el.style.top = `clamp(0px, ${top}px, ${
        document.documentElement.clientHeight - el.offsetHeight
      }px`
      el.style.left = `clamp(0px, ${left}px, ${
        document.documentElement.clientWidth - el.offsetWidth
      }px`
    }
  })

  return createPortal(
    <Wrapper ref={ref} contentEditable={false}>
      {children}
    </Wrapper>,
    document.body
  )
}

export default Floater
