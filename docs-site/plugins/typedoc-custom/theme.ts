import { posix } from 'path'
import {
  ArrayType,
  Comment,
  type CommentTag,
  type Context,
  DeclarationReflection,
  IntersectionType,
  IndexedAccessType,
  IntrinsicType,
  LiteralType,
  ParameterReflection,
  QueryType,
  ReferenceType,
  ReflectionKind,
  ReflectionType,
  type SignatureReflection,
  type SomeType,
  TupleType,
  TypeOperatorType,
  UnionType,
} from 'typedoc'
import type * as ts from 'typescript'
import { MarkdownPageEvent, MarkdownTheme, MarkdownThemeContext } from 'typedoc-plugin-markdown'
import {
  componentPropsInterfaces,
  getDomainPath,
  getSidebarPosition,
  groupWithTarget,
  hasGroup,
  isComponent,
  isDomainHub,
  isHookPage,
  isHooksIndex,
  isNamespaceIndex,
  NAMESPACE_PATHS,
  pageDescription,
  pageTitle,
  readDomainGuide,
  serializeFrontmatter as buildFrontmatterYaml,
  type Guide,
  type GuideSlot,
} from './utils.ts'
import { SDKRouter } from './router.ts'
import { TYPE_EMOJIS } from './router.config.ts'
import {
  findHookResultAlias,
  formHookModelForPage,
  getHookModel,
  getHookReadyInterface,
  HookModelError,
  type FormHookModel,
  type HookProps,
} from './hook-model.ts'

function getReflectionDescription(
  reflection: DeclarationReflection,
  context: SDKThemeContext,
): string {
  const comment = reflection.signatures?.[0]?.comment ?? reflection.comment
  if (!comment) return ''
  return context.helpers.getDescriptionForComment(comment) ?? ''
}

function renderDomainHub(context: SDKThemeContext, model: DeclarationReflection): string {
  const parts: string[] = [`# ${model.name}`, '']

  const domainGuide = readDomainGuide(getDomainPath(model))
  if (domainGuide?.slots.overview) {
    parts.push(fenceSlot(domainGuide.slots.overview, domainGuide.source, 'overview', true), '')
  }

  const namespaces = (model.children ?? []).filter(
    (c): c is DeclarationReflection =>
      c instanceof DeclarationReflection && c.kind === ReflectionKind.Namespace,
  )

  const domainPath = getDomainPath(model)
  for (const ns of namespaces) {
    parts.push(`## ${TYPE_EMOJIS.namespace} ${ns.name}`, '')

    const flows = (ns.children ?? []).filter(
      (c): c is DeclarationReflection =>
        c instanceof DeclarationReflection && isComponent(c) && c.name.endsWith('Flow'),
    )
    const blocks = (ns.children ?? []).filter(
      (c): c is DeclarationReflection =>
        c instanceof DeclarationReflection && isComponent(c) && !c.name.endsWith('Flow'),
    )

    const cards: Record<string, string>[] = flows.map(comp => {
      const href = context.urlTo(comp).replace(/\.md$/, '')
      const description = getReflectionDescription(comp, context)
      const item: Record<string, string> = {
        type: 'link',
        href,
        label: `${TYPE_EMOJIS.flow} ${comp.name}`,
      }
      if (description) item.description = description
      return item
    })

    if (blocks.length > 0) {
      const nsPath = NAMESPACE_PATHS[ns.name] ?? ns.name
      const nsRelPath = nsPath.startsWith(domainPath + '/')
        ? nsPath.slice(domainPath.length + 1)
        : ''
      const subComponentsHref = nsRelPath ? `${nsRelPath}/blocks` : 'blocks'
      cards.push({
        type: 'link',
        href: subComponentsHref,
        label: `${TYPE_EMOJIS.block} ${blocks.length} block${blocks.length === 1 ? '' : 's'}`,
      })
    }

    if (cards.length > 0) {
      parts.push(`<DocCardList items={${JSON.stringify(cards)}} />`, '')
    }
  }

  const hooksNs = (context.router as SDKRouter).hooksNsByDomain.get(getDomainPath(model))
  const hookPages = (hooksNs?.children ?? []) as DeclarationReflection[]

  if (hookPages.length > 0) {
    parts.push(`## ${TYPE_EMOJIS.hooks} Hooks`, '')
    const hookItems = hookPages.map(hookNs => {
      const href = context.urlTo(hookNs).replace(/\.md$/, '')
      const primaryHook = (hookNs.children?.find(c => c.name === hookNs.name) ??
        hookNs.children?.[0]) as DeclarationReflection | undefined
      const description = primaryHook ? getReflectionDescription(primaryHook, context) : ''
      const emoji = hookNs.name.endsWith('Form') ? TYPE_EMOJIS.formHook : TYPE_EMOJIS.dataHook
      const item: Record<string, string> = { type: 'link', href, label: `${emoji} ${hookNs.name}` }
      if (description) item.description = description
      return item
    })
    parts.push(`<DocCardList items={${JSON.stringify(hookItems)}} />`, '')
  }

  if (domainGuide?.slots.appendix) {
    parts.push(fenceSlot(domainGuide.slots.appendix, domainGuide.source, 'appendix', true), '')
  }

  return parts.join('\n')
}

function renderHooksIndex(context: SDKThemeContext, model: DeclarationReflection): string {
  const parts: string[] = [`# ${model.name}`, '']
  const hookItems = (model.children ?? ([] as DeclarationReflection[])).map(hookNs => {
    const href = context.urlTo(hookNs).replace(/\.md$/, '')
    const primaryHook = (hookNs.children?.find(c => c.name === hookNs.name) ??
      hookNs.children?.[0]) as DeclarationReflection | undefined
    const description = primaryHook ? getReflectionDescription(primaryHook, context) : ''
    const emoji = hookNs.name.endsWith('Form') ? TYPE_EMOJIS.formHook : TYPE_EMOJIS.dataHook
    const item: Record<string, string> = { type: 'link', href, label: `${emoji} ${hookNs.name}` }
    if (description) item.description = description
    return item
  })
  parts.push(`<DocCardList items={${JSON.stringify(hookItems)}} />`)
  return parts.join('\n')
}

function renderNamespaceIndex(context: SDKThemeContext, model: DeclarationReflection): string {
  const parts: string[] = [`# ${model.name}`, '']

  const nsComment = model.comment
    ? (context.helpers.getDescriptionForComment(model.comment) ?? '')
    : ''
  if (nsComment) parts.push(nsComment, '')

  const components = (model.children ?? []).filter(
    (c): c is DeclarationReflection => c instanceof DeclarationReflection && isComponent(c),
  )
  const flows = components.filter(c => c.name.endsWith('Flow'))
  const blocks = components.filter(c => !c.name.endsWith('Flow'))

  for (const [emoji, heading, items] of [
    [TYPE_EMOJIS.flow, 'Workflows', flows],
    [TYPE_EMOJIS.block, 'Blocks', blocks],
  ] as const) {
    if (items.length === 0) continue
    parts.push(`## ${emoji} ${heading}`, '')
    parts.push('| Component | Description |', '| --------- | ----------- |')
    for (const item of items) {
      parts.push(
        `| [${item.name}](${context.urlTo(item)}) | ${getReflectionDescription(item, context)} |`,
      )
    }
    parts.push('')
  }

  return parts.join('\n')
}

/**
 * Wrap injected guide prose in a provenance comment naming its source GUIDE.md
 * and slot, so the content is traceable from the generated page (whose
 * frontmatter banner otherwise points only at TSDoc). `.md` pages parse as
 * CommonMark (HTML comments); `.mdx` hubs need MDX expression comments.
 */
function fenceSlot(content: string, source: string, slot: GuideSlot, mdx: boolean): string {
  const open = mdx
    ? `{/* guide-source: ${source} (slot: ${slot}) */}`
    : `<!-- guide-source: ${source} (slot: ${slot}) -->`
  const close = mdx
    ? `{/* /guide-source (slot: ${slot}) */}`
    : `<!-- /guide-source (slot: ${slot}) -->`
  return `${open}\n${content}\n${close}`
}

/**
 * Slot GUIDE.md prose into a rendered page (flow or hook). `overview` lands
 * after the summary and any quick-start `## Example`, but before the rest
 * (Remarks, props, …) — so a reader gets the summary, the example, then the
 * conceptual overview. `appendix` lands at the end. Guide content never
 * overrides the autogenerated sections in between. These pages are `.md`
 * (CommonMark), so provenance fences use HTML comments.
 */
function renderGuidePage(rendered: string, guide: Guide): string {
  let result = rendered

  if (guide.slots.overview) {
    const fenced = fenceSlot(guide.slots.overview, guide.source, 'overview', false)
    const lines = result.split('\n')
    // Insert before the first non-Example `##` heading: this keeps the overview
    // below a quick-start Example when one exists, and otherwise right after the
    // H1 + summary. Append if there are no eligible sections.
    const isExampleHeading = (line: string) => /^##\s+Examples?\s*$/.test(line)
    const sectionIndex = lines.findIndex(l => /^##\s/.test(l) && !isExampleHeading(l))
    result =
      sectionIndex === -1
        ? `${result.trimEnd()}\n\n${fenced}`
        : [...lines.slice(0, sectionIndex), fenced, '', ...lines.slice(sectionIndex)].join('\n')
  }

  if (guide.slots.appendix) {
    result = `${result.trimEnd()}\n\n${fenceSlot(guide.slots.appendix, guide.source, 'appendix', false)}\n`
  }

  return result
}

/**
 * Bump every Markdown heading (`##` or deeper) down one level, leaving fenced
 * code blocks untouched. Lets a hook GUIDE.md authored with `##` sections nest
 * cleanly under a single `## Advanced` wrapper.
 */
function bumpHeadings(md: string): string {
  let inFence = false
  return md
    .split('\n')
    .map(line => {
      if (/^\s*```/.test(line)) {
        inFence = !inFence
        return line
      }
      return !inFence && /^#{2,}\s/.test(line) ? `#${line}` : line
    })
    .join('\n')
}

/**
 * Slot a hook page's GUIDE.md prose. Unlike flow guides (separate `overview`
 * and `appendix` slots placed at distinct points), a hook guide carries a
 * single `advanced` slot whose content is nested wholesale under one
 * `## Advanced` section at the end of the page, its own headings bumped one
 * level deeper.
 */
function renderHookGuidePage(rendered: string, guide: Guide): string {
  const content = guide.slots.advanced
  if (!content) return rendered
  const fenced = fenceSlot(bumpHeadings(content), guide.source, 'advanced', false)
  return `${rendered.trimEnd()}\n\n## Advanced\n\n${fenced}\n`
}

/**
 * Reorder a standalone component page's top-level (`##`) sections so the props
 * reference lands last. The default member template emits Props → Remarks →
 * Example, which fronts a reader with the exhaustive props table before they
 * know what the component is or how to call it. This reorders to Example →
 * Remarks → Props: quick-start first, conceptual detail next, full reference
 * last. Everything above the first `##` (H1 + summary) is untouched, and
 * unknown sections keep their original order ahead of the props table.
 */
function reorderComponentSections(rendered: string): string {
  const lines = rendered.split('\n')
  const firstSection = lines.findIndex(l => /^##\s/.test(l))
  if (firstSection === -1) return rendered

  const preamble = lines.slice(0, firstSection)
  const sections: { title: string; lines: string[] }[] = []
  for (const line of lines.slice(firstSection)) {
    const heading = /^##\s+(.+?)\s*$/.exec(line)
    if (heading) {
      sections.push({ title: heading[1]!, lines: [line] })
    } else {
      sections[sections.length - 1]!.lines.push(line)
    }
  }

  const rank = (title: string): number => {
    if (/^Examples?$/.test(title)) return 0
    if (title === 'Remarks') return 1
    if (/Props$/.test(title)) return 2
    if (title === 'Events') return 3
    return 4
  }
  const ordered = sections
    .map((section, index) => ({ section, index }))
    .sort((a, b) => rank(a.section.title) - rank(b.section.title) || a.index - b.index)
    .map(({ section }) => section)

  return [...preamble, ...ordered.flatMap(section => section.lines)].join('\n')
}

function isBlocksPage(model: DeclarationReflection): boolean {
  return model.name === 'Blocks' && model.kind === ReflectionKind.Namespace
}

function renderBlocksPage(context: SDKThemeContext, model: DeclarationReflection): string {
  const children = model.children ?? []
  const blockComps = children.filter(isComponent).sort((a, b) => a.name.localeCompare(b.name))
  const utilities = children
    .filter(c => !isComponent(c))
    .sort((a, b) => a.name.localeCompare(b.name))

  const parts: string[] = []
  for (const block of blockComps) {
    parts.push(context.partials.memberContainer(block, { headingLevel: 2 }))
  }
  if (utilities.length > 0) {
    parts.push('## Utility types')
    for (const util of utilities) {
      parts.push(context.partials.memberContainer(util, { headingLevel: 3 }))
    }
  }
  return parts.join('\n\n')
}

/**
 * Base-interface props whose type is driven by the component's generic
 * parameter, so they carry component-specific meaning only when specialized.
 */
const SPECIALIZABLE_BASE_PROPS = new Set(['dictionary', 'defaultValues'])

/**
 * The inert types `BaseComponentInterface` falls back to when a prop is not
 * specialized (`dictionary` → `undefined`, `defaultValues` → `unknown`/`undefined`).
 * Such a prop carries no component-specific information.
 */
function isInertType(type: SomeType | undefined): boolean {
  return type instanceof IntrinsicType && (type.name === 'undefined' || type.name === 'unknown')
}

/** True when `type`, anywhere in its tree, references one of the named type parameters. */
function referencesTypeParam(type: SomeType | undefined, names: Set<string>): boolean {
  if (type instanceof ReferenceType) {
    if (names.has(type.name)) return true
    return (type.typeArguments ?? []).some(t => referencesTypeParam(t, names))
  }
  if (type instanceof UnionType || type instanceof IntersectionType) {
    return type.types.some(t => referencesTypeParam(t, names))
  }
  if (type instanceof ArrayType) return referencesTypeParam(type.elementType, names)
  if (type instanceof TupleType) {
    return type.elements.some(t => referencesTypeParam(t, names))
  }
  if (type instanceof ReflectionType) {
    return (type.declaration.signatures ?? []).some(
      sig =>
        referencesTypeParam(sig.type, names) ||
        (sig.parameters ?? []).some(p => referencesTypeParam(p.type, names)),
    )
  }
  return false
}

/**
 * Replace type-parameter references inside `type` with the field's actual type
 * arguments, mutating in place and pushing an undo onto `restores` for each
 * swap so the caller can revert after rendering. A trailing `never` argument
 * (an unfilled defaulted parameter, e.g. `ValidationMessages<Code, never>`) is
 * dropped so it renders as `ValidationMessages<Code>`.
 */
function substituteTypeParams(
  type: SomeType | undefined,
  subMap: Map<string, SomeType>,
  restores: Array<() => void>,
): void {
  const swap = <T extends { type?: SomeType }>(holder: T): void => {
    const current = holder.type
    const replacement = current instanceof ReferenceType ? subMap.get(current.name) : undefined
    if (replacement) {
      holder.type = replacement
      restores.push(() => {
        holder.type = current
      })
    } else {
      substituteTypeParams(current, subMap, restores)
    }
  }

  if (type instanceof ReferenceType && type.typeArguments) {
    const original = type.typeArguments
    let next = original.map(arg =>
      arg instanceof ReferenceType ? (subMap.get(arg.name) ?? arg) : arg,
    )
    next.forEach(arg => {
      if (!(arg instanceof ReferenceType) || !subMap.has(arg.name)) {
        substituteTypeParams(arg, subMap, restores)
      }
    })
    while (
      next.length > 0 &&
      next[next.length - 1] instanceof IntrinsicType &&
      (next[next.length - 1] as IntrinsicType).name === 'never'
    ) {
      next = next.slice(0, -1)
    }
    if (next.length !== original.length || next.some((arg, i) => arg !== original[i])) {
      type.typeArguments = next
      restores.push(() => {
        type.typeArguments = original
      })
    }
    return
  }
  if (type instanceof UnionType || type instanceof IntersectionType) {
    type.types.forEach(t => substituteTypeParams(t, subMap, restores))
    return
  }
  if (type instanceof ArrayType) {
    substituteTypeParams(type.elementType, subMap, restores)
    return
  }
  if (type instanceof TupleType) {
    type.elements.forEach(t => substituteTypeParams(t, subMap, restores))
    return
  }
  if (type instanceof ReflectionType) {
    for (const sig of type.declaration.signatures ?? []) {
      swap(sig)
      for (const param of sig.parameters ?? []) swap(param)
    }
  }
}

/**
 * Markdown link to the props interface's base type, without type arguments —
 * e.g. `[BaseComponentInterface](…)`. Falls back to the bare name when the base
 * has no documented page.
 */
function baseInterfaceLink(context: SDKThemeContext, propsRef: DeclarationReflection): string {
  const base = (propsRef.extendedTypes ?? []).find(
    (type): type is ReferenceType => type instanceof ReferenceType,
  )
  if (!base) return ''
  const reflection = base.reflection
  if (reflection instanceof DeclarationReflection && context.router.hasUrl(reflection)) {
    return `[${base.name}](${context.urlTo(reflection)})`
  }
  return base.name
}

/** Declared (own) property reflections of an interface or `= { ... }` type alias. */
function declaredPropsOf(refl: DeclarationReflection): DeclarationReflection[] {
  if (refl.kind === ReflectionKind.TypeAlias && refl.type instanceof ReflectionType) {
    return (refl.type.declaration.children ?? []).filter(c => c.isDeclaration())
  }
  return (refl.children ?? []).filter(c => c.isDeclaration())
}

/** Anchor + summary/remarks comment for a reflection, when present. */
function reflectionHeaderParts(context: SDKThemeContext, refl: DeclarationReflection): string[] {
  const parts: string[] = []
  if (context.router.hasUrl(refl) && context.options.getValue('useHTMLAnchors')) {
    parts.push(`<a id="${context.router.getAnchor(refl)}"></a>`)
  }
  if (refl.comment) {
    const commentMd = context.partials.comment(refl.comment, { showSummary: true, showTags: true })
    if (commentMd.trim()) parts.push(commentMd)
  }
  return parts
}

/**
 * Render a hook's props from the model. A single interface renders as one
 * properties table; a discriminated union renders the shared base table plus a
 * table per variant listing its discriminating fields.
 */
function renderHookPropsTable(context: SDKThemeContext, props: HookProps): string {
  if (props.kind === 'interface') {
    const parts = reflectionHeaderParts(context, props.interface)
    const declared = declaredPropsOf(props.interface)
    if (declared.length > 0) {
      parts.push(
        context.partials.propertiesTable(declared, {
          isEventProps: false,
          kind: ReflectionKind.Interface,
        }),
      )
    }
    return parts.join('\n\n')
  }

  // Derived aliases are not elevated; the caller falls back before reaching here.
  if (props.kind === 'alias') return ''

  // Discriminated union: anchor + alias remarks, shared base table, per-variant tables.
  const parts = reflectionHeaderParts(context, props.alias)

  if (props.shared) {
    const sharedProps = declaredPropsOf(props.shared)
    if (sharedProps.length > 0) {
      parts.push('**Shared options** — apply to every variant.')
      parts.push(
        context.partials.propertiesTable(sharedProps, {
          isEventProps: false,
          kind: ReflectionKind.Interface,
        }),
      )
    }
  }

  if (props.branches.length > 0) {
    parts.push('Supply the fields for exactly one of the following variants:')
    props.branches.forEach((branch, i) => {
      if (branch.inlineProps.length === 0) return
      parts.push(`**Variant ${i + 1}**`)
      parts.push(
        context.partials.propertiesTable(branch.inlineProps, {
          isEventProps: false,
          kind: ReflectionKind.Interface,
        }),
      )
    })
  }

  return parts.join('\n\n')
}

/**
 * Render the props table for a component whose single parameter is its props
 * interface. Components take one `props` argument typed as a sibling interface
 * (or, on a standalone flow page, one re-parented onto the component). Instead
 * of the default bare `props: XxxProps` parameter row, inline the interface
 * itself — anchor + interface comment (if any) + properties table — so the
 * Props type stays co-located with the component that uses it. Anything that
 * isn't this shape falls back to the default parameters table.
 */
/**
 * Inline + expand a field component's props in place of the bare `props:
 * XxxFieldProps` parameter row. Field props are type aliases of the shape
 * `HookFieldProps<SomeHookFieldProps<ValidationCode, …>>` = `Omit<…, 'name'>`,
 * so the underlying field-props interface (e.g. `NumberInputHookFieldProps`)
 * holds the real properties. Field-specific and required props get a table row;
 * props identical on every field collapse to a footer (mirroring how
 * `BaseComponentInterface` props are summarized), and the parent-provided
 * `formHookResult` / hook-bound `name` are called out. `validationMessages` is
 * promoted with the field's own error codes substituted for the generic.
 * Returns null when `propsRef` is not a field-props alias.
 */
function renderFieldPropsTable(
  context: SDKThemeContext,
  propsRef: DeclarationReflection,
): string | null {
  if (propsRef.kind !== ReflectionKind.TypeAlias || !(propsRef.type instanceof ReferenceType)) {
    return null
  }
  const hookFieldRef = propsRef.type
  if (hookFieldRef.name !== 'HookFieldProps') return null
  const underlyingRef = hookFieldRef.typeArguments?.[0]
  if (!(underlyingRef instanceof ReferenceType)) return null
  const underlying = underlyingRef.reflection
  if (
    !(underlying instanceof DeclarationReflection) ||
    underlying.kind !== ReflectionKind.Interface
  ) {
    return null
  }

  // Map each of the underlying interface's type parameters to the field's
  // actual type argument (by position), falling back to the parameter default.
  // e.g. SelectHookFieldProps<TErrorCode, TEntry> on a field typed
  // <DeductionFormRequiredValidation, GarnishmentType>.
  const typeParams = underlying.typeParameters ?? []
  const subMap = new Map<string, SomeType>()
  typeParams.forEach((param, index) => {
    const actual = underlyingRef.typeArguments?.[index] ?? param.default
    if (actual) subMap.set(param.name, actual)
  })
  const paramNames = new Set(typeParams.map(p => p.name))

  // A field with no validation codes (its error-code generics resolve to
  // `never`, e.g. a checkbox typed `CheckboxHookFieldProps`) can't be given any
  // `validationMessages` — drop the prop entirely rather than show an unusable
  // `ValidationMessages<never>`.
  const hasCodes =
    ['TErrorCode', 'TOptionalErrorCode'].flatMap(p => collectErrorCodes(subMap.get(p))).length > 0

  // HookFieldProps<T> = Omit<T, 'name'> — the hook binds `name` internally.
  const props = (underlying.children ?? []).filter(
    c => c.isDeclaration() && c.name !== 'name' && !(c.name === 'validationMessages' && !hasCodes),
  )

  // A prop earns a row when it is required (e.g. `label`), when its type
  // references a type parameter (e.g. `validationMessages`, `getOptionLabel`)
  // so the field's real codes/entry type can be substituted, or when it's a
  // prop we always surface (`FieldComponent` — the UI-override escape hatch).
  // The rest are forwarded unchanged from the base field-props interface and
  // summarized — each is documented by following the base-interface link.
  const isPromoted = (c: DeclarationReflection) =>
    !c.flags.isOptional || referencesTypeParam(c.type, paramNames) || c.name === 'FieldComponent'
  const mainProps = props.filter(isPromoted)
  const forwarded = props.filter(c => !isPromoted(c))

  const parts: string[] = []

  if (mainProps.length > 0) {
    // Substitute type parameters with the field's actual type arguments. Child
    // reflections are shared across every field of this component type, so the
    // swaps are applied only for the duration of this synchronous render.
    const restores: Array<() => void> = []
    for (const c of mainProps) substituteTypeParams(c.type, subMap, restores)
    parts.push(
      context.partials.propertiesTable(mainProps, {
        isEventProps: false,
        kind: ReflectionKind.Interface,
      }),
    )
    for (const restore of restores) restore()
  }

  if (forwarded.length > 0) {
    const names = forwarded.map(c => `\`${c.name}\``).join(', ')
    const baseLink = context.router.hasUrl(underlying)
      ? `[${underlying.name}](${context.urlTo(underlying)})`
      : underlying.name
    parts.push(`_Also accepts ${names} from ${baseLink}._`)
  }

  return parts.join('\n\n')
}

function renderFunctionPropsTable(
  context: SDKThemeContext,
  params: ParameterReflection[],
  fallback: (params: ParameterReflection[]) => string,
): string {
  if (params.length !== 1) return fallback(params)

  const param = params[0]!
  const component = param.parent?.parent
  if (!(component instanceof DeclarationReflection)) return fallback(params)

  // Hook (form or data): render props from the model (single interface or
  // discriminated union). A derived alias (e.g. Omit<…>) is not elevated — fall
  // through.
  const hookModel = getHookModel(component)
  if (hookModel && hookModel.props.kind !== 'alias') {
    return renderHookPropsTable(context, hookModel.props)
  }
  if (hookModel) return fallback(params)

  // Component: inline the props interface when the parameter directly references one.
  if (!isComponent(component) || !(param.type instanceof ReferenceType)) {
    return fallback(params)
  }

  const propsRef = param.type.reflection

  // Field component: props are a `HookFieldProps<…>` type alias, not an
  // interface. Inline the underlying field-props interface instead. The
  // separate `#### XxxFieldProps` alias section (moved here by
  // nestFieldTypeAliasesUnderComponents) keeps the canonical type + anchor, so
  // this table omits the anchor to avoid a duplicate.
  if (propsRef instanceof DeclarationReflection) {
    const fieldTable = renderFieldPropsTable(context, propsRef)
    if (fieldTable) return fieldTable
  }

  // The props interface is normally a sibling of the component (shared
  // namespace parent). On a standalone flow page the router re-parents the
  // props onto the flow itself so cross-references resolve to a cross-page
  // URL (see SDKRouter.buildChildPages), so also accept that case.
  if (
    !(propsRef instanceof DeclarationReflection) ||
    propsRef.kind !== ReflectionKind.Interface ||
    (propsRef.parent !== component.parent && propsRef.parent !== component)
  ) {
    return fallback(params)
  }

  const parts: string[] = []

  // Emit the anchor so that cross-references to this Props type still resolve.
  if (context.router.hasUrl(propsRef) && context.options.getValue('useHTMLAnchors')) {
    parts.push(`<a id="${context.router.getAnchor(propsRef)}"></a>`)
  }

  // Include any summary/remarks on the Props interface itself.
  if (propsRef.comment) {
    const commentMd = context.partials.comment(propsRef.comment, {
      showSummary: true,
      showTags: true,
    })
    if (commentMd.trim()) parts.push(commentMd)
  }

  // Decide which props earn a row in the main table. An inherited prop is
  // promoted inline when it is required (e.g. `onEvent`) or when it is a
  // base-interface prop the component meaningfully specialized via its generic
  // (`dictionary`/`defaultValues` typed to something other than the inert
  // `undefined`/`unknown` sentinel). Every other inherited prop is identical on
  // every component, so it is summarized in a footer line instead of repeated.
  const declared = (propsRef.children ?? []).filter(c => c.isDeclaration())
  const isPromoted = (c: DeclarationReflection) =>
    !c.inheritedFrom ||
    !c.flags.isOptional ||
    (SPECIALIZABLE_BASE_PROPS.has(c.name) && !isInertType(c.type))
  const mainProps = declared.filter(isPromoted)
  const inheritedRest = declared.filter(c => !isPromoted(c))

  if (mainProps.length > 0) {
    parts.push(
      context.partials.propertiesTable(mainProps, {
        isEventProps: false,
        kind: ReflectionKind.Interface,
      }),
    )
  }

  if (inheritedRest.length > 0) {
    const names = inheritedRest.map(c => `\`${c.name}\``).join(', ')
    const base = baseInterfaceLink(context, propsRef)
    parts.push(base ? `_Inherits ${names} from ${base}._` : `_Inherits ${names}._`)
  }

  return parts.join('\n\n')
}

/**
 * Find the `@components` block tag on a reflection's own comment or its first
 * signature comment (function components carry their TSDoc on the signature).
 */
function findComponentsTag(
  model: DeclarationReflection,
): { comment: Comment; tag: CommentTag } | null {
  const comments = [model.comment, ...(model.signatures ?? []).map(sig => sig.comment)]
  for (const comment of comments) {
    const tag = comment?.blockTags.find(t => t.tag === '@components')
    if (comment && tag) return { comment, tag }
  }
  return null
}

/**
 * Map a target's resolved (relative) URL back to the namespace id that owns it,
 * e.g. `../../employee/onboarding/onboarding-flow.md` → `EmployeeOnboarding`.
 * Matches the most specific namespace path first so `employee/onboarding` wins
 * over a hypothetical `employee` prefix.
 */
function namespaceFromUrl(url: string): string | null {
  const entries = Object.entries(NAMESPACE_PATHS).sort((a, b) => b[1].length - a[1].length)
  return entries.find(([, path]) => url.includes(`${path}/`))?.[0] ?? null
}

/**
 * Render a `## Sub-components` table from the `{@link}` references inside a
 * `@components` tag. Each linked component or hook becomes a row with its name
 * (linked when documented) and summary description.
 */
function renderComponentsTable(
  context: SDKThemeContext,
  tag: CommentTag,
  pageUrl: string,
): string | null {
  const links = tag.content.filter(part => part.kind === 'inline-tag' && part.tag === '@link')

  const rows: string[] = []
  for (const part of links) {
    const target = part.target
    if (target instanceof DeclarationReflection) {
      // A same-namespace target's page (blocks.md or a sibling flow page) sits
      // in the flow's own directory, so its relative URL never traverses up
      // (`../`) — show it bare. A cross-namespace target's URL does traverse
      // up; qualify it with its own namespace. The relative URL alone can't
      // identify the namespace (a same-domain hop like `../onboarding/...`
      // drops the domain segment), so resolve it to an output-absolute path
      // first. The reflection's getFullName can't help — it resolves to the
      // synthetic "Blocks" page.
      const hasUrl = context.router.hasUrl(target)
      const url = hasUrl ? context.urlTo(target) : ''
      const foreignNamespace = url.includes('../')
        ? namespaceFromUrl(posix.join(posix.dirname(pageUrl), url))
        : null
      const name = foreignNamespace ? `${foreignNamespace}.${target.name}` : target.name
      const label = hasUrl ? `[${name}](${url})` : name
      rows.push(`| ${label} | ${getReflectionDescription(target, context)} |`)
    } else {
      rows.push(`| ${part.text.trim()} | |`)
    }
  }
  if (rows.length === 0) return null
  return [
    '## Sub-components',
    '',
    '| Component | Description |',
    '| ------ | ------ |',
    ...rows,
  ].join('\n')
}

/**
 * Append the components table after the props section. The section reorder
 * places the props table last, so appending keeps Components below it.
 */
function insertComponentsTable(rendered: string, table: string): string {
  return `${rendered.trimEnd()}\n\n${table}\n`
}

/**
 * Remove the hook group heading (`## Hooks`, `## Form Hooks`, etc.) and the
 * `### hookName()` sub-heading, then shift H4→H2 and H5→H3 for the content
 * inside the hook function section. Each hook page documents exactly one primary
 * hook, so the group heading carries no information and is dropped: it is always
 * the first `##` section on the page (the hook group renders before Interfaces /
 * Type Aliases). Uses a state machine to identify and transform the lines.
 */
function reformatHookFunctionSection(rendered: string, hookName: string): string {
  const escapedHookName = hookName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const hookFnHeadingRe = new RegExp(`^### ${escapedHookName}\\(\\)\\s*$`)

  type State = 'before' | 'in-group' | 'in-function' | 'done'
  let state: State = 'before'
  const out: string[] = []

  for (const line of rendered.split('\n')) {
    switch (state) {
      case 'before':
        if (/^## /.test(line)) {
          state = 'in-group'
          // skip the group heading (first `##` = the single hook's group)
        } else {
          out.push(line)
        }
        break
      case 'in-group':
        if (hookFnHeadingRe.test(line)) {
          state = 'in-function'
          // skip this line
        } else {
          out.push(line)
        }
        break
      case 'in-function':
        if (/^## /.test(line)) {
          state = 'done'
          out.push(line)
        } else if (/^#####/.test(line)) {
          out.push(line.replace(/^#####/, '###'))
        } else if (/^####/.test(line)) {
          out.push(line.replace(/^####/, '##'))
        } else {
          out.push(line)
        }
        break
      case 'done':
        out.push(line)
        break
    }
  }

  return out.join('\n')
}

/**
 * Reorder the top-level (`##`) sections of a hook page into a reader-friendly
 * sequence: Example → Remarks → Props → Returns → everything else (Fields,
 * Variables, Interfaces, Type Aliases — kept in their original relative order).
 *
 * The Props and Returns sections carry hard-coded headings, so they rank by
 * exact title.
 */
function reorderHookSections(rendered: string): string {
  const lines = rendered.split('\n')
  const firstSection = lines.findIndex(l => /^##\s/.test(l))
  if (firstSection === -1) return rendered

  const preamble = lines.slice(0, firstSection)
  const sections: { title: string; lines: string[] }[] = []
  for (const line of lines.slice(firstSection)) {
    const heading = /^##\s+(.+?)\s*$/.exec(line)
    if (heading) {
      sections.push({ title: heading[1]!, lines: [line] })
    } else {
      sections[sections.length - 1]!.lines.push(line)
    }
  }

  const rank = (title: string): number => {
    if (/^Examples?/.test(title)) return 0
    if (title === 'Remarks') return 1
    if (title === 'Props') return 2
    if (title === 'Returns') return 3
    return 99
  }
  const ordered = sections
    .map((section, index) => ({ section, index }))
    .sort((a, b) => rank(a.section.title) - rank(b.section.title) || a.index - b.index)
    .map(({ section }) => section)

  return [...preamble, ...ordered.flatMap(section => section.lines)].join('\n')
}

/**
 * Move the `## Example` section to the top of the hook page — before props,
 * returns, and remarks — so a reader sees a working example immediately after
 * the hook signature and description.
 */
function moveExampleToTop(rendered: string): string {
  const lines = rendered.split('\n')
  const exampleStart = lines.findIndex(l => /^## Example\s*$/.test(l))
  if (exampleStart === -1) return rendered

  let exampleEnd = lines.length
  for (let i = exampleStart + 1; i < lines.length; i++) {
    if (/^## /.test(lines[i]!)) {
      exampleEnd = i
      break
    }
  }

  const exampleLines = lines.slice(exampleStart, exampleEnd)
  const withoutExample = [...lines.slice(0, exampleStart), ...lines.slice(exampleEnd)]

  const firstH2 = withoutExample.findIndex(l => /^## /.test(l))
  if (firstH2 === -1) return rendered

  return [
    ...withoutExample.slice(0, firstH2),
    ...exampleLines,
    '',
    ...withoutExample.slice(firstH2),
  ].join('\n')
}

/**
 * Remove the `## Components` group heading from hook pages. The field
 * component entries (`### XxxField`) are already at H3 and nest naturally
 * under the preceding `## EmployeeDetailsFields` section without needing
 * their own H2 group header.
 */
function removeComponentsHeader(rendered: string): string {
  return rendered.replace(/^## Components\s*\n\n?/m, '')
}

/**
 * After `reformatHookFunctionSection` shifts headings, `#### Example` becomes
 * `## Example`. Find any opening code fence that appears after a `## Example`
 * heading (skipping blank lines) and add ` title="Example"` to it if absent.
 */
function addExampleTitles(rendered: string): string {
  const lines = rendered.split('\n')
  const out: string[] = []
  let lookingForFence = false

  for (const line of lines) {
    if (/^## Examples?\s*$/.test(line)) {
      lookingForFence = true
      out.push(line)
      continue
    }
    if (lookingForFence) {
      if (line.trim() === '') {
        out.push(line)
        continue
      }
      // Non-blank line: check if it's an opening code fence
      const fenceMatch = /^(```+)(\w+)?(.*)$/.exec(line)
      if (fenceMatch && !line.includes('title=')) {
        const [, ticks, lang, rest] = fenceMatch
        out.push(`${ticks}${lang ?? ''}${rest ?? ''} title="Example"`)
      } else {
        out.push(line)
      }
      lookingForFence = false
      continue
    }
    out.push(line)
  }

  return out.join('\n')
}

/**
 * The call signature carried by a `Fields` interface property type. With
 * `expandParameters` on, `typeof XxxField` is expanded to its call signature
 * `(props: XxxFieldProps) => Element` (a {@link ReflectionType}); a
 * conditionally-exposed field is a {@link UnionType} of that with `undefined`.
 */
function fieldCallSignature(type: SomeType | undefined): SignatureReflection | undefined {
  if (type instanceof ReflectionType) return type.declaration.signatures?.[0]
  if (type instanceof UnionType) {
    for (const member of type.types) {
      const sig = fieldCallSignature(member)
      if (sig) return sig
    }
  }
  return undefined
}

/**
 * Whether a `Fields` interface member is conditionally exposed — its declared
 * type is `typeof XxxField | undefined` (a {@link UnionType}) rather than the
 * bare `typeof XxxField`. Such fields are `undefined` until their visibility
 * rule is met and must be null-checked before rendering.
 */
function isConditionalField(member: DeclarationReflection): boolean {
  return member.type instanceof UnionType || member.flags.isOptional
}

/**
 * Reflection id of a field component's props parameter. A component and the
 * `Fields` property that exposes it both reference the same `XxxFieldProps`
 * type, so this id pairs key↔component by identity — no reliance on the public
 * export name matching `<FieldKey>Field` (it doesn't when an export is aliased,
 * e.g. `AmountField` → `DeductionAmountField`).
 */
function fieldPropsId(sig: SignatureReflection | undefined): number | undefined {
  const paramType = sig?.parameters?.[0]?.type
  return paramType instanceof ReferenceType ? paramType.reflection?.id : undefined
}

/**
 * The `*FieldProps` props reference a Fields member carries when it is a single
 * field component, or `undefined` when the member is a field *group*
 * (`PreparerFieldGroup`) or dynamic collection (`SplitFieldEntry[]`) that
 * legitimately renders without a per-component subsection.
 *
 * A single-component member is declared `typeof XxxField` — which
 * `expandParameters` turns into a `(props: XxxFieldProps) => Element` call
 * signature — or, less ideally, `ComponentType<XxxFieldProps>`. Both carry a
 * `*FieldProps` reference; groups and arrays do not. An unexpanded `typeof X`
 * {@link QueryType} survives only when `X` did not reflect (the component was
 * never exported), which is itself the defect {@link buildFieldsTable} fails on.
 */
function fieldComponentPropsName(type: SomeType | undefined): string | undefined {
  if (!type) return undefined
  if (type instanceof UnionType) {
    for (const member of type.types) {
      const name = fieldComponentPropsName(member)
      if (name) return name
    }
    return undefined
  }
  const sig = fieldCallSignature(type)
  if (sig) {
    const propsType = sig.parameters?.[0]?.type
    if (propsType instanceof ReferenceType && propsType.name.endsWith('FieldProps')) {
      return propsType.name
    }
  }
  if (type instanceof QueryType) return type.queryType.name
  if (type instanceof ReferenceType) {
    for (const arg of type.typeArguments ?? []) {
      if (arg instanceof ReferenceType && arg.name.endsWith('FieldProps')) return arg.name
    }
  }
  return undefined
}

/**
 * Resolve a Fields member's type to the `*FieldProps` reflection that documents
 * it — handling `typeof XxxField` (expanded call signature), `ComponentType<
 * XxxFieldProps>`, and `typeof XxxField | undefined`. Returns `null` for shapes
 * that carry no field-props reference (groups, arrays, primitives).
 */
function fieldPropsReflection(type: SomeType | undefined): DeclarationReflection | null {
  if (!type) return null
  if (type instanceof UnionType) {
    for (const member of type.types) {
      const ref = fieldPropsReflection(member)
      if (ref) return ref
    }
    return null
  }
  const sig = fieldCallSignature(type)
  if (sig) {
    const propsType = sig.parameters?.[0]?.type
    if (
      propsType instanceof ReferenceType &&
      propsType.reflection instanceof DeclarationReflection &&
      propsType.name.endsWith('FieldProps')
    ) {
      return propsType.reflection
    }
  }
  if (type instanceof ReferenceType) {
    for (const arg of type.typeArguments ?? []) {
      if (
        arg instanceof ReferenceType &&
        arg.reflection instanceof DeclarationReflection &&
        arg.name.endsWith('FieldProps')
      ) {
        return arg.reflection
      }
    }
  }
  return null
}

/**
 * Whether an alias's type is an opaque const-derived expression — `keyof typeof
 * <const>`, an indexed access (`typeof <const>[…]`, `(typeof <const>)[number]`),
 * or a bare `typeof <const>` query. These render as an unresolvable reference to
 * a (usually module-internal, unexported) const rather than useful text, and are
 * the only aliases {@link SDKTheme.expandConstDerivedAliases} rewrites.
 */
export function isOpaqueConstDerivedType(type: SomeType | undefined): boolean {
  return (
    (type instanceof TypeOperatorType && type.operator === 'keyof') ||
    type instanceof IndexedAccessType ||
    type instanceof QueryType
  )
}

/**
 * The const a `keyof typeof <const>` / `typeof <const>[…]` / `typeof <const>`
 * alias reads from, but only when that const is itself a documented reflection —
 * in which case the opaque form already renders as a useful link and a large
 * expansion would just be a wall of literals. Returns `null` when the const is
 * unexported/undocumented (a dead reference worth expanding regardless of size).
 */
export function documentedUnderlyingConst(
  type: SomeType | undefined,
): DeclarationReflection | null {
  let query: SomeType | undefined
  if (type instanceof TypeOperatorType && type.operator === 'keyof') query = type.target
  else if (type instanceof IndexedAccessType) query = type.objectType
  else if (type instanceof QueryType) query = type
  if (!(query instanceof QueryType)) return null
  const reflection = query.queryType.reflection
  return reflection instanceof DeclarationReflection ? reflection : null
}

/** Above this member count, a documented-const union stays a link, not a wall of literals. */
const MAX_INLINE_LITERALS = 12

/**
 * The string-literal members of a resolved TS type, or `null` if the type is not
 * a union (or single) of string literals — in which case the alias is left as-is
 * rather than rewritten to something lossy.
 */
function stringLiteralMembers(type: ts.Type): string[] | null {
  const parts = type.isUnion() ? type.types : [type]
  const values: string[] = []
  for (const part of parts) {
    if (!part.isStringLiteral()) return null
    values.push(part.value)
  }
  return values.length > 0 ? values : null
}

/**
 * Whether a member's rendered `defaultValue` merely restates its literal `type`
 * — true for every member of an `as const` object (`API_ERROR: 'api_error'`
 * typed as `"api_error"`), where the "Default value" table column is pure noise.
 */
export function defaultValueRestatesLiteralType(reflection: DeclarationReflection): boolean {
  if (reflection.defaultValue === undefined) return false
  if (!(reflection.type instanceof LiteralType)) return false
  return reflection.defaultValue.replace(/^['"]|['"]$/g, '') === String(reflection.type.value)
}

/** The `Translations` namespace holding the i18n resource-key interfaces (see src/i18n/types.d.ts). */
const TRANSLATIONS_NAMESPACE = 'Translations'

/**
 * The `Resources` map interface (namespace name → its key interface). It shares
 * the Translations page with the leaf key interfaces but is not one: its property
 * *values* are those interfaces, so its Type column carries the links to them and
 * must be kept (unlike the leaf glossaries, whose Type column is dropped).
 */
const RESOURCES_MAP_INTERFACE = 'Resources'

/**
 * Whether a reflection lives under the `Translations` namespace (the i18n
 * resource-key interfaces). Their property tables are pure translation-key
 * glossaries, so the `Type` column — always `string` (leaf keys) or `object`
 * (grouping rows, obvious from the dotted path) — is dropped as noise.
 */
export function isTranslationsMember(reflection: DeclarationReflection | undefined): boolean {
  for (let current = reflection?.parent; current; current = current.parent) {
    if (current.kind === ReflectionKind.Namespace && current.name === TRANSLATIONS_NAMESPACE) {
      return true
    }
  }
  return false
}

/** Remove a named column from a GitHub-flavored markdown table. Returns input unchanged if absent. */
export function dropTableColumn(markdown: string, columnName: string): string {
  const lines = markdown.split('\n')
  const headerIndex = lines.findIndex(
    line => line.startsWith('|') && line.split('|').some(cell => cell.trim() === columnName),
  )
  if (headerIndex === -1) return markdown
  const columnIndex = lines[headerIndex]!.split('|').findIndex(cell => cell.trim() === columnName)
  return lines
    .map(line => {
      if (!line.startsWith('|')) return line
      const cells = line.split('|')
      if (columnIndex >= cells.length) return line
      cells.splice(columnIndex, 1)
      return cells.join('|')
    })
    .join('\n')
}

/**
 * Collect the string-literal validation codes a type resolves to — walking
 * unions, type-alias references, and `typeof XxxErrorCodes.CODE` queries (whose
 * queried property's literal value, or failing that its name, is the code).
 */
function collectErrorCodes(
  type: SomeType | undefined,
  seen = new Set<DeclarationReflection>(),
): string[] {
  if (!type) return []
  if (type instanceof LiteralType && typeof type.value === 'string') return [type.value]
  if (type instanceof UnionType) return type.types.flatMap(t => collectErrorCodes(t, seen))
  // `(typeof XxxErrorCodes)['A' | 'B']` — the codes are the index keys (which
  // equal their values for these `as const` code maps).
  if (type instanceof IndexedAccessType) return collectErrorCodes(type.indexType, seen)
  // `keyof Pick<typeof XxxErrorCodes, 'A' | 'B'>` — the codes are the picked
  // keys; a bare `keyof X` falls back to walking `X`.
  if (type instanceof TypeOperatorType && type.operator === 'keyof') {
    if (type.target instanceof ReferenceType && type.target.name === 'Pick') {
      return collectErrorCodes(type.target.typeArguments?.[1], seen)
    }
    return collectErrorCodes(type.target, seen)
  }
  if (type instanceof QueryType) {
    const queried = type.queryType.reflection
    if (queried instanceof DeclarationReflection) {
      if (queried.type instanceof LiteralType && typeof queried.type.value === 'string') {
        return [queried.type.value]
      }
      return [queried.name]
    }
    const tail = type.queryType.name?.split('.').pop()
    return tail ? [tail] : []
  }
  if (type instanceof ReferenceType) {
    const refl = type.reflection
    if (refl instanceof DeclarationReflection && refl.type && !seen.has(refl)) {
      seen.add(refl)
      return collectErrorCodes(refl.type, seen)
    }
  }
  return []
}

const VALIDATION_CODE_PARAMS = new Set(['TErrorCode', 'TOptionalErrorCode'])

/**
 * Every validation code a field's `validationMessages` accepts — both the
 * required `TErrorCode` and optional `TOptionalErrorCode` generics (required
 * first). Reads the generics bound on an alias-shaped `HookFieldProps<Underlying
 * <…>>`, or the `ValidationMessages<TErrorCode, TOptionalErrorCode>` arguments
 * on an interface-shaped props type.
 */
function fieldValidationCodes(propsRef: DeclarationReflection): string[] {
  if (propsRef.type instanceof ReferenceType && propsRef.type.name === 'HookFieldProps') {
    const underlyingRef = propsRef.type.typeArguments?.[0]
    if (
      underlyingRef instanceof ReferenceType &&
      underlyingRef.reflection instanceof DeclarationReflection
    ) {
      const codes: string[] = []
      underlyingRef.reflection.typeParameters?.forEach((param, index) => {
        if (VALIDATION_CODE_PARAMS.has(param.name)) {
          codes.push(...collectErrorCodes(underlyingRef.typeArguments?.[index] ?? param.default))
        }
      })
      if (codes.length > 0) return [...new Set(codes)]
    }
  }
  const validationMessages = (propsRef.children ?? []).find(c => c.name === 'validationMessages')
  if (
    validationMessages?.type instanceof ReferenceType &&
    validationMessages.type.name === 'ValidationMessages'
  ) {
    const codes = (validationMessages.type.typeArguments ?? []).flatMap(arg =>
      collectErrorCodes(arg),
    )
    return [...new Set(codes)]
  }
  return []
}

/**
 * The field-component members of a field-*group* type — an object whose every
 * member is itself a field component (`typeof XxxField` / `ComponentType<…>`),
 * e.g. `PreparerFieldGroup`'s nine sub-fields. Returns `null` when `ref` isn't
 * such a group (handles both `interface` and object-literal `type` aliases).
 */
function fieldGroupMembers(ref: DeclarationReflection): DeclarationReflection[] | null {
  // Members live either on the reflection directly (interface, or object-literal
  // type alias TypeDoc converted to a container) or under `type.declaration`.
  const children =
    ref.children ?? (ref.type instanceof ReflectionType ? ref.type.declaration.children : null)
  const members = (children ?? []).filter(c => c.isDeclaration())
  if (members.length === 0) return null
  return members.every(m => fieldPropsReflection(m.type) != null) ? members : null
}

/**
 * Resolve a Fields member type to its field-group reflection (e.g.
 * `PreparerFieldGroup`), stripping a trailing `| undefined`. Returns `null`
 * when the member is not a field group.
 */
function fieldGroupReflection(type: SomeType | undefined): DeclarationReflection | null {
  let ref: SomeType | undefined = type
  if (ref instanceof UnionType) ref = ref.types.find(t => t instanceof ReferenceType)
  if (!(ref instanceof ReferenceType) || !(ref.reflection instanceof DeclarationReflection)) {
    return null
  }
  return fieldGroupMembers(ref.reflection) ? ref.reflection : null
}

/**
 * Render a field's props as a table from its props reflection alone — no
 * component-function reflection required. A `HookFieldProps<…>` alias goes
 * through {@link renderFieldPropsTable} (type-param substitution, base-prop
 * footer); a plain props interface (e.g. the factory-built `SplitFieldProps`)
 * renders its own properties directly. Returns null when neither applies.
 */
function renderFieldPropsTableAny(
  context: SDKThemeContext,
  propsRef: DeclarationReflection,
): string | null {
  const aliasTable = renderFieldPropsTable(context, propsRef)
  if (aliasTable) return aliasTable
  const props = (propsRef.children ?? []).filter(c => c.isDeclaration() && c.name !== 'name')
  if (props.length > 0) {
    return context.partials.propertiesTable(props, {
      isEventProps: false,
      kind: ReflectionKind.Interface,
    })
  }
  return null
}

/**
 * Render a type as markdown for a `form.Fields.X: <type>` signature line,
 * matching how TypeDoc renders types in property tables: the type name is in
 * inline code, generic brackets are escaped sans-serif (`\<`…`\>`), array `[]`
 * is plain, and any reference resolving to a page-local reflection is linked —
 * e.g. `` `ComponentType`\<[`SplitByFieldProps`](#…)\> `` and
 * `` [`SplitFieldEntry`](#…)[] ``. Mirrors {@link plainTypeString}'s shapes.
 */
function linkyType(context: SDKThemeContext, type: SomeType | undefined): string {
  if (type instanceof UnionType) {
    return type.types.map(t => linkyType(context, t)).join(' \\| ')
  }
  if (type instanceof ReferenceType) {
    const linkable =
      type.reflection instanceof DeclarationReflection && context.router.hasUrl(type.reflection)
    const nameMd = linkable
      ? `[\`${type.name}\`](${context.urlTo(type.reflection as DeclarationReflection)})`
      : `\`${type.name}\``
    const args = type.typeArguments ?? []
    if (args.length === 0) return nameMd
    return `${nameMd}\\<${args.map(a => linkyType(context, a)).join(', ')}\\>`
  }
  if (type instanceof ArrayType) return `${linkyType(context, type.elementType)}[]`
  // `typeof XxxField` expands (via `expandParameters`) to a `(props: XxxFieldProps)
  // => Element` call signature. Present it as the semantically-equivalent
  // `ComponentType<XxxFieldProps>` so `typeof`- and `ComponentType`-declared
  // fields read identically.
  if (type instanceof ReflectionType) {
    const propsType = type.declaration.signatures?.[0]?.parameters?.[0]?.type
    if (propsType instanceof ReferenceType && propsType.name.endsWith('FieldProps')) {
      return `\`ComponentType\`\\<${linkyType(context, propsType)}\\>`
    }
  }
  return `\`${plainTypeString(type)}\``
}

/** Same-reflection HTML anchor line, or empty when anchors are off / no URL. */
function anchorLine(context: SDKThemeContext, ref: DeclarationReflection): string {
  if (context.router.hasUrl(ref) && context.options.getValue('useHTMLAnchors')) {
    return `<a id="${context.router.getAnchor(ref)}"></a>\n\n`
  }
  return ''
}

/**
 * Render a type as a plain string with no markdown links — for the `form.Fields.X:
 * <type>` signature lines, which live inside inline code where links wouldn't
 * render. Covers the shapes Fields members use (references with type arguments,
 * arrays, unions, `typeof X`, primitives); falls back to TypeDoc's own
 * stringification for anything else.
 */
function plainTypeString(type: SomeType | undefined): string {
  if (!type) return 'unknown'
  if (type instanceof ReferenceType) {
    const args = type.typeArguments
    return args && args.length > 0
      ? `${type.name}<${args.map(plainTypeString).join(', ')}>`
      : type.name
  }
  if (type instanceof ArrayType) return `${plainTypeString(type.elementType)}[]`
  if (type instanceof UnionType) return type.types.map(plainTypeString).join(' | ')
  if (type instanceof QueryType) return `typeof ${plainTypeString(type.queryType)}`
  if (type instanceof IntrinsicType) return type.name
  return type.toString()
}

/**
 * Whether {@link buildFlatFieldsSection} can render every member of a fields
 * interface — i.e. each is a single field component (`typeof XxxField` /
 * `ComponentType<XxxFieldProps>`) or an array of field entries. Returns false
 * when any member is a field *group* (e.g. `PreparerFieldGroup`), which the
 * flat renderer doesn't handle yet (those hooks keep the legacy table).
 */
function canRenderFlatFields(fieldsInterface: DeclarationReflection): boolean {
  const members = (fieldsInterface.children ?? []).filter(c => c.isDeclaration())
  if (members.length === 0) return false
  return members.every(member => {
    if (member.type instanceof ArrayType && member.type.elementType instanceof ReferenceType) {
      const entryRef = member.type.elementType.reflection
      return (
        entryRef instanceof DeclarationReflection &&
        (entryRef.children ?? []).some(child => fieldPropsReflection(child.type) != null)
      )
    }
    return fieldPropsReflection(member.type) != null || fieldGroupReflection(member.type) != null
  })
}

/**
 * Build the `## Fields` section for a flat fields interface whose members are
 * declared as `ComponentType<XxxFieldProps>` and/or arrays of field entries —
 * the shape that needs no exported component-function value. Each field's docs
 * are sourced from its `*FieldProps` type (and, for arrays, the entry
 * interface), which are relocated here from "Utility Types" (their anchors are
 * preserved so existing links resolve). Returns the markdown plus the set of
 * type names relocated, for the caller to drop from their standalone section.
 *
 * Hard-fails (throws {@link HookModelError}) on any member it can't resolve to
 * a field component or an array of field entries — the loud signal that a hook
 * exposes a field shape the reference renderer doesn't yet handle.
 */
function buildFlatFieldsSection(
  context: SDKThemeContext,
  formModel: FormHookModel,
): { markdown: string; relocated: Set<string> } {
  const fieldsInterface = formModel.fieldsInterface!
  const members = (fieldsInterface.children ?? [])
    .filter(c => c.isDeclaration())
    .sort((a, b) => a.name.localeCompare(b.name))
  const relocated = new Set<string>()

  // An H4 block for a relocated type: `#### Name` + anchor + comment + table.
  const typeBlockH4 = (ref: DeclarationReflection, table: string): string => {
    const block: string[] = [`#### ${ref.name}`, '', anchorLine(context, ref).trimEnd()]
    if (ref.comment) {
      const comment = context.partials
        .comment(ref.comment, { showSummary: true, showTags: false })
        .trim()
      if (comment) block.push('', comment)
    }
    block.push('', table)
    return block.join('\n')
  }

  // An H4 block for a field's props type: `#### Name` + anchor + composed type +
  // comment + the props table. Alias-shaped props (`XxxFieldProps =
  // HookFieldProps<…>`) keep the underlying composed type, but the repeated
  // `**Name** =` prefix is stripped since the heading already names it.
  const renderPropsBlockH4 = (ref: DeclarationReflection): string => {
    const table = renderFieldPropsTableAny(context, ref)
    if (!table) {
      throw new HookModelError(
        formModel.hookFn.name,
        `Could not render props table for "${ref.name}".`,
      )
    }
    if (ref.kind === ReflectionKind.TypeAlias) {
      const standard = context.partials
        .memberContainer(ref, { headingLevel: 4 })
        .trimEnd()
        .replace(`**${ref.name}** = `, '')
      return `${standard}\n\n${table}`
    }
    return typeBlockH4(ref, table)
  }

  // A field group (e.g. `PreparerFieldGroup`) documented once, even when several
  // Fields members reference it: an `### Name` heading + comment + a table of its
  // sub-fields, then each distinct sub-field props type expanded once.
  const renderGroupBlock = (groupRef: DeclarationReflection): string => {
    const groupMembers = fieldGroupMembers(groupRef) ?? []
    const block: string[] = [`### ${groupRef.name}`, '', anchorLine(context, groupRef).trimEnd()]
    if (groupRef.comment) {
      const comment = context.partials
        .comment(groupRef.comment, { showSummary: true, showTags: false })
        .trim()
      if (comment) block.push('', comment)
    }
    block.push(
      '',
      '| Field | Component |',
      '| ------ | ------ |',
      ...groupMembers.map(m => `| \`${m.name}\` | ${linkyType(context, m.type)} |`),
    )
    const seen = new Set<string>()
    for (const m of groupMembers) {
      const propsRef = fieldPropsReflection(m.type)
      if (propsRef && !seen.has(propsRef.name)) {
        seen.add(propsRef.name)
        relocated.add(propsRef.name)
        block.push('', renderPropsBlockH4(propsRef))
      }
    }
    return block.join('\n')
  }

  // Field groups referenced by one or more members, rendered once after the
  // per-field sections (keyed by name to dedupe `Preparer1`–`Preparer4`).
  const groupRefs = new Map<string, DeclarationReflection>()
  // The first Fields key to use each group — that one gets the full worked
  // example; later keys reusing the same group point back to it.
  const groupFirstField = new Map<string, string>()

  const memberDescription = (member: DeclarationReflection): string =>
    member.comment
      ? context.partials.comment(member.comment, { showSummary: true, showTags: false }).trim()
      : ''

  // `AdjustForMinimumWage` → `Adjust for minimum wage`, for example labels.
  const humanize = (name: string): string => {
    const words = name
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .toLowerCase()
      .trim()
    return words.charAt(0).toUpperCase() + words.slice(1)
  }

  // A field is optional/conditional when its declared type is `… | undefined`
  // or the property itself is optional — it must be null-checked before use.
  const isOptionalField = (member: DeclarationReflection): boolean => isConditionalField(member)

  // Interface index table first — rendered via `linkyType` (not the default
  // member partial) so `typeof XxxField` members display as
  // `ComponentType<XxxFieldProps>`, consistent with the per-field examples.
  // Required fields first, then optional/can-be-undefined; alphabetical within
  // each group (the page sidebar keeps the per-field sections in strict alpha).
  const indexMembers = [...members].sort(
    (a, b) =>
      Number(isOptionalField(a)) - Number(isOptionalField(b)) || a.name.localeCompare(b.name),
  )
  const indexRows = indexMembers.map(member => {
    const optional = member.flags.isOptional ? '?' : ''
    const description = memberDescription(member)
      .replace(/\s*\n+\s*/g, ' ')
      .replace(/\|/g, '\\|')
    return `| \`${member.name}${optional}\` | ${linkyType(context, member.type)} | ${description || '—'} |`
  })
  const indexBlock: string[] = [
    `### ${fieldsInterface.name}`,
    '',
    anchorLine(context, fieldsInterface).trimEnd(),
  ]
  if (fieldsInterface.comment) {
    const comment = context.partials
      .comment(fieldsInterface.comment, { showSummary: true, showTags: false })
      .trim()
    if (comment) indexBlock.push('', comment)
  }
  indexBlock.push(
    '',
    '| Property | Type | Description |',
    '| ------ | ------ | ------ |',
    ...indexRows,
  )
  const sections: string[] = [indexBlock.join('\n')]

  // The `validationMessages={{…}}` attribute lines for a field's codes, indented
  // by `indent`. Inline for one or two codes; wrapped one-per-line beyond that.
  const validationMessagesAttr = (codes: string[], indent: string): string[] => {
    if (codes.length === 0) return []
    if (codes.length <= 2) {
      return [`${indent}validationMessages={{ ${codes.map(c => `${c}: '…'`).join(', ')} }}`]
    }
    return [
      `${indent}validationMessages={{`,
      ...codes.map(c => `${indent}  ${c}: '…',`),
      `${indent}}}`,
    ]
  }

  // A JSX usage example for a field component. The `label` (always required)
  // plus a `validationMessages` map pre-filled with the field's own required
  // codes — the cool part: each field shows exactly the codes it can emit.
  const fieldExample = (jsxTag: string, label: string, codes: string[]): string => {
    if (codes.length === 0) return `<${jsxTag} label="${label}" />`
    return [`<${jsxTag}`, `  label="${label}"`, ...validationMessagesAttr(codes, '  '), '/>'].join(
      '\n',
    )
  }

  // Wrap an example in a code fence, guarding behind a null-check for
  // optional/conditional fields (which are `undefined` until their rule is met).
  const exampleFence = (
    member: DeclarationReflection,
    fieldKey: string,
    element: string,
  ): string => {
    if (!isOptionalField(member)) return ['```tsx', element, '```'].join('\n')
    const indented = element
      .split('\n')
      .map(line => `  ${line}`)
      .join('\n')
    return ['```tsx', `{form.Fields.${fieldKey} && (`, indented, ')}', '```'].join('\n')
  }

  for (const member of members) {
    const fieldKey = member.name
    const description = memberDescription(member)
    // Heading + the member's own description, shared by every field shape.
    const intro = description ? [`### ${fieldKey}`, '', description] : [`### ${fieldKey}`]

    // Array-of-entries: `splits: SplitFieldEntry[]`.
    if (member.type instanceof ArrayType && member.type.elementType instanceof ReferenceType) {
      const entryRef = member.type.elementType.reflection
      if (!(entryRef instanceof DeclarationReflection)) {
        throw new HookModelError(
          formModel.hookFn.name,
          `Fields member "${fieldKey}" is an array whose entry type did not resolve.`,
        )
      }
      const entryProps = (entryRef.children ?? []).filter(c => c.isDeclaration())
      const boundField = entryProps.find(c => fieldPropsReflection(c.type))
      const boundPropsRef = boundField ? fieldPropsReflection(boundField.type) : null
      if (!boundField || !boundPropsRef) {
        throw new HookModelError(
          formModel.hookFn.name,
          `Fields member "${fieldKey}" is an array of "${entryRef.name}", but no entry property ` +
            `resolves to a field component (expected a \`ComponentType<XxxFieldProps>\` member).`,
        )
      }
      relocated.add(entryRef.name).add(boundPropsRef.name)

      // Entry interface keeps every property (including the data `name` field),
      // so render its table directly rather than through the field-props helper.
      const entryTable = context.partials.propertiesTable(entryProps, {
        isEventProps: false,
        kind: ReflectionKind.Interface,
      })
      const hasName = entryProps.some(p => p.name === 'name')
      const exampleLabel = hasName ? `{entry.name ?? '…'}` : '"…"'
      const boundAttrs = [
        `    key={entry.uuid}`,
        `    label=${exampleLabel}`,
        ...validationMessagesAttr(fieldValidationCodes(boundPropsRef), '    '),
      ]
      const example = [
        '```tsx',
        `{form.Fields.${fieldKey}.map(entry => (`,
        `  <entry.${boundField.name}`,
        ...boundAttrs,
        '  />',
        '))}',
        '```',
      ].join('\n')
      sections.push(
        [
          ...intro,
          '',
          example,
          '',
          typeBlockH4(entryRef, entryTable),
          '',
          renderPropsBlockH4(boundPropsRef),
        ].join('\n'),
      )
      continue
    }

    // Single field component: `ComponentType<XxxFieldProps>` / `typeof XxxField`.
    const propsRef = fieldPropsReflection(member.type)
    if (propsRef) {
      relocated.add(propsRef.name)
      const element = fieldExample(
        `form.Fields.${fieldKey}`,
        humanize(fieldKey),
        fieldValidationCodes(propsRef),
      )
      sections.push(
        [
          ...intro,
          '',
          exampleFence(member, fieldKey, element),
          '',
          renderPropsBlockH4(propsRef),
        ].join('\n'),
      )
      continue
    }

    // Field group (e.g. `PreparerFieldGroup`): description + an example that
    // accesses a sub-field, plus a reference to the shared group block rendered
    // once after the loop.
    const groupRef = fieldGroupReflection(member.type)
    if (groupRef) {
      relocated.add(groupRef.name)
      groupRefs.set(groupRef.name, groupRef)
      const groupParts = [...intro]
      const firstUse = groupFirstField.get(groupRef.name)

      // Wrap a fragment body in a code fence, null-checking the group for
      // optional/conditional members.
      const fenceFragment = (body: string[]): string => {
        const fragment = ['  <>', ...body, '  </>']
        const inner = isOptionalField(member)
          ? [`{form.Fields.${fieldKey} && (`, ...fragment, ')}']
          : fragment
        return ['```tsx', ...inner, '```'].join('\n')
      }

      if (!firstUse) {
        // First field to use this group: a complete example rendering every
        // sub-field, each with its own validationMessages.
        groupFirstField.set(groupRef.name, fieldKey)
        const body = (fieldGroupMembers(groupRef) ?? []).map(sub => {
          const subPropsRef = fieldPropsReflection(sub.type)
          const element = fieldExample(
            `form.Fields.${fieldKey}.${sub.name}`,
            humanize(sub.name),
            subPropsRef ? fieldValidationCodes(subPropsRef) : [],
          )
          return element
            .split('\n')
            .map(line => `    ${line}`)
            .join('\n')
        })
        groupParts.push('', fenceFragment(body))
      } else {
        // Reuses a group already shown — point back to the first field's example.
        groupParts.push('', fenceFragment([`    {/* same sub-fields as ${firstUse} */}`]))
      }
      groupParts.push(
        '',
        `See [\`${groupRef.name}\`](#${context.router.getAnchor(groupRef)}) for all sub-fields.`,
      )
      sections.push(groupParts.join('\n'))
      continue
    }

    throw new HookModelError(
      formModel.hookFn.name,
      `Fields member "${fieldKey}" (type ${member.type?.type ?? 'unknown'}) is neither a field ` +
        `component (\`ComponentType<XxxFieldProps>\` / \`typeof XxxField\`), a field group, nor an ` +
        `array of field entries.`,
    )
  }

  for (const groupRef of groupRefs.values()) {
    sections.push(renderGroupBlock(groupRef))
  }

  const markdown = ['## Fields', '', sections.join('\n\n***\n\n')].join('\n')
  return { markdown, relocated }
}

/**
 * Auto-generate a quick-reference fields table from the hook model's Fields
 * interface. Each row shows the field key, the component type extracted from
 * the field component's props type alias, and notes from the field
 * component's @remarks. Returns null when the Fields interface has no children.
 *
 * Hard-fails (throws {@link HookModelError}) when a Fields member is a single
 * field component yet no documented per-component subsection resolved for it —
 * almost always because the component function is not exported from the package
 * entry (`src/index.ts`), so TypeDoc never reflects it. This is deliberately
 * loud: a silent `—` row hides a missing piece of the public hook surface.
 */
function buildFieldsTable(
  context: SDKThemeContext,
  hookNs: DeclarationReflection,
  formModel: FormHookModel,
): string | null {
  const fieldsInterface = formModel.fieldsInterface
  if (!fieldsInterface) return null

  // Always-defined fields first, then conditional ones; alphabetical by key
  // within each group. Mirrors the "null-check before rendering" boundary.
  const fieldChildren = (fieldsInterface.children ?? [])
    .filter(c => c.isDeclaration())
    .sort(
      (a, b) =>
        Number(isConditionalField(a)) - Number(isConditionalField(b)) ||
        a.name.localeCompare(b.name),
    )
  if (fieldChildren.length === 0) return null

  // Pair each exposed field with its component by props-type identity.
  const fieldsGroup = hookNs.groups?.find(g => g.title === 'Components')
  const fieldComponents = (fieldsGroup?.children ?? []) as DeclarationReflection[]
  const componentByPropsId = new Map<number, DeclarationReflection>()
  for (const comp of fieldComponents) {
    const propsId = fieldPropsId(comp.signatures?.[0])
    if (propsId !== undefined) componentByPropsId.set(propsId, comp)
  }

  const rows: string[] = []
  for (const child of fieldChildren) {
    const fieldKey = child.name
    const propsId = fieldPropsId(fieldCallSignature(child.type))
    const fieldComp = propsId !== undefined ? componentByPropsId.get(propsId) : undefined

    // A single field-component member must resolve to a documented subsection.
    // If it doesn't, the component function is almost certainly not exported
    // from the package entry, so TypeDoc never reflected it — fail loudly
    // rather than emit a silent `—` row that hides the gap.
    const propsName = fieldComponentPropsName(child.type)
    if (propsName && !(fieldComp && context.router.hasUrl(fieldComp))) {
      throw new HookModelError(
        formModel.hookFn.name,
        `Fields member "${fieldKey}" is a field component (props \`${propsName}\`) but no ` +
          `documented component resolved for it. Export the field component function from the ` +
          `package entry (src/index.ts) and declare the member as \`typeof XxxField\`.`,
      )
    }

    // Column 1: Field Key — link to the field component's anchor below
    const fieldKeyUrl =
      fieldComp && context.router.hasUrl(fieldComp) ? context.urlTo(fieldComp) : null
    const fieldKeyCell = fieldKeyUrl ? `[\`${fieldKey}\`](${fieldKeyUrl})` : `\`${fieldKey}\``

    // Column 2: Component Type — extract from props type alias chain
    let componentTypeCell = '—'
    if (fieldComp) {
      try {
        // fieldComp.signatures[0].parameters[0].type → ReferenceType(XxxFieldProps)
        const param = fieldComp.signatures?.[0]?.parameters?.[0]
        const propsRef = param?.type instanceof ReferenceType ? param.type.reflection : null
        if (propsRef instanceof DeclarationReflection) {
          // propsRef.type → ReferenceType(HookFieldProps, typeArguments=[...])
          const innerRef = propsRef.type instanceof ReferenceType ? propsRef.type : null
          if (innerRef) {
            // typeArguments[0] → ReferenceType(DatePickerHookFieldProps, ...)
            const firstArg = innerRef.typeArguments?.[0]
            if (firstArg instanceof ReferenceType) {
              const rawName = firstArg.name
              // Strip "HookFieldProps" suffix to get component type name
              const componentTypeName = rawName.replace(/HookFieldProps$/, '')
              if (componentTypeName && componentTypeName !== rawName) {
                const targetRefl = firstArg.reflection
                if (
                  targetRefl instanceof DeclarationReflection &&
                  context.router.hasUrl(targetRefl)
                ) {
                  componentTypeCell = `[${componentTypeName}](${context.urlTo(targetRefl)})`
                } else {
                  componentTypeCell = componentTypeName
                }
              }
            }
          }
        }
      } catch {
        componentTypeCell = '—'
      }
    }

    // Column 3: Notes — from field component's @remarks, stripped of boilerplate
    let notes = '—'
    if (fieldComp) {
      const comment = fieldComp.signatures?.[0]?.comment ?? fieldComp.comment
      const remarksTag = comment?.blockTags.find(t => t.tag === '@remarks')
      const remarksText = remarksTag ? Comment.combineDisplayParts(remarksTag.content) : ''
      const strippedRemarks = remarksText.startsWith('Available on the hook result')
        ? (() => {
            const idx = remarksText.indexOf('. ')
            return idx === -1 ? '' : remarksText.slice(idx + 2)
          })()
        : remarksText
      const notesText = strippedRemarks.replace(/\n+/g, ' ').replace(/\|/g, '\\|').trim()
      if (notesText) notes = notesText
    }

    // Conditional fields are typed `typeof XxxField | undefined`; reflect that
    // in the Component Type column (escaping the pipe for the markdown table).
    if (isConditionalField(child) && componentTypeCell !== '—') {
      componentTypeCell = `${componentTypeCell} \\| \`undefined\``
    }

    rows.push(`| ${fieldKeyCell} | ${componentTypeCell} | ${notes} |`)
  }

  if (rows.length === 0) return null

  // A hard-coded `## Fields` parent groups the interface and its field
  // components as siblings; the interface keeps its symbol name (and anchor,
  // so cross-references stay valid) at H3.
  const parts: string[] = ['## Fields', '', `### ${fieldsInterface.name}`]
  if (context.router.hasUrl(fieldsInterface) && context.options.getValue('useHTMLAnchors')) {
    parts.push(`<a id="${context.router.getAnchor(fieldsInterface)}"></a>`)
  }
  if (fieldsInterface.comment) {
    const commentMd = context.partials.comment(fieldsInterface.comment, {
      showSummary: true,
      showTags: false,
    })
    if (commentMd.trim()) parts.push(commentMd)
  }
  parts.push(
    '',
    '| Field Key | Component Type | Notes |',
    '| --------- | -------------- | ----- |',
    ...rows,
  )
  return parts.join('\n')
}

/**
 * Inject the fields table into the rendered hook page, immediately before
 * the ## Components section that contains the detailed per-field docs.
 * Falls back to appending if the Components section is absent.
 */
function injectFieldsSummary(rendered: string, summary: string): string {
  const lines = rendered.split('\n')
  const componentsSectionIndex = lines.findIndex(l => /^##\s+Components\s*$/.test(l))
  if (componentsSectionIndex === -1) {
    return `${rendered.trimEnd()}\n\n${summary}\n`
  }
  return [
    ...lines.slice(0, componentsSectionIndex),
    summary,
    '',
    ...lines.slice(componentsSectionIndex),
  ].join('\n')
}

/**
 * Order field-section members alphabetically by name, except that a member
 * carrying `@groupWith {@link X}` is pulled out of the alphabetical run and
 * rendered immediately after `X` (chained — a follower can itself be a target).
 * `pinnedFirst`, when given, always leads the list regardless of name and may
 * itself be a `@groupWith` target (e.g. the fields source-of-truth alias).
 *
 * A `@groupWith` pointing at a name that isn't in this set degrades to a plain
 * alphabetical anchor; a cycle can't drop members — the trailing safety pass
 * emits anything left over.
 */
function orderByGroupWith(
  members: DeclarationReflection[],
  pinnedFirst?: DeclarationReflection,
): DeclarationReflection[] {
  const present = new Set([...(pinnedFirst ? [pinnedFirst.name] : []), ...members.map(m => m.name)])
  const followersByTarget = new Map<string, DeclarationReflection[]>()
  const anchors: DeclarationReflection[] = []
  for (const member of members) {
    const target = groupWithTarget(member)
    if (target && target !== member.name && present.has(target)) {
      const list = followersByTarget.get(target) ?? []
      list.push(member)
      followersByTarget.set(target, list)
    } else {
      anchors.push(member)
    }
  }
  const byName2 = (a: DeclarationReflection, b: DeclarationReflection): number =>
    a.name.localeCompare(b.name)
  anchors.sort(byName2)
  for (const list of followersByTarget.values()) list.sort(byName2)

  const emitted = new Set<DeclarationReflection>()
  const ordered: DeclarationReflection[] = []
  const emit = (member: DeclarationReflection): void => {
    if (emitted.has(member)) return
    emitted.add(member)
    ordered.push(member)
    for (const follower of followersByTarget.get(member.name) ?? []) emit(follower)
  }
  if (pinnedFirst) emit(pinnedFirst)
  for (const anchor of anchors) emit(anchor)
  for (const member of members) emit(member) // safety: emit any left by a cycle
  return pinnedFirst ? ordered.filter(m => m !== pinnedFirst) : ordered
}

/**
 * Render a Fields-section interface that extends a base (e.g. each
 * `*StateTaxQuestion` extends {@link SharedQuestionMetadata}) with the common
 * props treatment: drop the `#### Extends` block, table only the interface's own
 * props (the `type`/`Field` unique to each variant), and summarize every
 * inherited prop in an "Also includes … from Base" footer. Returns `null` when
 * the member has no inherited props, so the caller falls back to the default
 * `memberContainer` rendering.
 */
function renderFieldsMemberWithInheritance(
  context: SDKThemeContext,
  refl: DeclarationReflection,
): string | null {
  if (refl.kind !== ReflectionKind.Interface) return null
  const declared = (refl.children ?? []).filter(c => c.isDeclaration())
  const inherited = declared.filter(c => c.inheritedFrom)
  if (inherited.length === 0) return null
  const own = declared.filter(c => !c.inheritedFrom)

  const parts: string[] = []
  if (context.router.hasUrl(refl) && context.options.getValue('useHTMLAnchors')) {
    parts.push(`<a id="${context.router.getAnchor(refl)}"></a>`)
  }
  parts.push(`### ${refl.name}`)
  if (refl.comment) {
    const commentMd = context.partials.comment(refl.comment, { showSummary: true, showTags: false })
    if (commentMd.trim()) parts.push(commentMd)
  }
  if (own.length > 0) {
    parts.push('#### Properties')
    parts.push(
      context.partials.propertiesTable(own, {
        isEventProps: false,
        kind: ReflectionKind.Interface,
      }),
    )
  }
  const names = inherited.map(c => `\`${c.name}\``).join(', ')
  const base = baseInterfaceLink(context, refl)
  parts.push(base ? `_Also includes ${names} from ${base}._` : `_Also includes ${names}._`)
  return parts.join('\n\n')
}

/**
 * Build a `## Fields` section for a form hook whose `Fields` is an array alias
 * (`StateTaxFields = StateTaxFieldsGroup[]`) rather than a flat interface map.
 * There's no per-key quick-reference table to build, so the alias is documented
 * in its own right under the same `## Fields` heading the flat case uses — at
 * H3, keeping its symbol name and anchor so cross-references stay valid — with
 * its `@group Fields` companion types following it in {@link orderByGroupWith}
 * order. The caller must only invoke this when `fieldsArrayAlias` is set; a
 * missing alias is a hard {@link HookModelError}, never a silently field-less page.
 */
function buildFieldsArraySection(
  context: SDKThemeContext,
  hookNs: DeclarationReflection,
  formModel: FormHookModel,
): string {
  const alias = formModel.fieldsArrayAlias
  if (!alias) {
    throw new HookModelError(
      formModel.hookFn.name,
      'buildFieldsArraySection called without an array-shaped fields alias',
    )
  }
  const companions = (hookNs.children ?? [])
    .filter((c): c is DeclarationReflection => c instanceof DeclarationReflection)
    .filter(c => hasGroup(c, 'Fields'))
  const ordered = [alias, ...orderByGroupWith(companions, alias)]
  // `@groupWith` is a layout directive consumed by orderByGroupWith above, not
  // documentation — drop it so it doesn't render as a "Group With" block on the
  // member (mirrors how `@components` is stripped after it's consumed).
  for (const member of ordered) {
    if (member.comment) {
      member.comment.blockTags = member.comment.blockTags.filter(t => t.tag !== '@groupWith')
    }
  }
  // Separate entries with the same `***` divider the standard `members` partial
  // inserts between sibling members (memberContainer alone doesn't add it).
  const body = ordered
    .map(m =>
      (
        renderFieldsMemberWithInheritance(context, m) ??
        context.partials.memberContainer(m, { headingLevel: 3 })
      ).trimEnd(),
    )
    .join('\n\n***\n\n')
  return `## Fields\n\n${body}`
}

/**
 * Inject a section immediately after the `## Returns` section (before the next
 * `##` heading). Used for the array-fields `## Fields` section, which has no
 * `## Components` section to anchor against. Falls back to appending when there
 * is no Returns section.
 */
function injectAfterReturns(rendered: string, section: string): string {
  const lines = rendered.split('\n')
  const returnsIndex = lines.findIndex(l => /^##\s+Returns\s*$/.test(l))
  if (returnsIndex === -1) return `${rendered.trimEnd()}\n\n${section}\n`
  let nextSection = lines.length
  for (let i = returnsIndex + 1; i < lines.length; i++) {
    if (/^##\s/.test(lines[i]!)) {
      nextSection = i
      break
    }
  }
  return [...lines.slice(0, nextSection), section, '', ...lines.slice(nextSection)].join('\n')
}

/**
 * Names of the `*FieldProps` type aliases that are a flat field component's
 * props parameter — e.g. `CaseNumberFieldProps`. These are fully covered by the
 * component's expanded Parameters table, so {@link dropFieldPropsAliases}
 * drops their standalone alias blocks. Group sub-field props (e.g.
 * `PreparerTextFieldProps`) and `*Validation` types are deliberately excluded —
 * they have no per-field Parameters table and are referenced as link targets.
 */
function fieldComponentPropsAliasNames(hookNs: DeclarationReflection): Set<string> {
  const group = hookNs.groups?.find(g => g.title === 'Components')
  const names = new Set<string>()
  for (const comp of (group?.children ?? []) as DeclarationReflection[]) {
    const paramType = comp.signatures?.[0]?.parameters?.[0]?.type
    if (
      paramType instanceof ReferenceType &&
      paramType.reflection instanceof DeclarationReflection
    ) {
      names.add(paramType.reflection.name)
    }
  }
  return names
}

/**
 * Remove the dropped `*FieldProps` alias entries from the `## Utility Types`
 * section. Each names a flat field's props parameter, already documented by the
 * component's expanded Parameters table, so its standalone alias block is pure
 * duplication. Every other alias — `*Validation`, group/variant props, shared
 * base types — is left untouched in place. (Hook pages collapse Variables,
 * Interfaces, and Type Aliases into a single `## Utility Types` group.)
 */
function dropFieldPropsAliases(rendered: string, dropAliasNames: Set<string>): string {
  if (dropAliasNames.size === 0) return rendered

  const lines = rendered.split('\n')
  const taSectionStart = lines.findIndex(l => /^##\s+Utility Types\s*$/.test(l))
  if (taSectionStart === -1) return rendered

  let taSectionEnd = lines.length
  for (let i = taSectionStart + 1; i < lines.length; i++) {
    if (/^##\s/.test(lines[i]!)) {
      taSectionEnd = i
      break
    }
  }

  const taSectionLines = lines.slice(taSectionStart, taSectionEnd)

  // Type alias entries start at an anchor or ### heading and are delimited by
  // lines containing only `***`. Mark the lines of any dropped entry — plus its
  // trailing separator — for removal.
  const linesToRemove = new Set<number>()
  let i = 1 // skip the ## Utility Types heading line itself
  while (i < taSectionLines.length) {
    if (/^###\s/.test(taSectionLines[i]!) || /^<a id=/.test(taSectionLines[i]!)) {
      const entryStart = i
      let j = i + 1
      while (j < taSectionLines.length && !/^\*\*\*\s*$/.test(taSectionLines[j]!)) {
        j++
      }
      const entryEnd = j // exclusive; taSectionLines[j] is *** or end
      const headingLine = taSectionLines.slice(entryStart, entryEnd).find(l => /^###\s/.test(l))
      const headingName = headingLine ? (/^###\s+(\S+)/.exec(headingLine)?.[1] ?? '') : ''
      if (dropAliasNames.has(headingName)) {
        for (let k = entryStart; k < entryEnd; k++) linesToRemove.add(k)
        if (entryEnd < taSectionLines.length && /^\*\*\*\s*$/.test(taSectionLines[entryEnd]!)) {
          linesToRemove.add(entryEnd)
        }
      }
      i = entryEnd + 1 // skip past the *** separator
    } else {
      i++
    }
  }
  if (linesToRemove.size === 0) return rendered

  const newTALines = [taSectionLines[0]!]
  for (let k = 1; k < taSectionLines.length; k++) {
    if (!linesToRemove.has(k)) newTALines.push(taSectionLines[k]!)
  }
  // Trim leading blank lines after the heading (in case the first entry was dropped).
  while (newTALines.length > 1 && newTALines[1]!.trim() === '') {
    newTALines.splice(1, 1)
  }

  return [...lines.slice(0, taSectionStart), ...newTALines, ...lines.slice(taSectionEnd)].join('\n')
}

export class SDKTheme extends MarkdownTheme {
  override getRenderContext(
    page: ConstructorParameters<typeof MarkdownThemeContext>[1],
  ): SDKThemeContext {
    return new SDKThemeContext(this, page, this.application.options)
  }

  // Populate page.frontmatter from the page model and URL so other plugins can
  // read or override it before END. custom_edit_url is null because these files
  // are autogenerated — partners should not see an "Edit this page" link.
  static injectFrontmatter(page: MarkdownPageEvent): void {
    const sidebarPosition = getSidebarPosition(page.url)
    const isHub = isDomainHub(page.model) || isHooksIndex(page.model)
    page.frontmatter = {
      title: pageTitle(page),
      description: pageDescription(page),
      custom_edit_url: null,
      ...(sidebarPosition !== undefined && { sidebar_position: sidebarPosition }),
      ...(isHub && { hide_table_of_contents: true }),
      ...page.frontmatter,
    }
  }

  // Prepend the YAML frontmatter block to page.contents after rendering is done.
  static serializeFrontmatter(page: MarkdownPageEvent): void {
    if (!page.frontmatter) return
    page.contents = `${buildFrontmatterYaml(page.frontmatter)}\n\n${page.contents}`
  }

  // Expand opaque const-derived string-union aliases in place so they render as
  // `"a" | "b" | "c"` instead of an unresolvable `keyof typeof <internalConst>`
  // / `typeof <const>[…]` expression. Covers field-name unions (`keyof typeof
  // fieldValidators`), the error-category union (`typeof SDKErrorCategories[keyof
  // typeof SDKErrorCategories]`), and `as const` value unions (`(typeof FOO)
  // [number]`). The referenced const is often module-internal with no reflection,
  // so resolution goes through the TS type checker — it sees the fully-resolved
  // literal union regardless. Only aliases whose resolved type is entirely string
  // literals are rewritten; anything else is left untouched. A large union backed
  // by a *documented* const (e.g. `EventType` over the exported `componentEvents`)
  // is left as-is — its opaque form already links to that const, which beats
  // inlining hundreds of literals.
  static expandConstDerivedAliases(context: Context): void {
    // `context.program` throws outside file conversion; at RESOLVE_END read the
    // (single, entry-point) program directly for a checker that resolves aliases.
    const checker = context.programs[0]?.getTypeChecker()
    if (!checker) return
    for (const reflection of Object.values(context.project.reflections)) {
      if (!(reflection instanceof DeclarationReflection)) continue
      if (reflection.kind !== ReflectionKind.TypeAlias) continue
      if (!isOpaqueConstDerivedType(reflection.type)) continue

      const symbol = context.getSymbolFromReflection(reflection)
      if (!symbol) continue
      const literals = stringLiteralMembers(checker.getDeclaredTypeOfSymbol(symbol))
      if (!literals) continue
      if (literals.length > MAX_INLINE_LITERALS && documentedUnderlyingConst(reflection.type)) {
        continue
      }

      reflection.type =
        literals.length === 1
          ? new LiteralType(literals[0]!)
          : new UnionType(literals.map(value => new LiteralType(value)))
    }
  }

  // Drop the redundant "Default value" table column from `as const` object
  // constants (e.g. `SDKErrorCategories`, the `XxxErrorCodes` maps), where each
  // member's default merely restates its literal type. The column is genuinely
  // useful elsewhere (real defaults on params/props), so this only clears the
  // duplicate values — typeDeclarationTable then omits the column once no member
  // carries a defaultValue.
  static dropRedundantConstDefaults(context: Context): void {
    for (const reflection of Object.values(context.project.reflections)) {
      if (!(reflection instanceof DeclarationReflection)) continue
      if (defaultValueRestatesLiteralType(reflection)) {
        reflection.defaultValue = undefined
      }
    }
  }

  // Must run before CommentPlugin's RESOLVE_BEGIN handler (priority 0) so that
  // Props interfaces without a JSDoc comment are not removed by excludeNotDocumented
  // before we can inline them. We attach a minimal auto-generated comment so
  // TypeDoc treats them as documented — the comment is rendered inline inside
  // the component's Parameters section by the parametersTable theme override.
  static protectPropsInterfaces(context: Context): void {
    for (const reflection of Object.values(context.project.reflections)) {
      if (!(reflection instanceof DeclarationReflection)) continue
      if (reflection.kind !== ReflectionKind.Function) continue
      if (!/^[A-Z]/.test(reflection.name)) continue

      // Only protect props interfaces for components that are themselves documented
      // (have a JSDoc comment on the function or a signature). If the component gets
      // excluded by excludeNotDocumented, its props interface should also be excluded —
      // otherwise it'd appear as an orphaned entry in the ## Interfaces section.
      const isComponentDocumented =
        reflection.comment || reflection.signatures?.some(sig => !!sig.comment)
      if (!isComponentDocumented) continue

      for (const sig of reflection.signatures ?? []) {
        for (const param of sig.parameters ?? []) {
          if (!(param.type instanceof ReferenceType)) continue
          const propsRef = param.type.reflection
          if (
            !(propsRef instanceof DeclarationReflection) ||
            propsRef.kind !== ReflectionKind.Interface ||
            propsRef.parent !== reflection.parent
          ) {
            continue
          }
          // Auto-generate a summary so excludeNotDocumented keeps this interface.
          if (!propsRef.comment) {
            propsRef.comment = new Comment([
              { kind: 'text', text: 'Props for ' },
              { kind: 'inline-tag', tag: '@link', text: reflection.name, target: reflection },
            ])
          }
          // Protect undocumented properties too — excludeNotDocumentedKinds includes
          // Property by default, so properties without JSDoc would be removed otherwise.
          for (const child of propsRef.children ?? []) {
            if (!child.comment) {
              child.comment = new Comment()
            }
          }
        }
      }
    }

    // Protect hook SharedProps and Ready types so excludeNotDocumented keeps them
    // for inline rendering.
    for (const reflection of Object.values(context.project.reflections)) {
      if (!(reflection instanceof DeclarationReflection)) continue
      if (
        reflection.kind !== ReflectionKind.Interface &&
        reflection.kind !== ReflectionKind.TypeAlias
      )
        continue

      if (/^Use[A-Z][a-zA-Z]*Ready$/.test(reflection.name)) {
        if (!reflection.comment) {
          reflection.comment = new Comment([
            {
              kind: 'text',
              text: `Ready state for \`${reflection.name.replace(/Ready$/, '').replace(/^Use/, 'use')}\`.`,
            },
          ])
        }
        const children =
          reflection.kind === ReflectionKind.TypeAlias && reflection.type instanceof ReflectionType
            ? (reflection.type.declaration.children ?? [])
            : (reflection.children ?? [])
        for (const child of children) {
          if (!child.comment) {
            child.comment = new Comment()
          }
        }
      }
    }
  }

  // Must run after GroupPlugin (priority -100) so that groups already exist.
  // Remove component-props interfaces from their parent's groups — they are
  // rendered inline inside their component's Parameters section instead.
  // Applies at both namespace level and project level.
  static removePropsFromGroups(context: Context): void {
    for (const reflection of Object.values(context.project.reflections)) {
      if (!(reflection instanceof DeclarationReflection)) continue
      if (reflection.kind !== ReflectionKind.Namespace) continue
      if (!reflection.groups?.length) continue

      const propsSet = componentPropsInterfaces(reflection)
      if (propsSet.size === 0) continue

      for (const group of reflection.groups) {
        group.children = group.children.filter(c => !propsSet.has(c as DeclarationReflection))
      }
      reflection.groups = reflection.groups.filter(g => g.children.length > 0)
    }

    // Also remove component-props from the project's own groups so they don't
    // render as standalone Interfaces on the project index page.
    const projectPropsSet = componentPropsInterfaces(context.project)
    if (projectPropsSet.size > 0) {
      for (const group of context.project.groups ?? []) {
        group.children = group.children.filter(
          c => !projectPropsSet.has(c as DeclarationReflection),
        )
      }
      if (context.project.groups) {
        context.project.groups = context.project.groups.filter(g => g.children.length > 0)
      }
    }
  }
}

export class SDKThemeContext extends MarkdownThemeContext {
  constructor(...args: ConstructorParameters<typeof MarkdownThemeContext>) {
    super(...args)

    const origMemberTitle = this.partials.memberTitle.bind(this)
    const origPageTitle = this.partials.pageTitle.bind(this)
    const origSignature = this.partials.signature.bind(this)
    const origSignatureTitle = this.partials.signatureTitle.bind(this)
    const origSignatureReturns = this.partials.signatureReturns.bind(this)
    const origParametersTable = this.partials.parametersTable.bind(this)
    const origPropertiesTable = this.partials.propertiesTable.bind(this)

    this.partials = {
      ...this.partials,
      memberTitle: (model: DeclarationReflection) => {
        const title = origMemberTitle(model)
        // Strip trailing () for components. Deprecated titles are wrapped in ~~...~~
        // so the () sits before the closing ~~ rather than at the very end.
        return isComponent(model) ? title.replace(/\(\)(~~)?$/, (_, tilde = '') => tilde) : title
      },
      pageTitle: () => {
        // The standalone page H1 normally comes from the pageTitle partial
        // (e.g. "Function: TerminationFlow()" via the reflection kind). For
        // components, reuse memberTitle so the page H1 matches how the component
        // is titled when listed inline (e.g. on the Blocks page) — no "Function:"
        // prefix and no trailing "()".
        const model = this.page.model
        if (model instanceof DeclarationReflection && isComponent(model)) {
          return this.partials.memberTitle(model)
        }
        return origPageTitle()
      },
      signature: (model: SignatureReflection, options: Parameters<typeof origSignature>[1]) => {
        const result = origSignature(model, options)

        // Component: rename "Parameters" heading to the Props type name.
        if (model.parent instanceof DeclarationReflection && isComponent(model.parent)) {
          if (model.parameters?.length !== 1) return result
          const param = model.parameters[0]!
          if (!(param.type instanceof ReferenceType)) return result
          const propsRef = param.type.reflection
          // The props interface is normally a sibling of the component (shared
          // namespace parent). On a standalone flow page the router re-parents the
          // props onto the flow itself so cross-references resolve to a cross-page
          // URL (see SDKRouter.buildChildPages), so also accept that case.
          if (
            !(propsRef instanceof DeclarationReflection) ||
            propsRef.kind !== ReflectionKind.Interface ||
            (propsRef.parent !== model.parent.parent && propsRef.parent !== model.parent)
          ) {
            return result
          }
          const hashes = '#'.repeat((options as { headingLevel: number }).headingLevel)
          return result.replace(`${hashes} Parameters`, `${hashes} ${propsRef.name}`)
        }

        // Hook (form or data): replace the generic "Parameters" heading with a
        // hard-coded "Props" section, and nest the props type name(s) one level
        // deeper as sub-entries. The fixed section name keeps the structure
        // uniform and scales to hooks that take more than one props input.
        const hookFn = model.parent
        if (hookFn instanceof DeclarationReflection) {
          const hookModel = getHookModel(hookFn)
          // Derived-alias props are not elevated, so their heading is left as-is.
          if (hookModel && hookModel.props.kind !== 'alias') {
            const propsName =
              hookModel.props.kind === 'interface'
                ? hookModel.props.interface.name
                : hookModel.props.alias.name
            const headingLevel = (options as { headingLevel: number }).headingLevel
            const hashes = '#'.repeat(headingLevel)
            const subHashes = '#'.repeat(headingLevel + 1)
            return result.replace(
              `${hashes} Parameters`,
              `${hashes} Props\n\n${subHashes} ${propsName}`,
            )
          }
        }

        return result
      },
      signatureTitle: (
        model: SignatureReflection,
        options?: Parameters<typeof origSignatureTitle>[1],
      ) => {
        if (model.parent instanceof DeclarationReflection && isComponent(model.parent)) {
          return ''
        }
        return origSignatureTitle(model, options)
      },
      signatureReturns: (
        model: SignatureReflection,
        options: Parameters<typeof origSignatureReturns>[1],
      ) => {
        if (model.parent instanceof DeclarationReflection && isComponent(model.parent)) {
          return ''
        }

        const base = origSignatureReturns(model, options)

        // Hook: append the Ready interface properties table after the returns
        // section. The Ready interface is the non-loading branch of the return
        // union, found via the type graph rather than a name convention. Only the
        // page's primary hook inlines it — secondary hooks on the same page (e.g.
        // useCurrentHomeAddressForm) reuse the same Ready and would double-inline.
        const hookFn = model.parent
        const pageModel = this.page?.model
        const isPrimaryHook =
          hookFn instanceof DeclarationReflection &&
          pageModel instanceof DeclarationReflection &&
          hookFn.name === pageModel.name
        if (hookFn instanceof DeclarationReflection && isPrimaryHook) {
          const readyType = getHookReadyInterface(hookFn)
          if (!readyType) return base
          const readyName = readyType.name

          const headingLevel = (options as { headingLevel: number }).headingLevel
          const subHashes = '#'.repeat(headingLevel + 1)

          const parts: string[] = [base]

          // The `UseXxxResult` return-union alias is removed from the Type
          // Aliases group (router); render it here as the first Returns sub-entry
          // so the union definition stays with the Returns section. memberContainer
          // emits its anchor, so signature and cross-page links still resolve.
          const siblings = (pageModel.children ?? []).filter(
            (c): c is DeclarationReflection => c instanceof DeclarationReflection,
          )
          const resultAlias = findHookResultAlias(siblings, readyType)
          if (resultAlias) {
            parts.push(
              this.partials.memberContainer(resultAlias, { headingLevel: headingLevel + 1 }),
            )
            // Divide the two Returns entries (result alias / Ready interface) the
            // same way sibling members are separated elsewhere on the page.
            parts.push('***')
          }

          if (this.router.hasUrl(readyType) && this.options.getValue('useHTMLAnchors')) {
            parts.push(`<a id="${this.router.getAnchor(readyType)}"></a>`)
          }
          parts.push(`${subHashes} ${readyName}`)

          if (readyType.comment) {
            const commentMd = this.partials.comment(readyType.comment, {
              showSummary: true,
              showTags: false,
            })
            if (commentMd.trim()) parts.push(commentMd)
          }

          // For TypeAlias `= { ... }`, properties live on type.declaration.children.
          const typeAliasDecl =
            readyType.kind === ReflectionKind.TypeAlias && readyType.type instanceof ReflectionType
              ? readyType.type.declaration
              : null
          const allProps = (typeAliasDecl?.children ?? readyType.children ?? []).filter(c =>
            c.isDeclaration(),
          )
          if (allProps.length > 0) {
            parts.push(
              this.partials.propertiesTable(allProps, {
                isEventProps: false,
                kind: ReflectionKind.Interface,
              }),
            )
          }

          return parts.join('\n\n')
        }

        return base
      },
      propertiesTable: (...args: Parameters<typeof origPropertiesTable>) => {
        let result = origPropertiesTable(...args)
        // Translations (translation-key) interfaces are all `string` (leaves) / `object`
        // (groups): the Type column is noise, so drop it for the Default value glossary.
        // The `Resources` map is the exception — its Type column links each namespace
        // row to its key interface, so keep it.
        if (
          args[0]?.some(prop => isTranslationsMember(prop)) &&
          args[0]?.[0]?.parent?.name !== RESOURCES_MAP_INTERFACE
        ) {
          result = dropTableColumn(result, 'Type')
        }
        const lines = result.split('\n')
        // Find the Default value column index from the header row so this stays
        // correct if other columns are hidden or reordered.
        const headerLine = lines.find(l => l.startsWith('|') && l.includes('Default value'))
        if (!headerLine) return result
        const defaultColIndex = headerLine.split('|').findIndex(h => h.trim() === 'Default value')
        if (defaultColIndex === -1) return result
        return lines
          .map(line => {
            if (!line.startsWith('|')) return line
            const cells = line.split('|')
            if (cells[defaultColIndex]?.trim() === '`undefined`') cells[defaultColIndex] = ' '
            return cells.join('|')
          })
          .join('\n')
      },
      parametersTable: (params: ParameterReflection[]) =>
        renderFunctionPropsTable(this, params, origParametersTable),
    }

    const origReflectionTemplate = this.templates.reflection.bind(this)
    this.templates = {
      ...this.templates,
      reflection: (page: MarkdownPageEvent<DeclarationReflection>) => {
        if (isDomainHub(page.model)) return renderDomainHub(this, page.model)
        if (isHooksIndex(page.model)) return renderHooksIndex(this, page.model)
        if (isNamespaceIndex(page.model)) return renderNamespaceIndex(this, page.model)
        if (isBlocksPage(page.model)) return renderBlocksPage(this, page.model)

        // Build the @components table, then strip the tag so the default
        // renderer doesn't also emit it as a raw block-tag section.
        const componentsTag = findComponentsTag(page.model)
        const componentsTable = componentsTag
          ? renderComponentsTable(this, componentsTag.tag, page.url)
          : null
        if (componentsTag) {
          componentsTag.comment.blockTags = componentsTag.comment.blockTags.filter(
            tag => tag !== componentsTag.tag,
          )
        }

        let rendered = origReflectionTemplate(page)
        // Standalone component pages are flow pages; front the Example and
        // Remarks ahead of the props table for readability.
        if (isComponent(page.model)) rendered = reorderComponentSections(rendered)
        if (componentsTable) rendered = insertComponentsTable(rendered, componentsTable)

        // Hook page: reformat section headings and inject fields table.
        if (isHookPage(page.model)) {
          const formModel = formHookModelForPage(page.model)
          rendered = reformatHookFunctionSection(rendered, page.model.name)
          rendered = addExampleTitles(rendered)
          rendered = moveExampleToTop(rendered)
          rendered = reorderHookSections(rendered)
          let relocatedFieldTypes = new Set<string>()
          if (formModel) {
            // A form hook always gets a `## Fields` section — if neither shape
            // renders, that's a hard error, never a silently field-less page.
            if (formModel.fieldsInterface && canRenderFlatFields(formModel.fieldsInterface)) {
              // Flat interface of single field components (`typeof XxxField` /
              // `ComponentType<XxxFieldProps>`) and/or arrays of field entries —
              // documented from the props types, no component-function value
              // required.
              const { markdown, relocated } = buildFlatFieldsSection(this, formModel)
              relocatedFieldTypes = relocated
              rendered = injectAfterReturns(rendered, markdown)
            } else if (formModel.fieldsInterface) {
              // Has a field shape the flat renderer doesn't handle yet (e.g.
              // `PreparerFieldGroup` groups) — keep the legacy quick-ref table.
              const fieldsTable = buildFieldsTable(this, page.model, formModel)
              if (!fieldsTable) {
                throw new HookModelError(
                  formModel.hookFn.name,
                  `Fields interface "${formModel.fieldsInterface.name}" produced no documentable fields`,
                )
              }
              rendered = injectFieldsSummary(rendered, fieldsTable)
            } else if (formModel.fieldsArrayAlias) {
              rendered = injectAfterReturns(
                rendered,
                buildFieldsArraySection(this, page.model, formModel),
              )
            } else {
              throw new HookModelError(
                formModel.hookFn.name,
                'form hook resolved no Fields interface or array alias to render',
              )
            }
          }
          rendered = removeComponentsHeader(rendered)
          rendered = dropFieldPropsAliases(
            rendered,
            new Set([...fieldComponentPropsAliasNames(page.model), ...relocatedFieldTypes]),
          )
        }

        const flowGuide = (this.router as SDKRouter).flowGuides.get(page.model)
        if (flowGuide) return renderGuidePage(rendered, flowGuide)
        const hookGuide = (this.router as SDKRouter).hookGuides.get(page.model)
        if (hookGuide) return renderHookGuidePage(rendered, hookGuide)
        return rendered
      },
    }
  }
}
