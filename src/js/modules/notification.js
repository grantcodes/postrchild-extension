import browser from 'webextension-polyfill'

export default async function ({ message, title = 'PostrChild' }) {
  if (browser && browser.notifications && browser.notifications.create) {
    browser.notifications.create('postrchild-notification', {
      type: 'basic',
      title,
      message,
      iconUrl: browser.extension.getURL('icon-128.png'),
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
