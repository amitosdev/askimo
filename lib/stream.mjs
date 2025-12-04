import { generateText, streamText } from 'ai'

async function streamResponse(model, messages) {
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

  return fullText
}

async function generateResponse(model, messages) {
  const { text, sources } = await generateText({
    model,
    messages
  })

  return { text, sources }
}

function buildJsonOutput(conversation, response, sources) {
  const lastUserMessage = conversation.messages.findLast((m) => m.role === 'user')
  const output = {
    provider: conversation.provider,
    model: conversation.model,
    question: lastUserMessage?.content || '',
    response,
    conversationId: conversation.id,
    messageCount: conversation.messages.length + 1
  }

  if (sources?.length > 0) {
    output.sources = sources
  }

  return output
}

function outputJson(conversation, response, sources) {
  const output = buildJsonOutput(conversation, response, sources)
  console.log(JSON.stringify(output, null, 2))
}

export { streamResponse, generateResponse, outputJson, buildJsonOutput }
