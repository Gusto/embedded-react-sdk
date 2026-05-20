import { ReflectionKind } from 'typedoc'
import { MemberRouter } from 'typedoc-plugin-markdown'

/**
 * TypeDoc plugin: domain-aware router for @gusto/embedded-react-sdk
 *
 * Replaces MemberRouter's two default grouping axes:
 *   - module/namespace hierarchy  →  domain extracted from source file path
 *   - kind subdirectories (functions/, interfaces/, …)  →  @category tag value
 *
 * Register via  "router": "domain"  in typedoc.json.
 */
export function load(app) {
  app.renderer.defineRouter('domain', DomainRouter)
}

class DomainRouter extends MemberRouter {
  getIdealBaseName(reflection) {
    const source = findSourceFile(reflection)
    const domain = extractDomain(source)

    if (!domain) {
      return super.getIdealBaseName(reflection)
    }

    const category = findCategory(reflection)

    switch (reflection.kind) {
      case ReflectionKind.Module:
      case ReflectionKind.Namespace:
        // Module/namespace page becomes the category index entry
        return `${domain}/${category}/${this.entryFileName}`
      default:
        // Functions, interfaces, type aliases, etc.
        return `${domain}/${category}/${this.getReflectionAlias(reflection)}`
    }
  }
}

/** Walk up the reflection tree until we find a source file reference. */
function findSourceFile(reflection) {
  if (reflection.sources?.length) {
    return reflection.sources[0].fileName
  }
  if (reflection.parent) {
    return findSourceFile(reflection.parent)
  }
  return ''
}

/** Extract the domain segment from a source path under src/components/. */
function extractDomain(sourcePath) {
  const match = sourcePath.match(/\bcomponents\/(\w+)\//)
  return match?.[1] ?? null
}

/**
 * Derive category from the reflection's name, then walk up the tree so that
 * types and interfaces with no name match inherit from their parent hook/flow.
 *
 * Rules (applied to each name encountered going up):
 *   use*   → hooks
 *   *Flow  → flows
 *   other  → components
 */
function findCategory(reflection) {
  const name = reflection.name
  if (/^use[A-Z_]/.test(name)) return 'hooks'
  if (/Flow$/.test(name)) return 'flows'
  if (reflection.parent) return findCategory(reflection.parent)
  return 'components'
}
