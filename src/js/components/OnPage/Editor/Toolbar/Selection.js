import React, { Component } from 'react'
import { Button } from 'rebass'
import Floater from './Floater'
import { marks, nodes, inlines } from '../elements/index'

class SelectionToolbar extends Component {
  hasMark = type => {
    const { editor } = this.props
    if (!editor) {
      return null
    }
    const { value } = editor
    return value.activeMarks.some(mark => mark.type == type)
  }

  hasBlock = type => {
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
        {Object.values(marks).map(mark =>
          mark.icon ? (
            <Button
              key={`mark-button-${mark.name}`}
              bg={this.hasMark(mark.name) ? 'blue' : 'black'}
              // Use onMouseDown to prevent deselection of text
              onMouseDown={mark.onButtonClick(editor)}
            >
              {mark.icon}
            </Button>
          ) : null
        )}

        {Object.values(nodes).map(node =>
          node.icon ? (
            <Button
              key={`node-button-${node.name}`}
              bg={this.hasBlock(node.name) ? 'blue' : 'black'}
              onMouseDown={node.onButtonClick(editor)}
            >
              {node.icon}
            </Button>
          ) : null
        )}

        {Object.values(inlines).map(inline =>
          inline.icon ? (
            <Button
              key={`inline-button-${inline.name}`}
              bg={this.hasInline(inline.name) ? 'blue' : 'black'}
              onMouseDown={inline.onButtonClick(editor)}
            >
              {inline.icon}
            </Button>
          ) : null
        )}
      </Floater>
    )
  }
}

export default SelectionToolbar
