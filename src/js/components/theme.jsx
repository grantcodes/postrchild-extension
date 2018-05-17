import React from "react";
import { Provider } from "rebass";
import { createColors } from "rebass/src/colors";

const theme = {
  colors: createColors("#0a7bdb")
};

const Theme = props => <Provider theme={theme}>{props.children}</Provider>;

export default Theme;
