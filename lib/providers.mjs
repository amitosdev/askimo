import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createOpenAI } from '@ai-sdk/openai'
import { createPerplexity } from '@ai-sdk/perplexity'
import { createXai } from '@ai-sdk/xai'

const DEFAULT_MODELS = {
  perplexity: 'sonar',
  openai: 'gpt-4o',
  anthropic: 'claude-sonnet-4-20250514',
  xai: 'grok-4',
  gemini: 'gemini-3-pro-preview'
}

const DEFAULT_IMAGE_MODEL = 'gemini-3-pro-image-preview'

// Provider name mapping (askimo name → models.dev name)
const PROVIDER_MAP = {
  gemini: 'google'
}

async function fetchModelsFromApi() {
  const response = await fetch('https://models.dev/api.json')
  if (!response.ok) {
    throw new Error(`models.dev API error: ${response.status}`)
  }
  return response.json()
}

async function listModels(provider) {
  const apiData = await fetchModelsFromApi()
  const providerKey = PROVIDER_MAP[provider] || provider
  const providerData = apiData[providerKey]

  if (!providerData) {
    throw new Error(`Unknown provider: ${provider}`)
  }

  return Object.values(providerData.models).map((m) => ({
    id: m.id,
    description: m.name
  }))
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
    case 'gemini': {
      const apiKey = config.GOOGLE_GENERATIVE_AI_API_KEY
      if (!apiKey) {
        throw new Error('GOOGLE_GENERATIVE_AI_API_KEY not found in config')
      }
      const modelName = config.GEMINI_MODEL || DEFAULT_MODELS.gemini
      const google = createGoogleGenerativeAI({ apiKey })
      return {
        model: google(modelName),
        name: 'gemini',
        modelName
      }
    }
    default:
      throw new Error(`Unknown provider: ${providerName}`)
  }
}

function getImageProvider(config) {
  const apiKey = config.GOOGLE_GENERATIVE_AI_API_KEY
  if (!apiKey) {
    throw new Error('GOOGLE_GENERATIVE_AI_API_KEY not found in config')
  }
  const modelName = config.IMAGE_MODEL || DEFAULT_IMAGE_MODEL
  const google = createGoogleGenerativeAI({ apiKey })
  return {
    model: google(modelName),
    name: 'gemini',
    modelName
  }
}

function determineProvider(options, config = {}) {
  if (options.openai) return 'openai'
  if (options.anthropic) return 'anthropic'
  if (options.perplexity) return 'perplexity'
  if (options.xai) return 'xai'
  if (options.gemini) return 'gemini'

  const defaultProvider = config.DEFAULT_PROVIDER?.toLowerCase()
  if (defaultProvider && ['perplexity', 'openai', 'anthropic', 'xai', 'gemini'].includes(defaultProvider)) {
    return defaultProvider
  }

  return 'perplexity'
}

export { DEFAULT_MODELS, determineProvider, getImageProvider, getProvider, listModels }
