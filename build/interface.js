import { readdir, writeFile, readFile } from 'fs/promises'
import fs from 'fs'
import { basename, resolve } from 'path'

// Directory to scan for JSON files
const dirPath = resolve('src/i18n/en')

// Output file path
const outputFilePath = resolve('src/types/i18next.d.ts')

// Default namespace
const defaultNamespace = 'common'

async function generateKeys(source) {
  const ret = []
  for await (const key of Object.keys(source)) {
    typeof source[key] === 'string'
      ? ret.push(`"${key}":string;`)
      : ret.push(`"${key}":{\n${await generateKeys(source[key])}\n};`)
  }
  return ret.join('\n')
}

;(async () => {
  try {
    console.log(
      '██╗ ██╗ █████╗ ███╗   ██╗\n██║███║██╔══██╗████╗  ██║\n██║╚██║╚█████╔╝██╔██╗ ██║\n██║ ██║██╔══██╗██║╚██╗██║\n██║ ██║╚█████╔╝██║ ╚████║\n╚═╝ ╚═╝ ╚════╝ ╚═╝  ╚═══╝',
    )
    // Read all files in the directory
    const files = await readdir(dirPath)

    // Filter for .json files
    const jsonFiles = files.filter(file => file.endsWith('.json'))

    if (jsonFiles.length === 0) {
      console.error('No JSON files found in the directory.')
      return
    }

    // Generate imports and resources object entries
    let types = ''
    let resources = ''

    for await (const file of jsonFiles) {
      const sanitizedName = basename(file, '.json').replace(/\./g, '')
      const json = await readFile(resolve(dirPath, file), 'utf-8')
      resources += `'${basename(file, '.json')}': ${sanitizedName}, `
      const nsKeys = await generateKeys(JSON.parse(json))
      types += `export interface ${sanitizedName}{\n${nsKeys}\n};\n`
    }

    // Generate the TypeScript declaration file content
    const content = `
// This file is autogenerated        
import 'i18next';

declare module 'i18next' {
    ${types}
    interface CustomTypeOptions {
        defaultNS: '${defaultNamespace}';
        resources: { ${resources} }
    };
}
`.trim()

    // Write the generated content to the file
    await writeFile(outputFilePath, content, 'utf-8')
    console.log(`Generated TypeScript declaration file for i18n dictionaries at ${outputFilePath} `)
  } catch (error) {
    console.error('Error generating TypeScript declaration file:', error)
  }
})()
