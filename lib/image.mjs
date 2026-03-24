import fs from 'node:fs/promises'
import path from 'node:path'

const MEDIA_TYPE_EXTENSIONS = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp'
}

function buildImagePath(outputDir, timestamp, index, mediaType) {
  const ext = MEDIA_TYPE_EXTENSIONS[mediaType] || '.png'
  const safestamp = timestamp.replace(/:/g, '-')
  const filename = `askimo-${safestamp}-${index}${ext}`
  return path.join(outputDir, filename)
}

async function saveImages(files, outputDir) {
  if (!files?.length) return []

  const dir = outputDir || process.cwd()
  await fs.mkdir(dir, { recursive: true })

  const timestamp = new Date().toISOString()
  const savedPaths = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const filePath = buildImagePath(dir, timestamp, i + 1, file.mediaType)
    await fs.writeFile(filePath, file.data)
    savedPaths.push(filePath)
  }

  return savedPaths
}

export { buildImagePath, saveImages }
