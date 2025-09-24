export async function readableStreamToBlob(stream: ReadableStream<Uint8Array>, mimeType: string) {
  const reader = stream.getReader()
  const chunks: Uint8Array[] = []
  let done = false
  while (!done) {
    const { value, done: readerDone } = await reader.read()
    if (value) chunks.push(value)
    done = readerDone
  }
  // Concatenate all chunks
  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0)
  const merged = new Uint8Array(totalLength)
  let offset = 0
  for (const chunk of chunks) {
    merged.set(chunk, offset)
    offset += chunk.length
  }
  return new Blob([merged], { type: mimeType })
}
