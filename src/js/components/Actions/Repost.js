import React from 'react'
import { Repeat as Icon } from 'styled-icons/material'
import Action from './Base'
import micropub from '../../modules/micropub'

const Repost = ({ setLoading, url, notify, ...props }) => (
  <Action
    title="Repost"
    onClick={async (e) => {
      e.preventDefault()
      setLoading(true)
      try {
        const res = await micropub.create({
          type: ['h-entry'],
          properties: { 'repost-of': [url] },
        })
        if (res) {
          notify({ type: 'success', text: 'Reposted successfully', url: res })
        }
      } catch (err) {
        notify({ text: 'Error reposting 😔', type: 'error' })
        console.error('[Error deleting post]', err)
      }
      setLoading(false)
    }}
    {...props}
  >
    <Icon /> Repost
  </Action>
)

export default Repost
