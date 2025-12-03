import test from 'ava'
import { buildJsonOutput } from '../lib/stream.mjs'

const createMockConversation = (overrides = {}) => ({
  id: 'test-123',
  provider: 'openai',
  model: 'gpt-4o',
  messages: [],
  ...overrides
})

test('buildJsonOutput includes provider from conversation', (t) => {
  const conversation = createMockConversation({ provider: 'anthropic' })
  const output = buildJsonOutput(conversation, 'response text')
  t.is(output.provider, 'anthropic')
})

test('buildJsonOutput includes model from conversation', (t) => {
  const conversation = createMockConversation({ model: 'gpt-4-turbo' })
  const output = buildJsonOutput(conversation, 'response text')
  t.is(output.model, 'gpt-4-turbo')
})

test('buildJsonOutput includes conversationId', (t) => {
  const conversation = createMockConversation({ id: 'abc-456' })
  const output = buildJsonOutput(conversation, 'response text')
  t.is(output.conversationId, 'abc-456')
})

test('buildJsonOutput includes response', (t) => {
  const conversation = createMockConversation()
  const output = buildJsonOutput(conversation, 'Hello, world!')
  t.is(output.response, 'Hello, world!')
})

test('buildJsonOutput extracts question from last user message', (t) => {
  const conversation = createMockConversation({
    messages: [
      { role: 'user', content: 'First question' },
      { role: 'assistant', content: 'First answer' },
      { role: 'user', content: 'Second question' }
    ]
  })
  const output = buildJsonOutput(conversation, 'response')
  t.is(output.question, 'Second question')
})

test('buildJsonOutput returns empty question when no messages', (t) => {
  const conversation = createMockConversation({ messages: [] })
  const output = buildJsonOutput(conversation, 'response')
  t.is(output.question, '')
})

test('buildJsonOutput calculates messageCount correctly', (t) => {
  const conversation = createMockConversation({
    messages: [
      { role: 'user', content: 'Q1' },
      { role: 'assistant', content: 'A1' },
      { role: 'user', content: 'Q2' }
    ]
  })
  const output = buildJsonOutput(conversation, 'response')
  t.is(output.messageCount, 4) // 3 existing + 1 for new response
})

test('buildJsonOutput includes sources when provided', (t) => {
  const conversation = createMockConversation()
  const sources = [
    { title: 'Source 1', url: 'https://example.com/1' },
    { title: 'Source 2', url: 'https://example.com/2' }
  ]
  const output = buildJsonOutput(conversation, 'response', sources)
  t.deepEqual(output.sources, sources)
})

test('buildJsonOutput excludes sources when empty array', (t) => {
  const conversation = createMockConversation()
  const output = buildJsonOutput(conversation, 'response', [])
  t.false('sources' in output)
})

test('buildJsonOutput excludes sources when undefined', (t) => {
  const conversation = createMockConversation()
  const output = buildJsonOutput(conversation, 'response', undefined)
  t.false('sources' in output)
})

test('buildJsonOutput excludes sources when null', (t) => {
  const conversation = createMockConversation()
  const output = buildJsonOutput(conversation, 'response', null)
  t.false('sources' in output)
})
