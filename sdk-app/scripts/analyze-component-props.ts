/* eslint-disable no-console */
/**
 * Static analysis script that inspects SDK component TypeScript interfaces
 * to determine which props each component requires at runtime.
 *
 * It produces two maps consumed by the SDK Dev App's component registry:
 *   - ENTITY_REQUIREMENTS: which entity IDs (companyId, employeeId, etc.)
 *     each component needs so the app can pass them from environment/settings
 *   - ADDITIONAL_REQUIRED_PROPS: non-entity required props (e.g. formId, state)
 *     that can't be auto-provisioned and need manual input or a parent flow
 *
 * Standard SDK base props (onEvent, className, dictionary, etc.) are automatically
 * excluded by reading them from BaseComponentInterface / CommonComponentInterface
 * so they don't need to be maintained by hand.
 *
 * Run: npx tsx sdk-app/scripts/analyze-component-props.ts
 */
import { resolve } from 'path'
import { existsSync, writeFileSync } from 'fs'
import { Project, SyntaxKind, type Type } from 'ts-morph'

const ROOT = resolve(import.meta.dirname, '../..')
const OUTPUT = resolve(import.meta.dirname, '../src/generated-registry-data.ts')

const ENTITY_ID_PATTERN = /^(company|employee|contractor|payroll|request)Id$/

const NAMESPACES: Record<string, string> = {
  Company: 'src/components/Company/index.tsx',
  Employee: 'src/components/Employee/index.ts',
  Contractor: 'src/components/Contractor/index.ts',
  Payroll: 'src/components/Payroll/index.ts',
  InformationRequests: 'src/components/InformationRequests/index.ts',
  Hooks: 'sdk-app/src/components/Hooks.ts',
}

interface ComponentData {
  requiredEntityIds: string[]
  additionalRequiredProps: string[]
}

function getPropertyNames(type: Type, requiredOnly: boolean): string[] {
  const names: string[] = []
  for (const prop of type.getProperties()) {
    if (requiredOnly) {
      const isOptional = prop.getDeclarations().some(d => {
        if (d.isKind(SyntaxKind.PropertySignature)) {
          return d.hasQuestionToken()
        }
        return false
      })
      if (isOptional) continue
    }
    names.push(prop.getName())
  }
  return names
}

function extractBaseProps(project: Project): Set<string> {
  const basePath = resolve(ROOT, 'src/components/Base/Base.tsx')
  const sourceFile = project.addSourceFileAtPath(basePath)

  const baseProps = new Set<string>()

  for (const iface of sourceFile.getInterfaces()) {
    const name = iface.getName()
    if (name === 'CommonComponentInterface' || name === 'BaseComponentInterface') {
      const type = iface.getType()
      for (const propName of getPropertyNames(type, false)) {
        baseProps.add(propName)
      }
    }
  }

  return baseProps
}

function analyzeComponents(): Record<string, ComponentData> {
  const project = new Project({
    tsConfigFilePath: resolve(ROOT, 'tsconfig.json'),
    skipAddingFilesFromTsConfig: true,
  })

  const baseProps = extractBaseProps(project)
  console.log(`  Base props (auto-detected, excluded): ${[...baseProps].sort().join(', ')}`)

  const results: Record<string, ComponentData> = {}

  for (const [namespace, indexPath] of Object.entries(NAMESPACES)) {
    const fullPath = resolve(ROOT, indexPath)
    if (!existsSync(fullPath)) {
      console.warn(`  Skipping missing namespace file: ${indexPath}`)
      continue
    }
    const sourceFile = project.addSourceFileAtPath(fullPath)

    for (const exportDecl of sourceFile.getExportDeclarations()) {
      for (const namedExport of exportDecl.getNamedExports()) {
        const name = namedExport.getName()
        const key = `${namespace}.${name}`

        const symbol = namedExport.getNameNode().getSymbol()
        if (!symbol) continue

        const aliasedSymbol = symbol.getAliasedSymbol()
        const targetSymbol = aliasedSymbol || symbol

        const declarations = targetSymbol.getDeclarations()
        const funcDecl = declarations.find(
          d => d.isKind(SyntaxKind.FunctionDeclaration) || d.isKind(SyntaxKind.VariableDeclaration),
        )

        if (!funcDecl) continue

        let propsType: Type | undefined

        if (funcDecl.isKind(SyntaxKind.FunctionDeclaration)) {
          const params = funcDecl.getParameters()
          if (params.length > 0) {
            propsType = params[0].getType()
          }
        } else if (funcDecl.isKind(SyntaxKind.VariableDeclaration)) {
          const initializer = funcDecl.getInitializer()
          if (
            initializer &&
            (initializer.isKind(SyntaxKind.ArrowFunction) ||
              initializer.isKind(SyntaxKind.FunctionExpression))
          ) {
            const params = initializer.getParameters()
            if (params.length > 0) {
              propsType = params[0].getType()
            }
          }
        }

        if (!propsType) continue

        const allRequired = getPropertyNames(propsType, true)
        const entityIds: string[] = []
        const additionalProps: string[] = []

        for (const prop of allRequired) {
          if (baseProps.has(prop)) continue
          if (ENTITY_ID_PATTERN.test(prop)) {
            entityIds.push(prop)
          } else {
            additionalProps.push(prop)
          }
        }

        results[key] = {
          requiredEntityIds: entityIds.length > 0 ? entityIds : ['companyId'],
          additionalRequiredProps: additionalProps,
        }
      }
    }
  }

  return results
}

function generate() {
  console.log('Analyzing component interfaces...\n')

  const results = analyzeComponents()
  const sortedKeys = Object.keys(results).sort()

  const scriptPath = 'sdk-app/scripts/analyze-component-props.ts'
  let output = `// Auto-generated by ${scriptPath}\n`
  output += `// Run: npx tsx ${scriptPath}\n\n`

  const toArrayLiteral = (arr: string[]) => `[${arr.map(s => `'${s}'`).join(', ')}]`

  output += `export const ENTITY_REQUIREMENTS: Record<string, string[]> = {\n`
  for (const key of sortedKeys) {
    output += `  '${key}': ${toArrayLiteral(results[key].requiredEntityIds)},\n`
  }
  output += `}\n\n`

  output += `export const ADDITIONAL_REQUIRED_PROPS: Record<string, string[]> = {\n`
  for (const key of sortedKeys) {
    const props = results[key].additionalRequiredProps
    if (props.length > 0) {
      output += `  '${key}': ${toArrayLiteral(props)},\n`
    }
  }
  output += `}\n`

  writeFileSync(OUTPUT, output)
  console.log(`\nGenerated: ${OUTPUT}`)
  console.log(`  ${sortedKeys.length} components analyzed`)

  const withAdditional = sortedKeys.filter(k => results[k].additionalRequiredProps.length > 0)
  if (withAdditional.length > 0) {
    console.log(`  ${withAdditional.length} with additional required props:`)
    for (const key of withAdditional) {
      console.log(`    ${key}: ${results[key].additionalRequiredProps.join(', ')}`)
    }
  }
}

generate()
