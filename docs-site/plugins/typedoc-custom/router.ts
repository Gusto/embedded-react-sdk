import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'
import {
  ArrayType,
  Comment,
  CommentTag,
  type Context,
  DeclarationReflection,
  IndexedAccessType,
  IntersectionType,
  PageKind,
  type PageDefinition,
  ProjectReflection,
  QueryType,
  ReferenceType,
  type Reflection,
  ReflectionGroup,
  ReflectionKind,
  RendererEvent,
  Slugger,
  type SomeType,
  TupleType,
  UnionType,
} from 'typedoc'
import { MemberRouter } from 'typedoc-plugin-markdown'
import { DOMAINS, I18N_RELOCATION, STANDALONE_PAGES } from './router.config.ts'
import { CUSTOM_GROUPS, GROUP_ORDER } from '../../typedoc-utils.ts'
import {
  findHookResultAlias,
  getFormHookModel,
  getHookModel,
  getHookReadyInterface,
} from './hook-model.ts'
import {
  componentPropsInterfaces,
  domainFromSources,
  hasGroup,
  hookDirFromSources,
  isHookSourceFile,
  NAMESPACE_PATHS,
  pathToSourceDir,
  readFlowGuide,
  readHookGuide,
  type Guide,
  reparentDeprecatedMembers,
  standalonePageFromSources,
} from './utils.ts'

/**
 * The TypeDoc namespace (and generated directory) that re-exports embedded-API entity types.
 * `export type * as APIModels` in src/index.ts produces this; getIdealBaseName leaves the
 * directory name as-is since it's absent from NAMESPACE_PATHS.
 */
const API_MODELS_NAMESPACE = 'APIModels'

/**
 * The `Translations` namespace (referenced by the `Resources` map interface in
 * src/i18n/types.d.ts) holding each i18n namespace's overridable message keys,
 * browsable as `Translations.CompanyAddresses`.
 */
const TRANSLATIONS_NAMESPACE = 'Translations'

/**
 * Namespaces rendered as a single flat page — all members anchored on the index,
 * no Flow/Blocks split. These re-export data/entity types, so the component-domain
 * heuristics (splitting `*Flow` members onto their own pages) must not apply, even
 * when a member's name happens to end in "Flow" (e.g. `Translations.PayrollPayrollFlow`).
 */
const FLAT_NAMESPACES = new Set([API_MODELS_NAMESPACE, TRANSLATIONS_NAMESPACE])

/**
 * Map an installed-package source path to its definition on GitHub.
 *
 * TypeDoc resolves re-exported entity types to the compiled `esm/**\/*.d.ts` inside
 * `node_modules`. We rewrite that to the package's published TypeScript source
 * (`src/**\/*.ts`) on the repo named in the package's own `package.json#repository`, so
 * the link survives version bumps (the dated package directory comes from `repository.directory`).
 */
function upstreamGitHubSource(
  absolutePath: string,
  symbolName: string,
): { fileName: string; line: number; url: string } | undefined {
  const match = /^(.*\/node_modules\/(?:@[^/]+\/)?[^/]+)\/(.+)$/.exec(absolutePath)
  if (!match) return undefined
  const [, packageRoot, relativePath] = match
  const repo = readPackageRepository(packageRoot!)
  if (!repo) return undefined

  const srcRelative = relativePath!.replace(/^esm\//, 'src/').replace(/\.d\.ts$/, '.ts')
  const repoRelative = `${repo.directory}/${srcRelative}`
  const line = findDeclarationLine(join(packageRoot!, srcRelative), symbolName)
  const anchor = line ? `#L${line}` : ''
  // The client publishes one git tag per package version, e.g. `gusto_embedded_v_2025_11_15/v0.0.2`.
  // Pin to that tag (not `main`) so links keep resolving to the exact source this build documents.
  const ref = `${repo.directory}/v${repo.version}`
  return {
    fileName: repoRelative,
    line: line ?? 1,
    url: `${repo.baseUrl}/blob/${ref}/${repoRelative}${anchor}`,
  }
}

type PackageRepository = { baseUrl: string; directory: string; version: string }
const repositoryCache = new Map<string, PackageRepository | null>()

function readPackageRepository(packageRoot: string): PackageRepository | null {
  if (repositoryCache.has(packageRoot)) return repositoryCache.get(packageRoot)!
  let result: PackageRepository | null = null
  try {
    const manifestPath = join(packageRoot, 'package.json')
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
      version?: string
      repository?: { url?: string; directory?: string }
    }
    const rawUrl = manifest.repository?.url
    const directory = manifest.repository?.directory
    const version = manifest.version
    if (rawUrl && directory && version) {
      const baseUrl = rawUrl
        .replace(/^git\+/, '')
        .replace(/\.git$/, '')
        .replace(/^git:\/\//, 'https://')
      result = { baseUrl, directory, version }
    }
  } catch {
    result = null
  }
  repositoryCache.set(packageRoot, result)
  return result
}

/** Line number of the top-level declaration of `symbolName` in a package source file, if found. */
function findDeclarationLine(sourcePath: string, symbolName: string): number | undefined {
  if (!existsSync(sourcePath)) return undefined
  const escaped = symbolName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const declaration = new RegExp(
    `^export (?:type ${escaped}\\b|declare (?:const|function|class|enum) ${escaped}(?![\\w$])|(?:const|function|class|enum) ${escaped}(?![\\w$]))`,
  )
  const lines = readFileSync(sourcePath, 'utf8').split('\n')
  const index = lines.findIndex(line => declaration.test(line))
  return index >= 0 ? index + 1 : undefined
}

/** Convert a PascalCase name to kebab-case.
 *  'OnboardingFlow' → 'onboarding-flow',  'PayrollRunFlow' → 'payroll-run-flow' */
function toKebabCase(name: string): string {
  return name.replace(
    /([A-Z])/g,
    (_, letter: string, offset: number) => (offset > 0 ? '-' : '') + letter.toLowerCase(),
  )
}

/**
 * Return the slug for a namespace's own hub page.
 *
 * Multi-namespace domains (namespace has a subpath) → 'index'
 *   e.g. EmployeeManagement (subpath 'management') → 'index'
 *        → employee/management/index.md
 *
 * Single-namespace domains (no subpath) → 'namespace'
 *   e.g. Payroll (no subpath) → 'namespace'
 *        → payroll/namespace.md  (distinct from the domain hub at payroll/index.md)
 *
 * Falls back to 'index' for unknown namespaces (not in DOMAINS).
 */
function getNamespaceIndexSlug(namespaceName: string): string {
  for (const domain of DOMAINS) {
    const ns = domain.namespaces.find(n => n.id === namespaceName)
    if (ns) return ns.subpath ? 'index' : 'namespace'
  }
  return 'index'
}

// Type-parameter names on a field's `*HookFieldProps` interface whose bound
// argument is a validation error-code type. A field-props interface may carry
// other generics (e.g. `RadioGroupHookFieldProps<TErrorCode, TEntry>`), so
// validation types are matched by parameter name, never by position.
const VALIDATION_TYPE_PARAMS = new Set(['TErrorCode', 'TOptionalErrorCode'])

/**
 * Collect the field validation types on a hook page: the error-code types
 * passed as the `TErrorCode` / `TOptionalErrorCode` generic of a field's props.
 *
 * Field props are type aliases of the shape
 * `HookFieldProps<SomeHookFieldProps<TErrorCode, TOptionalErrorCode>>`, declared
 * directly as `*FieldProps` members and referenced by each field component's
 * props parameter. For every such alias we resolve the underlying field-props
 * interface, then read the arguments bound to its `TErrorCode` /
 * `TOptionalErrorCode` parameters. An argument counts as a validation type only
 * when it resolves to a reflection on this page (skipping `never`, inline
 * unions, and cross-page references), so the page's own `*Validation` aliases
 * are gathered while entry/value generics like `TEntry` are left alone.
 */
function collectFieldValidationTypes(members: DeclarationReflection[]): Set<DeclarationReflection> {
  const memberSet = new Set(members)
  const validationTypes = new Set<DeclarationReflection>()

  const collectFromAlias = (alias: DeclarationReflection): void => {
    if (!(alias.type instanceof ReferenceType) || alias.type.name !== 'HookFieldProps') return
    const underlyingRef = alias.type.typeArguments?.[0]
    if (!(underlyingRef instanceof ReferenceType)) return
    const underlying = underlyingRef.reflection
    if (!(underlying instanceof DeclarationReflection)) return
    underlying.typeParameters?.forEach((param, index) => {
      if (!VALIDATION_TYPE_PARAMS.has(param.name)) return
      const arg = underlyingRef.typeArguments?.[index]
      if (
        arg instanceof ReferenceType &&
        arg.reflection instanceof DeclarationReflection &&
        memberSet.has(arg.reflection)
      ) {
        validationTypes.add(arg.reflection)
      }
    })
  }

  for (const member of members) {
    if (member.kind === ReflectionKind.TypeAlias) {
      collectFromAlias(member)
    } else if (member.kind === ReflectionKind.Function) {
      for (const sig of member.signatures ?? []) {
        const propsRef = sig.parameters?.[0]?.type
        if (
          propsRef instanceof ReferenceType &&
          propsRef.reflection instanceof DeclarationReflection
        ) {
          collectFromAlias(propsRef.reflection)
        }
      }
    }
  }

  return validationTypes
}

/**
 * Walk a type and collect the names of every page member it references.
 *
 * Matching is by name (against `memberNames`), not object identity: a type
 * argument's resolved reflection can be a distinct instance from the declared
 * member that carries the page anchor, yet they share a name. A reference that
 * resolves to a child reflection (e.g. an error-code property reached via
 * `typeof X.REQUIRED`) climbs to its nearest enclosing member (the `X` const),
 * so the full code map is captured rather than a single property. Covers the
 * type shapes that appear in validation and error-code aliases — `typeof X`,
 * `typeof X[...]`, unions, intersections, arrays, and tuples.
 */
function collectReferencedMembers(
  type: SomeType | undefined,
  memberNames: Set<string>,
  out: Set<string>,
): void {
  if (!type) return
  if (type instanceof ReferenceType) {
    let refl: Reflection | undefined = type.reflection ?? undefined
    while (refl && !memberNames.has(refl.name)) {
      refl = refl.parent
    }
    if (refl) out.add(refl.name)
    for (const arg of type.typeArguments ?? []) collectReferencedMembers(arg, memberNames, out)
    return
  }
  if (type instanceof UnionType || type instanceof IntersectionType) {
    for (const member of type.types) collectReferencedMembers(member, memberNames, out)
    return
  }
  if (type instanceof ArrayType) {
    collectReferencedMembers(type.elementType, memberNames, out)
    return
  }
  if (type instanceof TupleType) {
    for (const element of type.elements) collectReferencedMembers(element, memberNames, out)
    return
  }
  if (type instanceof IndexedAccessType) {
    collectReferencedMembers(type.objectType, memberNames, out)
    collectReferencedMembers(type.indexType, memberNames, out)
    return
  }
  if (type instanceof QueryType) {
    collectReferencedMembers(type.queryType, memberNames, out)
  }
}

function kindGroupName(kind: ReflectionKind): string {
  switch (kind) {
    case ReflectionKind.Function:
      return 'Functions'
    case ReflectionKind.Interface:
      return 'Interfaces'
    case ReflectionKind.TypeAlias:
      return 'Type Aliases'
    case ReflectionKind.Enum:
      return 'Enumerations'
    case ReflectionKind.Variable:
      return 'Variables'
    case ReflectionKind.Class:
      return 'Classes'
    default:
      return 'Other'
  }
}

/**
 * Build ReflectionGroups for a synthetic namespace. GroupPlugin only runs
 * during conversion, so synthetic namespaces created in buildPages need their
 * groups constructed manually.
 *
 * For the domain hooks page, pass `hookGroupMap` (built before sources are
 * cleared) so each member is grouped under its hook directory name rather than
 * a kind-based section. Priority: hookGroupMap entry → @group tag → kind name.
 *
 * Within each hook-named group the primary hook function (member whose name
 * matches the group title) is sorted to the top.
 *
 * When `collapseUtilityTypes` is set (hook pages), the leftover kind-based
 * groups — Variables, Interfaces, Type Aliases — are merged into one
 * "Utility types" group instead of standing as separate sections.
 */
function groupSyntheticMembers(
  members: DeclarationReflection[],
  owner: DeclarationReflection,
  hookGroupMap?: Map<DeclarationReflection, string>,
  collapseUtilityTypes = false,
): ReflectionGroup[] {
  const byTitle = new Map<string, DeclarationReflection[]>()
  for (const member of members) {
    const hookGroup = hookGroupMap?.get(member)
    const tag = member.comment?.blockTags.find(t => t.tag === '@group')
    const title = hookGroup ?? tag?.content[0]?.text?.trim() ?? kindGroupName(member.kind)
    const bucket = byTitle.get(title) ?? []
    bucket.push(member)
    byTitle.set(title, bucket)
  }

  // Within each hook-named group, sort the primary hook function to the top.
  // Within all other groups, sort alphabetically by name.
  for (const [title, groupMembers] of byTitle) {
    if (/^use[A-Z]/.test(title)) {
      groupMembers.sort((a, b) => {
        if (a.name === title) return -1
        if (b.name === title) return 1
        return 0
      })
    } else {
      groupMembers.sort((a, b) => a.name.localeCompare(b.name))
    }
  }

  // On hook pages, fold the generic kind-based buckets — everything not sorted
  // into a named section (Props, Returns, Fields, Utility hooks, …) — into a
  // single "Utility types" group, alphabetized across the merged set.
  if (collapseUtilityTypes) {
    // First lift out the field validation types (the error-code types passed as
    // a field's `TErrorCode` / `TOptionalErrorCode` generic) into their own
    // "Validations" section, ahead of the Utility types catch-all.
    //
    // Membership is tracked by NAME against the page's own member objects:
    // `collectFieldValidationTypes` and the type-graph walk can surface
    // reflection instances distinct from (though identically named to) the
    // declared members that own the page's anchors, so resolving each back to
    // its canonical member keeps anchors intact and dedupes cleanly.
    const seedRefs = collectFieldValidationTypes(members)
    if (seedRefs.size > 0) {
      const membersByName = new Map(members.map(member => [member.name, member]))
      const memberNames = new Set(membersByName.keys())

      const referenced = (type: SomeType | undefined): Set<string> => {
        const out = new Set<string>()
        collectReferencedMembers(type, memberNames, out)
        return out
      }

      // Validation types: the transitive closure from each field's `TErrorCode`
      // / `TOptionalErrorCode` argument over type-alias references. A composite
      // such as `AmountValidation = RequiredValidation | NegativeAmountValidation`
      // pulls in both operands even when they are not field generics themselves.
      // The closure stops at the error-code map, which is a const (variable),
      // not a type alias.
      const validations = new Set<DeclarationReflection>()
      const queue = [...seedRefs]
        .map(ref => membersByName.get(ref.name))
        .filter((member): member is DeclarationReflection => member !== undefined)
      while (queue.length > 0) {
        const validation = queue.pop()!
        if (validations.has(validation) || validation.kind !== ReflectionKind.TypeAlias) continue
        validations.add(validation)
        for (const name of referenced(validation.type)) {
          const ref = membersByName.get(name)
          if (ref?.kind === ReflectionKind.TypeAlias && !validations.has(ref)) queue.push(ref)
        }
      }
      const validationNames = new Set([...validations].map(v => v.name))

      // The full code maps the validations are built from: the `XxxErrorCodes`
      // const each validation references, plus the `XxxErrorCode` union derived
      // solely from one of those maps. Found via the type graph, never names.
      const codeMapNames = new Set<string>()
      for (const validation of validations) {
        for (const name of referenced(validation.type)) {
          if (!validationNames.has(name)) codeMapNames.add(name)
        }
      }
      const errorCodes = new Set<DeclarationReflection>()
      for (const name of codeMapNames) {
        const member = membersByName.get(name)
        if (member) errorCodes.add(member)
      }
      for (const member of members) {
        if (validationNames.has(member.name) || codeMapNames.has(member.name)) continue
        // Field-props aliases (`HookFieldProps<…>`) inline a code reference but
        // are not code types — skip them.
        if (member.type instanceof ReferenceType && member.type.name === 'HookFieldProps') continue
        const refNames = referenced(member.type)
        // The union is a type alias derived solely from a code map — it
        // references one (or more) of them and nothing else on the page.
        if (refNames.size > 0 && [...refNames].every(name => codeMapNames.has(name))) {
          errorCodes.add(member)
        }
      }

      // Order: full code maps first (the `const` map ahead of its derived
      // union), then the per-field validation types — each alphabetical.
      const byKind = (a: DeclarationReflection, b: DeclarationReflection) => {
        const rank = (r: DeclarationReflection) => (r.kind === ReflectionKind.Variable ? 0 : 1)
        return rank(a) - rank(b) || a.name.localeCompare(b.name)
      }
      const ordered = [
        ...[...errorCodes].sort(byKind),
        ...[...validations].sort((a, b) => a.name.localeCompare(b.name)),
      ]

      const toMove = new Set(ordered.map(member => member.name))
      for (const title of Array.from(byTitle.keys())) {
        const remaining = byTitle.get(title)!.filter(member => !toMove.has(member.name))
        if (remaining.length > 0) byTitle.set(title, remaining)
        else byTitle.delete(title)
      }
      byTitle.set(CUSTOM_GROUPS.validations, ordered)
    }

    const merged: DeclarationReflection[] = []
    for (const title of ['Variables', 'Interfaces', 'Type Aliases']) {
      const bucket = byTitle.get(title)
      if (bucket) {
        merged.push(...bucket)
        byTitle.delete(title)
      }
    }
    if (merged.length > 0) {
      merged.sort((a, b) => a.name.localeCompare(b.name))
      byTitle.set(CUSTOM_GROUPS.utilityTypes, [
        ...(byTitle.get(CUSTOM_GROUPS.utilityTypes) ?? []),
        ...merged,
      ])
    }
  }

  const ordered = [
    ...GROUP_ORDER.filter(t => byTitle.has(t)),
    ...Array.from(byTitle.keys()).filter(t => !GROUP_ORDER.includes(t)),
  ]
  return ordered.map(title => {
    const group = new ReflectionGroup(title, owner)
    group.children = byTitle.get(title)!
    return group
  })
}

export class SDKRouter extends MemberRouter {
  // Populated by buildPages; used by emitCategoryFiles to create hooks subdirectories.
  private static readonly domainsWithHooks = new Set<string>()

  // Emit _category_.json files for each domain directory and namespace subdirectory
  // so Docusaurus uses our labels and ordering in the sidebar rather than inferring
  // them from directory names.
  static emitCategoryFiles(event: RendererEvent): void {
    const outDir = event.outputDirectory
    for (const [idx, domain] of DOMAINS.entries()) {
      const domainDir = join(outDir, domain.path)
      mkdirSync(domainDir, { recursive: true })
      writeFileSync(
        join(domainDir, '_category_.json'),
        JSON.stringify({ label: domain.label, position: idx + 1 }, null, 2) + '\n',
      )
      for (const [nsIdx, ns] of domain.namespaces.entries()) {
        if (!ns.subpath) continue
        const nsDir = join(domainDir, ns.subpath)
        mkdirSync(nsDir, { recursive: true })
        writeFileSync(
          join(nsDir, '_category_.json'),
          // index.md = position 1; namespace subdirs start at position 2
          JSON.stringify({ label: ns.id, position: nsIdx + 2, collapsed: false }, null, 2) + '\n',
        )
      }
      if (SDKRouter.domainsWithHooks.has(domain.path)) {
        const hooksDir = join(domainDir, 'hooks')
        mkdirSync(hooksDir, { recursive: true })
        writeFileSync(
          join(hooksDir, '_category_.json'),
          JSON.stringify({ label: CUSTOM_GROUPS.hooks, position: 100, collapsed: true }, null, 2) +
            '\n',
        )
      }
    }

    // APIModels re-exports embedded-API entity types. It's a TypeDoc namespace, but in the
    // sidebar we present it as an ordinary collapsed section pinned to the end — after the
    // domains and standalone pages — rather than letting it default to the top.
    const apiModelsDir = join(outDir, API_MODELS_NAMESPACE)
    mkdirSync(apiModelsDir, { recursive: true })
    writeFileSync(
      join(apiModelsDir, '_category_.json'),
      JSON.stringify(
        {
          label: 'API models',
          position: DOMAINS.length + STANDALONE_PAGES.length + 1,
          collapsed: true,
        },
        null,
        2,
      ) + '\n',
    )

    // Translations (i18n translation keys) — pinned after API Models.
    const translationsDir = join(outDir, TRANSLATIONS_NAMESPACE)
    mkdirSync(translationsDir, { recursive: true })
    writeFileSync(
      join(translationsDir, '_category_.json'),
      JSON.stringify(
        {
          label: 'Translations',
          position: DOMAINS.length + STANDALONE_PAGES.length + 2,
          collapsed: true,
        },
        null,
        2,
      ) + '\n',
    )
  }

  // Must run before CommentPlugin's RESOLVE_BEGIN handler (priority 0) so that
  // ReferenceReflections in non-deprecated namespaces haven't yet been removed by
  // excludeNotDocumented. Priority 50 = after protectPropsInterfaces (100) but
  // before CommentPlugin (0).
  static reparentDeprecated(context: Context): void {
    reparentDeprecatedMembers(context.project)
  }

  /**
   * Relocate the i18n *types* ({@link I18N_RELOCATION}) from the project index
   * onto the `Translations` page, keeping each type's natural `@group` section
   * (e.g. "Utility types"). Selected by source path + `@group` rather than by
   * name, so new i18n-adjacent utilities added to those files move
   * automatically. This is purely a docs move: the public export paths are
   * unchanged (they remain top-level `@gusto/embedded-react-sdk` exports), only
   * their rendered location changes, and TypeDoc's relativeUrl walk keeps every
   * cross-link correct.
   *
   * Must run before GroupPlugin (priority -100) so the reflections leave
   * `project.groups` (no longer rendered on the index) and are grouped under
   * `Translations` instead. Group ordering on the page is set via `groupOrder`.
   */
  static relocateI18nTypes(context: Context): void {
    const { project } = context
    const translations = project.children?.find(
      (c): c is DeclarationReflection =>
        c instanceof DeclarationReflection &&
        c.kind === ReflectionKind.Namespace &&
        c.name === TRANSLATIONS_NAMESPACE,
    )
    if (!translations) return

    const { sources, groups } = I18N_RELOCATION
    for (const child of [...(project.children ?? [])]) {
      if (!(child instanceof DeclarationReflection)) continue
      const fp = child.sources?.[0]?.fullFileName ?? child.sources?.[0]?.fileName ?? ''
      if (!sources.some(fragment => fp.includes(fragment))) continue
      const inGroup = child.comment?.blockTags.some(
        t =>
          t.tag === '@group' &&
          groups.some(g => g === Comment.combineDisplayParts(t.content).trim()),
      )
      if (!inGroup) continue

      project.removeChild(child)
      child.parent = translations
      translations.addChild(child)
      // Keep the source `@group` intact so each type renders under its natural
      // section on the Translations page (e.g. "Utility types"); GroupPlugin
      // rebuilds project.groups from children after this, so removing the child
      // above is what drops it from the index.
    }
  }

  /**
   * Stamp `@group Translation namespaces` on the per-i18n-namespace key
   * interfaces (`Translations.CompanyAddresses`, …) so they render under their
   * own section rather than the generic "Interfaces". The relocated i18n *types*
   * ({@link relocateI18nTypes}) already carry a `@group` (e.g. "Utility types")
   * and are skipped, so they stay in their own section.
   *
   * Must run before GroupPlugin (priority -100). Group ordering is set via
   * `groupOrder`.
   */
  static groupTranslationInterfaces(context: Context): void {
    const translations = context.project.children?.find(
      (c): c is DeclarationReflection =>
        c instanceof DeclarationReflection &&
        c.kind === ReflectionKind.Namespace &&
        c.name === TRANSLATIONS_NAMESPACE,
    )
    if (!translations) return

    for (const child of translations.children ?? []) {
      if (child.kind !== ReflectionKind.Interface) continue
      if (child.comment?.blockTags.some(t => t.tag === '@group')) continue

      if (!child.comment) child.comment = new Comment()
      child.comment.blockTags.push(
        new CommentTag('@group', [{ kind: 'text', text: CUSTOM_GROUPS.translationNamespaces }]),
      )
    }
  }

  // Must run before GroupPlugin (priority -100). EventDispatcher fires higher priorities first,
  // so priority 0 (default) runs before GroupPlugin's -100.
  //
  // Auto-stamps @group tags so GroupPlugin places each member in the right section:
  //   Components in a namespace  → Flow components (*Flow) or Block components (other)
  //   Components at project level → Components
  //   Hooks ending with Form      → Form hooks  (Data hooks / Utility hooks come from JSDoc)
  //   Other hooks                 → Hooks (fallback)
  // Skips reflections that already carry an explicit @group tag from their JSDoc.
  // NOTE: TypeDoc places @group block tags on SignatureReflections, not the parent
  // DeclarationReflection. We copy any signature-level @group to the declaration so
  // the skip check fires and groupSyntheticMembers can read the group from member.comment.
  static stampGroupTags(context: Context): void {
    for (const reflection of Object.values(context.project.reflections)) {
      if (!(reflection instanceof DeclarationReflection)) continue
      if (reflection.kind !== ReflectionKind.Function) continue
      if (reflection.comment?.blockTags.some(t => t.tag === '@group')) continue

      // TypeDoc places @group block tags on the SignatureReflection, not the
      // DeclarationReflection. Copy any explicit tag to the declaration so the
      // check above fires on the next pass and groupSyntheticMembers can read it.
      const sigGroupTag = reflection.signatures
        ?.flatMap(sig => sig.comment?.blockTags ?? [])
        .find(t => t.tag === '@group')
      if (sigGroupTag) {
        if (!reflection.comment) reflection.comment = new Comment()
        reflection.comment.blockTags.push(sigGroupTag)
        continue
      }

      let group: string
      if (/^[A-Z]/.test(reflection.name)) {
        const inNamespace =
          reflection.parent instanceof DeclarationReflection &&
          reflection.parent.kind === ReflectionKind.Namespace
        group = inNamespace
          ? /Flow$/.test(reflection.name)
            ? CUSTOM_GROUPS.flowComponents
            : CUSTOM_GROUPS.blockComponents
          : CUSTOM_GROUPS.components
      } else if (/^use[A-Z]/.test(reflection.name)) {
        group = /Form$/.test(reflection.name) ? CUSTOM_GROUPS.formHooks : CUSTOM_GROUPS.hooks
      } else {
        continue
      }

      if (!reflection.comment) reflection.comment = new Comment()
      reflection.comment.blockTags.push(new CommentTag('@group', [{ kind: 'text', text: group }]))
    }
  }

  // Populated at the start of buildPages; hooks here are anchors on a synthetic
  // domain hooks page and must be skipped when buildChildPages encounters them.
  private readonly handledHooks = new Set<DeclarationReflection>()

  // Populated at the start of buildPages; members here get a standalone page
  // and must be skipped when buildChildPages would otherwise anchor them on index.md.
  private readonly handledStandalone = new Set<DeclarationReflection>()

  // Keyed by domain.path; populated in buildPages so renderDomainHub can list hooks.
  readonly hooksNsByDomain = new Map<string, DeclarationReflection>()

  // Keyed by the flow DeclarationReflection; populated before sources are cleared
  // so the renderer can slot GUIDE.md prose into each flow page.
  readonly flowGuides = new Map<DeclarationReflection, Guide>()

  // Keyed by the synthetic per-hook namespace; same GUIDE.md slot mechanism as
  // flows, read from the hook directory root before sources are cleared.
  readonly hookGuides = new Map<DeclarationReflection, Guide>()

  /**
   * Pre-scan for domain hooks and consolidate them into one synthetic namespace
   * page per domain (e.g. employee/hooks.md), then delegate everything else to
   * super. Each individual hook becomes an anchor on its domain's hooks page
   * rather than getting its own file.
   */
  override buildPages(project: ProjectReflection): PageDefinition[] {
    const hooksByDomain = new Map<string, DeclarationReflection[]>()
    // Capture hook directory affiliation here, before SDKRouter.clearSources
    // wipes reflection.sources. groupSyntheticMembers uses this map to group
    // each hooks-page member under its hook's name rather than a kind section.
    const hookGroupMap = new Map<DeclarationReflection, string>()
    // GUIDE.md slots per hook directory, captured here while sources are intact;
    // applied to each synthetic hook namespace once it's built below.
    const hookGuidesByDir = new Map<string, Guide>()

    const standaloneGroups = new Map<string, DeclarationReflection[]>()

    // Maps source directory name (e.g. 'Employee') to domain path (e.g. 'employee').
    const domainPathBySourceDir = new Map(DOMAINS.map(d => [pathToSourceDir(d.path), d.path]))

    for (const child of project.children ?? []) {
      if (child.kind === ReflectionKind.Namespace) continue

      // Standalone pages take priority: check them before the hook-file heuristic so
      // that types from files named useX.ts (e.g. ComponentsContextType from
      // useComponentContext.ts) are routed to their designated page rather than being
      // caught by isHookSourceFile and silently skipped.
      const page = standalonePageFromSources(child)
      if (page) {
        const bucket = standaloneGroups.get(page) ?? []
        bucket.push(child)
        standaloneGroups.set(page, bucket)
        this.handledStandalone.add(child)
        continue
      }

      // Route to the domain hooks page only for hooks (use[A-Z] functions) and
      // companion exports from hook files (useCamelCase.ts). Other domain exports
      // fall through to the project index as anchors.
      const isHookFn = child.kind === ReflectionKind.Function && /^use[A-Z]/.test(child.name)
      if (isHookFn || isHookSourceFile(child)) {
        const sourceDir = domainFromSources(child)
        if (sourceDir) {
          const domainPath = domainPathBySourceDir.get(sourceDir)
          if (domainPath) {
            const bucket = hooksByDomain.get(domainPath) ?? []
            bucket.push(child)
            hooksByDomain.set(domainPath, bucket)
            this.handledHooks.add(child)

            const hookDir = hookDirFromSources(child)
            if (hookDir) {
              hookGroupMap.set(child, hookDir)
              if (!hookGuidesByDir.has(hookDir)) {
                const fp = child.sources?.[0]?.fullFileName ?? child.sources?.[0]?.fileName
                const guide = fp ? readHookGuide(fp, hookDir) : null
                if (guide) hookGuidesByDir.set(hookDir, guide)
              }
            }
          }
        }
        continue
      }
    }

    // Remove reflections routed to synthetic pages from the project's groups so
    // they don't also render inline on the project index page. GroupPlugin
    // populates these groups before buildPages runs, so we strip handled members
    // here rather than in a converter event.
    for (const group of project.groups ?? []) {
      group.children = group.children.filter(
        c =>
          !this.handledHooks.has(c as DeclarationReflection) &&
          !this.handledStandalone.has(c as DeclarationReflection),
      )
    }
    if (project.groups) {
      project.groups = project.groups.filter(g => g.children.length > 0)
    }

    // Read GUIDE.md files for Flow components before sources are cleared.
    // Sources are the only way to locate the flow directory at this stage.
    for (const ns of project.children ?? []) {
      if (!(ns instanceof DeclarationReflection)) continue
      if (ns.kind !== ReflectionKind.Namespace) continue
      for (const member of ns.children ?? []) {
        if (!(member instanceof DeclarationReflection)) continue
        if (!member.name.endsWith('Flow')) continue
        const fp = member.sources?.[0]?.fullFileName ?? member.sources?.[0]?.fileName
        if (!fp) continue
        const guide = readFlowGuide(fp)
        if (guide) this.flowGuides.set(member, guide)
      }
    }

    // Sources were only needed for routing; clear them before rendering so
    // typedoc-plugin-markdown doesn't emit "Defined in: <path>" on every member.
    SDKRouter.clearSources(project)

    const pages = super.buildPages(project)

    for (const [domainPath, hooks] of hooksByDomain) {
      // Group hooks by hook directory name (e.g. 'useCompensationForm').
      const byHookDir = new Map<string, DeclarationReflection[]>()
      for (const hook of hooks) {
        const hookDir = hookGroupMap.get(hook) ?? hook.name
        const bucket = byHookDir.get(hookDir) ?? []
        bucket.push(hook)
        byHookDir.set(hookDir, bucket)
      }

      // Each hook directory gets its own page under ${domainPath}/hooks/.
      const hookPageNsList: DeclarationReflection[] = []
      for (const [hookDir, hookMembers] of byHookDir) {
        const hookNs = new DeclarationReflection(hookDir, ReflectionKind.Namespace, project)
        hookNs.children = hookMembers
        hookNs.groups = groupSyntheticMembers(hookMembers, hookNs, undefined, true)
        // Remove inlined types from groups by reflection identity, derived from
        // the type graph: every hook's Ready interface and its `UseXxxResult`
        // return-union alias are inlined in the Returns section, and its props
        // are inlined under Parameters; a form hook additionally inlines its
        // Fields — the flat interface as the quick-reference table, or the
        // array alias (`StateTaxFields`) under its own `## Fields` section.
        // FormData and derived-alias props stay visible as their own sections.
        const inlined = new Set<DeclarationReflection>()
        const memberDecls = hookMembers.filter(
          (m): m is DeclarationReflection => m instanceof DeclarationReflection,
        )
        for (const member of hookMembers) {
          if (
            !(member instanceof DeclarationReflection) ||
            member.kind !== ReflectionKind.Function
          ) {
            continue
          }
          const ready = getHookReadyInterface(member)
          if (ready) {
            inlined.add(ready)
            const resultAlias = findHookResultAlias(memberDecls, ready)
            if (resultAlias) inlined.add(resultAlias)
          }
          const model = getHookModel(member)
          if (model) {
            if (model.props.kind === 'interface') {
              inlined.add(model.props.interface)
            } else if (model.props.kind === 'union') {
              inlined.add(model.props.alias)
              if (model.props.shared) inlined.add(model.props.shared)
            }
          }
          const formModel = getFormHookModel(member)
          if (formModel?.fieldsInterface) inlined.add(formModel.fieldsInterface)
          if (formModel?.fieldsArrayAlias) inlined.add(formModel.fieldsArrayAlias)
        }
        // Exported field-component functions (e.g. `SignatureField`, taking a
        // single `*FieldProps` argument) are documented through the props-driven
        // `## Fields` section, not as standalone members — inline them so they
        // don't render duplicate `### XxxField` subsections.
        for (const member of memberDecls) {
          if (member.kind !== ReflectionKind.Function) continue
          const paramType = member.signatures?.[0]?.parameters?.[0]?.type
          if (paramType instanceof ReferenceType && paramType.name.endsWith('FieldProps')) {
            inlined.add(member)
          }
        }
        // Companion types tagged `@group Fields` (e.g. the per-variant
        // `StateTaxQuestion*Field` aliases) render inside the page's `## Fields`
        // section after the fields source-of-truth, not as their own group.
        for (const member of memberDecls) {
          if (hasGroup(member, CUSTOM_GROUPS.fields)) inlined.add(member)
        }
        if (inlined.size > 0) {
          for (const group of hookNs.groups) {
            group.children = group.children.filter(
              c => !(c instanceof DeclarationReflection && inlined.has(c)),
            )
          }
          hookNs.groups = hookNs.groups.filter(g => g.children.length > 0)
        }
        const hookGuide = hookGuidesByDir.get(hookDir)
        if (hookGuide) this.hookGuides.set(hookNs, hookGuide)
        this.buildSyntheticPage(
          `${domainPath}/hooks/${toKebabCase(hookDir)}`,
          hookNs,
          hookMembers,
          pages,
        )
        hookPageNsList.push(hookNs)
      }
      hookPageNsList.sort((a, b) => a.name.localeCompare(b.name))

      // Index page lists all hook pages for this domain.
      const hooksIndexNs = new DeclarationReflection(
        CUSTOM_GROUPS.hooks,
        ReflectionKind.Namespace,
        project,
      )
      hooksIndexNs.comment = new Comment()
      hooksIndexNs.comment.blockTags.push(new CommentTag('@hooksIndex', []))
      hooksIndexNs.children = hookPageNsList
      const hooksIndexUrl = this.getFileName(`${domainPath}/hooks/index`).replace(/\.md$/, '.mdx')
      this.buildSyntheticPage(`${domainPath}/hooks/index`, hooksIndexNs, [], pages, hooksIndexUrl)
      this.hooksNsByDomain.set(domainPath, hooksIndexNs)
      SDKRouter.domainsWithHooks.add(domainPath)
    }

    for (const [page, members] of standaloneGroups) {
      const { displayName } = STANDALONE_PAGES.find(p => p.id === page)!
      const ns = new DeclarationReflection(displayName, ReflectionKind.Namespace, project)
      ns.children = members
      ns.groups = groupSyntheticMembers(members, ns)
      this.buildSyntheticPage(page, ns, members, pages)
    }

    for (const domain of DOMAINS) {
      const nsReflections = domain.namespaces
        .map(ns =>
          project.children?.find(c => c.name === ns.id && c.kind === ReflectionKind.Namespace),
        )
        .filter((r): r is DeclarationReflection => r !== undefined)

      const hubNs = new DeclarationReflection(domain.label, ReflectionKind.Namespace, project)
      hubNs.comment = new Comment()
      hubNs.comment.blockTags.push(new CommentTag('@domainHub', []))
      hubNs.comment.blockTags.push(
        new CommentTag('@domainPath', [{ kind: 'text', text: domain.path }]),
      )
      hubNs.children = nsReflections
      const hubUrl = this.getFileName(`${domain.path}/index`).replace(/\.md$/, '.mdx')
      this.buildSyntheticPage(`${domain.path}/index`, hubNs, [], pages, hubUrl)
    }

    return pages
  }

  /**
   * Override page building for namespaces and unmapped project-level members.
   *
   * - Namespace with Flow children: split into blocks.md, flows, and index.md.
   * - Namespace without Flow children: one page, all children as anchors.
   * - Domain hook (in handledHooks): skip — already registered in buildPages.
   * - Other project-level reflection: anchor onto the project's index page.
   */
  override buildChildPages(reflection: Reflection, outPages: PageDefinition[]): void {
    // Domain hooks and standalone page members are handled in buildPages; skip them here.
    if (reflection instanceof DeclarationReflection && this.handledHooks.has(reflection)) {
      return
    }
    if (reflection instanceof DeclarationReflection && this.handledStandalone.has(reflection)) {
      return
    }

    if (reflection.kind === ReflectionKind.Namespace) {
      const children = (reflection as DeclarationReflection).children ?? []
      const flows = FLAT_NAMESPACES.has(reflection.name)
        ? []
        : children.filter(c => c.name.endsWith('Flow'))

      if (flows.length > 0) {
        // Each Flow component gets its own page; block components share blocks.md.
        // The namespace's canonical URL points to index.md for cross-references.
        const nsBasePath = NAMESPACE_PATHS[reflection.name] ?? reflection.name
        const ns = reflection as DeclarationReflection

        // Props interfaces are inlined by the parametersTable override; exclude them
        // from .children so they don't also appear as standalone entries. Map each flow's
        // props to that flow's page; block props go on blocks.md.
        const allPropsSet = componentPropsInterfaces(ns)
        const flowPropsMap = new Map<DeclarationReflection, DeclarationReflection[]>()
        const blockProps: DeclarationReflection[] = []
        for (const propsIface of allPropsSet) {
          const ownerFlow = flows.find(flow =>
            flow.signatures?.some(sig =>
              sig.parameters?.some(
                p => p.type instanceof ReferenceType && p.type.reflection === propsIface,
              ),
            ),
          )
          if (ownerFlow) {
            const list = flowPropsMap.get(ownerFlow) ?? []
            list.push(propsIface)
            flowPropsMap.set(ownerFlow, list)
          } else {
            blockProps.push(propsIface)
          }
        }
        const blocks = children.filter(c => !c.name.endsWith('Flow') && !allPropsSet.has(c))

        // Register each flow as its own page with its props as anchors.
        for (const flow of flows) {
          const flowUrl = this.getFileName(`${nsBasePath}/${toKebabCase(flow.name)}`)
          this.fullUrls.set(flow, flowUrl)
          const slugger = new Slugger(this.sluggerConfiguration)
          this.sluggers.set(flow, slugger)
          outPages.push({ kind: PageKind.Reflection, model: flow, url: flowUrl })
          for (const propsIface of flowPropsMap.get(flow) ?? []) {
            const slug = slugger.slug(propsIface.name)
            this.anchors.set(propsIface, slug)
            this.fullUrls.set(propsIface, `${flowUrl}#${slug}`)
            // Re-parent so TypeDoc's relativeUrl walk finds flow (which has an own URL)
            // before reaching Project. Without this, cross-references generate same-page
            // hash links instead of cross-page URLs.
            propsIface.parent = flow
          }
        }

        if (blocks.length > 0) {
          const blocksNs = new DeclarationReflection(
            'Blocks',
            ReflectionKind.Namespace,
            reflection.parent,
          )
          blocksNs.children = blocks
          this.buildSyntheticPage(
            `${nsBasePath}/blocks`,
            blocksNs,
            [...blocks, ...blockProps],
            outPages,
          )
        }

        // Build namespace index page; its URL becomes the canonical URL for the namespace.
        const indexNs = new DeclarationReflection(
          ns.name,
          ReflectionKind.Namespace,
          reflection.parent,
        )
        indexNs.comment = ns.comment ? ns.comment.clone() : new Comment()
        indexNs.comment.blockTags.push(new CommentTag('@namespaceIndex', []))
        indexNs.children = [...flows, ...blocks]
        const nsIndexSlug = getNamespaceIndexSlug(ns.name)
        const indexUrl = this.buildSyntheticPage(
          `${nsBasePath}/${nsIndexSlug}`,
          indexNs,
          [],
          outPages,
        )
        this.fullUrls.set(reflection, indexUrl)
        return
      }

      // Default: single index page with all children as anchors.
      const url = this.getFileName(this.getIdealBaseName(reflection))
      this.fullUrls.set(reflection, url)
      this.sluggers.set(reflection, new Slugger(this.sluggerConfiguration))
      outPages.push({ kind: PageKind.Reflection, model: reflection, url })
      for (const child of children) {
        this.buildAnchors(child, reflection)
      }
      return
    }

    // Anchor all remaining project-level reflections to the project's index page.
    // buildAnchors requires pageTarget to be an ancestor of the target, so passing
    // reflection.parent (the Project) keeps the slug to just the reflection's name.
    if (reflection.parent?.kind === ReflectionKind.Project) {
      this.buildAnchors(reflection, reflection.parent)
      return
    }

    super.buildChildPages(reflection, outPages)
  }

  override getIdealBaseName(reflection: Reflection): string {
    // Namespace → mapped path or bare name  (no @gusto prefix)
    if (reflection.kind === ReflectionKind.Namespace) {
      const base = NAMESPACE_PATHS[reflection.name] ?? reflection.name
      const slug = getNamespaceIndexSlug(reflection.name)
      // Multi-namespace domains use the configured entry file name (e.g. 'index').
      // Single-namespace domains use the fixed slug 'namespace' so the namespace
      // hub (e.g. payroll/namespace.md) is distinct from the domain hub (payroll/index.md).
      return slug === 'index' ? `${base}/${this.entryFileName}` : `${base}/${slug}`
    }

    return super.getIdealBaseName(reflection)
  }

  private static clearSources(reflection: ProjectReflection | DeclarationReflection): void {
    // The APIModels namespace re-exports entity types from the embedded-API package.
    // Keep their sources (rewritten to upstream GitHub links) so the reference shows
    // where each entity is actually defined, rather than stripping them like SDK-owned
    // symbols whose source paths are noise.
    if (reflection instanceof DeclarationReflection && reflection.name === API_MODELS_NAMESPACE) {
      SDKRouter.rewriteUpstreamSources(reflection)
      return
    }
    if (reflection instanceof DeclarationReflection) {
      reflection.sources = undefined
      for (const sig of reflection.signatures ?? []) {
        sig.sources = undefined
      }
    }
    for (const child of reflection.children ?? []) {
      SDKRouter.clearSources(child)
    }
  }

  /** Point every source under the namespace at the upstream package's source on GitHub. */
  private static rewriteUpstreamSources(reflection: DeclarationReflection): void {
    const apply = (
      sources: { fileName: string; fullFileName: string; line: number; url?: string }[] | undefined,
    ) => {
      for (const source of sources ?? []) {
        const upstream = upstreamGitHubSource(
          source.fullFileName || source.fileName,
          reflection.name,
        )
        if (!upstream) continue
        source.fileName = upstream.fileName
        source.line = upstream.line
        source.url = upstream.url
      }
    }
    apply(reflection.sources)
    for (const sig of reflection.signatures ?? []) apply(sig.sources)
    for (const child of reflection.children ?? []) SDKRouter.rewriteUpstreamSources(child)
  }

  /**
   * Register a synthetic namespace page and make every member an anchor on it.
   * Returns the page's URL.
   *
   * Pass `explicitUrl` to override the default URL derived from `basePath` — used
   * for domain hubs which need a `.mdx` extension so Docusaurus enables JSX processing.
   */
  private buildSyntheticPage(
    basePath: string,
    ns: DeclarationReflection,
    members: DeclarationReflection[],
    outPages: PageDefinition[],
    explicitUrl?: string,
  ): string {
    const url = explicitUrl ?? this.getFileName(basePath)
    this.fullUrls.set(ns, url)
    const slugger = new Slugger(this.sluggerConfiguration)
    this.sluggers.set(ns, slugger)
    outPages.push({ kind: PageKind.Reflection, model: ns, url })
    for (const member of members) {
      const slug = slugger.slug(member.name)
      this.anchors.set(member, slug)
      this.fullUrls.set(member, `${url}#${slug}`)
      // Re-parent to the synthetic namespace so TypeDoc's relativeUrl walk
      // finds ns (which hasOwnDocument) before reaching Project. Without this,
      // cross-references from non-hook pages (e.g. BaseFormHookReady "Extended
      // by" on index.md) generate same-page hash links instead of cross-page URLs.
      member.parent = ns
    }
    return url
  }
}
