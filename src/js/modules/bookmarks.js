import browser from 'webextension-polyfill'
import micropub from './micropub'

const defaultFolders = [
  'other bookmarks',
  'unfiled bookmarks',
  'favorites',
  'bookmarks',
]

export default class Bookmark {
  constructor(data) {
    this.mf2 = null
    this.browser = null
    if (data.browser && data.mf2) {
      // This is already a completed bookmark object
      this.mf2 = data.mf2
      this.browser = data.browser
    } else if (!data.properties && data.id && data.url) {
      // This is a browser bookmark
      this.browser = data
      this.mf2 = {
        type: ['h-entry'],
        properties: {
          name: [data.title],
          'bookmark-of': [data.url],
          visibility: ['unlisted'],
        },
      }
      if (data.folder) {
        let cats = []
        data.folder.split('/').forEach(cat => cats.push(cat))
        if (data.folder.indexOf('/') > -1) {
          cats.push(data.folder)
        }
        cats = cats.filter(
          cat => defaultFolders.indexOf(cat.toLowerCase()) === -1
        )
        if (cats.length) {
          this.mf2.properties.category = cats
        }
      } else {
        this.browser.folder = ''
      }
    } else if (
      data.properties &&
      data.properties['bookmark-of'] &&
      data.properties['bookmark-of'][0]
    ) {
      // This is a mf2 bookmark
      this.mf2 = data
      this.browser = {
        title: data.properties['bookmark-of'][0],
        url: data.properties['bookmark-of'][0],
        folder: '',
      }
      if (data.properties.name && data.properties.name[0]) {
        this.browser.title = data.properties.name[0]
      }
      if (data.properties.category && data.properties.category[0]) {
        this.browser.folder =
          data.properties.category.find(cat => cat.indexOf('/') > -1) ||
          data.properties.category[0]
      }
    } else {
      // This is a broken bookmark
      throw new Error('Error instantiating that bookmark')
    }

    this.setFolder = this.setFolder.bind(this)
    this.createLocal = this.createLocal.bind(this)
    this.createLocalFolder = this.createLocalFolder.bind(this)
    this.createMicropub = this.createMicropub.bind(this)
    this.deleteLocal = this.deleteLocal.bind(this)
    this.deleteMicropub = this.deleteMicropub.bind(this)
  }

  setFolder(folder) {
    this.browser.folder = folder
    let cats = []
    if (folder.indexOf('/') > -1) {
      cats.push(folder)
    }
    folder.split('/').forEach(cat => cats.push(cat))
    if (cats.length) {
      this.mf2.properties.category = cats
    }
  }

  async createLocalFolder() {
    const flatten = array => {
      let result = []
      for (const a of array) {
        result.push(a)
        if (a.children && Array.isArray(a.children)) {
          result = result.concat(flatten(a.children))
        }
      }
      return result
    }

    const folders = this.browser.folder.split('/').filter(folder => folder)
    if (!folders || !folders.length) {
      return true
    }

    const tree = await browser.bookmarks.getTree()
    let existingFolders = flatten(tree).filter(item =>
      Array.isArray(item.children)
    )

    async function createFolder(name, parentId = false) {
      let newFolder = {
        title: name,
      }

      if (parentId) {
        newFolder.parentId = parentId
      }

      const existingFolder = existingFolders.find(folder => {
        const oldTitle = folder.title.trim().toLowerCase()
        const newTitle = name.trim().toLowerCase()
        if (parentId && oldTitle == newTitle && folder.parentId == parentId) {
          return true
        }
        if (!parentId && oldTitle == newTitle) {
          return true
        }
        return false
      })

      if (existingFolder) {
        // Folder exists, create the next level
        return existingFolder.id
      } else {
        // Folder doesn't exist so let's create it
        const res = await browser.bookmarks.create(newFolder)
        existingFolders.push(res)
        return res.id
      }
    }

    const createFolders = async folders => {
      let parentId = null
      for (const folder of folders) {
        parentId = await createFolder(folder, parentId)
      }
      this.browser.parentId = parentId
    }

    createFolders(folders)
  }

  async createLocal() {
    await this.createLocalFolder()
    let browserBookmark = this.browser
    delete browserBookmark.folder
    return await browser.bookmarks.create(browserBookmark)
  }

  async createMicropub() {
    // TODO: Would like to check that this doesn't already exist first
    return await micropub.create(this.mf2)
  }

  async deleteLocal() {
    if (this.browser.id) {
      return await browser.bookmarks.remove(this.browser.id)
    }
    return null
  }

  async deleteMicropub() {
    if (this.mf2.properties.url && this.mf2.properties.url[0]) {
      return await micropub.delete(this.mf2.properties.url[0])
    } else {
      throw new Error('Missing the permalink for the online bookmark')
    }
  }
}

export const getLocalFolders = async () => {
  const tree = await browser.bookmarks.getTree()
  let folders = []
  const flatten = (items, parentName = null) => {
    const childFolders = items.filter(item => item.children)
    if (childFolders) {
      for (const folder of childFolders) {
        if (
          parentName &&
          defaultFolders.indexOf(parentName.toLowerCase()) === -1
        ) {
          // Sub folder
          folder.title = parentName + '/' + folder.title
        }
        folders.push(folder.title)
        flatten(folder.children, folder.title)
      }
    }
  }
  flatten(tree)
  return folders
}

export const getLocal = async () => {
  const tree = await browser.bookmarks.getTree()
  let bookmarks = []
  const flatten = (items, folder = null) => {
    if (items && Array.isArray(items)) {
      for (const item of items) {
        if (folder) {
          item.folder = folder
        }
        if (item.children) {
          // This is a folder
          if (folder && defaultFolders.indexOf(folder.toLowerCase()) === -1) {
            // Sub folder
            item.title = folder + '/' + item.title
          }
          flatten(item.children, item.title)
          delete item.children
        } else {
          bookmarks.push(new Bookmark(item))
        }
      }
    }
  }
  flatten(tree)
  return bookmarks.filter(
    bookmark =>
      !bookmark.browser.url.startsWith('javascript:') &&
      bookmark.browser.folder.toLowerCase().trim() !== 'trash'
  )
}

export const getOnline = async () => {
  const query = 'source&post-type=bookmark&limit=9999'
  const url = `${micropub.options.micropubEndpoint}?q=${query}`

  const request = {
    method: 'GET',
    credentials: 'omit',
    headers: {
      Authorization: 'Bearer ' + micropub.options.token,
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      Accept: 'application/json',
    },
  }

  const res = await fetch(url, request)
  if (!res.ok) {
    console.log(
      'Error querying micropub bookmarks, probably because the query is not supported'
    )
    return []
  }
  const data = await res.json()
  return data.items.map(data => new Bookmark(data))
}

// NOTE: This deletes all online bookmarks, should probably never be used except for testing
export const deleteAllMicropub = async () => {
  console.log('Deleting all online bookmarks')
  const browserBookmarks = await getOnline()
  for (const bookmark of browserBookmarks) {
    const res = await bookmark.deleteMicropub()
    console.log('Deleted bookmark', res)
  }
}

export const sync = async () => {
  console.log('Beginning bookmark sync')
  let browserBookmarks = await getLocal()
  let onlineBookmarks = await getOnline()

  async function makeOnlineBookmarks(browserBookmarks, onlineBookmark) {
    for (const browserBookmark of browserBookmarks) {
      // Search to see if this bookmark exists on the site
      const onlineBookmark = onlineBookmarks.find(
        bookmark => bookmark.browser.url == browserBookmark.browser.url
      )
      if (onlineBookmark) {
        // There is a bookmark online, so check if the categories or title should be updated
        if (
          onlineBookmark.browser.title != browserBookmark.browser.title ||
          onlineBookmark.browser.folder.trim().toLowerCase() !=
            browserBookmark.browser.folder.trim().toLowerCase()
        ) {
          console.log(
            'Online bookmark exists but the title or folder is incorrect: ' +
              onlineBookmark.browser.url
          )
          console.log(
            onlineBookmark.browser.title,
            browserBookmark.browser.title ||
              onlineBookmark.browser.folder.trim().toLowerCase(),
            browserBookmark.browser.folder.trim().toLowerCase()
          )
          await onlineBookmark.deleteLocal()
          // await onlineBookmark.createLocal()
          console.log(
            'recreated the local bookmark from an update on your site'
          )
        }
      } else {
        // There is no bookmark online so create it
        console.log('Creating online bookmark', browserBookmark.mf2)
        try {
          const url = await browserBookmark.createMicropub()
          console.log('Micropub bookmark created', url)
        } catch (err) {
          console.log('error creating online bookmark', err)
        }
      }
    }
    console.log('Created online bookmarks')
  }

  async function makeLocalBookmarks(onlineBookmarks) {
    for (const onlineBookmark of onlineBookmarks) {
      const browserBookmark = browserBookmarks.find(
        bookmark => onlineBookmark.browser.url == bookmark.browser.url
      )
      if (!browserBookmark) {
        console.log('Creating local bookmark', onlineBookmark.browser)
        await onlineBookmark.createLocal()
      }
    }
    console.log('Created local bookmarks')
  }

  await makeOnlineBookmarks(browserBookmarks, onlineBookmarks)
  await makeLocalBookmarks(onlineBookmarks)
  console.log('Syncing complete')
}
