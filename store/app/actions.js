import marked from 'marked'
import { sha256 } from 'js-sha256'
import base64js from 'base64-js'
import VueCookies from 'vue-cookies'
import localForage from 'localforage'

export function setDetails (context, data) {
  console.log('set details')
  // console.log(localForage)
  localForage.setItem('server', data.server)
  localForage.setItem('group', data.group)
  localForage.setItem('loginStatus', data.loginStatus)
  localForage.setItem('collections', data.collections)
  localForage.setItem('currentCollection', data.currentCollection)
}

export function login (context, data) {
  let loginStatus = false
  let loginsecret = null
  if (data.secret) {
    // console.log('secret is ' + data.secret)
    const secretBytes = new (TextEncoder)('utf-8').encode(data.secret)
    const randomBytes = new Uint8Array(32)
    window.crypto.getRandomValues(randomBytes)
    const concatedBytes = new Uint8Array(secretBytes.length + randomBytes.length)
    concatedBytes.set(secretBytes)
    concatedBytes.set(randomBytes, secretBytes.length)
    let digestPromise
    if (!window.crypto.subtle) {
      digestPromise = Promise.resolve(sha256.arrayBuffer(concatedBytes))
    } else {
      digestPromise = window.crypto.subtle.digest('SHA-256', concatedBytes)
    }
    digestPromise
      .then((s) => {
        const thesecret = base64js.fromByteArray(randomBytes) + '|' + base64js.fromByteArray(new Uint8Array(s))
        // console.log(thesecret)
        const bodyFormData = 'secret=' + encodeURIComponent(thesecret)
        fetch(data.server + 'authenticate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: bodyFormData
        }).then(async (response) => {
          // console.log(response)
          // get collections
          loginsecret = await response.text()
          VueCookies.set('audioserve_token', loginsecret)
          loginStatus = true
          context.commit('loginStatus', loginStatus)

          const collections = await fetchCollections(context)

          setDetails(context, {
            ...data,
            loginStatus,
            collections: collections.names,
            currentCollection: 0
          })
        }).catch((err) => {
          console.log(err)
        })
        /* return ajax({
            url: baseUrl + "/authenticate",
            type: "POST",
            data: { secret: secret }

        }); */
      })
  } else {
    loginStatus = true
    loginsecret = 'noauth'
  }
  context.commit('loginsecret', loginsecret)
  context.commit('loginStatus', loginStatus)

  setDetails(context, {
    ...data,
    loginStatus
  })

  /*
  // console.log(data)
  const response = await firelogin(context, data)
  switch (response.data.status) {
    case 'ok':
      context.commit('setLoginStatus', 'logged_in')
      if (this.$router.currentRoute.query && this.$router.currentRoute.query.forward) {
        window.location.replace(this.$router.currentRoute.query.forward)
      }
      break
    case 'multifactor':
      context.commit('setLoginStatus', 'multifactor')
      break
  }
  // ping(context)
  return response
  */
}

export async function fetchCollections (context) {
  const collections = await fetch(context.state.server + 'collections', {
    headers: {
      Authorization: 'Bearer ' + VueCookies.get('audioserve_token')
    }
  })
  return collections.json()
}

export async function getFolderDescription (context, path) {
  const description = await getDescription(context, path)
  context.commit('folderDescription', description)
}

export async function getBookDetails (context, hash) {
  let book = await localForage.getItem(hash)
  if (!book) {
    let description = null
    if (context.state.folder.description && context.state.folder.description.path) {
      description = await getDescription(context, context.state.folder.description.path)
    }
    let cover = null
    if (context.state.folder.cover) {
      cover = context.state.server + 'cover/' + context.state.folder.cover.path
    }

    book = {
      hash,
      name: 'Unknown',
      author: 'Unknown',
      description,
      cover,
      seek: 0
    }
    await localForage.setItem(hash, book)
  }

  context.commit('book', book)
}

export async function updateBookDetails (context, item) {
  const currentbook = context.state.book
  const updates = item.book
  const book = {
    ...currentbook,
    ...updates
  }
  await localForage.setItem(item.hash, book)
  context.commit('book', book)
}

export async function setBookDetails (context, book) {
  await localForage.setItem(book.hash, book)
  context.commit('book', book)
}

export async function getDescription (context, path) {
  const description = context.state.server + 'desc/' + path
  const response = await fetch(description, {
    headers: {
      Authorization: 'Bearer ' + VueCookies.get('audioserve_token')
    }
  })
  // console.log(response)
  // console.log(response.headers.get('Content-Type'))

  const mime = response.headers.get('Content-Type')
  const data = await response.text()
  // console.log(data)
  let output = ''
  let para = ''
  if (mime === 'text/html') {
    output = data
  } else if (mime === 'text/x-markdown' || mime === 'text/markdown') {
    output = marked(data)
  } else if (mime === 'text/plain') {
    const lines = data.split(/\r?\n/)
    for (const line of lines) {
      para += '<p>' + line + '</p>'
    }
    output = para
  } else {
    output = response.data
  }
  return output
}

export async function fileIsCached (context, details) {
  const cacheName = context.state.cacheKey + details.hash
  const exists = await caches.has(cacheName)
  if (exists) {
    const cacheStorage = await caches.open(cacheName)
    const cachedResponse = await cacheStorage.match(details.file)
    return (cachedResponse !== undefined)
  }
  return false
}

export function contentToExtension (mime) {
  let extension = 'mp3'
  switch (mime) {
    case 'audio/aac': extension = 'aac'; break
    case 'audio/mpeg': extension = 'mp3'; break
    case 'video/mp4': extension = 'mp4'; break
    case 'audio/ogg': extension = 'oga'; break
    case 'audio/opus': extension = 'opus'; break
    case 'audio/wav': extension = 'wav'; break
    case 'audio/webm': extension = 'weba'; break
    case 'audio/3gpp': extension = '3gp'; break
    case 'audio/3gpp2': extension = '3g2'; break
  }
  return extension
}

export async function getCachedFile (context, details) {
  const cacheName = context.state.cacheKey + details.hash
  const cacheStorage = await caches.open(cacheName)
  const cachedResponse = await cacheStorage.match(details.file)
  let url = null
  if (cachedResponse !== undefined) {
    const blob = await cachedResponse.blob()
    url = URL.createObjectURL(blob)
  }
  // const re = /(?:\.([^.]+))?$/
  const extension = contentToExtension(cachedResponse.headers.get('content-type'))

  return {
    src: url,
    // format: re.exec(cachedResponse.url)[1]
    format: extension
  }
}

export async function cacheFile (context, details) {
  const cacheName = context.state.cacheKey + details.hash
  const cacheStorage = await caches.open(cacheName)
  // await cacheStorage.add(details.file)
  const response = await fetch(details.file, {
    headers: {
      Authorization: 'Bearer ' + VueCookies.get('audioserve_token')
    }
  })
  console.log(response)
  const response2 = response.clone()
  cacheStorage.put(details.file, response)
  return response2
}

export async function tempCache (context, details) {
  const alreadyCached = await fileIsCached(context, details)
  if (alreadyCached) {
    return getCachedFile(context, details)
  }
  const response = await cacheFile(context, details)

  // return getCachedFile(context, details)
  let url = null
  if (response !== undefined) {
    const blob = await response.blob()
    url = URL.createObjectURL(blob)
  }
  // const re = /(?:\.([^.]+))?$/
  const extension = contentToExtension(response.headers.get('content-type'))

  return {
    src: url,
    // format: re.exec(response.url)[1]
    format: extension
  }
}

export async function initialiseApp (context) {
  const server = await localForage.getItem('server')
  const group = await localForage.getItem('group')
  const loginStatus = await localForage.getItem('loginStatus')
  const collections = await localForage.getItem('collections')
  const currentCollection = await localForage.getItem('currentCollection')
  if (server) {
    context.commit('server', server)
  }
  if (group) {
    context.commit('group', group)
  }
  if (loginStatus) {
    context.commit('loginStatus', loginStatus)
  }
  if (collections) {
    context.commit('collections', collections)
  }
  if (currentCollection) {
    context.commit('currentCollection', currentCollection)
  }
}