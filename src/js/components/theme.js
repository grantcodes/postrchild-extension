import React from "react";
import { Provider, Base } from "rebass";
import { createColors } from "rebass/src/colors";
import CssReset from "./css-reset";

const theme = {
  colors: createColors("#0a7bdb")
};

const Theme = props => (
  <Provider theme={theme}>
    <CssReset theme={theme} />
    <Base>{props.children}</Base>
  </Provider>
);

export default Theme;
