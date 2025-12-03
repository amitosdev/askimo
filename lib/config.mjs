import { mkdir, readFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'

const ASKIMO_DIR = join(homedir(), '.askimo')
const CONFIG_FILE = join(ASKIMO_DIR, 'config')
const CONVERSATIONS_DIR = join(ASKIMO_DIR, 'conversations')

function parseConfig(content) {
  const config = {}

  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const eqIndex = trimmed.indexOf('=')
    if (eqIndex === -1) continue

    const key = trimmed.slice(0, eqIndex).trim()
    config[key] = trimmed.slice(eqIndex + 1).trim()
  }

  return config
}

async function loadConfig() {
  try {
    const content = await readFile(CONFIG_FILE, 'utf8')
    return parseConfig(content)
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err
    }
    console.error(`Config file not found: ${CONFIG_FILE}`)
    console.error('Create the file with your API keys:')
    console.error('  PERPLEXITY_API_KEY=your-key')
    console.error('  OPENAI_API_KEY=your-key')
    console.error('  ANTHROPIC_API_KEY=your-key')
    console.error('')
    console.error('Optional settings:')
    console.error('  DEFAULT_PROVIDER=perplexity  # perplexity, openai, or anthropic')
    console.error('  PERPLEXITY_MODEL=sonar       # default model for Perplexity')
    console.error('  OPENAI_MODEL=gpt-4o          # default model for OpenAI')
    console.error('  ANTHROPIC_MODEL=claude-sonnet-4-20250514  # default model for Anthropic')
    process.exit(1)
  }
}

async function ensureDirectories() {
  await mkdir(ASKIMO_DIR, { recursive: true })
  await mkdir(CONVERSATIONS_DIR, { recursive: true })
}

export { loadConfig, ensureDirectories, parseConfig, ASKIMO_DIR, CONVERSATIONS_DIR }
