import React, { Component } from 'react'
import { Group, Button } from 'rebass'
import Floater from './Floater'
import { blocks } from '../elements/index'

class NewBlockToolbar extends Component {
  hasBlock = type => {
    const { editor } = this.props
    if (!editor) {
      return null
    }
    const { value } = editor
    return value.blocks.some(node => node.type == type)
  }

  render() {
    const { editor, position } = this.props
    return (
      <Floater position={position} vertical="bottom">
        {Object.values(blocks).map(block =>
          block.icon ? (
            <Button
              key={`block-button-${block.name}`}
              bg={this.hasBlock(block.name) ? 'blue' : 'black'}
              onMouseDown={block.onButtonClick(editor)}
            >
              {block.icon}
            </Button>
          ) : null
        )}
      </Floater>
    )
  }
}

export default NewBlockToolbar
