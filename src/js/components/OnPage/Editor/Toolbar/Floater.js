import React, { Component } from 'react'
import { createPortal } from 'react-dom'
import { Group } from 'rebass'

class Floater extends Component {
  floaterRef = React.createRef()

  style = () => {
    const { position, vertical } = this.props
    let top = position && position.top ? position.top : -100
    let left = position && position.left ? position.left : -400

    // Figure out if the toolbar will be offscreen and make sure it is pushed back into the screen
    const elWidth = this.floaterRef.current
      ? this.floaterRef.current.offsetWidth
      : 0
    if (elWidth && left > 0 && left - elWidth / 2 < 0) {
      left = elWidth / 2
    } else if (
      elWidth &&
      left > 0 &&
      left + elWidth / 2 > window.document.body.offsetWidth
    ) {
      left = window.document.body.offsetWidth - elWidth / 2
    }

    let transform = 'translate(-50%, -110%)'
    if (vertical === 'bottom') {
      transform = 'translate(-50%, 100%)'
    } else if (vertical === 'middle') {
      transform = 'translate(-50%, -10%)'
    }

    return {
      position: 'absolute',
      opacity: 1,
      transform,
      left,
      top,
    }
  }

  render() {
    const { children } = this.props
    return createPortal(
      <Group ref={this.floaterRef} style={this.style()} contentEditable={false}>
        {children}
      </Group>,
      document.body
    )
  }
}

export default Floater
