import React from 'react'
import { ThumbUp as Icon } from 'styled-icons/material'
import Action from './Base'
import micropub from '../../modules/micropub'

const Like = ({ setLoading, url, notify, ...props }) => (
  <Action
    title="Like"
    onClick={async (e) => {
      e.preventDefault()
      setLoading(true)
      try {
        const res = await micropub.create({
          type: ['h-entry'],
          properties: { 'like-of': [url] },
        })
        if (res) {
          notify({ text: '👍 Like posted', type: 'success', url: res })
        }
      } catch (err) {
        notify({ text: 'Error liking post 😔', type: 'error' })
        console.error('[Error liking post]', err)
      }
      setLoading(false)
    }}
    {...props}
  >
    <Icon /> Like
  </Action>
)

export default Like
