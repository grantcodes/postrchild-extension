import browser from 'webextension-polyfill'
import micropub from './modules/micropub'

import React from 'react'
import { render } from 'react-dom'
import Theme from './components/Theme'
import EditPost from './components/OnPage/EditPost'
import NewPost from './components/OnPage/NewPost'
import { getNewPostTemplate } from './modules/template-utils'

const createOnPageContainer = () => {
  const existing = document.getElementById('postrchild-extension-app-container')
  if (existing) {
    return false
  }
  const onPageContainer = document.createElement('div')
  onPageContainer.id = 'postrchild-extension-app-container'
  onPageContainer.className = 'postrchild-extension-app-container'
  onPageContainer.style.position = 'fixed'
  onPageContainer.style.bottom = '20px'
  onPageContainer.style.right = '20px'
  onPageContainer.style.zIndex = 99999999
  document.body.appendChild(onPageContainer)
  return onPageContainer
}

const loadNew = async () => {
  const newPostContainer = createOnPageContainer()
  if (newPostContainer) {
    const template = await getNewPostTemplate()
    render(
      <Theme>
        <NewPost template={template} />
      </Theme>,
      newPostContainer
    )
  }
}

const loadEdit = () => {
  const editorContainer = createOnPageContainer()
  if (editorContainer) {
    render(
      <Theme>
        <EditPost post={document.getElementsByClassName('h-entry')[0]} />
      </Theme>,
      editorContainer
    )
  }
}

const isUserSite = async () => {
  if (process.env.NODE_ENV === 'development') {
    return true
  }
  const store = await browser.runtime.sendMessage({
    action: 'getSettings',
  })
  if (!store.setting_micropubMe) {
    return false
  }
  const currentUrl = new URL(window.location.href)
  const meUrl = new URL(store.setting_micropubMe)
  return currentUrl.origin === meUrl.origin
}

// Respond to browser api messages
browser.runtime.onMessage.addListener(async (request, sender) => {
  switch (request.action) {
    case 'discoverPageAction':
      if (await isUserSite()) {
        const templateEl = document.getElementsByClassName(
          'postrchild-template'
        )
        if (templateEl.length > 0) {
          return { action: 'new' }
        }
        const hEntries = document.getElementsByClassName('h-entry')
        if (hEntries.length === 1) {
          return { action: 'edit' }
        }
        return { action: 'new' }
      }
      return { action: null }
    case 'showEditor':
      // Inject editor onto page
      loadEdit()
      break
    case 'showNewPost':
      // Inject new post editor onto page
      loadNew()
      break
  }
  return false
})

const init = async () => {
  // Complete auth if on micropub redirect page
  if (
    window.location.href.indexOf(micropub.options.redirectUri) === 0 &&
    !micropub.options.token
  ) {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const state = params.get('state')

    try {
      await browser.runtime.sendMessage({
        action: 'getToken',
        state,
        code,
      })
      alert("Ok you're all set up. Visit your website to start posting")
      await browser.runtime.sendMessage({ action: 'closeTab' })
    } catch (err) {
      console.log('Error getting access token', err)
      alert('Uh oh, there was an error getting the access token')
    }
  }
  // Autoload new post if there is a template for it on the page
  const templateEl = document.getElementsByClassName('postrchild-template')
  if ((await isUserSite()) && templateEl.length === 1) {
    loadNew()
  }
}

init()
