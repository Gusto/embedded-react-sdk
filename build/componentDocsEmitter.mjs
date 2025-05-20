import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const UI_DIR = join(__dirname, '../src/components/Common/UI')
const OUTPUT_DIR = join(__dirname, '../docs/06/01')
const OUTPUT_FILE = join(OUTPUT_DIR, 'component-inventory.md')

// Define interfaces to omit
const omitInterfaces = [
  'BaseListProps',
  'SharedFieldLayoutProps',
  'FieldLayoutProps',
  'InternalFieldLayoutProps',
]

async function generateDocs() {
  const TypeDoc = await import('typedoc')
  const app = await TypeDoc.Application.bootstrap({
    entryPoints: [`${UI_DIR}/**/*Types.ts`],
  })

  const project = await app.convert()
  if (!project) {
    throw new Error('Failed to convert project')
  }

  const markdown = generateMarkdown(project, TypeDoc)
  await mkdir(OUTPUT_DIR, { recursive: true })
  await writeFile(OUTPUT_FILE, markdown)
  console.log(`Documentation written to ${OUTPUT_FILE}`)
}

/**
 * Returns all referenced interfaces for a given interface, and updates referencedByMain set.
 */
function getReferencedInterfaces(iface, TypeDoc, referencedByMain) {
  const refs = []
  if (iface instanceof TypeDoc.DeclarationReflection) {
    for (const prop of iface.children || []) {
      if (prop.type && prop.type.type === 'reference' && prop.type.reflection) {
        refs.push(prop.type.reflection)
        referencedByMain.add(prop.type.reflection.id)
      }
      if (
        prop.type &&
        prop.type.type === 'array' &&
        prop.type.elementType &&
        prop.type.elementType.type === 'reference' &&
        prop.type.elementType.reflection
      ) {
        refs.push(prop.type.elementType.reflection)
        referencedByMain.add(prop.type.elementType.reflection.id)
      }
    }
  }
  return refs
}

/**
 * Builds the markdown index section for the given interfaces.
 */
function buildIndexSection(interfaces) {
  return interfaces.map(iface => `- [${iface.name}](#${iface.name.toLowerCase()})`).join('\n')
}

/**
 * Renders a full interface section, including summary, table, and referenced interfaces as h3s.
 */
function renderInterfaceSection(iface, project, TypeDoc, referencedByMain) {
  if (iface.name === 'ButtonProps') {
    console.log(iface)
  }
  const summary = iface.comment?.summary ? `\n${formatCommentSummary(iface.comment.summary)}\n` : ''
  const propsTable = renderPropsTable(iface, project, TypeDoc)
  const refs = getReferencedInterfaces(iface, TypeDoc, referencedByMain)
  const refSections = refs
    .map(ref => {
      const refSummary = ref.comment?.summary
        ? `\n${formatCommentSummary(ref.comment.summary)}\n`
        : ''
      return `### ${ref.name}\n\n${refSummary}${renderPropsTable(ref, project, TypeDoc)}`
    })
    .join('')
  return `## ${iface.name}\n\n${summary}${propsTable}${refSections}`
}

function generateMarkdown(project, TypeDoc) {
  const allInterfaces = project.getReflectionsByKind(TypeDoc.ReflectionKind.Interface)

  const mainInterfaces = allInterfaces
    .filter(i => i.name.endsWith('Props') && !omitInterfaces.includes(i.name))
    .sort((a, b) => a.name.localeCompare(b.name))
  const otherInterfaces = allInterfaces
    .filter(i => !i.name.endsWith('Props') && !omitInterfaces.includes(i.name))
    .sort((a, b) => a.name.localeCompare(b.name))

  const referencedByMain = new Set()
  const indexSection = buildIndexSection(mainInterfaces)
  const mainSections = mainInterfaces
    .map(iface => renderInterfaceSection(iface, project, TypeDoc, referencedByMain))
    .join('')

  return `# UI Component Types\n\n## Index\n\n${indexSection}\n\n${mainSections}`
}

function getAllProps(reflection, TypeDoc) {
  // Prefer TypeDoc's built-in flattening if available
  if (typeof reflection.getAllChildren === 'function') {
    return reflection.getAllChildren()
  }
  // Custom recursive flattening
  let props = reflection.children ? [...reflection.children] : []
  const bases = [...(reflection.extendedTypes || []), ...(reflection.implementedTypes || [])]
  for (const base of bases) {
    if (base.reflection && base.reflection instanceof TypeDoc.DeclarationReflection) {
      props = props.concat(getAllProps(base.reflection, TypeDoc))
    }
  }
  // Remove duplicates by name
  const seen = new Set()
  return props.filter(prop => {
    if (seen.has(prop.name)) return false
    seen.add(prop.name)
    return true
  })
}

function collectNormalizedProps(component, TypeDoc) {
  let props = getAllProps(component, TypeDoc)
  let notes = ''

  // Detect Pick utility in extendedTypes
  if (component.extendedTypes) {
    for (const ext of component.extendedTypes) {
      if (ext.name === 'Pick' && ext.typeArguments && ext.typeArguments.length === 2) {
        const base = ext.typeArguments[0]
        const keys = ext.typeArguments[1]
        let pickedKeys = []
        if (keys.type === 'literal') {
          pickedKeys = [keys.value]
        } else if (keys.type === 'union' && Array.isArray(keys.types)) {
          pickedKeys = keys.types.map(t => t.value)
        }
        let baseTypeName = base.name || ''
        let isExternal = !base.reflection
        if (isExternal) {
          notes = `\n> **Note:** This interface also includes the following picked props from external type \`${baseTypeName}\`: ${pickedKeys.map(k => `\`${k}\``).join(', ')}. See the external type for details.\n`
        } else {
          const baseProps = base.reflection.children || []
          const pickedProps = baseProps.filter(p => pickedKeys.includes(p.name))
          const missingKeys = pickedKeys.filter(k => !pickedProps.some(p => p.name === k))
          if (pickedProps.length > 0) {
            notes = `\n> **Note:** This interface also picks the following props from \`${baseTypeName}\`: ${pickedKeys.map(k => `\`${k}\``).join(', ')}.\n`
            for (const p of pickedProps) {
              if (!props.some(existing => existing.name === p.name)) {
                props.unshift(p)
              }
            }
          }
          if (missingKeys.length > 0) {
            notes += `\n> The following picked keys could not be resolved: ${missingKeys.map(k => `\`${k}\``).join(', ')}.\n`
          }
        }
      }
    }
  }
  return { props, notes }
}

function renderPropsTable(component, project, TypeDoc) {
  if (!(component instanceof TypeDoc.DeclarationReflection)) return '\n'
  const { props, notes } = collectNormalizedProps(component, TypeDoc)
  const rows = props.map(prop => {
    const type = formatTypeWithLinks(prop.type, project)
    const required = prop.flags.isOptional ? 'No' : 'Yes'
    const defaultValue = prop.defaultValue || '-'
    const description = prop.comment?.summary ? formatCommentSummary(prop.comment.summary) : '-'
    return [prop.name || '-', type || '-', required, defaultValue, description || '-'].join(' | ')
  })
  return [
    notes,
    '| Prop | Type | Required | Default | Description |',
    '|------|------|----------|--------|-------------|',
    ...rows,
    '',
  ].join('\n')
}

function escapePipes(str) {
  return str.replace(/\|/g, '\\|')
}

function formatTypeWithLinks(type, project) {
  if (!type) return '-'

  if (type.type === 'array') {
    const elementType = formatTypeWithLinks(type.elementType, project)
    return escapePipes(`${elementType}[]`)
  }

  if (type.type === 'union') {
    const unionStr = type.types.map(t => formatTypeWithLinks(t, project)).join(' | ')
    return escapePipes(unionStr)
  }

  if (type.type === 'reference' && type.reflection) {
    const reflection = project.getReflectionById(type.reflection.id)
    if (reflection) {
      return escapePipes(`[${type.toString()}](#${reflection.name.toLowerCase()})`)
    }
  }

  return escapePipes(`\`${type.toString()}\``)
}

function formatCommentSummary(summary) {
  if (!summary) return '-'
  if (typeof summary === 'string') return summary
  if (Array.isArray(summary)) {
    return summary
      .map(part => {
        if (typeof part === 'string') return part
        if (part.kind === 'text') return part.text
        if (part.kind === 'code') return `\`${part.text}\``
        return ''
      })
      .join('')
  }
  if (summary && typeof summary === 'object') {
    if (summary.kind === 'text') return summary.text
    if (summary.kind === 'code') return `\`${summary.text}\``
  }
  return '-'
}

generateDocs().catch(console.error)
