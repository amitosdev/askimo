import test from 'ava'
import { buildContentParts, buildMessage, isImageFile } from '../lib/input.mjs'

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

// isImageFile tests

test('isImageFile returns true for .png', (t) => {
  t.true(isImageFile('photo.png'))
})

test('isImageFile returns true for .jpg', (t) => {
  t.true(isImageFile('photo.jpg'))
})

test('isImageFile returns true for .jpeg', (t) => {
  t.true(isImageFile('photo.jpeg'))
})

test('isImageFile returns true for .gif', (t) => {
  t.true(isImageFile('photo.gif'))
})

test('isImageFile returns true for .webp', (t) => {
  t.true(isImageFile('photo.webp'))
})

test('isImageFile returns false for .txt', (t) => {
  t.false(isImageFile('file.txt'))
})

test('isImageFile returns false for .js', (t) => {
  t.false(isImageFile('code.js'))
})

test('isImageFile is case-insensitive', (t) => {
  t.true(isImageFile('photo.PNG'))
  t.true(isImageFile('photo.JPG'))
})

// buildContentParts tests

test('buildContentParts returns array with image and text parts', (t) => {
  const imageData = { data: Buffer.from('fake'), mediaType: 'image/png' }
  const result = buildContentParts('describe this', imageData)
  t.is(result.length, 2)
  t.is(result[0].type, 'image')
  t.deepEqual(result[0].image, imageData.data)
  t.is(result[0].mimeType, 'image/png')
  t.is(result[1].type, 'text')
  t.is(result[1].text, 'describe this')
})

test('buildContentParts uses default text when no prompt', (t) => {
  const imageData = { data: Buffer.from('fake'), mediaType: 'image/jpeg' }
  const result = buildContentParts(undefined, imageData)
  t.is(result[1].text, 'Describe this image')
})
