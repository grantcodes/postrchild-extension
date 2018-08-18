import React, { Component } from "react";
import { Box, Close } from "rebass";
import { Transition } from "react-transition-group";

class Popout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: props.open
    };
    this.handleToggle = this.handleToggle.bind(this);
  }

  componentWillReceiveProps(newProps) {
    if (newProps.open != this.state.open) {
      this.setState({ open: newProps.open });
    }
  }

  handleToggle(e) {
    this.setState({ open: !this.state.open });
  }

  render() {
    const { open } = this.state;
    return (
      <Transition in={open} timeout={300} unmountOnExit>
        {transitionState => (
          <Box
            p={3}
            pt={4}
            w={260}
            bg="white"
            style={{
              position: "fixed",
              top: 0,
              bottom: 0,
              right: 0,
              overflow: "auto",
              maxWidth: "90%",
              boxShadow: "0 0 10px rgba(0,0,0,.4)",
              transition: "transform .3s, opacity .3s",
              transform:
                transitionState == "entering" || transitionState == "exiting"
                  ? "translateX(100%)"
                  : "translate(0%)",
              opacity:
                transitionState == "entering" || transitionState == "exiting"
                  ? 0
                  : 1
            }}
          >
            <Close
              onClick={this.handleToggle}
              style={{
                position: "fixed",
                right: 0,
                top: 0,
                padding: 0,
                lineHeight: 1,
                color: "gray",
                background: "transparent",
                width: "auto",
                height: "auto",
                fontSize: 30
              }}
            />
            {this.props.children}
          </Box>
        )}
      </Transition>
    );
  }
}

Popout.defaultProps = {
  open: false
};

export default Popout;
