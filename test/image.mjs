import fs from 'node:fs/promises'
import path from 'node:path'
import test from 'ava'
import { buildImagePath, saveImages } from '../lib/image.mjs'

test('saveImages returns empty array when files is undefined', async (t) => {
  const result = await saveImages(undefined)
  t.deepEqual(result, [])
})

test('saveImages returns empty array when files is empty', async (t) => {
  const result = await saveImages([])
  t.deepEqual(result, [])
})

test('saveImages writes files and returns paths', async (t) => {
  const absDir = path.join(process.cwd(), `test-saveImages-${Date.now()}`)

  const files = [
    { mediaType: 'image/png', data: Buffer.from('fake-png') },
    { mediaType: 'image/jpeg', data: Buffer.from('fake-jpg') }
  ]

  const paths = await saveImages(files, absDir)

  t.is(paths.length, 2)
  t.true(paths[0].endsWith('.png'))
  t.true(paths[1].endsWith('.jpg'))

  const content0 = await fs.readFile(paths[0])
  t.deepEqual(content0, Buffer.from('fake-png'))

  const content1 = await fs.readFile(paths[1])
  t.deepEqual(content1, Buffer.from('fake-jpg'))

  // cleanup
  await fs.rm(absDir, { recursive: true })
})

test('buildImagePath uses correct extension for png', (t) => {
  const result = buildImagePath('/tmp', '2026-01-01T00:00:00.000Z', 1, 'image/png')
  t.true(result.endsWith('-1.png'))
})

test('buildImagePath uses correct extension for jpeg', (t) => {
  const result = buildImagePath('/tmp', '2026-01-01T00:00:00.000Z', 1, 'image/jpeg')
  t.true(result.endsWith('-1.jpg'))
})

test('buildImagePath uses correct extension for webp', (t) => {
  const result = buildImagePath('/tmp', '2026-01-01T00:00:00.000Z', 1, 'image/webp')
  t.true(result.endsWith('-1.webp'))
})

test('buildImagePath defaults to .png for unknown media type', (t) => {
  const result = buildImagePath('/tmp', '2026-01-01T00:00:00.000Z', 1, 'image/bmp')
  t.true(result.endsWith('-1.png'))
})

test('buildImagePath replaces colons in timestamp', (t) => {
  const result = buildImagePath('/tmp', '2026-01-01T12:30:45.000Z', 1, 'image/png')
  t.false(result.includes(':'))
})
