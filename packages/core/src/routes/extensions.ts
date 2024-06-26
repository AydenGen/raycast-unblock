import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import consola from 'consola'
import destr from 'destr'
import { Debug } from '../utils/log.util'
import { httpClient } from '../utils'

// import { ofetch } from 'ofetch'
// import { getStore, setStore } from '../utils/store.util'

// const EXTENSION_ASSETS_URL = 'https://api.github.com/repos/wibus-wee/raycast-unblock/releases/154304368/assets'

// async function getDownloadDetails() {
//   const cache = getStore<{
//     timestamp: number
//     response: any
//   }>('extension_assets_cache')

//   if (cache && cache.timestamp + 86400000 > Date.now()) {
//     return {
//       download_url: cache.response[0].browser_download_url,
//       updated_at: cache.response[0].updated_at,
//     }
//   }

//   const response = await ofetch(EXTENSION_ASSETS_URL, {
//     method: 'GET',
//     headers: {
//       'Accept': 'application/vnd.github.v3+json',
//       'User-Agent': 'Raycast Unblock',
//     },
//   })

//   setStore('extension_assets_cache', {
//     timestamp: Date.now(),
//     response,
//   })

//   return {
//     download_url: response[0].browser_download_url,
//     updated_at: response[0].updated_at,
//   }
// }

interface Datum {
  relative_path: string
  api_version: string
  categories: string[]
  native_id: null
  status: string
  title: string
  readme_assets_path: string
  icons: Icons
  commands: Command[]
  updated_at: number
  owner: Author
  is_new: boolean
  contributors: Author[]
  metadata_count: number
  source_url: string
  name: string
  kill_listed_at: number
  download_url: string
  id: string
  access: string
  commit_sha: string
  readme_url: null | string
  download_count: number
  created_at: number
  store_url: string
  author: Author
  description: string
  changelog: Changelog
  metadata: any[]
  listed: boolean
}

interface Changelog {
  versions: Version[]
}

interface Version {
  markdown: string
  title: string
  date: string
  title_link?: null
}

interface Author {
  id: string
  slack_community_username?: null | string
  avatar_placeholder_color: string
  created_at?: number
  handle: string
  bio?: null | string
  twitter_handle?: null | string
  location?: null | string
  slack_community_user_id?: null | string
  website_anchor?: null | string
  username?: string
  avatar: null | string
  github_handle?: null | string
  website?: null | string
  name: string
  initials: string
}

interface Command {
  icons: Icons
  subtitle: string
  id: string
  keywords: any[]
  title: string
  mode: Mode
  disabled_by_default: boolean
  description: string
  name: string
  beta: boolean
}

interface Icons {
  light: null | string
  dark: null | string
}

enum Mode {
  MenuBar = 'menu-bar',
  NoView = 'no-view',
  View = 'view',
}

const owner: Author = {
  id: 'd5de6450-58ea-4cf8-94f4-723b9f77c6of',
  slack_community_username: null,
  avatar_placeholder_color: '#D85A9B',
  created_at: 1618576021,
  handle: 'wibus-wee',
  bio: '',
  twitter_handle: 'wibus_wee',
  location: 'Undefined',
  slack_community_user_id: null,
  website_anchor: null,
  username: 'wibus-wee',
  avatar: 'https:\/\/files.raycast.com\/n4vypr7cb2946natd8d6ea6fkefb',
  github_handle: 'wibus-wee',
  website: null,
  name: 'Wibus',
  initials: 'W',
}

const EXTENSION_DETAILS: Datum = {
  id: 'd5de6450-58ea-4cf8-94f4-723b9f77c6of',
  download_url: 'https:\/\/github.com\/wibus-wee\/raycast-unblock\/releases\/download\/ci\/raycast-unblock-extension.zip',
  created_at: 1714135495,
  updated_at: 1714135495,
  relative_path: 'extensions\/raycast-unblock\/',
  api_version: '1.62.0',
  categories: [
    'Productivity',
  ],
  native_id: null,
  status: 'active',
  title: 'Raycast Unblock Extension',
  readme_assets_path: 'https:\/\/github.com\/wibus-wee\/raycast-unblock\/raw\/main\/README.md',
  icons: {
    light: null,
    dark: null,
  },
  commands: [],
  is_new: true,
  changelog: {
    versions: [
      {
        markdown: `This is a fake plugin detail intercepted and generated by Raycast Unblock.`,
        title: 'Fake Changelog',
        date: '2024-05-05',
        title_link: null,
      },
    ],
  },
  metadata_count: 0,
  metadata: [],
  listed: true,
  name: 'raycast-unblock',
  kill_listed_at: 0,
  source_url: 'https:\/\/github.com\/wibus-wee\/raycast-unblock',
  access: 'public',
  download_count: 99999,
  store_url: 'https:\/\/github.com\/wibus-wee\/raycast-unblock',
  owner,
  author: owner,
  description: 'A extension for Raycast Unblock. Unblock the Pro features of Raycast.\n\n>> This is a fake plugin detail intercepted and generated by Raycast Unblock.',
  commit_sha: 'b9708d711abd65ddd5d6a5b68cbadf530c40959d',
  readme_url: 'https:\/\/github.com\/wibus-wee\/raycast-unblock\/blob\/main\/README.md',
  contributors: [
    owner,
  ],
}

export function ExtensionsRoute(fastify: FastifyInstance, opts: Record<any, any>, done: Function) {
  fastify.get('/featured', async (request: FastifyRequest, reply: FastifyReply) => {
    // /extensions/featured?per_page=3&include_native=true&page=1
    // 丢回最基本的请求
    Debug.info('[GET] /featured --> Backend Request --> Official Request')
    const url = new URL(request.url, 'https://backend.raycast.com')
    request.headers = {
      ...request.headers,
      host: 'backend.raycast.com',
    }
    const backendResponse = await httpClient(url, {
      headers: request.headers as Record<string, string>,
      method: 'GET',
      redirect: 'manual',
    }).catch((reason) => {
      consola.error(`[GET] /featured <-x- Local Handler <-x- Official Request Error`)
      return reply.send(reason)
    }) as any

    consola.info(`[GET] /featured <-- Local Handler <-- Official Request Response`)

    const data = destr<any>(backendResponse.data)
    const first = data[0]
    data[0] = EXTENSION_DETAILS
    data.push(first)
    return reply.send({ data })
  })

  fastify.get('/wibus-wee/raycast-unblock', async (_request: FastifyRequest, reply: FastifyReply) => {
    Debug.info('[GET] /wibus-wee/raycast-unblock --> Backend Request')
    Debug.info('[GET] /wibus-wee/raycast-unblock <-- Local Hander <-- Backend Response')
    return reply.send(EXTENSION_DETAILS)
  })

  fastify.get('/*', async (request, reply) => {
    const subUrl = request.url.substring(0, 30)
    Debug.info(`[GET] ${subUrl} <-- 托底策略 --> Backend Request`)

    const url = new URL(request.url, 'https://backend.raycast.com')

    request.headers = {
      ...request.headers,
      host: 'backend.raycast.com',
    }

    const backendResponse = await httpClient.native(url, {
      headers: request.headers as Record<string, string>,
      method: 'GET',
      redirect: 'manual',
    }).catch((reason) => {
      consola.error(`[GET] ${subUrl} <-- 托底策略 <-x- Backend Response Error`)
      consola.error(reason)
      return reply.send(reason)
    })
    Debug.info(`[GET] ${subUrl} <-- 托底策略 <-- Backend Response`)

    const headers = Object.fromEntries(backendResponse.headers.entries())
    delete headers['content-encoding']

    const bodyBuffer = await backendResponse.arrayBuffer()
    const bodyArray = new Uint8Array(bodyBuffer)

    return reply.status(backendResponse.status).headers(headers).send(bodyArray)
  })

  done()
}
