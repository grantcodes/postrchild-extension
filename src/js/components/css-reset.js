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
        .postrchild-extension-app-container button,
        .postrchild-extension-app-container input,
        .postrchild-extension-app-container select,
        .postrchild-extension-app-container textarea {
          color: ${theme.colors.black};
          text-transform: none;
          letter-spacing: 0;
          font-weight: ${theme.fontWeights.normal};
          font-size: ${theme.fontSizes[1]}px;
        }

        .postrchild-extension-app-container button:hover,
        .postrchild-extension-app-container button:focus,
        .postrchild-extension-app-container button:active,
        .postrchild-extension-app-container input:hover,
        .postrchild-extension-app-container input:focus,
        .postrchild-extension-app-container input:active,
        .postrchild-extension-app-container select:hover,
        .postrchild-extension-app-container select:focus,
        .postrchild-extension-app-container select:active,
        .postrchild-extension-app-container textarea:hover,
        .postrchild-extension-app-container textarea:focus,
        .postrchild-extension-app-container textarea:active {
          color: ${theme.colors.black};
          padding: ${theme.space[2]}px ${theme.space[1]}px;
          background-color: transparent;
        }

        .postrchild-extension-app-container button,
        .postrchild-extension-app-container button:hover,
        .postrchild-extension-app-container button:focus,
        .postrchild-extension-app-container button:active {
          background: ${theme.colors.blue};
          padding: ${theme.space[2]}px ${theme.space[3]}px;
          color: ${theme.colors.white};
          font-weight: ${theme.fontWeights.bold};
        }
        .postrchild-extension-app-container button:hover,
        .postrchild-extension-app-container button:focus,
        .postrchild-extension-app-container button:active {
          background: ${theme.colors.cyan};
        }
      `}
    </style>
  );
};

export default CssReset;
