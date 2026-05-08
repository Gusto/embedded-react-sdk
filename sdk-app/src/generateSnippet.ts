import type { ComponentEntry } from './registry'
import type { EntityIds } from './useEntities'
import { resolveDefaults } from './component-defaults'

const TODO = '{/* TODO */}'

function formatPropValue(value: unknown): string {
  if (typeof value === 'string') return JSON.stringify(value)
  if (typeof value === 'boolean' || typeof value === 'number') return `{${String(value)}}`
  if (value === null) return '{null}'
  return TODO
}

export function generateSnippet(entry: ComponentEntry, entities: EntityIds): string {
  const propLines: string[] = []
  const seen = new Set<string>()

  const pushProp = (name: string, rendered: string) => {
    if (seen.has(name)) return
    seen.add(name)
    propLines.push(`  ${name}=${rendered}`)
  }

  for (const id of entry.requiredEntityIds) {
    const value = entities[id as keyof EntityIds]
    if (!value) {
      pushProp(id, TODO)
    } else {
      pushProp(id, JSON.stringify(value))
    }
  }

  for (const prop of entry.additionalRequiredProps) {
    if (seen.has(prop)) continue
    const fromEntities = entities[prop as keyof EntityIds]
    if (fromEntities) {
      pushProp(prop, JSON.stringify(fromEntities))
    } else {
      pushProp(prop, TODO)
    }
  }

  const defaults = resolveDefaults(`${entry.category}.${entry.name}`)
  for (const [prop, value] of Object.entries(defaults)) {
    if (seen.has(prop)) continue
    pushProp(prop, formatPropValue(value))
  }

  pushProp('onEvent', '{handleEvent}')

  const tag = `${entry.category}.${entry.name}`
  return [
    `import { ${entry.category} } from '@gusto/embedded-react-sdk'`,
    '',
    `<${tag}`,
    ...propLines,
    '/>',
  ].join('\n')
}
