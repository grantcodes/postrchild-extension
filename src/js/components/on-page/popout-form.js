import React from "react";
import PropTypes from "prop-types";
import { Box, Label, Input, Button, Select, Textarea } from "rebass";
import Mf2Editor from "micropub-client-editor";

const PopoutForm = ({
  onChange,
  shownProperties,
  properties = {},
  syndication = [],
  richContent = true
}) => (
  <Mf2Editor
    onChange={onChange}
    shownProperties={shownProperties}
    properties={properties}
    syndication={syndication}
    richContent={richContent}
    divComponent={Box}
    labelComponent={props => <Label color="black" mb={1} {...props} />}
    inputComponent={props => <Input mb={3} {...props} />}
    buttonComponent={props => <Button mb={3} {...props} />}
    selectComponent={props => <Select mb={3} {...props} />}
    textareaComponent={props => <Textarea mb={3} {...props} />}
  />
);

PopoutForm.propTypes = {
  onChange: PropTypes.func.isRequired,
  shownProperties: PropTypes.array
};

export default PopoutForm;
