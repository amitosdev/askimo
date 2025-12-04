import test from 'ava'
import { buildMessage } from '../lib/input.mjs'

test('buildMessage combines prompt and content with colon format', (t) => {
  const result = buildMessage('explain this', 'const x = 1')
  t.is(result, 'explain this:\n\nconst x = 1')
})

test('buildMessage returns content only when no prompt', (t) => {
  const result = buildMessage(null, 'some content')
  t.is(result, 'some content')
})

test('buildMessage returns content only when prompt is undefined', (t) => {
  const result = buildMessage(undefined, 'some content')
  t.is(result, 'some content')
})

test('buildMessage returns prompt only when no content', (t) => {
  const result = buildMessage('what is 2+2', null)
  t.is(result, 'what is 2+2')
})

test('buildMessage returns prompt only when content is undefined', (t) => {
  const result = buildMessage('what is 2+2', undefined)
  t.is(result, 'what is 2+2')
})

test('buildMessage returns null when both are null', (t) => {
  const result = buildMessage(null, null)
  t.is(result, null)
})

test('buildMessage returns null when both are undefined', (t) => {
  const result = buildMessage(undefined, undefined)
  t.is(result, null)
})

test('buildMessage handles empty string prompt as falsy', (t) => {
  const result = buildMessage('', 'content')
  t.is(result, 'content')
})

test('buildMessage handles empty string content as falsy', (t) => {
  const result = buildMessage('prompt', '')
  t.is(result, 'prompt')
})

test('buildMessage preserves multiline content', (t) => {
  const content = 'line 1\nline 2\nline 3'
  const result = buildMessage('summarize', content)
  t.is(result, 'summarize:\n\nline 1\nline 2\nline 3')
})
