import fs from 'node:fs/promises'

async function readStdin() {
  if (process.stdin.isTTY) {
    return null
  }

  // In non-TTY environments, check if data is available with a short timeout
  // to avoid hanging when no data is being piped
  return new Promise((resolve) => {
    const chunks = []
    let hasData = false

    const timeout = setTimeout(() => {
      if (!hasData) {
        process.stdin.removeAllListeners()
        process.stdin.pause()
        resolve(null)
      }
    }, 10)

    process.stdin.on('readable', () => {
      let chunk = process.stdin.read()
      while (chunk !== null) {
        hasData = true
        chunks.push(chunk)
        chunk = process.stdin.read()
      }
    })

    process.stdin.on('end', () => {
      clearTimeout(timeout)
      if (chunks.length === 0) {
        resolve(null)
      } else {
        const content = Buffer.concat(chunks).toString('utf8').trim()
        resolve(content || null)
      }
    })
  })
}

async function readFile(filePath) {
  const content = await fs.readFile(filePath, 'utf8')
  return content.trim() || null
}

function buildMessage(prompt, content) {
  if (prompt && content) {
    return `${prompt}:\n\n${content}`
  }
  return content || prompt || null
}

export { readStdin, readFile, buildMessage }
