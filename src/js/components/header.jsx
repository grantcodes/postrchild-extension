import React from "react";
import { Banner, Heading } from "rebass";
const Header = () => {
  return (
    <Banner color="white" bg="blue" style={{ minHeight: 0 }} p={3}>
      <Heading
        f={[3, 4, 5, 6]}
        style={
          {
            // textDecoration: "overline wavy",
            // fontWeight: 700
          }
        }
      >
        ❤
      </Heading>
    </Banner>
  );
};

export default Header;
