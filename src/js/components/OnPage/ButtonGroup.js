import styled from 'styled-components'
import { Button } from '../util'

const ButtonGroup = styled.div`
  position: relative;
  overflow: hidden;
  border-radius: 4px;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: stretch;

  ${Button} {
    border-radius: 0;
    white-space: nowrap;
    margin: 0;

    &:first-child {
      border-radius: 4px 0 0 4px;
    }

    &:last-child {
      border-radius: 0 4px 4px 0;
    }
  }
`

export default ButtonGroup
