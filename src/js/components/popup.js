import React, { Component, Fragment } from "react";
import { hot } from "react-hot-loader";
import { Box } from "rebass";
import Header from "./header";
import Tabs, { TabPane } from "./popup-tabs";
import Theme from "./theme";

class Popup extends Component {
  render() {
    return (
      <Theme>
        <Box style={{ minWidth: 256 }} p={0}>
          <Header />
        </Box>
      </Theme>
    );
  }
}

export default hot(module)(Popup);
