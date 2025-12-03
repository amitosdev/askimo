// biome-ignore-all lint/style/useNamingConvention: values in configs are often upper case with underscores
import test from 'ava'
import { parseConfig } from '../lib/config.mjs'

test('parseConfig parses simple key=value pairs', (t) => {
  const content = 'FOO=bar\nBAZ=qux'
  const result = parseConfig(content)
  t.deepEqual(result, { FOO: 'bar', BAZ: 'qux' })
})

test('parseConfig ignores empty lines', (t) => {
  const content = 'FOO=bar\n\nBAZ=qux\n'
  const result = parseConfig(content)
  t.deepEqual(result, { FOO: 'bar', BAZ: 'qux' })
})

test('parseConfig ignores comment lines', (t) => {
  const content = '# This is a comment\nFOO=bar\n# Another comment\nBAZ=qux'
  const result = parseConfig(content)
  t.deepEqual(result, { FOO: 'bar', BAZ: 'qux' })
})

test('parseConfig ignores lines without equals sign', (t) => {
  const content = 'FOO=bar\ninvalid line\nBAZ=qux'
  const result = parseConfig(content)
  t.deepEqual(result, { FOO: 'bar', BAZ: 'qux' })
})

test('parseConfig trims whitespace around keys and values', (t) => {
  const content = '  FOO  =  bar  \n  BAZ  =  qux  '
  const result = parseConfig(content)
  t.deepEqual(result, { FOO: 'bar', BAZ: 'qux' })
})

test('parseConfig handles values with equals signs', (t) => {
  const content = 'API_KEY=abc=def=ghi'
  const result = parseConfig(content)
  t.deepEqual(result, { API_KEY: 'abc=def=ghi' })
})

test('parseConfig handles empty values', (t) => {
  const content = 'EMPTY_KEY='
  const result = parseConfig(content)
  t.deepEqual(result, { EMPTY_KEY: '' })
})

test('parseConfig returns empty object for empty content', (t) => {
  const result = parseConfig('')
  t.deepEqual(result, {})
})

test('parseConfig returns empty object for only comments', (t) => {
  const content = '# comment 1\n# comment 2'
  const result = parseConfig(content)
  t.deepEqual(result, {})
})

test('parseConfig handles typical config file', (t) => {
  const content = `# API Keys
PERPLEXITY_API_KEY=pplx-123
OPENAI_API_KEY=sk-456
ANTHROPIC_API_KEY=ant-789

# Optional settings
DEFAULT_PROVIDER=openai
OPENAI_MODEL=gpt-4-turbo`

  const result = parseConfig(content)
  t.deepEqual(result, {
    PERPLEXITY_API_KEY: 'pplx-123',
    OPENAI_API_KEY: 'sk-456',
    ANTHROPIC_API_KEY: 'ant-789',
    DEFAULT_PROVIDER: 'openai',
    OPENAI_MODEL: 'gpt-4-turbo'
  })
})
