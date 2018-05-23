import React from "react";
import defaultTheme from "rebass/src/theme";

const CssReset = props => {
  let theme = defaultTheme;
  if (props && props.theme) {
    theme = Object.assign({}, theme, props.theme);
  }
  // console.log(theme);
  return (
    <style>
      {`
        #app-container button,
        #app-container input,
        #app-container select,
        #app-container textarea {
          color: ${theme.colors.black};
          text-transform: none;
          letter-spacing: 0;
          font-weight: ${theme.fontWeights.normal};
          font-size: ${theme.fontSizes[1]}px;
        }

        #app-container button:hover,
        #app-container button:focus,
        #app-container button:active,
        #app-container input:hover,
        #app-container input:focus,
        #app-container input:active,
        #app-container select:hover,
        #app-container select:focus,
        #app-container select:active,
        #app-container textarea:hover,
        #app-container textarea:focus,
        #app-container textarea:active {
          color: ${theme.colors.black};
          padding: ${theme.space[2]}px ${theme.space[1]}px;
          background-color: transparent;
        }

        #app-container button,
        #app-container button:hover,
        #app-container button:focus,
        #app-container button:active {
          background: ${theme.colors.blue};
          padding: ${theme.space[2]}px ${theme.space[3]}px;
          color: ${theme.colors.white};
          font-weight: ${theme.fontWeights.bold};
        }
        #app-container button:hover,
        #app-container button:focus,
        #app-container button:active {
          background: ${theme.colors.cyan};
        }
      `}
    </style>
  );
};

export default CssReset;
