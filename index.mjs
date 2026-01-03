#!/usr/bin/env node

import { Command } from 'commander'
import { startChat } from './lib/chat.mjs'
import { ensureDirectories, loadConfig } from './lib/config.mjs'
import { createConversation, loadConversation, loadConversationById, saveConversation } from './lib/conversation.mjs'
import { showConversationsInBrowser } from './lib/conversations-ui.mjs'
import { buildMessage, readFile, readStdin } from './lib/input.mjs'
import { DEFAULT_MODELS, determineProvider, getProvider, listModels } from './lib/providers.mjs'
import { generateResponse, outputJson, streamResponse } from './lib/stream.mjs'
import pkg from './package.json' with { type: 'json' }

const program = new Command()

program.name('askimo').description('CLI tool for communicating with AI providers').version(pkg.version)

program
  .command('ask', { isDefault: true })
  .description('Ask a single question')
  .argument('[question]', 'The question to ask (can also pipe content via stdin)')
  .option('-p, --perplexity', 'Use Perplexity AI (default)')
  .option('-o, --openai', 'Use OpenAI')
  .option('-a, --anthropic', 'Use Anthropic Claude')
  .option('-x, --xai', 'Use xAI Grok')
  .option('-g, --gemini', 'Use Google Gemini')
  .option('-j, --json', 'Output as JSON instead of streaming')
  .option('-c, --continue <n>', 'Continue conversation N (1=last, 2=second-to-last)', Number.parseInt)
  .option('--cid <id>', 'Continue conversation by ID')
  .option('-f, --file <path>', 'Read content from file')
  .action(async (question, options) => {
    try {
      const stdinContent = await readStdin()
      const fileContent = options.file ? await readFile(options.file) : null

      if (stdinContent && options.file) {
        console.error('Error: Cannot use both piped input and --file flag')
        process.exit(1)
      }

      const content = stdinContent || fileContent
      const message = buildMessage(question, content)

      if (!message) {
        console.error('Error: No question provided. Use: askimo "question" or pipe content')
        process.exit(1)
      }

      const config = await loadConfig()
      await ensureDirectories()

      const providerName = determineProvider(options, config)
      const { model, name, modelName } = getProvider(providerName, config)

      let conversation
      let existingPath = null

      if (options.continue && options.cid) {
        console.error('Error: Cannot use both -c and --cid flags')
        process.exit(1)
      }

      if (options.continue) {
        const loaded = await loadConversation(options.continue)
        conversation = loaded.conversation
        existingPath = loaded.filePath

        if (conversation.provider !== name) {
          console.error(`Warning: Continuing ${conversation.provider} conversation with ${name}`)
        }
      } else if (options.cid) {
        const loaded = await loadConversationById(options.cid)
        conversation = loaded.conversation
        existingPath = loaded.filePath

        if (conversation.provider !== name) {
          console.error(`Warning: Continuing ${conversation.provider} conversation with ${name}`)
        }
      } else {
        conversation = createConversation(name, modelName)
      }

      conversation.messages.push({
        role: 'user',
        content: message
      })

      let responseText

      if (options.json) {
        const { text, sources, duration } = await generateResponse(model, conversation.messages)
        responseText = text
        conversation.messages.push({
          role: 'assistant',
          content: responseText
        })
        await saveConversation(conversation, existingPath)
        outputJson(conversation, responseText, sources, duration)
      } else {
        responseText = await streamResponse(model, conversation.messages, modelName)
        conversation.messages.push({
          role: 'assistant',
          content: responseText
        })
        await saveConversation(conversation, existingPath)
      }
    } catch (err) {
      console.error('Error:', err.message)
      process.exit(1)
    }
  })

program
  .command('chat')
  .description('Start an interactive chat session')
  .option('-p, --perplexity', 'Use Perplexity AI (default)')
  .option('-o, --openai', 'Use OpenAI')
  .option('-a, --anthropic', 'Use Anthropic Claude')
  .option('-x, --xai', 'Use xAI Grok')
  .option('-g, --gemini', 'Use Google Gemini')
  .option('-c, --continue <n>', 'Continue conversation N (1=last, 2=second-to-last)', Number.parseInt)
  .option('--cid <id>', 'Continue conversation by ID')
  .action(async (options) => {
    try {
      if (options.continue && options.cid) {
        console.error('Error: Cannot use both -c and --cid flags')
        process.exit(1)
      }

      const config = await loadConfig()
      await ensureDirectories()

      const providerName = determineProvider(options, config)
      const { model, name, modelName } = getProvider(providerName, config)

      await startChat(model, name, modelName, options.continue, options.cid)
    } catch (err) {
      console.error('Error:', err.message)
      process.exit(1)
    }
  })

program
  .command('models')
  .description('List available models for each provider')
  .option('-p, --perplexity', 'Show only Perplexity models')
  .option('-o, --openai', 'Show only OpenAI models')
  .option('-a, --anthropic', 'Show only Anthropic models')
  .option('-x, --xai', 'Show only xAI models')
  .option('-g, --gemini', 'Show only Gemini models')
  .action(async (options) => {
    try {
      const config = await loadConfig()

      const providers = []
      if (options.perplexity) providers.push('perplexity')
      if (options.openai) providers.push('openai')
      if (options.anthropic) providers.push('anthropic')
      if (options.xai) providers.push('xai')
      if (options.gemini) providers.push('gemini')

      const toShow = providers.length === 0 ? ['perplexity', 'openai', 'anthropic', 'xai', 'gemini'] : providers

      const results = await Promise.all(
        toShow.map(async (provider) => ({
          provider,
          models: await listModels(provider, config)
        }))
      )

      for (const { provider, models } of results) {
        const defaultModel = DEFAULT_MODELS[provider]
        console.log(`\n${provider.toUpperCase()}`)
        console.log('─'.repeat(40))

        for (const model of models) {
          const isDefault = model.id === defaultModel ? ' (default)' : ''
          const description = model.description || model.displayName || ''
          console.log(`  ${model.id}${isDefault}`)
          if (description) {
            console.log(`    ${description}`)
          }
        }
      }
      console.log('')
    } catch (err) {
      console.error('Error:', err.message)
      process.exit(1)
    }
  })

program
  .command('conversations')
  .description('View all conversations in browser')
  .action(async () => {
    try {
      await showConversationsInBrowser()
    } catch (err) {
      console.error('Error:', err.message)
      process.exit(1)
    }
  })

program.parse()
