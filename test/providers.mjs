// biome-ignore-all lint/style/useNamingConvention: values in configs are often upper case with underscores
import test from 'ava'
import { DEFAULT_MODELS, determineProvider } from '../lib/providers.mjs'

// determineProvider tests

test('determineProvider returns perplexity when --perplexity flag is set', (t) => {
  const result = determineProvider({ perplexity: true })
  t.is(result, 'perplexity')
})

test('determineProvider returns openai when --openai flag is set', (t) => {
  const result = determineProvider({ openai: true })
  t.is(result, 'openai')
})

test('determineProvider returns anthropic when --anthropic flag is set', (t) => {
  const result = determineProvider({ anthropic: true })
  t.is(result, 'anthropic')
})

test('determineProvider prefers flag over config', (t) => {
  const result = determineProvider({ openai: true }, { DEFAULT_PROVIDER: 'anthropic' })
  t.is(result, 'openai')
})

test('determineProvider uses DEFAULT_PROVIDER from config when no flag', (t) => {
  const result = determineProvider({}, { DEFAULT_PROVIDER: 'openai' })
  t.is(result, 'openai')
})

test('determineProvider handles case-insensitive DEFAULT_PROVIDER', (t) => {
  const result = determineProvider({}, { DEFAULT_PROVIDER: 'ANTHROPIC' })
  t.is(result, 'anthropic')
})

test('determineProvider defaults to perplexity when no flag or config', (t) => {
  const result = determineProvider({})
  t.is(result, 'perplexity')
})

test('determineProvider defaults to perplexity with invalid DEFAULT_PROVIDER', (t) => {
  const result = determineProvider({}, { DEFAULT_PROVIDER: 'invalid' })
  t.is(result, 'perplexity')
})

// DEFAULT_MODELS tests

test('DEFAULT_MODELS contains perplexity model', (t) => {
  t.is(DEFAULT_MODELS.perplexity, 'sonar')
})

test('DEFAULT_MODELS contains openai model', (t) => {
  t.is(DEFAULT_MODELS.openai, 'gpt-4o')
})

test('DEFAULT_MODELS contains anthropic model', (t) => {
  t.is(DEFAULT_MODELS.anthropic, 'claude-sonnet-4-20250514')
})
