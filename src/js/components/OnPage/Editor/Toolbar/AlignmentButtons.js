import React, { Component, Fragment } from 'react'
import { Button } from 'rebass'
import Icon from './Icon'

class AlignmentButtons extends Component {
  handleClick = alignment => e => {
    e.preventDefault()
    if (this.props.onChange) {
      this.props.onChange(alignment)
    }
  }
  render() {
    const { alignment } = this.props
    return (
      <Fragment>
        <Button
          bg={alignment === 'none' ? 'blue' : 'black'}
          onMouseDown={this.handleClick('none')}
        >
          <Icon path="M3 5h14V3H3v2zm12 8V7H5v6h10zM3 17h14v-2H3v2z" />
        </Button>
        <Button
          bg={alignment === 'wide' ? 'blue' : 'black'}
          onMouseDown={this.handleClick('wide')}
        >
          <Icon path="M5 5h10V3H5v2zm12 8V7H3v6h14zM5 17h10v-2H5v2z" />
        </Button>
        <Button
          bg={alignment === 'full' ? 'blue' : 'black'}
          onMouseDown={this.handleClick('full')}
        >
          <Icon path="M17 13V3H3v10h14zM5 17h10v-2H5v2z" />
        </Button>
      </Fragment>
    )
  }
}

export default AlignmentButtons
