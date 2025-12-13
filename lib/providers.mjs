import { createAnthropic } from '@ai-sdk/anthropic'
import { createOpenAI } from '@ai-sdk/openai'
import { createPerplexity } from '@ai-sdk/perplexity'
import { createXai } from '@ai-sdk/xai'

const DEFAULT_MODELS = {
  perplexity: 'sonar',
  openai: 'gpt-4o',
  anthropic: 'claude-sonnet-4-20250514',
  xai: 'grok-4'
}

// Perplexity doesn't have a models list API, so we hardcode these
const PERPLEXITY_MODELS = [
  { id: 'sonar', description: 'Lightweight, cost-effective search model' },
  { id: 'sonar-pro', description: 'Advanced search for complex queries' },
  { id: 'sonar-reasoning', description: 'Chain-of-thought problem solving' },
  { id: 'sonar-reasoning-pro', description: 'Advanced reasoning (DeepSeek-R1)' },
  { id: 'sonar-deep-research', description: 'Deep research sessions' }
]

// xAI doesn't have a public models list API, so we hardcode these
const XAI_MODELS = [
  { id: 'grok-4-1-fast-reasoning', description: 'Grok 4.1 fast with reasoning' },
  { id: 'grok-4-1-fast-non-reasoning', description: 'Grok 4.1 fast without reasoning' },
  { id: 'grok-code-fast-1', description: 'Grok optimized for code' },
  { id: 'grok-4-fast-reasoning', description: 'Grok 4 fast with reasoning' },
  { id: 'grok-4-fast-non-reasoning', description: 'Grok 4 fast without reasoning' },
  { id: 'grok-4-0709', description: 'Grok 4 flagship model' },
  { id: 'grok-3-mini', description: 'Lightweight Grok 3 model' },
  { id: 'grok-3', description: 'Grok 3 base model' },
  { id: 'grok-2-vision-1212', description: 'Grok 2 with vision capabilities' },
  { id: 'grok-2-image-1212', description: 'Image generation model' }
]

async function fetchOpenAiModels(apiKey) {
  const response = await fetch('https://api.openai.com/v1/models', {
    // biome-ignore lint/style/useNamingConvention: headers use standard capitalization
    headers: { Authorization: `Bearer ${apiKey}` }
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`)
  }

  const data = await response.json()
  return data.data.map((m) => ({ id: m.id, created: m.created })).sort((a, b) => b.created - a.created)
}

async function fetchAnthropicModels(apiKey) {
  const response = await fetch('https://api.anthropic.com/v1/models', {
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    }
  })

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status}`)
  }

  const data = await response.json()
  return data.data.map((m) => ({
    id: m.id,
    displayName: m.display_name
  }))
}

async function listModels(provider, config) {
  switch (provider) {
    case 'perplexity':
      return PERPLEXITY_MODELS

    case 'openai': {
      const apiKey = config.OPENAI_API_KEY
      if (!apiKey) {
        throw new Error('OPENAI_API_KEY not found in config')
      }
      return fetchOpenAiModels(apiKey)
    }

    case 'anthropic': {
      const apiKey = config.ANTHROPIC_API_KEY
      if (!apiKey) {
        throw new Error('ANTHROPIC_API_KEY not found in config')
      }
      return fetchAnthropicModels(apiKey)
    }

    case 'xai':
      return XAI_MODELS

    default:
      throw new Error(`Unknown provider: ${provider}`)
  }
}

function getProvider(providerName, config) {
  switch (providerName) {
    case 'perplexity': {
      const apiKey = config.PERPLEXITY_API_KEY
      if (!apiKey) {
        throw new Error('PERPLEXITY_API_KEY not found in config')
      }
      const modelName = config.PERPLEXITY_MODEL || DEFAULT_MODELS.perplexity
      const perplexity = createPerplexity({ apiKey })
      return {
        model: perplexity(modelName),
        name: 'perplexity',
        modelName
      }
    }
    case 'openai': {
      const apiKey = config.OPENAI_API_KEY
      if (!apiKey) {
        throw new Error('OPENAI_API_KEY not found in config')
      }
      const modelName = config.OPENAI_MODEL || DEFAULT_MODELS.openai
      const openai = createOpenAI({ apiKey })
      return {
        model: openai(modelName),
        name: 'openai',
        modelName
      }
    }
    case 'anthropic': {
      const apiKey = config.ANTHROPIC_API_KEY
      if (!apiKey) {
        throw new Error('ANTHROPIC_API_KEY not found in config')
      }
      const modelName = config.ANTHROPIC_MODEL || DEFAULT_MODELS.anthropic
      const anthropic = createAnthropic({ apiKey })
      return {
        model: anthropic(modelName),
        name: 'anthropic',
        modelName
      }
    }
    case 'xai': {
      const apiKey = config.XAI_API_KEY
      if (!apiKey) {
        throw new Error('XAI_API_KEY not found in config')
      }
      const modelName = config.XAI_MODEL || DEFAULT_MODELS.xai
      const xai = createXai({ apiKey })
      return {
        model: xai(modelName),
        name: 'xai',
        modelName
      }
    }
    default:
      throw new Error(`Unknown provider: ${providerName}`)
  }
}

function determineProvider(options, config = {}) {
  if (options.openai) return 'openai'
  if (options.anthropic) return 'anthropic'
  if (options.perplexity) return 'perplexity'
  if (options.xai) return 'xai'

  const defaultProvider = config.DEFAULT_PROVIDER?.toLowerCase()
  if (defaultProvider && ['perplexity', 'openai', 'anthropic', 'xai'].includes(defaultProvider)) {
    return defaultProvider
  }

  return 'perplexity'
}

export { getProvider, determineProvider, DEFAULT_MODELS, listModels }
