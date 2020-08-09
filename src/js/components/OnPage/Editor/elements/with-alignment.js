import React from 'react'
import { useEditor } from 'slate-react'
import AlignmentButtonsBase from '../Toolbar/AlignmentButtons'
import { updateElement } from '../helpers'

const alignments = ['none', 'center', 'wide', 'full']

const getAlignmentFromClass = (classname = '') => {
  const foundAlignment = alignments.find((a) => classname.includes('align' + a))
  return foundAlignment
}

const generateClass = (alignment, classname = '') => {
  if (!alignment) {
    return classname
  }
  const alignClass = 'align' + alignment
  if (classname === '') {
    classname = alignClass
  } else {
    const foundAlignment = getAlignmentFromClass(classname)
    if (foundAlignment) {
      classname = classname.replace('align' + foundAlignment, alignClass)
    } else {
      classname = classname + ' ' + alignClass
    }
  }

  return classname
}

const withAlignment = (element) => {
  const { render } = element

  // Pass alignment helpers to render props
  element.render = (props) => {
    const AlignmentButtons = () => {
      const editor = useEditor()

      return (
        <AlignmentButtonsBase
          alignment={getAlignmentFromClass(props.element.class) || 'none'}
          onChange={(alignment) => {
            const newClass = generateClass(alignment, props.element.class)
            updateElement(editor, props.element, { class: newClass })
          }}
        />
      )
    }

    props.AlignmentButtons = AlignmentButtons

    return render(props)
  }

  return element
}

export default withAlignment
