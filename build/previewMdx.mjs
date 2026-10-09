import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { basename, delimiter, dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createServer } from 'vite'
import { parse } from 'yaml'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const documentPath = resolve(
  repositoryRoot,
  process.argv[2] ?? 'docs/getting-started/authentication.mdx',
)

if (!existsSync(documentPath) || !documentPath.endsWith('.mdx')) {
  throw new Error('Supply the path to an existing .mdx document.')
}

async function importPreviewPackage(packageName) {
  for (const executableDirectory of (process.env.PATH ?? '').split(delimiter)) {
    if (basename(executableDirectory) !== '.bin') continue
    const require = createRequire(join(executableDirectory, '../package.json'))
    try {
      const modulePath = require.resolve(packageName)
      return await import(pathToFileURL(modulePath).href)
    } catch (error) {
      if (error.code !== 'MODULE_NOT_FOUND') throw error
    }
  }
  throw new Error(`Run through npx with --package=${packageName}; see DOCS-PUBLISHING-SPIKE.md.`)
}

const { default: mdx } = await importPreviewPackage('@mdx-js/rollup')
const { default: remarkFrontmatter } = await importPreviewPackage('remark-frontmatter')
const entryId = 'virtual:mdx-preview'
const resolvedEntryId = `\0${entryId}`
const documentUrl = `/@fs/${documentPath}`
const frontmatter = readFileSync(documentPath, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/)
const metadata = frontmatter ? parse(frontmatter[1]) : {}
const title =
  typeof metadata?.title === 'string' ? metadata.title : relative(repositoryRoot, documentPath)

const server = await createServer({
  configFile: false,
  root: repositoryRoot,
  cacheDir: join(tmpdir(), 'embedded-sdk-mdx-preview-cache'),
  esbuild: { jsx: 'automatic' },
  optimizeDeps: { noDiscovery: true, include: ['react', 'react-dom/client', 'react/jsx-runtime'] },
  plugins: [
    mdx({ remarkPlugins: [remarkFrontmatter] }),
    {
      name: 'mdx-preview',
      resolveId(id) {
        if (id === entryId) return resolvedEntryId
      },
      load(id) {
        if (id !== resolvedEntryId) return
        return `
          import React from 'react'
          import { createRoot } from 'react-dom/client'
          import Document from ${JSON.stringify(documentUrl)}
          import { DocCardList } from '/build/mdx-preview/DocCardList.jsx'
          document.title = ${JSON.stringify(title)} + ' — MDX preview'
          const root = createRoot(document.getElementById('root'))
          root.render(
            React.createElement('main', null,
              React.createElement('h1', null, ${JSON.stringify(title)}),
              React.createElement(Document, { components: { DocCardList } })
            )
          )
          if (import.meta.hot) {
            import.meta.hot.accept()
            import.meta.hot.dispose(() => root.unmount())
          }
        `
      },
      configureServer(previewServer) {
        previewServer.middlewares.use(async (request, response, next) => {
          if (request.url !== '/') return next()
          const html = await previewServer.transformIndexHtml(
            '/',
            `
            <!doctype html>
            <html lang="en">
              <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="data:," />
                <title>MDX preview</title>
                <style>
                  body { margin: 0; font: 16px/1.6 system-ui, sans-serif; color: #1b1b1d; }
                  main { max-width: 960px; margin: auto; padding: 32px 24px; }
                  a { color: #165dcc; }
                  pre { overflow-x: auto; padding: 16px; background: #f4f5f7; }
                  code { font-size: 0.9em; }
                  .doc-cards { list-style: none; padding: 0; display: grid; gap: 16px; }
                  .doc-cards li { border: 1px solid #dadde1; border-radius: 8px; padding: 16px; }
                  .doc-cards a { font-weight: 600; font-size: 1.1em; }
                  .doc-cards p { margin: 8px 0 0; }
                  .doc-card-footer { white-space: pre-line; color: #525860; font-size: 0.9em; }
                </style>
              </head>
              <body>
                <div id="root"></div>
                <script type="module" src="/@id/${entryId}"></script>
              </body>
            </html>
          `,
          )
          response.setHeader('Content-Type', 'text/html')
          response.end(html)
        })
      },
    },
  ],
  server: { host: '127.0.0.1', port: 5300, strictPort: true },
})

await server.listen()
console.log(`Previewing ${relative(repositoryRoot, documentPath)}`)
server.printUrls()
