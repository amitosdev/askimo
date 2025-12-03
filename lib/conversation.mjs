import { randomUUID } from 'node:crypto'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { CONVERSATIONS_DIR, ensureDirectories } from './config.mjs'

function createConversation(provider, model) {
  const id = randomUUID().slice(0, 8)
  const now = new Date().toISOString()
  return {
    id,
    createdAt: now,
    updatedAt: now,
    provider,
    model,
    messages: []
  }
}

async function loadConversation(n) {
  await ensureDirectories()

  try {
    const files = await readdir(CONVERSATIONS_DIR)
    const jsonFiles = files
      .filter((f) => f.endsWith('.json'))
      .sort()
      .reverse()

    if (jsonFiles.length === 0) {
      console.error('No previous conversations found')
      process.exit(1)
    }

    const index = n - 1
    if (index >= jsonFiles.length) {
      console.error(`Only ${jsonFiles.length} conversation(s) available`)
      process.exit(1)
    }

    const filePath = join(CONVERSATIONS_DIR, jsonFiles[index])
    const content = await readFile(filePath, 'utf8')
    return {
      conversation: JSON.parse(content),
      filePath
    }
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err
    }
    console.error('No conversations directory found')
    process.exit(1)
  }
}

async function saveConversation(conversation, existingPath = null) {
  await ensureDirectories()

  conversation.updatedAt = new Date().toISOString()

  let filePath = existingPath
  if (!filePath) {
    const timestamp = conversation.createdAt.replace(/:/g, '-')
    const filename = `${timestamp}-${conversation.id}.json`
    filePath = join(CONVERSATIONS_DIR, filename)
  }

  await writeFile(filePath, JSON.stringify(conversation, null, 2))
  return filePath
}

export { createConversation, loadConversation, saveConversation }
