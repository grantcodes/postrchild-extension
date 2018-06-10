import React from "react";
import { Banner, Heading } from "rebass";
import icon from "../../img/icon-128.png";
const Header = () => {
  return (
    <Banner
      p={3}
      color="white"
      bg="blue"
      style={{
        minHeight: 0,
        backgroundImage: "linear-gradient(25deg, #6142a5, #df99d8)"
      }}
    >
      <img
        src={icon}
        style={{ display: "inline-block", width: 40, height: 40 }}
      />
    </Banner>
  );
};

export default Header;
