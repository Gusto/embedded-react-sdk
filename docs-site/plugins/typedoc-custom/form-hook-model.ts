import {
  DeclarationReflection,
  IntersectionType,
  ReferenceType,
  ReflectionKind,
  ReflectionType,
  UnionType,
  type SomeType,
} from 'typedoc'

/**
 * Structured model of a form hook's documentable parts, derived entirely from
 * the TypeScript type graph (never from name conventions).
 *
 * A hook is recognized as a form hook when its return type is a union with a
 * branch whose interface extends {@link https://github.com/gusto/embedded-react-sdk | `BaseFormHookReady`}.
 * Once recognized, every part below must be extractable or the build hard-fails
 * via {@link FormHookModelError} — a malformed form hook is a bug, not a
 * silently-degraded page.
 */
export interface FormHookModel {
  /** The hook function reflection (e.g. `useBankForm`). */
  hookFn: DeclarationReflection
  /** The hook's props parameter, as either a single interface or a discriminated union. */
  props: FormHookProps
  /** The `UseXxxFormReady` interface — the ready branch of the return union. */
  readyInterface: DeclarationReflection
  /**
   * The `Fields` component map interface (3rd type arg of `BaseFormHookReady`),
   * or `null` when `Fields` is not a flat interface map — e.g. an array of
   * per-group field bundles (`StateTaxFieldsGroup[]`). A `null` here means no
   * flat fields quick-reference table is generated for the hook.
   */
  fieldsInterface: DeclarationReflection | null
  /** The form data type (2nd type arg of `BaseFormHookReady`); interface or alias. */
  formDataType: SomeType
  /** The fields-metadata type (1st type arg of `BaseFormHookReady`). */
  fieldsMetadataType: SomeType
}

/** The hook's props as a single interface. */
export interface InterfaceProps {
  kind: 'interface'
  interface: DeclarationReflection
}

/** One branch of a discriminated-union props type. */
export interface PropsUnionBranch {
  /** Inline object properties unique to this branch (e.g. `companyId`, `employeeId`). */
  inlineProps: DeclarationReflection[]
}

/** The hook's props as a discriminated union (e.g. create vs update mode). */
export interface UnionProps {
  kind: 'union'
  /** The `UseXxxFormProps` type alias whose declared type is the union. */
  alias: DeclarationReflection
  /** The base props type shared by every branch (e.g. `UseXxxFormSharedProps`), if any. */
  shared: DeclarationReflection | null
  /** The union branches, each carrying its discriminating inline props. */
  branches: PropsUnionBranch[]
}

/**
 * The hook's props as a derived type alias that is neither a single interface
 * nor a discriminated union — e.g. `Omit<UseXxxFormProps, 'k'>` on a secondary
 * hook. Not elevated; rendered with the default parameter table.
 */
export interface AliasProps {
  kind: 'alias'
  alias: DeclarationReflection
}

export type FormHookProps = InterfaceProps | UnionProps | AliasProps

/** Thrown when a recognized form hook is missing a part the renderer requires. */
export class FormHookModelError extends Error {
  constructor(hookName: string, detail: string) {
    super(`Form hook "${hookName}": ${detail}`)
    this.name = 'FormHookModelError'
  }
}

const BASE_FORM_READY = 'BaseFormHookReady'

const cache = new Map<DeclarationReflection, FormHookModel | null>()

/**
 * Build (or return the cached) {@link FormHookModel} for a hook function.
 * Returns `null` when the function is not a form hook. Throws
 * {@link FormHookModelError} when it is a form hook but malformed.
 */
export function getFormHookModel(hookFn: DeclarationReflection): FormHookModel | null {
  if (cache.has(hookFn)) return cache.get(hookFn)!
  const model = extractFormHookModel(hookFn)
  cache.set(hookFn, model)
  return model
}

/**
 * Find the primary form hook function on a synthetic hook-page namespace and
 * return its model. Prefers the function whose name matches the namespace
 * (e.g. `useBankForm` on the `useBankForm` page), falling back to the first
 * function child that resolves to a form hook.
 */
export function formHookModelForPage(hookNs: DeclarationReflection): FormHookModel | null {
  const functions = (hookNs.children ?? []).filter(
    (c): c is DeclarationReflection =>
      c instanceof DeclarationReflection && c.kind === ReflectionKind.Function,
  )
  const primary = functions.find(f => f.name === hookNs.name)
  if (primary) return getFormHookModel(primary)
  for (const fn of functions) {
    const model = getFormHookModel(fn)
    if (model) return model
  }
  return null
}

function extendsBaseFormReady(ref: DeclarationReflection): boolean {
  return (ref.extendedTypes ?? []).some(
    et => et instanceof ReferenceType && et.name === BASE_FORM_READY,
  )
}

/**
 * Resolve a return type to its union — directly when annotated inline
 * (`HookLoadingResult | UseXxxReady`), or by unwrapping a named alias
 * (`UseXxxResult = HookLoadingResult | UseXxxReady`).
 */
function asReturnUnion(returnType: SomeType | undefined): UnionType | null {
  if (returnType instanceof UnionType) return returnType
  if (
    returnType instanceof ReferenceType &&
    returnType.reflection instanceof DeclarationReflection &&
    returnType.reflection.kind === ReflectionKind.TypeAlias &&
    returnType.reflection.type instanceof UnionType
  ) {
    return returnType.reflection.type
  }
  return null
}

/**
 * The ready-state interface of any hook (form or data) — the non-loading branch
 * of its return union. Type-based, independent of naming. Returns null when the
 * hook's return is not a `HookLoadingResult | …Ready` union.
 */
export function getHookReadyInterface(hookFn: DeclarationReflection): DeclarationReflection | null {
  const union = asReturnUnion(hookFn.signatures?.[0]?.type)
  if (!union) return null
  for (const member of union.types) {
    if (
      member instanceof ReferenceType &&
      member.reflection instanceof DeclarationReflection &&
      member.reflection.kind === ReflectionKind.Interface &&
      member.name !== 'HookLoadingResult'
    ) {
      return member.reflection
    }
  }
  return null
}

/** The ready branch of a hook's return-type union, or null when not a form hook. */
function findReadyBranch(returnType: SomeType | undefined): DeclarationReflection | null {
  const union = asReturnUnion(returnType)
  if (!union) return null
  for (const member of union.types) {
    if (
      member instanceof ReferenceType &&
      member.reflection instanceof DeclarationReflection &&
      member.reflection.kind === ReflectionKind.Interface &&
      extendsBaseFormReady(member.reflection)
    ) {
      return member.reflection
    }
  }
  return null
}

function extractFormHookModel(hookFn: DeclarationReflection): FormHookModel | null {
  const sig = hookFn.signatures?.[0]
  if (!sig) return null

  const readyInterface = findReadyBranch(sig.type)
  if (!readyInterface) return null

  // From here the hook IS a form hook — any missing part is a hard error.
  const baseRef = (readyInterface.extendedTypes ?? []).find(
    (et): et is ReferenceType => et instanceof ReferenceType && et.name === BASE_FORM_READY,
  )
  if (!baseRef) {
    throw new FormHookModelError(hookFn.name, `${readyInterface.name} does not extend ${BASE_FORM_READY}`)
  }

  const typeArgs = baseRef.typeArguments ?? []
  if (typeArgs.length < 3) {
    throw new FormHookModelError(
      hookFn.name,
      `${BASE_FORM_READY} has ${typeArgs.length} type arguments, expected 3`,
    )
  }
  const [fieldsMetadataType, formDataType, fieldsArg] = typeArgs

  // Fields is a flat interface map for most hooks, but some expose an array of
  // per-group bundles (e.g. StateTaxFieldsGroup[]) — a valid shape with no flat
  // table. Only a reference that fails to resolve is an integrity error.
  let fieldsInterface: DeclarationReflection | null = null
  if (fieldsArg instanceof ReferenceType) {
    if (!(fieldsArg.reflection instanceof DeclarationReflection)) {
      throw new FormHookModelError(
        hookFn.name,
        `Fields type argument references "${fieldsArg.name}" which did not resolve`,
      )
    }
    fieldsInterface = fieldsArg.reflection
  }

  const propParam = sig.parameters?.[0]
  if (!propParam) {
    throw new FormHookModelError(hookFn.name, 'has no props parameter')
  }
  const props = extractProps(hookFn.name, propParam.type)

  return { hookFn, props, readyInterface, fieldsInterface, formDataType, fieldsMetadataType }
}

function extractProps(hookName: string, propType: SomeType | undefined): FormHookProps {
  if (!(propType instanceof ReferenceType) || !(propType.reflection instanceof DeclarationReflection)) {
    throw new FormHookModelError(
      hookName,
      `props parameter is not a resolvable reference (got ${propType?.type ?? 'none'})`,
    )
  }
  const ref = propType.reflection

  if (ref.kind === ReflectionKind.Interface) {
    return { kind: 'interface', interface: ref }
  }

  // Union-of-intersections alias → discriminated props (rendered first-class).
  if (ref.kind === ReflectionKind.TypeAlias && ref.type instanceof UnionType) {
    return extractUnionProps(hookName, ref, ref.type)
  }

  // Any other alias shape (e.g. Omit<…> on a derived hook) is valid but not
  // elevated — the theme renders it with the default parameter table.
  return { kind: 'alias', alias: ref }
}

function extractUnionProps(
  hookName: string,
  alias: DeclarationReflection,
  union: UnionType,
): UnionProps {
  const branches: PropsUnionBranch[] = []
  const sharedSets: Set<DeclarationReflection>[] = []

  for (const member of union.types) {
    if (!(member instanceof IntersectionType)) {
      throw new FormHookModelError(
        hookName,
        `union props branch is not an intersection (got ${member.type})`,
      )
    }
    const refMembers = new Set<DeclarationReflection>()
    const inlineProps: DeclarationReflection[] = []
    for (const part of member.types) {
      if (part instanceof ReferenceType && part.reflection instanceof DeclarationReflection) {
        refMembers.add(part.reflection)
      } else if (part instanceof ReflectionType) {
        inlineProps.push(...(part.declaration.children ?? []))
      }
    }
    sharedSets.push(refMembers)
    branches.push({ inlineProps })
  }

  // The shared base is the reference present in every branch.
  const shared =
    sharedSets.length > 0
      ? ([...sharedSets[0]!].find(ref => sharedSets.every(s => s.has(ref))) ?? null)
      : null

  return { kind: 'union', alias, shared, branches }
}
