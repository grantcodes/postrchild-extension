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
    let tabs = Array.isArray(this.props.children)
      ? this.props.children
      : [this.props.children];
    return (
      <Fragment>
        <Tabs
          px={3}
          style={{
            justifyContent: "space-around"
          }}
        >
          {tabs.map((tab, i) => {
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

        <Box p={3}>{tabs[this.state.tab]}</Box>
      </Fragment>
    );
  }
}

export default PopupTabs;

export const TabPane = props => {
  return <Fragment>{props.children}</Fragment>;
};
