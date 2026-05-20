# api-extractor

`@microsoft/api-extractor` reads the compiled `dist/index.d.ts` and produces a machine-readable model of the public API surface. The output is anchored to the build — it documents what was actually compiled and exported, not what the source files say, so the docs can never drift from the real public surface.

**Important: the API report in particular is useful for development to validate potential changes to the public API contract.**

## What it produces

| File                               | Purpose                                                                       |
| ---------------------------------- | ----------------------------------------------------------------------------- |
| `embedded-react-sdk.api.json`      | Machine-readable API model; input for API Documenter and custom emitters      |
| `embedded-react-sdk.public.api.md` | Human-readable surface report; useful as a PR review artifact                 |
| `embedded-react-sdk.public.d.ts`   | Trimmed public type declarations; useful for consumers to inspect the surface |

The `.api.json` is the key artifact. It encodes every exported symbol — kind (function, interface, class, type alias, etc.), signature, TSDoc comment, release tag, and source location — in a structured format that downstream tools consume.

The `.api.md` report is valuable on its own even without a documentation step: it makes every public API change visible in the PR diff.

## TSDoc tags

The full set of recognized tags is in `tsdoc.json` at the project root. Tags fall into three groups.

### Release tags

These are API Extractor's primary mechanism for controlling what appears in the `.api.json`, `.api.md`, and `.d.ts` rollup. Every exported symbol should carry exactly one.

| Tag         | Effect on output                                                                                                                                                                                                                                                                        |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@public`   | Included in all outputs. The rollup `.d.ts` and generated docs only contain `@public` symbols by default.                                                                                                                                                                               |
| `@beta`     | Included in the API report (`.api.md`), but stripped from the public `.d.ts` rollup and excluded from generated docs (per current `releaseTagsToTrim` config).                                                                                                                          |
| `@alpha`    | Same as `@beta` — in the report, stripped from rollup and docs. Use for early-preview APIs.                                                                                                                                                                                             |
| `@internal` | Stripped from the public `.d.ts` rollup and excluded from generated docs. Still appears in the API report as a stripped symbol, so it's visible to reviewers but not to consumers. Use this for types that are reachable through signatures but should not be independently importable. |

Any exported symbol without one of these triggers an `ae-missing-release-tag` warning (currently set to `warning` in `api-extractor.json`).

The `ae-forgotten-export` warnings in the sample output (e.g. `UseEmployeeDetailsFormSharedProps`, `EmployeeDetailsFields`) are prime candidates for `@internal` — they're referenced in public signatures but aren't meant to be imported directly.

### Tags with special meaning in API Extractor

These go beyond plain documentation and affect how API Extractor processes or emits a symbol.

| Tag                      | What it does                                                                                                                                                                                                                                                    |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@packageDocumentation`  | Marks the doc comment for the package as a whole. Place in the entry point file (`src/index.ts`) on the file-level comment. API Extractor uses it to populate the package-level description in the `.api.json`.                                                 |
| `@privateRemarks`        | Remarks that are stripped before any output is generated. Safe for internal notes, implementation caveats, or workaround explanations that should never appear in partner-facing docs.                                                                          |
| `@inheritDoc`            | Copies the documentation from another symbol. API Extractor resolves this at extraction time, so the resolved text appears in the `.api.json` rather than a raw reference. Useful for keeping overloads or extending classes in sync without duplicating prose. |
| `@sealed`                | Documents that a class cannot be subclassed. API Extractor validates this against the type graph.                                                                                                                                                               |
| `@virtual` / `@override` | Document inheritance intent. API Extractor validates that `@override` is only applied to methods that actually override a base member.                                                                                                                          |

### Standard TSDoc tags (documentation only)

These work as you'd expect from the TSDoc spec and have no special extraction behavior beyond being included in the `.api.json` for downstream tools to render.

`@param`, `@returns`, `@typeParam`, `@throws`, `@remarks`, `@example`, `@deprecated`, `@defaultValue`, `@see`, `@link`, `@readonly`, `@experimental`

## Configuration — `api-extractor.json`

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/api-extractor/v7/api-extractor.schema.json",
  "mainEntryPointFilePath": "<projectFolder>/dist/index.d.ts",
  "compiler": {
    "tsconfigFilePath": "<projectFolder>/spike/autogen-docs/api-extractor/tsconfig.api-extractor.json"
  },
  "apiReport": {
    "enabled": true,
    "reportFolder": "<projectFolder>/spike/autogen-docs/api-extractor/",
    "reportTempFolder": "<projectFolder>/spike/autogen-docs/api-extractor/temp/",
    "reportVariants": ["public"]
  },
  "docModel": {
    "enabled": true,
    "apiJsonFilePath": "<projectFolder>/spike/autogen-docs/api-extractor/<unscopedPackageName>.api.json",
    "includeForgottenExports": false,
    "releaseTagsToTrim": ["@alpha", "@beta", "@internal"]
  },
  "dtsRollup": {
    "enabled": true,
    "publicTrimmedFilePath": "<projectFolder>/spike/autogen-docs/api-extractor/<unscopedPackageName>.public.d.ts"
  },
  "messages": {
    "extractorMessageReporting": {
      "ae-missing-release-tag": { "logLevel": "warning" }
    }
  }
}
```

**Key decisions:**

- `includeForgottenExports: false` — only symbols reachable from `index.d.ts` are included. Symbols exported from internal modules but not re-exported from the package entry point are excluded.
- `releaseTagsToTrim: ["@alpha", "@beta", "@internal"]` — these are stripped from the public `.d.ts` rollup and excluded from the doc model. Only `@public` symbols appear in generated docs.
- `ae-missing-release-tag: warning` — every exported symbol without an explicit `@public`, `@beta`, `@alpha`, or `@internal` tag triggers a warning. Currently a warning rather than an error to allow incremental adoption alongside `jsdoc/require-jsdoc`.

## Configuration — `tsconfig.api-extractor.json`

```json
{
  "compilerOptions": {
    "lib": ["ESNext", "DOM"],
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "jsx": "react-jsx",
    "declaration": true,
    "skipLibCheck": true,
    "strict": true
  },
  "files": ["dist/index.d.ts"]
}
```

A minimal config that points directly at the pre-built declarations. API Extractor uses it to resolve types without re-running the TypeScript compiler. `files: ["dist/index.d.ts"]` scopes it to the build output only.

## Scripts

```bash
npm run api-report:derive   # api-extractor run --local --config ...
npm run api-report:verify   # api-extractor run --config ...
```

**`derive` (`--local`)**: writes output to disk and permits the report to differ from the checked-in version. Run this locally after any change to the public API surface; commit the resulting changes to `.api.json` and `.api.md` alongside the source change.

**`verify` (no flag)**: exits non-zero if the freshly extracted report would differ from the checked-in `.api.md`. This is what runs in CI.

## What counts as a public API change

Run `api-report:derive` and commit the results whenever:

- An export is added, removed, or renamed in `src/index.ts`
- A function signature, type, or interface shape changes
- A TSDoc comment on a public symbol is added or modified
- A `@public` / `@beta` / `@internal` release tag changes

## CI

Fits the existing derive/verify pattern (same as `endpoints:verify`):

```yaml
- name: Restore build artifacts
  uses: actions/cache/restore@v5
  with:
    path: dist
    key: build-${{ github.sha }}

- name: Verify API report
  run: npm run api-report:verify
```

If CI fails with "API report is different", the fix is always `npm run build && npm run api-report:derive`.

## Sample output: `useEmployeeDetailsForm`

The following is an extract from `embedded-react-sdk.public.api.md` showing the entries generated for `useEmployeeDetailsForm.tsx`. Every symbol is present and typed correctly, but each is marked `(undocumented)` because no TSDoc comments exist yet — that's the signal that `eslint-plugin-tsdoc` would turn into a lint warning or error.

```
// @public (undocumented)
export type EmployeeDetailsFieldsMetadata = UseEmployeeDetailsFormReady['form']['fieldsMetadata'];

// @public (undocumented)
export type EmployeeDetailsFormFields = UseEmployeeDetailsFormReady['form']['Fields'];

// @public (undocumented)
export interface EmployeeDetailsSubmitCallbacks {
    // (undocumented)
    onEmployeeCreated?: (employee: Employee) => void;
    // (undocumented)
    onEmployeeUpdated?: (employee: Employee) => void;
    // (undocumented)
    onOnboardingStatusUpdated?: (status: unknown) => void;
}

// @public (undocumented)
export function useEmployeeDetailsForm(input: UseEmployeeDetailsFormProps): HookLoadingResult | UseEmployeeDetailsFormReady;

// Warning: (ae-forgotten-export) The symbol "UseEmployeeDetailsFormSharedProps" needs to be exported by the entry point index.d.ts
//
// @public (undocumented)
export type UseEmployeeDetailsFormProps = (UseEmployeeDetailsFormSharedProps & {
    companyId: string;
    employeeId?: never;
}) | (UseEmployeeDetailsFormSharedProps & {
    employeeId: string;
    companyId?: string;
});

// Warning: (ae-forgotten-export) The symbol "EmployeeDetailsFields" needs to be exported by the entry point index.d.ts
//
// @public (undocumented)
export interface UseEmployeeDetailsFormReady extends BaseFormHookReady<FieldsMetadata, EmployeeDetailsFormData, EmployeeDetailsFields> {
    // (undocumented)
    actions: {
        onSubmit: (callbacks?: EmployeeDetailsSubmitCallbacks) => Promise<HookSubmitResult<Employee> | undefined>;
    };
    // (undocumented)
    data: {
        employee: Employee | null;
    };
    // (undocumented)
    status: {
        isPending: boolean;
        mode: 'create' | 'update';
    };
}

// @public (undocumented)
export type UseEmployeeDetailsFormResult = HookLoadingResult | UseEmployeeDetailsFormReady;
```

Two things stand out beyond the missing docs:

- **`ae-forgotten-export` warnings** on `UseEmployeeDetailsFormSharedProps` and `EmployeeDetailsFields` — these types are referenced in the public API but not re-exported from `src/index.ts`. Consumers can see them in signatures but can't import them by name. Whether to export them or move them to the `@internal` release tag is a decision the surface report surfaces explicitly.
- **`EmployeeDetailsFormData` and `EmployeeDetailsFormOutputs`** also appear in the full report (not shown here), defined via a `z.infer<...>` mapped type. API Extractor resolves the Zod schema and emits the fully-expanded type shape — it doesn't leave `z.infer<...>` unexpanded.

## Relationship to other approaches

- **eslint-plugin-tsdoc** is the enforce step that runs before extraction. TSDoc comments on exported symbols are what API Extractor reads to populate descriptions. Without them, the `.api.json` contains signatures with no documentation text.
- The `.api.json` can feed a custom emitter (see the RFC) for generating browsable markdown in the structure the taxonomy requires. API Extractor can be adopted independently — the `.api.md` surface report is useful on its own without any downstream emit step.
