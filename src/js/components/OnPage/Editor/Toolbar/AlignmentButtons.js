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
          <Icon
            size={24}
            path="M5 3h14v3h-14v-3zM5 8h14v8h-14v-8zM5 18h14v3h-14v-3z"
          />
        </Button>
        <Button
          bg={alignment === 'wide' ? 'blue' : 'black'}
          onMouseDown={this.handleClick('wide')}
        >
          <Icon
            size={24}
            path="M5 3h14v3h-14v-3zM3 8h18v8h-18v-8zM5 18h14v3h-14v-3z"
          />
        </Button>
        <Button
          bg={alignment === 'full' ? 'blue' : 'black'}
          onMouseDown={this.handleClick('full')}
        >
          <Icon
            size={24}
            path="M5 3h14v3h-14v-3zM0 8h24v8h-24v-8zM5 18h14v3h-14v-3z"
          />
        </Button>
      </Fragment>
    )
  }
}

export default AlignmentButtons
