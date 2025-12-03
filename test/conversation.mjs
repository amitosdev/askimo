import test from 'ava'
import { createConversation } from '../lib/conversation.mjs'

test('createConversation creates a conversation with correct provider', (t) => {
  const conversation = createConversation('openai', 'gpt-4o')
  t.is(conversation.provider, 'openai')
})

test('createConversation creates a conversation with correct model', (t) => {
  const conversation = createConversation('openai', 'gpt-4o')
  t.is(conversation.model, 'gpt-4o')
})

test('createConversation creates empty messages array', (t) => {
  const conversation = createConversation('openai', 'gpt-4o')
  t.deepEqual(conversation.messages, [])
})

test('createConversation generates 8-character id', (t) => {
  const conversation = createConversation('openai', 'gpt-4o')
  t.is(conversation.id.length, 8)
})

test('createConversation sets createdAt timestamp', (t) => {
  const before = new Date().toISOString()
  const conversation = createConversation('openai', 'gpt-4o')
  const after = new Date().toISOString()

  t.true(conversation.createdAt >= before)
  t.true(conversation.createdAt <= after)
})

test('createConversation sets updatedAt equal to createdAt', (t) => {
  const conversation = createConversation('openai', 'gpt-4o')
  t.is(conversation.updatedAt, conversation.createdAt)
})

test('createConversation generates unique ids', (t) => {
  const ids = new Set()
  for (let i = 0; i < 100; i++) {
    const conversation = createConversation('openai', 'gpt-4o')
    ids.add(conversation.id)
  }
  t.is(ids.size, 100)
})

test('createConversation works with perplexity provider', (t) => {
  const conversation = createConversation('perplexity', 'sonar')
  t.is(conversation.provider, 'perplexity')
  t.is(conversation.model, 'sonar')
})

test('createConversation works with anthropic provider', (t) => {
  const conversation = createConversation('anthropic', 'claude-sonnet-4-20250514')
  t.is(conversation.provider, 'anthropic')
  t.is(conversation.model, 'claude-sonnet-4-20250514')
})
