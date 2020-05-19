import browser from 'webextension-polyfill'
import React, { useState, useEffect } from 'react'
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
import useExtensionSettings from '../../hooks/use-extension-settings'
import logger from '../../modules/logger'

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
  const [settings] = useExtensionSettings()
  const { newPostPage } = settings

  useEffect(() => {
    setEditPost(false)
    setNewPost(false)
    if (tabId) {
      browser.tabs
        .sendMessage(tabId, {
          action: 'discoverPageAction',
        })
        .then((res) => {
          if (res.action === 'edit') {
            setEditPost(true)
          } else if (res.action === 'new') {
            setNewPost(true)
          }
        })
        .catch((err) => logger.warn('Error discovering page action', err))
        .finally(() => {
          setLoading(false)
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

      {(newPost || newPostPage) && (
        <New {...actionProps} newPostPage={newPostPage} />
      )}

      {!!url && (
        <>
          <Like {...actionProps} />
          <Repost {...actionProps} />
          {!!newPostPage && (
            <Reply {...actionProps} newPostPage={newPostPage} />
          )}
        </>
      )}
    </Container>
  )
}

export default Actions
