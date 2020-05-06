import React from 'react'
import Button from '../../../util/Button'
import Icon from './Icon'

const AlignmentButtons = ({ onChange, alignment }) => {
  const handleClick = (alignment) => (e) => {
    e.preventDefault()
    if (onChange) {
      onChange(alignment)
    }
  }

  return (
    <>
      <Button selected={alignment === 'none'} onClick={handleClick('none')}>
        <Icon
          size={24}
          path="M5 3h14v3h-14v-3zM5 8h14v8h-14v-8zM5 18h14v3h-14v-3z"
        />
      </Button>
      <Button selected={alignment === 'wide'} onClick={handleClick('wide')}>
        <Icon
          size={24}
          path="M5 3h14v3h-14v-3zM3 8h18v8h-18v-8zM5 18h14v3h-14v-3z"
        />
      </Button>
      <Button selected={alignment === 'full'} onClick={handleClick('full')}>
        <Icon
          size={24}
          path="M5 3h14v3h-14v-3zM0 8h24v8h-24v-8zM5 18h14v3h-14v-3z"
        />
      </Button>
    </>
  )
}

export default AlignmentButtons
