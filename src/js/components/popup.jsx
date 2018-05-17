import React, { Component, Fragment } from "react";
import { hot } from "react-hot-loader";
import { Box } from "rebass";
import Header from "./header";
import Tabs, { TabPane } from "./popup-tabs";
import Theme from "./theme";
import BookmarkForm from "./bookmark-form";

class Popup extends Component {
  render() {
    return (
      <Theme>
        <Box style={{ minWidth: 256 }} p={0}>
          <Header />
          <Tabs>
            <TabPane label="Bookmark">
              <BookmarkForm />
            </TabPane>
          </Tabs>
        </Box>
      </Theme>
    );
  }
}

export default hot(module)(Popup);
