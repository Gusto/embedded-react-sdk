/**
 * Drains a binary `ReadableStream` and packages the bytes into a `Blob`.
 *
 * @remarks
 * Reads all chunks from the stream, concatenates them into a single `Uint8Array`, and wraps the
 * result in a `Blob` tagged with `mimeType`. Used to materialize downloads returned by streaming
 * API responses.
 *
 * @param stream - The byte stream to read to completion
 * @param mimeType - The MIME type assigned to the resulting `Blob`
 * @returns A `Blob` containing the full contents of the stream
 * @internal
 */
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
