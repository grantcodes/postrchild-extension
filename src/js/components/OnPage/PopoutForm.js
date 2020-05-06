import React from 'react'
import PropTypes from 'prop-types'
import { AutoForm } from '@postrchild/editor-base'
import { Input, Label, Button } from '../util'

const Select = (props) => <Input as="select" {...props} />
const Textarea = (props) => <Input as="textarea" {...props} />

const PopoutForm = ({
  onChange,
  properties = {},
  syndication = [],
  richContent = true,
}) => (
  <AutoForm
    onChange={onChange}
    properties={properties}
    syndication={syndication}
    richContent={richContent}
    // divComponent={Box}
    labelComponent={Label}
    inputComponent={Input}
    buttonComponent={Button}
    selectComponent={Select}
    textareaComponent={Textarea}
  />
)

PopoutForm.propTypes = {
  onChange: PropTypes.func.isRequired,
  shownProperties: PropTypes.array,
}

export default PopoutForm
