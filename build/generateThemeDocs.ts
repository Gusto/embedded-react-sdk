import { Project, Type } from 'ts-morph'
import { writeFile } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const THEME_FILE = join(__dirname, '../src/contexts/ThemeProvider/theme.ts')
const DOCS_OUTPUT_FILE = join(__dirname, '../docs/theming/theme-variables.md')

interface ThemeVariable {
  name: string
  type: string
}

function formatType(type: Type): string {
  if (type.isUnion()) {
    const unionTypes = type.getUnionTypes().filter(t => t.getText() !== 'undefined')
    return unionTypes[0].getText()
  }

  return type.getText()
}

function getCategory(name: string): number {
  if (name.startsWith('color')) return 0
  if (name.startsWith('font')) return 1
  if (name.startsWith('shadow') || name.startsWith('focus')) return 2
  return 3
}

function extractThemeVariables(sourceFile: any): ThemeVariable[] {
  const gustoSDKThemeType = sourceFile.getTypeAlias('GustoSDKTheme')
  if (!gustoSDKThemeType) {
    throw new Error('GustoSDKTheme type alias not found in theme.ts')
  }

  const properties = gustoSDKThemeType.getType().getProperties()
  const variables: ThemeVariable[] = []

  for (const prop of properties) {
    variables.push({
      name: prop.getName(),
      type: formatType(prop.getTypeAtLocation(sourceFile)),
    })
  }

  return variables.sort((a, b) => {
    const categoryA = getCategory(a.name)
    const categoryB = getCategory(b.name)

    if (categoryA !== categoryB) return categoryA - categoryB
    return a.name.localeCompare(b.name)
  })
}

function generateMarkdownTable(variables: ThemeVariable[]): string {
  const header = '| Variable | Type |\n|----------|------|'
  const rows = variables.map(v => `| **${v.name}** | \`${v.type}\` |`)
  return `${header}\n${rows.join('\n')}`
}

async function generateThemeDocs() {
  const project = new Project({
    tsConfigFilePath: join(__dirname, '../tsconfig.json'),
    skipAddingFilesFromTsConfig: false,
  })

  const sourceFile = project.addSourceFileAtPath(THEME_FILE)
  const variables = extractThemeVariables(sourceFile)
  const table = generateMarkdownTable(variables)

  const markdown = `# Theme Variables

${table}

## Usage

To customize the theme, pass a partial theme object to the \`GustoProvider\`:

\`\`\`tsx
import { GustoProvider } from '@gusto/embedded-react-sdk'

function App() {
  return (
    <GustoProvider
      theme={{
        colorPrimary: '#007bff',
        fontSizeRegular: '18px',
        inputRadius: '12px',
      }}
    >
      {/* Your app content */}
    </GustoProvider>
  )
}
\`\`\`

## Default Values

The theme uses sensible defaults for all variables. You only need to specify the variables you want to customize.
`

  await writeFile(DOCS_OUTPUT_FILE, markdown)
  console.log(`Theme documentation updated and written to ${DOCS_OUTPUT_FILE}`)
}

generateThemeDocs().catch(console.error)
