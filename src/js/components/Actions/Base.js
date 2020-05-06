import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Button } from '../util'

const Action = styled(Button)`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  padding: 5px 10px;
  margin-bottom: 5px;
  text-align: left;

  & > * {
    display: block;
    margin-right: 10px;
  }
`

Action.propTypes = {
  // setLoading: PropTypes.func.isRequired,
  children: PropTypes.any.isRequired,
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
}

export default Action
