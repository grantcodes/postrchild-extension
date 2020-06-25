import styled from 'styled-components'
import { Button } from '../util'

const ButtonGroup = styled.div`
  position: relative !important;
  overflow: hidden !important;
  border-radius: 4px !important;
  display: flex !important;
  flex-direction: row !important;
  justify-content: center !important;
  align-items: stretch !important;

  ${Button} {
    border-radius: 0 !important;
    white-space: nowrap !important;
    margin: 0 !important;

    &:first-child {
      border-radius: 4px 0 0 4px !important;
    }

    &:last-child {
      border-radius: 0 4px 4px 0 !important;
    }
  }
`

export default ButtonGroup
