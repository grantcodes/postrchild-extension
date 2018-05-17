import React, { Component, Fragment } from "react";
import { Box, Tabs, Tab } from "rebass";

class PopupTabs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tab: 0
    };
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(i) {
    return e => this.setState({ tab: i });
  }

  render() {
    return (
      <Fragment>
        <Tabs
          px={3}
          style={{
            justifyContent: "space-around"
          }}
        >
          {this.props.children.map((tab, i) => {
            let tabProps = {
              key: i,
              onClick: this.handleClick(i)
            };
            if (i == this.state.tab) {
              tabProps.borderColor = "blue";
            }
            return <Tab {...tabProps}>{tab.props.label}</Tab>;
          })}
        </Tabs>

        <Box p={3}>{this.props.children[this.state.tab].props.children}</Box>
      </Fragment>
    );
  }
}

export default PopupTabs;

export const TabPane = props => {
  return <Fragment>{props.children}</Fragment>;
};
