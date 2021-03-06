import React from 'react'

const buttonStyle = {
  display: 'block',
  width: 20,
  height: 20,
  fontSize: 16,
  letterSpacing: 0,
  lineHeight: 24 / 16,
  fontFamily: 'monospace',
  textAlign: 'center',
  color: 'inherit',
  fill: 'currentColor',
}

const Icon = ({ path = null, size = 20, children }) => (
  <svg
    width={size}
    height={size}
    viewBox={`0 0 ${size} ${size}`}
    style={buttonStyle}
  >
    {!!children ? children : <path d={path} />}
  </svg>
)

export default Icon
export { buttonStyle }
