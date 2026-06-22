import {
  Comment,
  type Context,
  DeclarationReflection,
  ParameterReflection,
  ReferenceType,
  ReflectionKind,
  type SignatureReflection,
} from 'typedoc'
import { MarkdownPageEvent, MarkdownTheme, MarkdownThemeContext } from 'typedoc-plugin-markdown'
import {
  componentPropsInterfaces,
  getDomainPath,
  getSidebarPosition,
  isComponent,
  isDomainHub,
  isHooksIndex,
  isNamespaceIndex,
  pageDescription,
  pageTitle,
  readDomainReadme,
  serializeFrontmatter as buildFrontmatterYaml,
} from './utils.ts'
import { SDKRouter } from './router.ts'
import { NAMESPACE_PATHS, TYPE_EMOJIS } from './router.config.ts'

function getReflectionDescription(
  reflection: DeclarationReflection,
  context: SDKThemeContext,
): string {
  const comment = reflection.signatures?.[0]?.comment ?? reflection.comment
  if (!comment) return ''
  return context.helpers.getDescriptionForComment(comment) ?? ''
}

function escapeJsxAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
}

function renderDomainHub(context: SDKThemeContext, model: DeclarationReflection): string {
  const parts: string[] = [`# ${model.name}`, '']

  const domainReadme = readDomainReadme(getDomainPath(model))
  if (domainReadme) parts.push(domainReadme, '')

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
      const subComponentsHref = nsRelPath ? `${nsRelPath}/sub-components` : 'sub-components'
      cards.push({
        type: 'link',
        href: subComponentsHref,
        label: `${TYPE_EMOJIS.block} ${blocks.length} sub-component${blocks.length === 1 ? '' : 's'}`,
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
 * Inject README prose into a rendered flow page, inserting it after the
 * first heading and before any existing content below that heading.
 */
function renderFlowPage(rendered: string, readme: string): string {
  const lines = rendered.split('\n')
  const headingIndex = lines.findIndex(l => /^#+\s/.test(l))
  if (headingIndex === -1) return `${readme}\n\n${rendered}`

  // Skip blank lines immediately after the heading so there's no double gap.
  let insertAt = headingIndex + 1
  while (insertAt < lines.length && lines[insertAt] === '') insertAt++

  return [...lines.slice(0, headingIndex + 1), '', readme, '', ...lines.slice(insertAt)].join('\n')
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
      signature: (model: SignatureReflection, options: Parameters<typeof origSignature>[1]) => {
        const result = origSignature(model, options)
        // For a component whose single parameter is an interface sibling in the
        // same namespace, replace the generated "Parameters" heading with the
        // Props type name (e.g. "#### FederalTaxesCardProps").
        if (!(model.parent instanceof DeclarationReflection) || !isComponent(model.parent)) {
          return result
        }
        if (model.parameters?.length !== 1) return result
        const param = model.parameters[0]!
        if (!(param.type instanceof ReferenceType)) return result
        const propsRef = param.type.reflection
        if (
          !(propsRef instanceof DeclarationReflection) ||
          propsRef.kind !== ReflectionKind.Interface ||
          propsRef.parent !== model.parent.parent
        ) {
          return result
        }
        const hashes = '#'.repeat(options.headingLevel)
        return result.replace(`${hashes} Parameters`, `${hashes} ${propsRef.name}`)
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
        return origSignatureReturns(model, options)
      },
      propertiesTable: (...args: Parameters<typeof origPropertiesTable>) => {
        const result = origPropertiesTable(...args)
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
      parametersTable: (params: ParameterReflection[]) => {
        // For a Component whose single parameter is an interface sibling in the
        // same namespace, inline the interface's properties directly instead of
        // showing a bare type reference. This renders: anchor + interface comment
        // (if any) + properties table — keeping the Props type co-located with
        // the component that uses it.
        if (params.length !== 1) return origParametersTable(params)

        const param = params[0]!
        const component = param.parent?.parent
        if (
          !(component instanceof DeclarationReflection) ||
          !isComponent(component) ||
          !(param.type instanceof ReferenceType)
        ) {
          return origParametersTable(params)
        }

        const propsRef = param.type.reflection
        if (
          !(propsRef instanceof DeclarationReflection) ||
          propsRef.kind !== ReflectionKind.Interface ||
          propsRef.parent !== component.parent
        ) {
          return origParametersTable(params)
        }

        const parts: string[] = []

        // Emit the anchor so that cross-references to this Props type still resolve.
        if (this.router.hasUrl(propsRef) && this.options.getValue('useHTMLAnchors')) {
          parts.push(`<a id="${this.router.getAnchor(propsRef)}"></a>`)
        }

        // Include any summary/remarks on the Props interface itself.
        if (propsRef.comment) {
          const commentMd = this.partials.comment(propsRef.comment, {
            showSummary: true,
            showTags: true,
          })
          if (commentMd.trim()) parts.push(commentMd)
        }

        const properties = (propsRef.children ?? []).filter(c => c.isDeclaration())
        if (properties.length > 0) {
          parts.push(
            this.partials.propertiesTable(properties, {
              isEventProps: false,
              kind: ReflectionKind.Interface,
            }),
          )
        }

        return parts.join('\n\n')
      },
    }

    const origReflectionTemplate = this.templates.reflection.bind(this)
    this.templates = {
      ...this.templates,
      reflection: (page: MarkdownPageEvent<DeclarationReflection>) => {
        if (isDomainHub(page.model)) return renderDomainHub(this, page.model)
        if (isHooksIndex(page.model)) return renderHooksIndex(this, page.model)
        if (isNamespaceIndex(page.model)) return renderNamespaceIndex(this, page.model)
        const flowReadme = (this.router as SDKRouter).flowReadmes.get(page.model)
        if (flowReadme) return renderFlowPage(origReflectionTemplate(page), flowReadme)
        return origReflectionTemplate(page)
      },
    }
  }
}
