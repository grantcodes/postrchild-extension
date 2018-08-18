import React, { Component } from "react";
import { hot } from "react-hot-loader";
import { Box } from "rebass";
import Theme from "./theme";
import Settings from "./settings";

class Popup extends Component {
  render() {
    return (
      <Theme>
        <Box style={{ minWidth: 280 }} p={3}>
          <Settings />
        </Box>
      </Theme>
    );
  }
}

export default hot(module)(Popup);
