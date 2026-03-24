import { generateText, streamText } from 'ai'

function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

async function streamResponse(model, messages, modelName) {
  const startTime = Date.now()

  const result = streamText({
    model,
    messages
  })

  let fullText = ''

  for await (const textPart of result.textStream) {
    process.stdout.write(textPart)
    fullText += textPart
  }

  process.stdout.write('\n')

  // Display sources/citations if available (Perplexity)
  const sources = await result.sources
  if (sources?.length > 0) {
    process.stdout.write('\n\x1b[2m─── Sources ───\x1b[0m\n')
    sources.forEach((source, index) => {
      const num = index + 1
      const title = source.title || source.url
      process.stdout.write(`\x1b[2m[${num}] ${title}\x1b[0m\n`)
      if (source.url && source.title) {
        process.stdout.write(`\x1b[2m    ${source.url}\x1b[0m\n`)
      }
    })
  }

  // Display status line
  const duration = Date.now() - startTime
  process.stdout.write(`\n\x1b[2m${modelName} · ${formatDuration(duration)}\x1b[0m\n`)

  return fullText
}

async function generateResponse(model, messages) {
  const startTime = Date.now()

  const { text, sources } = await generateText({
    model,
    messages
  })

  const duration = Date.now() - startTime
  return { text, sources, duration }
}

async function generateImageResponse(model, messages) {
  const startTime = Date.now()
  process.stdout.write('\x1b[2mGenerating image...\x1b[0m')

  const { text, files } = await generateText({
    model,
    messages
  })

  process.stdout.write('\r\x1b[K')

  const duration = Date.now() - startTime
  const imageFiles = files?.filter((f) => f.mediaType?.startsWith('image/'))
  return { text, files: imageFiles, duration }
}

function printResponse(text, sources, duration, modelName) {
  process.stdout.write(text)
  process.stdout.write('\n')

  if (sources?.length > 0) {
    process.stdout.write('\n\x1b[2m─── Sources ───\x1b[0m\n')
    sources.forEach((source, index) => {
      const num = index + 1
      const title = source.title || source.url
      process.stdout.write(`\x1b[2m[${num}] ${title}\x1b[0m\n`)
      if (source.url && source.title) {
        process.stdout.write(`\x1b[2m    ${source.url}\x1b[0m\n`)
      }
    })
  }

  process.stdout.write(`\n\x1b[2m${modelName} · ${formatDuration(duration)}\x1b[0m\n`)
}

function buildJsonOutput(conversation, response, sources, duration, images) {
  const lastUserMessage = conversation.messages.findLast((m) => m.role === 'user')
  const output = {
    provider: conversation.provider,
    model: conversation.model,
    question: lastUserMessage?.content || '',
    response,
    conversationId: conversation.id,
    messageCount: conversation.messages.length + 1,
    durationMs: duration
  }

  if (sources?.length > 0) {
    output.sources = sources
  }

  if (images?.length > 0) {
    output.images = images
  }

  return output
}

function printImageResponse(text, imagePaths, duration, modelName) {
  if (text) {
    process.stdout.write(text)
    process.stdout.write('\n')
  }

  if (imagePaths?.length > 0) {
    for (const imgPath of imagePaths) {
      process.stdout.write(`\x1b[2m[image]\x1b[0m ${imgPath}\n`)
    }
  }

  if (!text && !imagePaths?.length) {
    process.stdout.write('No image or text was generated.\n')
  }

  process.stdout.write(`\n\x1b[2m${modelName} · ${formatDuration(duration)}\x1b[0m\n`)
}

function outputJson(conversation, response, sources, duration, images) {
  const output = buildJsonOutput(conversation, response, sources, duration, images)
  console.log(JSON.stringify(output, null, 2))
}

export {
  buildJsonOutput,
  generateImageResponse,
  generateResponse,
  outputJson,
  printImageResponse,
  printResponse,
  streamResponse
}
