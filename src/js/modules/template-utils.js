import browser from 'webextension-polyfill'

const hasParentClass = function(el, cls) {
  while ((el = el.parentElement) && !el.classList.contains(cls));
  return el
}

export const removeText = el => {
  let parent = el.cloneNode(true)
  for (let i = 0; i < parent.childNodes.length; i++) {
    const child = parent.childNodes[i]
    if (child.nodeType === 3) {
      parent.removeChild(child)
    }
  }

  const children = parent.children
  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    parent.replaceChild(removeText(child), child)
  }
  return parent
}

export const sanitizeTemplate = template => {
  // First remove all text
  template = removeText(template)

  // Then remove hrefs from links to prevent accidental clickings
  const links = template.getElementsByTagName('a')
  for (let i = 0; i < links.length; i++) {
    const a = links[i]
    a.removeAttribute('href')
  }

  // Remove photos
  const photos = template.getElementsByClassName('u-photo')
  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i]
    photo.remove()
  }

  return template
}

const getContentEl = template => {
  let contentEl = template.querySelectorAll('.e-content')
  if (!contentEl || !contentEl.length) {
    contentEl = null
  } else {
    contentEl = [].slice.call(contentEl).find(content => {
      // Check each potential title to see if it is inside a h-card or is also e-content
      if (
        content &&
        !hasParentClass(content, 'h-card') &&
        !hasParentClass(content, 'p-comment') &&
        !hasParentClass(content, 'p-like') &&
        !hasParentClass(content, 'p-repost') &&
        !hasParentClass(content, 'h-cite')
      ) {
        return true
      }
      return false
    })
  }

  if (!contentEl) {
    contentEl = document.createElement('div')
    contentEl.className = 'e-content'
    template.appendChild(contentEl)
  }

  return contentEl
}

const getTitleEl = template => {
  // Look for all p-names
  let titleEl = template.querySelectorAll('.p-name')
  if (!titleEl || !titleEl.length) {
    // There are no p-names
    titleEl = null
  } else {
    titleEl = [].slice.call(titleEl).find(title => {
      // Check each potential title to see if it is inside a h-card or is also e-content
      if (
        title &&
        !title.classList.contains('e-content') &&
        !hasParentClass(title, 'h-card') &&
        !hasParentClass(title, 'p-comment') &&
        !hasParentClass(title, 'p-like') &&
        !hasParentClass(title, 'p-repost') &&
        !hasParentClass(title, 'h-cite')
      ) {
        return true
      }
      return false
    })
  }

  // If there is no title create an empty h2 and insert it before the content
  if (!titleEl) {
    const contentEl = getContentEl(template)
    titleEl = document.createElement('h2')
    titleEl.className = 'p-name'
    contentEl.parentElement.insertBefore(titleEl, contentEl)
  }

  return titleEl
}

const getPhotoEl = template => {
  const photoEl = template.querySelector('.u-photo')
  if (photoEl) {
    return photoEl
  }
  return null
}

export const getEditorElements = template => ({
  title: getTitleEl(template),
  content: getContentEl(template),
  photo: getPhotoEl(template),
})

export const getNewPostTemplate = async () => {
  let hasStoredTemplate = false
  let template = await browser.storage.local.get('setting_newPostTemplate')
  if (template && template.setting_newPostTemplate) {
    hasStoredTemplate = true
    template = new DOMParser().parseFromString(
      template.setting_newPostTemplate.trim(),
      'text/xml'
    ).firstChild
    console.log('generated template', template)
    // let tmpTemplate = document.createElement('div')
    // tmpTemplate.innerHTML = template.setting_newPostTemplate.trim()
    // template = tmpTemplate.innerHTML
  } else {
    // Create a template based off the last post.
    template = sanitizeTemplate(document.getElementsByClassName('h-entry')[0])
  }
  const onPageTemplate = document.getElementsByClassName('postrchild-template')
  if (onPageTemplate.length > 0) {
    // There is a template on this page, use it or replace it with the browser template
    if (!hasStoredTemplate) {
      template = sanitizeTemplate(onPageTemplate[0])
    }
    onPageTemplate[0].replaceWith(template)
  } else {
    // Need to add the template to an appropriate place
    const hEntries = document.getElementsByClassName('h-entry')
    const hFeed = document.getElementsByClassName('h-feed')
    const main = document.getElementsByTagName('main')
    if (hEntries && hEntries.length) {
      hEntries[0].parentElement.insertBefore(template, hEntries[0])
    } else if (hFeed && hFeed.length) {
      hFeed.prepend(template)
    } else if (main && main.length) {
      main.prepend(template)
    } else {
      document.body.prepend(template)
    }
  }
  return template
}
