import React, { Component } from 'react'
import { Button } from 'rebass'
import Floater from './Floater'
import { marks, nodes, inlines } from '../elements/index'

const allElements = [...marks, ...nodes, ...inlines]

class SelectionToolbar extends Component {
  hasElement = type => {
    const { editor } = this.props
    if (!editor) {
      return null
    }
    const { value } = editor
    return (
      value.inlines.some(inline => inline.type == type) ||
      value.activeMarks.some(mark => mark.type == type) ||
      value.blocks.some(node => node.type == type)
    )
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
                bg={this.hasElement(element.name) ? 'blue' : 'black'}
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
