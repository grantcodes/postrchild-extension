import browser from 'webextension-polyfill'

import React from 'react'
import { render } from 'react-dom'
import Theme from './components/Theme'
import NewPost from './components/OnPage/NewPost'
import EditPost from './components/OnPage/EditPost'
import logger from './modules/logger'
import notification from './modules/notification'
import { getNewPostTemplate, getEditorElements } from './modules/template-utils'

if (module.hot) {
  __webpack_public_path__ = 'http://localhost:3000/'
}

const createOnPageContainer = () => {
  const existing = document.getElementById('postrchild-extension-app-container')
  if (existing) {
    logger.log('Existing container element', existing)
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
  // TODO: Store this url so that it can be used with a quick action
  try {
    const newPostContainer = createOnPageContainer()
    logger.log('Got new post container', newPostContainer)
    if (newPostContainer) {
      logger.log('trying to get template elements')
      // Get and clear template elements.
      const template = await getNewPostTemplate()
      const els = getEditorElements(template)

      for (const key in els) {
        if (els.hasOwnProperty(key)) {
          const el = els[key]
          if (el && el.innerHTML) {
            el.innerHTML = ''
          }
        }
      }

      render(
        <Theme>
          <NewPost
            titleEl={els.title}
            contentEl={els.content}
            photoEl={els.photo}
          />
        </Theme>,
        newPostContainer
      )
    }
  } catch (err) {
    logger.warn('Error injecting new post editor', err)
  }
}
const loadEdit = async () => {
  const editorContainer = createOnPageContainer()
  if (editorContainer) {
    logger.log('Loading edit post')
    render(
      <Theme>
        <EditPost postEl={document.getElementsByClassName('h-entry')[0]} />
      </Theme>,
      editorContainer
    )
  }
}

const isUserSite = async () => {
  // Load editor everywhere when testing.
  if (process.env.NODE_ENV === 'development') {
    return true
  }
  // Otherwise only load the editor on the user site.
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
  if (window.location.href.startsWith('https://postrchild.com/auth')) {
    const store = await browser.runtime.sendMessage({
      action: 'getSettings',
    })
    if (!store.setting_micropubToken) {
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')
      const state = params.get('state')

      try {
        notification({ message: 'Getting your access token...' })
        await browser.runtime.sendMessage({
          action: 'getToken',
          state,
          code,
        })
        notification({
          message: "Ok you're all set up. Visit your website to start posting.",
        })
        await browser.runtime.sendMessage({ action: 'closeTab' })
      } catch (err) {
        logger.error('[Error getting access token]', err)
        notification({
          title: 'Uh oh!',
          message: 'There was an error getting the access token',
        })
      }
    }
  }

  // Autoload new post if there is a template for it on the page
  const templateEl = document.getElementsByClassName('postrchild-template')
  if ((await isUserSite()) && templateEl.length === 1) {
    logger.log(
      'Single postrchild-template on user site, loading new post editor'
    )
    loadNew()
  }
}

window.onload = init
// init()
