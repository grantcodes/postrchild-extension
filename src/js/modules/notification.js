import browser from 'webextension-polyfill'

export default async function ({
  url,
  title = 'PostrChild',
  message = '',
  ...params
}) {
  if (browser && browser.notifications && browser.notifications.create) {
    let id = 'postrchild-notification'
    if (url) {
      id = `postrchild-notification-url-${url}`
    }
    browser.notifications.create(id, {
      type: 'basic',
      title,
      iconUrl: browser.extension.getURL('icon-128.png'),
      ...params,
    })
  } else if (browser && browser.runtime && browser.runtime.sendMessage) {
    await browser.runtime.sendMessage({
      action: 'notification',
      title,
      message,
    })
  } else if (typeof window !== 'undefined' && window.alert) {
    window.alert(title + '\n\n' + message)
  } else {
    console.warn('[No notification method available]')
  }
}
