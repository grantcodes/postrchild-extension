import React, { Component } from 'react'
import { Box, Button } from 'rebass'
import { MdClose } from 'react-icons/md'
import { Transition } from 'react-transition-group'

class Popout extends Component {
  constructor(props) {
    super(props)
    this.state = {
      open: props.open,
    }
    this.handleToggle = this.handleToggle.bind(this)
  }

  componentWillReceiveProps(newProps) {
    if (newProps.open !== this.state.open) {
      this.setState({ open: newProps.open })
    }
  }

  handleToggle(e) {
    this.setState({ open: !this.state.open })
    if (this.state.open && this.props.onClose) {
      this.props.onClose()
    }
  }

  render() {
    const { open } = this.state
    return (
      <Transition in={open} timeout={300} unmountOnExit>
        {transitionState => (
          <Box
            p={3}
            pt={4}
            bg="white"
            style={{
              position: 'fixed',
              top: 0,
              bottom: 0,
              right: 0,
              overflow: 'auto',
              width: 260,
              maxWidth: '90%',
              boxShadow: '0 0 10px rgba(0,0,0,.4)',
              transition: 'transform .3s, opacity .3s',
              transform:
                transitionState == 'entering' || transitionState == 'entered'
                  ? 'translateX(0%)'
                  : 'translate(100%)',
              opacity:
                transitionState == 'entering' || transitionState == 'entered'
                  ? 1
                  : 0,
            }}
          >
            <Button
              onClick={this.handleToggle}
              style={{
                position: 'fixed',
                right: 5,
                top: 5,
                padding: 0,
                lineHeight: 1,
                color: 'gray',
                background: 'transparent',
                width: 'auto',
                height: 'auto',
                fontSize: 30,
              }}
            >
              <MdClose />
            </Button>
            {this.props.children}
          </Box>
        )}
      </Transition>
    )
  }
}

Popout.defaultProps = {
  open: false,
}

export default Popout
