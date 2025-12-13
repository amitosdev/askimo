import input from '@inquirer/input'
import { createConversation, loadConversation, saveConversation } from './conversation.mjs'
import { streamResponse } from './stream.mjs'

async function startChat(model, providerName, modelName, continueN = null) {
  let conversation
  let existingPath = null

  if (continueN) {
    const loaded = await loadConversation(continueN)
    conversation = loaded.conversation
    existingPath = loaded.filePath

    if (conversation.provider !== providerName) {
      console.error(`Warning: Continuing ${conversation.provider} conversation with ${providerName}`)
    }

    console.log(`Continuing conversation ${conversation.id} (${conversation.messages.length} messages)`)
  } else {
    conversation = createConversation(providerName, modelName)
    console.log(`Starting new chat with ${providerName} (${modelName})`)
  }

  console.log('Type "exit" or press Ctrl+C to quit\n')

  while (true) {
    let question
    try {
      question = await input({ message: 'You:' })
    } catch {
      // User pressed Ctrl+C
      break
    }

    const trimmed = question.trim()
    if (!trimmed) continue
    if (trimmed.toLowerCase() === 'exit') break

    conversation.messages.push({
      role: 'user',
      content: trimmed
    })

    console.log('')
    const responseText = await streamResponse(model, conversation.messages, modelName)

    conversation.messages.push({
      role: 'assistant',
      content: responseText
    })

    await saveConversation(conversation, existingPath)
    if (!existingPath) {
      const timestamp = conversation.createdAt.replace(/:/g, '-')
      const { join } = await import('node:path')
      const { CONVERSATIONS_DIR } = await import('./config.mjs')
      existingPath = join(CONVERSATIONS_DIR, `${timestamp}-${conversation.id}.json`)
    }
  }

  console.log('\nChat ended. Conversation saved.')
}

export { startChat }
