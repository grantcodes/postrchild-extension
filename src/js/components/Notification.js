import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Button } from './util'
import { Close } from 'styled-icons/material'

const Wrapper = styled.div`
  display: flex;
  width: 100%;
  padding: 6px 10px;
  line-height: 1.2;
  flex-direction: row;
  flex-wrap: nowrap;
  border-radius: 4px;
  margin-bottom: 10px;
  color: #fff;
  overflow: hidden;
  font-size: 12px;
  background-color: ${(props) =>
    props.type === 'success'
      ? '#38BF2A'
      : props.type === 'error'
      ? '#E02926'
      : '#0088E2'};

  ${Button} {
    float: right;
    margin: -6px -10px -6px 10px;
    padding: 4px;
    width: 28px;
    flex-grow: 0;
    color: #fff;
    border-radius: 0;
    background-color: rgba(0, 0, 0, 0.1);
  }
`

const Text = styled.span`
  display: block;
  flex-grow: 1;
`

const Notification = ({ text, action: Action = null, type = 'success' }) => {
  const [open, setOpen] = useState(true)

  useEffect(() => {
    setOpen(true)
    setTimeout(() => setOpen(false), 3000)
  }, [setOpen, text, type, Action])

  if (!open) {
    return null
  }

  return (
    <Wrapper type={type}>
      <Text>{text}</Text>
      {!!Action && <Action />}
      <Button onClick={(e) => setOpen(false)}>
        <Close />
      </Button>
    </Wrapper>
  )
}

Notification.propTypes = {
  text: PropTypes.string.isRequired,
  action: PropTypes.node,
  type: PropTypes.oneOf(['success', 'error', 'info']),
}

export default Notification
