import browser from 'webextension-polyfill'
import React, { Fragment, useState } from 'react'
import { Button, Input, Label } from '../components/util'
import useExtensionSettings from '../hooks/use-extension-settings'
import useCurrentTab from '../hooks/use-current-tab'
import micropub from '../modules/micropub'
import { sync as syncBookmarks } from '../modules/bookmarks'
import notification from '../modules/notification'

const Settings = () => {
  const [bookmarksSyncing, setBookmarksSyncing] = useState(false)
  const [settings, setSettings] = useExtensionSettings()
  const [isDefaultUrl, setIsDefaultUrl] = useState(true)
  const { url: currentTabUrl } = useCurrentTab()

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      micropub.options.me = settings.micropubMe || currentTabUrl
      const url = await micropub.getAuthUrl()
      setSettings({
        micropubToken: '',
        micropubMe: settings.micropubMe || currentTabUrl,
        tokenEndpoint: micropub.options.tokenEndpoint,
        micropubEndpoint: micropub.options.micropubEndpoint,
      })
      await browser.tabs.create({ url })
    } catch (err) {
      console.error('[Error creating login tab]', err)
      notification({
        message:
          'Oh dear. It looks like there was an error getting your login data :(',
      })
    }
  }

  const handleSyncBookmarks = async (e) => {
    e.preventDefault()
    setBookmarksSyncing(true)
    // Do the callback on a timeout to allow the background script time to check if the sync is happening
    try {
      await syncBookmarks()
    } catch (err) {
      console.error('[Error syncing bookmarks]', err)
    }
    setTimeout(() => setBookmarksSyncing(false), 500)
  }

  return (
    <form>
      <Label htmlFor="micropubMe">Domain</Label>
      <Input
        type="url"
        id="micropubMe"
        value={
          isDefaultUrl && !settings.micropubMe && currentTabUrl
            ? currentTabUrl
            : settings.micropubMe
        }
        onChange={(e) => {
          if (isDefaultUrl) {
            setIsDefaultUrl(false)
          }
          setSettings({ micropubMe: e.target.value })
        }}
      />

      <Button
        disabled={!settings.micropubMe && !currentTabUrl}
        onClick={handleLogin}
        mb={3}
      >
        {settings.micropubToken ? 'Refresh token' : 'Login'}
      </Button>

      {!!settings.micropubToken && (
        <Fragment>
          <Label htmlFor="newPostTemplate">New Post Template</Label>
          <Input
            as="textarea"
            style={{ resize: 'vertical' }}
            value={settings.newPostTemplate}
            id="newPostTemplate"
            onChange={(e) => setSettings({ newPostTemplate: e.target.value })}
          />
          <small>
            Here you can write blank html code for how posts are displayed on
            your site. Make sure to include the classes "p-name" on your title
            and "e-content" on your content area or the extension will not work.
            Note: This will also automatically be wrapped in a plain &lt;div&gt;
            element.
          </small>

          <hr />
          <Label style={{ marginBottom: 10 }}>
            <input
              type="checkbox"
              mr={1}
              checked={settings.bookmarkAutoSync}
              onChange={(e) => {
                let update = {
                  setting_bookmarkAutoSync: !bookmarkAutoSync,
                }
                browser.storage.local.set(update)
                setSettings({
                  ...settings,
                  bookmarkAutoSync: !settings.bookmarkAutoSync,
                })
              }}
            />{' '}
            Enable Bookmark Auto Posting
          </Label>
          <Button disabled={bookmarksSyncing} onClick={handleSyncBookmarks}>
            {bookmarksSyncing ? 'Syncing...' : 'Sync Bookmarks'}
          </Button>
          <br />
          <small>
            This will almost certainly not work fully for you. Full bookmark
            syncing requires a micropub query api which does not fully exist
            yet. What should work for you is the automatic creation of micropub
            bookmark posts on your site. If you hit the sync button it will push
            all your browser bookmarks as mf2 posts and the extension will
            automatically create new mf2 bookmark posts when you create a
            browser bookmark
          </small>
        </Fragment>
      )}
    </form>
  )
}

export default Settings
