import React, { Component } from 'react'
import { Group } from 'rebass'

const style = {
  position: 'absolute',
  bottom: 5,
  left: '50%',
  transform: 'translateX(-50%)',
}

class Overlay extends Component {
  render() {
    const { children } = this.props
    return (
      <Group style={style} contentEditable={false}>
        {children}
      </Group>
    )
  }
}

export default Overlay
