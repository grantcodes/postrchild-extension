import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Button } from '../util'

const Action = styled(Button)`
  display: flex !important;
  flex-direction: row !important;
  justify-content: flex-start !important;
  align-items: center !important;
  width: 100% !important;
  padding: 5px 10px !important;
  margin-bottom: 5px !important;
  text-align: left !important;

  & > * {
    display: block !important;
    margin-right: 10px !important;
  }
`

Action.propTypes = {
  // setLoading: PropTypes.func.isRequired,
  children: PropTypes.any.isRequired,
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
}

export default Action
