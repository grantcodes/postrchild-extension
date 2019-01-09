import React, { Component } from 'react'
import { Button } from 'rebass'
import Floater from './Floater'
import { marks, nodes, inlines } from '../elements/index'

const allElements = [...marks, ...nodes, ...inlines]

class SelectionToolbar extends Component {
  hasMark = type => {
    const { editor } = this.props
    if (!editor) {
      return null
    }
    const { value } = editor
    return value.activeMarks.some(mark => mark.type == type)
  }

  hasNode = type => {
    const { editor } = this.props
    if (!editor) {
      return null
    }
    const { value } = editor
    return value.blocks.some(node => node.type == type)
  }

  hasInline = type => {
    const { editor } = this.props
    if (!editor) {
      return null
    }
    const { value } = editor
    return value.inlines.some(inline => inline.type == type)
  }

  render() {
    const { position, editor } = this.props
    return (
      <Floater position={position}>
        {allElements
          .filter(element => element.showIcon)
          .map(element => {
            return (
              <Button
                key={`toolbar-button-${element.name}`}
                bg={this.hasMark(mark.name) ? 'blue' : 'black'}
                // Use onMouseDown to prevent deselection of text
                onMouseDown={e => {
                  e.preventDefault()
                  element.onButtonClick(editor)
                }}
              >
                {element.icon}
              </Button>
            )
          })}
      </Floater>
    )
  }
}

export default SelectionToolbar
