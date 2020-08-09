import React from 'react'

const Wrapper = ({ children, attributes, element }) => (
  <div
    {...attributes}
    contentEditable={false}
    style={{ position: 'relative', userSelect: 'none' }}
    className={element.class || null}
  >
    {children}
  </div>
)

export default Wrapper
