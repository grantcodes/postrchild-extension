import browser from 'webextension-polyfill'
import React, { useState, useEffect, useCallback } from 'react'
import styled from 'styled-components'
import { Link as LinkIcon } from 'styled-icons/material'
import Edit from './Edit'
import Delete from './Delete'
import New from './New'
import Like from './Like'
import Repost from './Repost'
import Reply from './Reply'
import Notification from '../Notification'
import { Spinner, Button } from '../util'
import useCurrentTab from '../../hooks/use-current-tab'

const UrlButton = ({ url, setNotification }) => (
  <Button
    onClick={async (e) => {
      await browser.tabs.create({ url })
      setNotification(null)
    }}
  >
    <LinkIcon />
  </Button>
)

const Container = styled.div`
  display: flex;
  position: relative;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: 200px;
`

function Actions() {
  const [newPost, setNewPost] = useState(false)
  const [editPost, setEditPost] = useState(false)
  const [loading, setLoading] = useState(true)
  const { url, id: tabId } = useCurrentTab()
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    setEditPost(false)
    setNewPost(false)
    if (tabId) {
      browser.tabs
        .sendMessage(tabId, {
          action: 'discoverPageAction',
        })
        .then((res) => {
          setLoading(false)
          if (res.action === 'edit') {
            setEditPost(true)
          } else if (res.action === 'new') {
            setNewPost(true)
          }
        })
    }
  }, [tabId, setEditPost, setNewPost])

  const notify = ({ url = null, ...params }) => {
    if (url) {
      params.action = () => (
        <UrlButton url={url} setNotification={setNotification} />
      )
    }
    setNotification(params)
  }

  const actionProps = {
    url,
    tabId,
    notify,
    setLoading,
    disabled: loading,
  }

  return (
    <Container>
      {!!loading && (
        <Spinner
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      )}

      {!!notification && <Notification {...notification} />}

      {editPost && url && (
        <>
          <Edit {...actionProps} />
          <Delete {...actionProps} />
        </>
      )}

      {newPost && <New {...actionProps} />}

      {!!url && (
        <>
          <Like {...actionProps} />
          <Repost {...actionProps} />
          <Reply {...actionProps} />
        </>
      )}
    </Container>
  )
}

export default Actions
