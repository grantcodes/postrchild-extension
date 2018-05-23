import React, { Component, Fragment } from "react";
import { Box, ButtonOutline as Button, Close } from "rebass";

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
    if (!this.state.open) {
      return null;
    }
    return (
      <Box
        p={3}
        w={260}
        bg="white"
        style={{
          position: "fixed",
          top: 0,
          bottom: 0,
          right: 0,
          overflow: "auto",
          maxWidth: "90%",
          boxShadow: "0 0 10px rgba(0,0,0,.4)"
        }}
      >
        <Close
          onClick={this.handleToggle}
          style={{
            position: "fixed",
            right: 0,
            top: 0,
            padding: 0,
            color: "black",
            background: "transparent"
          }}
        />
        {/* <Button /> */}
        {this.props.children}
      </Box>
    );
  }
}

Popout.defaultProps = {
  open: false
};

export default Popout;
