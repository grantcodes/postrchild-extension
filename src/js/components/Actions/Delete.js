import React, { useState } from 'react'
import { Delete as Icon } from 'styled-icons/material'
import Action from './Base'
import micropub from '../../modules/micropub'

const Delete = ({ setLoading, url, notify, ...props }) => {
  const [confirmed, setConfirmed] = useState(0)

  const handleClick = async (e) => {
    e.preventDefault()
    if (confirmed === 0) {
      setConfirmed(1)
    } else {
      setConfirmed(2)
      setLoading(true)
      try {
        const res = await micropub.delete(url)
        if (res) {
          notify({ text: 'Successfully deleted post', type: 'success' })
        }
      } catch (err) {
        notify({ text: 'Error deleting post 😔', type: 'error' })
        console.error('Error deleting post', err)
      }
      setLoading(false)
    }
  }

  return (
    <Action title="Delete Post" onClick={handleClick} {...props}>
      <Icon />
      {confirmed === 0 && 'Delete'}
      {confirmed === 1 && 'Click again to confirm deletion'}
      {confirmed === 2 && 'Deleting...'}
    </Action>
  )
}

export default Delete
