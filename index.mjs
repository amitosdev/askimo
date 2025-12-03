#!/usr/bin/env node

import { Command } from 'commander'
import { startChat } from './lib/chat.mjs'
import { ensureDirectories, loadConfig } from './lib/config.mjs'
import { createConversation, loadConversation, saveConversation } from './lib/conversation.mjs'
import { DEFAULT_MODELS, determineProvider, getProvider, listModels } from './lib/providers.mjs'
import { generateResponse, outputJson, streamResponse } from './lib/stream.mjs'
import pkg from './package.json' with { type: 'json' }

const program = new Command()

program.name('askimo').description('CLI tool for communicating with AI providers').version(pkg.version)

program
  .command('ask', { isDefault: true })
  .description('Ask a single question')
  .argument('<question>', 'The question to ask')
  .option('-p, --perplexity', 'Use Perplexity AI (default)')
  .option('-o, --openai', 'Use OpenAI')
  .option('-a, --anthropic', 'Use Anthropic Claude')
  .option('-j, --json', 'Output as JSON instead of streaming')
  .option('-c, --continue <n>', 'Continue conversation N (1=last, 2=second-to-last)', Number.parseInt)
  .action(async (question, options) => {
    try {
      const config = await loadConfig()
      await ensureDirectories()

      const providerName = determineProvider(options, config)
      const { model, name, modelName } = getProvider(providerName, config)

      let conversation
      let existingPath = null

      if (options.continue) {
        const loaded = await loadConversation(options.continue)
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
        content: question
      })

      let responseText

      if (options.json) {
        const { text, sources } = await generateResponse(model, conversation.messages)
        responseText = text
        conversation.messages.push({
          role: 'assistant',
          content: responseText
        })
        await saveConversation(conversation, existingPath)
        outputJson(conversation, responseText, sources)
      } else {
        responseText = await streamResponse(model, conversation.messages)
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
  .option('-c, --continue <n>', 'Continue conversation N (1=last, 2=second-to-last)', Number.parseInt)
  .action(async (options) => {
    try {
      const config = await loadConfig()
      await ensureDirectories()

      const providerName = determineProvider(options, config)
      const { model, name, modelName } = getProvider(providerName, config)

      await startChat(model, name, modelName, options.continue)
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
  .action(async (options) => {
    try {
      const config = await loadConfig()

      const providers = []
      if (options.perplexity) providers.push('perplexity')
      if (options.openai) providers.push('openai')
      if (options.anthropic) providers.push('anthropic')

      const toShow = providers.length === 0 ? ['perplexity', 'openai', 'anthropic'] : providers

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

program.parse()
