import React from 'react'
import notification from '../modules/notification'
import logger from '../modules/logger'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    logger.error('[React Error]', error, errorInfo)
    notification({ title: 'Uh Oh', message: 'An uncaught error occurred' })
  }

  render() {
    return this.props.children
  }
}

export default ErrorBoundary
