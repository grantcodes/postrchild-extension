import React from 'react'
import styled, { keyframes } from 'styled-components'
import { Button } from '../util'
import {
  Close as CloseIcon,
  Settings as OptionsIcon,
  Delete as DeleteIcon,
} from 'styled-icons/material'
import ButtonGroup from './ButtonGroup'

const animation = keyframes`
  0% {
    transform: translateX(-100%)
  }
  100% {
    transform: translateX(300%)
  }
`

const LoadingIndicator = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 4px;
  width: 100%;

  &:before {
    content: '';
    display: block;
    height: 4px;
    border-radius: 2px;
    width: 50%;
    background-color: ${(props) => props.theme.colors.alt};
    animation: ${animation} infinite 2s;
  }
`

function FloatingActions({
  loading,
  onClose,
  onPublish,
  onOptions,
  onDelete,
  publishText = 'Publish',
}) {
  return (
    <ButtonGroup>
      {!!onPublish && (
        <Button onClick={onPublish} disabled={loading}>
          {publishText}
        </Button>
      )}

      {!!onOptions && (
        <Button onClick={onOptions} title="Post options" disabled={loading}>
          <OptionsIcon />
        </Button>
      )}

      {!!onDelete && (
        <Button onClick={onDelete} title="Delete" disabled={loading}>
          <DeleteIcon />
        </Button>
      )}

      {!!onClose && (
        <Button onClick={onClose} title="Cancel" disabled={loading}>
          <CloseIcon />
        </Button>
      )}
      {!!loading && <LoadingIndicator />}
    </ButtonGroup>
  )
}

export default FloatingActions
