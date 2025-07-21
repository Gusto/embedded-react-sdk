import {
  Project,
  InterfaceDeclaration,
  TypeAliasDeclaration,
  Type,
  Node,
  PropertySignature,
  Symbol as TSMorphSymbol,
} from 'ts-morph'
import { writeFile } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const UI_COMPONENTS_DIR = join(__dirname, '../src/components/Common/UI')
const DOCS_OUTPUT_DIR = join(__dirname, '../docs/component-adapter')
const DOCS_OUTPUT_FILE = join(DOCS_OUTPUT_DIR, 'component-inventory.md')

// Types that should be excluded from documentation
const EXCLUDED_TYPES: string[] = []

type ComponentType = {
  getName(): string
  getType(): Type
  getDeclarations(): (InterfaceDeclaration | TypeAliasDeclaration)[]
}

function isReactRefUnion(types: Type[]): boolean {
  // A React ref union type consists of:
  // 1. A RefObject<T> type
  // 2. A function type (for callback refs)
  // 3. null (for unset refs)
  const hasRefObject = types.some(t => t.getSymbol()?.getName() === 'RefObject')
  const hasCallbackRef = types.some(t => t.getCallSignatures()?.length === 1)
  const hasNull = types.some(t => t.getText() === 'null')

  // All three types must be present for a valid React ref union
  return hasRefObject && hasCallbackRef && hasNull
}

function formatRefType(type: Type, name: string): string {
  const typeArgs = type.getTypeArguments()
  if (typeArgs.length) {
    const argType = typeArgs[0]
    const argName = argType.getSymbol()?.getName() || argType.getText()
    return `${name}<${argName}>`
  }
  return name
}

function isBooleanUnion(types: Type[]): boolean {
  // A boolean union type must contain both true and false literals
  // A single true/false literal would be a literal type, not a boolean
  const hasTrue = types.some(t => t.getText() === 'true')
  const hasFalse = types.some(t => t.getText() === 'false')

  // Must have both true and false to be a boolean union
  // A single literal would be a literal type (e.g., type TrueOnly = true)
  return hasTrue && hasFalse
}

function formatType(type: Type | undefined): string {
  if (!type) return '-'

  const typeText = type.getText()

  // Handle React types
  if (typeText === 'React.ReactNode') {
    return 'React.ReactNode'
  }

  if (typeText === 'ReactNode') {
    return 'ReactNode'
  }

  // Handle arrays
  if (type.isArray()) {
    const elementType = type.getArrayElementType()
    return elementType ? `${formatType(elementType)}[]` : 'any[]'
  }

  // Handle unions
  if (type.isUnion()) {
    const unionTypes = type.getUnionTypes().filter(t => t.getText() !== 'undefined')

    // Special case for React Ref<T>
    if (isReactRefUnion(unionTypes)) {
      const refObjType = unionTypes.find(t => t.getSymbol()?.getName() === 'RefObject')
      return refObjType ? formatRefType(refObjType, 'Ref') : 'Ref<any>'
    }

    // Special case for boolean
    if (isBooleanUnion(unionTypes)) {
      return 'boolean'
    }

    return unionTypes.map(formatType).join(' | ')
  }

  // Handle intersections
  if (type.isIntersection()) {
    return type.getIntersectionTypes().map(formatType).join(' & ')
  }

  // Handle interfaces and type aliases
  const symbol = type.getSymbol()
  const decl = symbol?.getDeclarations()[0]
  if (decl && (Node.isInterfaceDeclaration(decl) || Node.isTypeAliasDeclaration(decl))) {
    // Don't create links for types from node_modules
    const sourceFile = decl.getSourceFile()
    if (sourceFile.getFilePath().includes('node_modules')) {
      return symbol.getName()
    }
    return `[${symbol.getName()}](#${symbol.getName().toLowerCase()})`
  }

  return typeText
}

function escapeMarkdownTable(str: string): string {
  return str.replace(/\|/g, '\\|')
}

function getDescription(decl: PropertySignature | undefined): string {
  if (!decl) return '-'
  const jsDocs = decl.getJsDocs?.()
  if (jsDocs?.length) {
    return (
      jsDocs
        .map(doc => doc.getComment() || '')
        .join(' ')
        .trim() || '-'
    )
  }
  return '-'
}

/**
 * Finds component types referenced within a given type.
 * Recursively traverses a type to find any component types that are directly referenced,
 * inside arrays, part of a union, or part of an intersection.
 * Only returns types that exist in the knownTypes set.
 *
 * @example
 * // For a type like:
 * type MyProps = {
 *   items: ComponentType[] | OtherType & AnotherType
 * }
 * // And knownTypes = new Set(['ComponentType', 'OtherType'])
 * // Returns: ['ComponentType', 'OtherType']
 */
function findReferencedTypes(type: Type, knownTypes: Set<string>): string[] {
  if (!type) return []

  if (type.isArray()) {
    const elementType = type.getArrayElementType()
    return elementType ? findReferencedTypes(elementType, knownTypes) : []
  }

  if (type.isUnion()) {
    return type.getUnionTypes().flatMap(t => findReferencedTypes(t, knownTypes))
  }

  if (type.isIntersection()) {
    return type.getIntersectionTypes().flatMap(t => findReferencedTypes(t, knownTypes))
  }

  const symbol = type.getSymbol()
  if (symbol && knownTypes.has(symbol.getName())) {
    return [symbol.getName()]
  }

  return []
}

/**
 * Resolves a type to its concrete object type by following type aliases and handling intersections.
 * Traverses the type hierarchy to find the actual object type with properties, handling direct object types,
 * intersection types, and type aliases. Maintains a set of seen type names to prevent infinite loops.
 *
 * @param type - The type to resolve
 * @param componentTypeMap - Map of component type names to their type definitions
 * @returns The resolved type, or the original type if no resolution is possible
 */
function resolveType(type: Type, componentTypeMap: Map<string, ComponentType>): Type {
  const seen = new Set<string>()

  // Helper to check if a type is an object with properties
  const hasObjectProperties = (t: Type) => t.isObject() && t.getProperties().length > 0

  while (true) {
    // Check for object type with properties
    if (hasObjectProperties(type)) {
      return type
    }

    // Check intersection types
    if (type.isIntersection()) {
      const objType = type.getIntersectionTypes().find(hasObjectProperties)
      if (objType) return objType
    }

    // Follow type aliases
    const symbol = type.getSymbol()
    if (!symbol) break

    const name = symbol.getName()
    if (seen.has(name)) break
    seen.add(name)

    const referenced = componentTypeMap.get(name)
    if (!referenced) break

    type = referenced.getType()
  }

  return type
}

/**
 * Gets the properties of a component type, handling type aliases and any type fallbacks.
 * Handles direct type aliases, resolves the type to get its properties, and handles any type fallbacks
 * by recursively getting props from referenced types.
 *
 * @param type - The component type to get properties from
 * @param componentTypeMap - Map of component type names to their type definitions
 * @returns Array of property symbols for the component
 */
function getComponentProps(
  type: ComponentType,
  componentTypeMap: Map<string, ComponentType>,
): TSMorphSymbol[] {
  // Helper to get referenced type from a type alias
  const getReferencedType = (decl: TypeAliasDeclaration): ComponentType | undefined => {
    const typeNode = decl.getTypeNode()
    if (!typeNode || !Node.isTypeReference(typeNode)) return undefined

    const refName = typeNode.getTypeName().getText()
    const referenced = refName && componentTypeMap.get(refName)
    return referenced && referenced !== type ? referenced : undefined
  }

  // Check if this is a type alias referencing another component
  const decl = type.getDeclarations()[0]
  if (decl && Node.isTypeAliasDeclaration(decl)) {
    const referenced = getReferencedType(decl)
    if (referenced) return []
  }

  // Get properties from resolved type
  const resolvedType = resolveType(type.getType(), componentTypeMap)
  const props = resolvedType.getApparentProperties()

  // Handle any type fallback by checking referenced type
  if (
    props.length > 0 &&
    props.every(p => {
      const nodeArg = type.getType().getSymbol()?.getDeclarations()?.[0]
      const propType = nodeArg && Node.isNode(nodeArg) ? p.getTypeAtLocation(nodeArg) : undefined
      return propType?.getText() === 'any'
    })
  ) {
    if (decl && Node.isTypeAliasDeclaration(decl)) {
      const referenced = getReferencedType(decl)
      if (referenced) {
        return getComponentProps(referenced, componentTypeMap)
      }
    }
  }

  return props
}

/**
 * Generates a markdown section for a component type, including its props and child components.
 * Creates a heading for the component, handles type aliases by linking to referenced types,
 * generates a prop table, and recursively includes child component sections.
 *
 * @param type - The component type to document
 * @param componentTypeMap - Map of component type names to their type definitions
 * @param parentToChildren - Map of parent component names to their child component names
 * @param level - The heading level to use (default: 2)
 * @returns Markdown string containing the component documentation
 */
function generateComponentSection(
  type: ComponentType,
  componentTypeMap: Map<string, ComponentType>,
  parentToChildren: Map<string, string[]>,
  level = 2,
): string {
  if (EXCLUDED_TYPES.includes(type.getName())) {
    return ''
  }

  const heading = `${'#'.repeat(level)} ${type.getName()}`
  const props = getComponentProps(type, componentTypeMap)

  // Handle type aliases
  const aliasSection = handleTypeAlias(type, props, componentTypeMap)
  if (aliasSection) {
    return `${heading}\n\n${aliasSection}`
  }

  // Generate prop table
  const table = generatePropTable(type, props)
  let section = `${heading}\n\n${table}`

  // Add child components
  const childSections = (parentToChildren.get(type.getName()) || [])
    .map(childName => componentTypeMap.get(childName))
    .filter((child): child is ComponentType => child !== undefined)
    .map(child => generateComponentSection(child, componentTypeMap, parentToChildren, level + 1))
    .filter(Boolean)
    .join('\n\n')

  return childSections ? `${section}\n\n${childSections}` : section
}

/**
 * Handles type alias references by returning a link to the referenced type.
 */
function handleTypeAlias(
  type: ComponentType,
  props: TSMorphSymbol[],
  componentTypeMap: Map<string, ComponentType>,
): string | null {
  if (props.length > 0) return null

  const decl = type.getDeclarations()[0]
  if (!decl || !Node.isTypeAliasDeclaration(decl)) return null

  const typeNode = decl.getTypeNode()
  if (!typeNode || !Node.isTypeReference(typeNode)) return null

  const refName = typeNode.getTypeName().getText()
  return refName && componentTypeMap.has(refName)
    ? `The props for this component are defined in [${refName}](#${refName.toLowerCase()}).`
    : null
}

/**
 * Generates a markdown table of component props with their types, requirements, defaults, and descriptions.
 * Filters out duplicate props and formats each prop's name, type, required status, default value,
 * and description into a markdown table.
 *
 * @example
 * Input: interface MyProps { name?: string; count: number; }
 * Output:
 * | Prop | Type | Required | Description |
 * |------|------|----------|-------------|
 * | **name** | `string` | No | - |
 * | **count** | `number` | Yes | - |
 *
 * @param type - The component type containing the props
 * @param props - Array of property symbols to document
 * @returns Markdown table string with prop documentation
 */
function generatePropTable(type: ComponentType, props: TSMorphSymbol[]): string {
  const TABLE_HEADER =
    '| Prop | Type | Required | Description |\n|------|------|----------|-------------|'

  // Get unique props by name using a Set
  const seenNames = new Set<string>()
  const uniqueProps = props.filter(prop => {
    const name = prop.getName()
    if (seenNames.has(name)) return false
    seenNames.add(name)
    return true
  })

  const rows = uniqueProps.map(prop => generatePropRow(type, prop))
  return `${TABLE_HEADER}\n${rows.join('\n')}`
}

/**
 * Generates a markdown table row for a single prop.
 * Extracts the prop's name, type, and declaration, determines if it's required,
 * gets description, and formats everything into a markdown table row.
 *
 * @example
 * Input: prop with name "onClick", type "() => void", optional
 * Output: | **onClick** | `() => void` | No | - |
 *
 * @param type - The component type containing the prop
 * @param prop - The property symbol to document
 * @returns Markdown table row string
 */
function generatePropRow(type: ComponentType, prop: TSMorphSymbol): string {
  // Get basic prop info
  const name = prop.getName()
  const nodeArg = type.getType().getSymbol()?.getDeclarations()?.[0]
  const propType = nodeArg && Node.isNode(nodeArg) ? prop.getTypeAtLocation(nodeArg) : undefined
  const typeText = formatType(propType).replace(/[\n\r]/g, ' ')

  // Get prop declaration and metadata
  const decl = prop.getDeclarations()[0]
  const required = decl && Node.isPropertySignature(decl) && decl.hasQuestionToken() ? 'No' : 'Yes'
  const description = Node.isPropertySignature(decl) ? getDescription(decl) : '-'

  // Format type cell based on whether it's a markdown link
  const isMarkdownLink = typeText.startsWith('[') && typeText.includes('](')
  const typeCell = isMarkdownLink
    ? escapeMarkdownTable(typeText)
    : `\`${escapeMarkdownTable(typeText)}\``

  return `| **${name}** | ${typeCell} | ${required} | ${description} |`
}

/**
 * Generates a markdown index entry for a component and its children.
 * Creates a markdown link to the component's section and recursively includes child components
 * with proper indentation, preventing duplicate entries.
 *
 * @example
 * // For a component hierarchy like:
 * // Parent
 * // └── Child1
 * //     └── GrandChild
 * // └── Child2
 *
 * // Generates:
 * // - [Parent](#parent)
 * //   - [Child1](#child1)
 * //     - [GrandChild](#grandchild)
 * //   - [Child2](#child2)
 *
 * @param type - The component type to generate an index entry for
 * @param componentTypeMap - Map of component type names to their type definitions
 * @param parentToChildren - Map of parent component names to their child component names
 * @param level - Current indentation level (default: 0)
 * @param indexed - Set of component names that have already been indexed
 * @returns Markdown string containing the index entry and its children
 */
function generateIndex(
  type: ComponentType,
  componentTypeMap: Map<string, ComponentType>,
  parentToChildren: Map<string, string[]>,
  level = 0,
  indexed = new Set<string>(),
): string {
  const name = type.getName()
  if (indexed.has(name)) return ''

  indexed.add(name)
  const indent = '  '.repeat(level)
  const link = `[${name}](#${name.toLowerCase()})`

  // Get child entries recursively
  const childEntries = (parentToChildren.get(name) || [])
    .map(childName => componentTypeMap.get(childName))
    .filter((child): child is ComponentType => child !== undefined)
    .map(child => generateIndex(child, componentTypeMap, parentToChildren, level + 1, indexed))
    .filter(Boolean)
    .join('\n')

  return `${indent}- ${link}${childEntries ? '\n' + childEntries : ''}`
}

/**
 * Builds a map of parent components to their children by analyzing prop types.
 * Analyzes each component's props to find referenced component types and creates a hierarchy map,
 * returning both the map and a function to find top-level components.
 *
 * @param componentTypeMap - Map of component type names to their type definitions
 * @param knownTypeNames - Set of valid component type names
 * @returns Object containing the hierarchy map and a function to find top-level components
 */
function buildComponentHierarchy(
  componentTypeMap: Map<string, ComponentType>,
  knownTypeNames: Set<string>,
): {
  parentToChildren: Map<string, string[]>
  getTopLevelComponents: () => ComponentType[]
} {
  const parentToChildren = new Map<string, string[]>()
  const allChildren = new Set<string>()

  // Process each component
  for (const [_, parentType] of componentTypeMap) {
    const parentName = parentType.getName()
    const props = getComponentProps(parentType, componentTypeMap)

    // Find all referenced component types in props
    const childNames = props.flatMap(prop => {
      const nodeArg = parentType.getType().getSymbol()?.getDeclarations()?.[0] ?? prop
      return Node.isNode(nodeArg)
        ? findReferencedTypes(prop.getTypeAtLocation(nodeArg), knownTypeNames)
        : []
    })

    // Add relationships and track children
    if (childNames.length > 0) {
      parentToChildren.set(parentName, childNames)
      childNames.forEach(child => allChildren.add(child))
    }
  }

  // Function to find top-level components (those that aren't children of any other component)
  const getTopLevelComponents = () =>
    Array.from(componentTypeMap.values()).filter(
      type => !allChildren.has(type.getName()) && !EXCLUDED_TYPES.includes(type.getName()),
    )

  return { parentToChildren, getTopLevelComponents }
}

async function generateAdapterPropDocs() {
  const project = new Project({
    tsConfigFilePath: join(__dirname, '../tsconfig.json'),
    skipAddingFilesFromTsConfig: false,
  })

  // Add source files
  project.addSourceFilesAtPaths(join(UI_COMPONENTS_DIR, '**/*Types.ts'))

  // Get all interfaces and type aliases
  const sourceFiles = project.getSourceFiles(join(UI_COMPONENTS_DIR, '**/*Types.ts'))
  const interfaces = sourceFiles.flatMap(sourceFile => sourceFile.getInterfaces())
  const typeAliases = sourceFiles.flatMap(sourceFile => sourceFile.getTypeAliases())

  // Create component type entries
  const componentEntries = [
    ...interfaces.map(intf => {
      const entry: [string, ComponentType] = [
        intf.getName(),
        {
          getName: () => intf.getName(),
          getType: () => intf.getType(),
          getDeclarations: () => [intf],
        },
      ]
      return entry
    }),
    ...typeAliases.map(alias => {
      const entry: [string, ComponentType] = [
        alias.getName(),
        {
          getName: () => alias.getName(),
          getType: () => resolveType(alias.getType(), componentTypeMap),
          getDeclarations: () => [alias],
        },
      ]
      return entry
    }),
  ].sort(([nameA], [nameB]) => nameA.localeCompare(nameB))

  // Create component type map
  const componentTypeMap = new Map<string, ComponentType>(componentEntries)
  const knownTypeNames = new Set<string>(componentTypeMap.keys())

  // Build component hierarchy
  const { parentToChildren, getTopLevelComponents } = buildComponentHierarchy(
    componentTypeMap,
    knownTypeNames,
  )

  // Get top-level components
  const topLevelComponents = getTopLevelComponents()

  const index = topLevelComponents
    .map(type => generateIndex(type, componentTypeMap, parentToChildren))
    .filter(Boolean)
    .join('\n')

  const sections = topLevelComponents
    .map(type => generateComponentSection(type, componentTypeMap, parentToChildren))
    .filter(Boolean)
    .join('\n\n')

  const markdown = `# Component Inventory\n\n${index}\n\n${sections}`

  await writeFile(DOCS_OUTPUT_FILE, markdown)
  console.log(`Component adapter docs updated and written to ${DOCS_OUTPUT_FILE}`)
}

generateAdapterPropDocs().catch(console.error)
