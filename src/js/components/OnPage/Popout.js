import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import Button from '../util/Button'
import { Close as CloseIcon } from 'styled-icons/material'
import { Transition } from 'react-transition-group'

const Container = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  overflow: auto;
  width: 260;
  max-width: 90%;
  padding: 10px;
  background: ${(props) => props.theme.colors.background};
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.4);
  transition: transform 0.3s, opacity 0.3s;
  transform: ${({ transitionState }) =>
    transitionState === 'entering' || transitionState === 'entered'
      ? 'translateX(0%)'
      : 'translate(100%)'};
  opacity: ${({ transitionState }) =>
    transitionState === 'entering' || transitionState === 'entered' ? 1 : 0};
`

const CloseButton = styled(Button)`
  position: fixed;
  right: 0px;
  top: 0px;
  padding: 10px;
  display: block;
  color: ${(props) => props.theme.colors.text};
  background: none;
  width: auto;
  height: auto;
  font-size: 30px;
  z-index: 2;

  svg {
    display: block;
  }

  :hover,
  :focus,
  :active {
    background: none;
    color: ${(props) => props.theme.colors.text};
  }
`

const Popout = ({ open: openProp, onClose, children }) => {
  const [open, setOpen] = useState(openProp)

  useEffect(() => {
    if (openProp !== open) {
      setOpen(openProp)
    }
  }, [openProp])

  const handleToggle = (e) => {
    setOpen(false)
    if (onClose) {
      onClose()
    }
  }

  return (
    <Transition in={open} timeout={300}>
      {(transitionState) => (
        <Container transitionState={transitionState}>
          <CloseButton onClick={handleToggle}>
            <CloseIcon />
          </CloseButton>

          {children}
        </Container>
      )}
    </Transition>
  )
}

Popout.defaultProps = {
  open: false,
}

export default Popout
