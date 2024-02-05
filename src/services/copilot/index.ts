import consola from 'consola'
import { ofetch } from 'ofetch'
import { v4 as uuid } from 'uuid'
import type { FastifyRequest } from 'fastify'
import type { GithubCopilotTokenAuthorization, GithubCopilotTokenAuthorizationRemoteBody } from '../../types'
import { getCache, setCache } from '../../utils/cache.util'

const authUrl = 'https://api.github.com/copilot_internal/v2/token'

interface Authorization {
  token: string
  expires_at: number
}

async function fetchAuth(token: string) {
  const res = await ofetch<GithubCopilotTokenAuthorizationRemoteBody>(authUrl, {
    headers: {
      Authorization: `token ${token}`,
    },
  })
  consola.success(`[Copilot] Auth fetch success`)
  return res
}

export async function getAuthFromToken(token: string) {
  const auth = getAuthFromCache(token)
  // eslint-disable-next-line style/max-statements-per-line
  if (auth) { return auth }
  else {
    const auth = await fetchAuth(token)
    consola.success(`[Copilot] Get GithubCopilot Authorization Token Success: App_Token: ${token} Token: ${auth.token} Expires: ${auth.expires_at}`)
    return setAuthToCache(token, {
      token: auth.token,
      expires_at: auth.expires_at,
    })
  }
}

async function refreshSession(token: string) {
  const cache = getCache('copilot', 'auth') as GithubCopilotTokenAuthorization[] || []
  const authInCache = cache.find((c: GithubCopilotTokenAuthorization) => c.app_token === token)
  if (!authInCache)
    return null
  if (authInCache.session_expires_at < new Date().getTime()) {
    consola.info(`[Copilot] Session Expired. Refreshing GithubCopilot Authorization Token in Cache.`)
    authInCache.session_expires_at = new Date().getTime() + 60 * 15
    authInCache.vscode_sessionid = uuid() + new Date().getTime()
    const auth = await fetchAuth(token)
    authInCache.app_token = auth.token
    setCache('copilot', 'auth', cache.map((c: GithubCopilotTokenAuthorization) => c.app_token === token ? authInCache : c))
    consola.success(`[Copilot] Refresh GithubCopilot Authorization Token in Cache. Token: ${token} Session Expires: ${authInCache.session_expires_at}`)
  }
}

export function setAuthToCache(token: string, auth: Authorization) {
  const cache = getCache('copilot', 'auth') as GithubCopilotTokenAuthorization[] || []
  const vscode_sessionid = uuid() + new Date().getTime()
  const session_expires_at = new Date().getTime() + 60 * 15
  const _new = {
    app_token: token,
    c_token: auth.token,
    expires_at: auth.expires_at,
    last_touched: new Date().getTime(),
    vscode_sessionid,
    vscode_machineid: uuid(),
    session_expires_at,
  } as GithubCopilotTokenAuthorization
  setCache('copilot', 'auth', [...cache, _new])
  consola.success(`[Copilot] Set GithubCopilot Authorization Token to Cache. App_Token: ${token} VSCode SessionID: ${vscode_sessionid} MachineID: ${_new.vscode_machineid} Session Expires: ${_new.session_expires_at}`)
  return auth
}

/**
 * Get auth from cache
 *
 * If the token is not in the cache, return null.
 * @param token
 */
export function getAuthFromCache(token: string): GithubCopilotTokenAuthorization | null {
  const cache = getCache('copilot', 'auth') as GithubCopilotTokenAuthorization[] || []
  const authInCache = cache.find((c: GithubCopilotTokenAuthorization) => c.app_token === token)
  if (!authInCache)
    return null
  refreshSession(token)
  // const now = new Date().getTime() + 600
  // if (authInCache && new Date(authInCache.expires_at).getTime() > now) {
  //   return authInCache
  // }
  // else {
  //   setCache('copilot', 'auth', cache.filter((c: GithubCopilotTokenAuthorization) => c.app_token !== token))
  //   return null
  // }

  return authInCache
}

export function getAuthorization(request: FastifyRequest) {
  const copilotToken = request.headers.authorization?.replace('Bearer ', '')
  if (!copilotToken)
    return null
  return copilotToken
}

export function generateCopilotRequestHeader(token: string, stream: boolean = true) {
  const auth = getAuthFromCache(token) as GithubCopilotTokenAuthorization
  if (!auth) {
    consola.warn(`[Copilot] Failed to generate request header. Token: ${token} is not in cache.`)
    return null
  }
  const contentType = stream ? 'text/event-stream; charset=utf-8' : 'application/json; charset=utf-8'
  return {
    'Authorization': `Bearer ${auth.c_token}`,
    'Vscode-Sessionid': auth.vscode_sessionid,
    'Vscode-Machineid': auth.vscode_machineid,
    'Editor-Version': 'vscode/1.83.1',
    'Editor-plugin-version': 'copilot-chat/0.8.0',
    'Openai-Organization': 'github-copilot',
    'Openai-Intent': 'conversation-panel',
    'Content-Type': contentType,
    'User-Agent': 'GitHubCopilotChat/0.8.0',
    'Accept-Encoding': 'gzip,deflate,br',
    'Accept': '*/*',
  }
}
