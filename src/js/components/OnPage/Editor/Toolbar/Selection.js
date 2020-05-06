import React from 'react'
import { Editor, Range } from 'slate'
import { ReactEditor, useSlate } from 'slate-react'
import Floater from './Floater'
import ButtonGroup from '../../ButtonGroup'
import Button from '../../../util/Button'
import { marks, nodes, inlines } from '../elements/index'
import { isBlockActive } from '../helpers'

const allElements = [...marks, ...nodes, ...inlines]

const SelectionToolbar = () => {
  const editor = useSlate()

  const { selection } = editor

  // TODO: Selection is messed up in firefox

  if (
    !selection ||
    !ReactEditor.isFocused(editor) ||
    Range.isCollapsed(selection) ||
    Editor.string(editor, selection) === ''
  ) {
    return null
  }

  return (
    <Floater>
      <ButtonGroup>
        {allElements
          .filter((element) => element.showIcon)
          .map((element) => (
            <Button
              key={`toolbar-button-${element.name}`}
              selected={isBlockActive(editor, element.name)}
              // selected={false}
              onClick={(e) => {
                e.preventDefault()
                element.onButtonClick(editor)
              }}
            >
              {element.icon}
            </Button>
          ))}
      </ButtonGroup>
    </Floater>
  )
}

export default SelectionToolbar
