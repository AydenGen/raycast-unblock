import consola from 'consola'
import { generateCopilotRequestHeader, getAuthFromToken } from '../../../services/copilot'
import type { AIGenerateContent } from '../../../types'
import { getAIConfig } from '../../../utils/env.util'
import { copilotClient } from '../../../utils'

const completions = '/chat/completions'

export async function CopilotGenerateContent(prompt: {
  role: string
  content: string
}[], msg?: string): Promise<AIGenerateContent> {
  const messages = []
  for (const m of prompt) {
    messages.push({
      role: m.role,
      content: m.content,
    })
  }
  if (msg) {
    messages.push({
      role: 'system',
      content: msg,
    })
  }

  const app_token = getAIConfig().key
  if (!app_token) {
    consola.error(`[Copilot] Auth error: Missing token`)
    throw new Error('Unauthorized. Missing token')
  }
  try {
    const _ = await getAuthFromToken(app_token)
  }
  catch (e: any) {
    consola.error(`[Copilot] Auth error: ${e.message}.`)
    throw new Error('Unauthorized. Invalid token')
  }

  const temperature = Number(getAIConfig().temperature || 0.5)
  const requestBody = {
    messages,
    model: 'gpt-4',
    temperature,
    top_p: 1,
    n: 1,
    stream: false,
  }
  const headers = generateCopilotRequestHeader(app_token, false) as Record<string, string>

  const result = await copilotClient(completions, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody),
  }).catch((e: any) => {
    consola.error(`[Copilot] Request error: ${e.message}.`)
    return null
  })

  const text = result.choices[0].message.content
  const split = text.split('\n')
  const detectedSourceLanguage = split[0]
  const translatedText = split[1]

  return {
    content: translatedText,
    detectedSourceLanguage,
  }
}
