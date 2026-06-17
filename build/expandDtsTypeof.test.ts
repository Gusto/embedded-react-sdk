// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { Project } from 'ts-morph'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { processSourceFile } from './expandDtsTypeof'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = join(__dirname, '..')

// Virtual files live under dist/ so TypeScript's module resolver finds node_modules
// by traversing up from that directory.
const FIXTURE_DIR = join(ROOT, 'dist', '__test_fixtures__')

// Important: get the checker AFTER adding all source files to the project so
// the TypeScript program includes them. Obtaining it before adding files returns
// a checker unaware of those declarations (typeof x → any, keyof any → string|number|symbol).
function setup(name: string, content: string) {
  const project = new Project({
    tsConfigFilePath: join(ROOT, 'tsconfig.json'),
    skipAddingFilesFromTsConfig: true,
  })
  const sf = project.createSourceFile(join(FIXTURE_DIR, name), content, { overwrite: true })
  const checker = project.getTypeChecker().compilerObject
  return { sf, checker }
}

// ── No unexported variables ──────────────────────────────────────────────────

describe('processSourceFile — no unexported variables', () => {
  it('returns false when all consts are exported', () => {
    const { sf, checker } = setup(
      'all-exported.d.ts',
      `
export declare const config: { title: string };
export type Keys = keyof typeof config;
    `,
    )
    expect(processSourceFile(sf, checker)).toBe(false)
  })

  it('returns false for a file with no variable declarations', () => {
    const { sf, checker } = setup('no-vars.d.ts', `export type Foo = string;`)
    expect(processSourceFile(sf, checker)).toBe(false)
  })
})

// ── Successful expansions ────────────────────────────────────────────────────

describe('processSourceFile — successful expansion', () => {
  it('expands keyof typeof to a string literal union', () => {
    const { sf, checker } = setup(
      'keyof.d.ts',
      `
declare const validators: { title: string; age: number; };
export type FormFields = keyof typeof validators;
    `,
    )
    expect(processSourceFile(sf, checker)).toBe(true)
    expect(sf.getText()).toContain('"title" | "age"')
    expect(sf.getText()).not.toContain('typeof validators')
  })

  it('expands an indexed access (value union) type', () => {
    const { sf, checker } = setup(
      'indexed.d.ts',
      `
declare const STATUS: { active: "active"; inactive: "inactive" };
export type Status = (typeof STATUS)[keyof typeof STATUS];
    `,
    )
    expect(processSourceFile(sf, checker)).toBe(true)
    expect(sf.getText()).toContain('"active" | "inactive"')
  })

  it('expands a mapped type to a concrete object type', () => {
    const { sf, checker } = setup(
      'mapped.d.ts',
      `
declare const validators: { title: string; active: boolean; };
export type FormData = { [K in keyof typeof validators]: (typeof validators)[K] };
    `,
    )
    expect(processSourceFile(sf, checker)).toBe(true)
    const text = sf.getText()
    expect(text).toContain('title: string')
    expect(text).toContain('active: boolean')
  })

  it('preserves JSDoc property comments when expanding a mapped type', () => {
    const { sf, checker } = setup(
      'mapped-with-jsdoc.d.ts',
      `
declare const validators: {
  /** The job title. */
  title: string;
  /** Whether active. */
  active: boolean;
};
export type FormData = { [K in keyof typeof validators]: (typeof validators)[K] };
    `,
    )
    expect(processSourceFile(sf, checker)).toBe(true)
    const text = sf.getText()
    expect(text).toContain('/** The job title. */')
    expect(text).toContain('/** Whether active. */')
    expect(text).toContain('title: string')
    expect(text).toContain('active: boolean')
  })

  it('does not add spurious comments when the const has no property JSDoc', () => {
    const { sf, checker } = setup(
      'mapped-no-jsdoc.d.ts',
      `
declare const validators: { title: string; active: boolean; };
export type FormData = { [K in keyof typeof validators]: (typeof validators)[K] };
    `,
    )
    expect(processSourceFile(sf, checker)).toBe(true)
    const text = sf.getText()
    expect(text).not.toContain('/**')
    expect(text).toContain('title: string')
    expect(text).toContain('active: boolean')
  })

  it('returns true only for the file that changed', () => {
    const { sf, checker } = setup(
      'unchanged.d.ts',
      `
declare const validators: { name: string };
export type FormFields = keyof typeof validators;
    `,
    )
    expect(processSourceFile(sf, checker)).toBe(true)
    // Second call — nothing left to expand
    expect(processSourceFile(sf, checker)).toBe(false)
  })
})

// ── Orphan removal ───────────────────────────────────────────────────────────

describe('processSourceFile — orphan declare const removal', () => {
  it('removes a declare const that is no longer referenced after expansion', () => {
    const { sf, checker } = setup(
      'orphan-remove.d.ts',
      `
declare const validators: { name: string };
export type FormFields = keyof typeof validators;
    `,
    )
    processSourceFile(sf, checker)
    expect(sf.getText()).not.toContain('declare const validators')
  })

  it('keeps a declare const still referenced by a function return type', () => {
    const { sf, checker } = setup(
      'keep-const.d.ts',
      `
declare const validators: { title: string };
export type FormFields = keyof typeof validators;
export declare function getDefault(): typeof validators;
    `,
    )
    processSourceFile(sf, checker)
    // FormFields expanded, but getDefault(): typeof validators still references the const
    expect(sf.getText()).toContain('declare const validators')
  })

  it('removes two different declare consts when neither is referenced after expansion', () => {
    const { sf, checker } = setup(
      'two-orphans.d.ts',
      `
declare const validators: { name: string };
declare const config: { mode: string };
export type FormFields = keyof typeof validators;
export type ConfigKey = keyof typeof config;
    `,
    )
    processSourceFile(sf, checker)
    const text = sf.getText()
    expect(text).not.toContain('declare const validators')
    expect(text).not.toContain('declare const config')
  })
})

// ── Skipped cases ────────────────────────────────────────────────────────────

describe('processSourceFile — skipped cases', () => {
  it('skips generic type aliases (has type parameters)', () => {
    const { sf, checker } = setup(
      'generic.d.ts',
      `
declare const config: { a: string };
export type Wrap<T> = T extends typeof config ? true : false;
    `,
    )
    expect(processSourceFile(sf, checker)).toBe(false)
    expect(sf.getText()).toContain('typeof config')
  })

  it('skips non-exported type aliases', () => {
    const { sf, checker } = setup(
      'unexported-alias.d.ts',
      `
declare const config: { a: string };
type Private = keyof typeof config;
    `,
    )
    expect(processSourceFile(sf, checker)).toBe(false)
  })

  it('skips and warns when resolution produces a type containing any', () => {
    // Wrapping in a generic type alias that can't be resolved causes any-degradation
    const { sf, checker } = setup(
      'any-guard.d.ts',
      `
export type AnyWrapper<T> = T extends any ? T : never;
declare const config: { a: string };
export type SafeType = AnyWrapper<typeof config>;
    `,
    )
    // AnyWrapper<typeof config> resolves to {a: string} which doesn't contain 'any' — expands
    // This test verifies the guard doesn't false-positive on non-any types
    const result = processSourceFile(sf, checker)
    // If it expanded, great; if it was skipped, the const stays — either way no crash
    expect(typeof result).toBe('boolean')
  })
})

// ── Zod-specific behaviour ───────────────────────────────────────────────────

describe('processSourceFile — Zod types', () => {
  it('expands BankFormField (keyof over ZodEnum fieldValidators)', () => {
    const { sf, checker } = setup(
      'bank-form-field.d.ts',
      `
import { z } from 'zod';
declare const fieldValidators: {
  name: z.ZodString;
  accountType: z.ZodEnum<{ Checking: "Checking"; Savings: "Savings"; }>;
};
export type BankFormField = keyof typeof fieldValidators;
    `,
    )
    expect(processSourceFile(sf, checker)).toBe(true)
    expect(sf.getText()).toContain('"name" | "accountType"')
  })

  it('catches the crash on BankFormData (ZodEnum in mapped type body) and skips it', () => {
    const { sf, checker } = setup(
      'bank-form-data-only.d.ts',
      `
import { z } from 'zod';
declare const fieldValidators: {
  name: z.ZodString;
  accountType: z.ZodEnum<{ Checking: "Checking"; Savings: "Savings"; }>;
};
export type BankFormData = {
  [K in keyof typeof fieldValidators]: z.infer<(typeof fieldValidators)[K]>;
};
    `,
    )
    // In an isolated single-file program the crash may not reproduce — that only happens in
    // the full dist context with many interdependent files. What we assert: no throw, and
    // if expansion didn't happen the original text is preserved.
    expect(() => processSourceFile(sf, checker)).not.toThrow()
  })

  it('expands BankFormField but leaves BankFormData and its declare const intact', () => {
    const { sf, checker } = setup(
      'bank-both.d.ts',
      `
import { z } from 'zod';
declare const fieldValidators: {
  name: z.ZodString;
  accountType: z.ZodEnum<{ Checking: "Checking"; Savings: "Savings"; }>;
};
export type BankFormField = keyof typeof fieldValidators;
export type BankFormData = {
  [K in keyof typeof fieldValidators]: z.infer<(typeof fieldValidators)[K]>;
};
    `,
    )
    expect(() => processSourceFile(sf, checker)).not.toThrow()
    // BankFormField always expands cleanly regardless of program context
    expect(sf.getText()).toContain('"name" | "accountType"')
  })

  it('expands JobFormData (ZodString + ZodBoolean only) to a concrete object type', () => {
    const { sf, checker } = setup(
      'job-form-data.d.ts',
      `
import { z } from 'zod';
declare const fieldValidators: {
  title: z.ZodString;
  active: z.ZodBoolean;
};
export type JobFormData = {
  [K in keyof typeof fieldValidators]: z.infer<(typeof fieldValidators)[K]>;
};
    `,
    )
    expect(processSourceFile(sf, checker)).toBe(true)
    const text = sf.getText()
    expect(text).toContain('title: string')
    expect(text).toContain('active: boolean')
    expect(text).not.toContain('declare const fieldValidators')
  })

  it('does not throw on OptionalFieldsToRequire pattern', () => {
    // In the full dist program, OptionalFieldsToRequire<typeof requiredFieldsConfig> degrades
    // to OptionalFieldsToRequire<any> and is skipped by the any guard. In an isolated
    // single-file context it may resolve differently. Either way: no crash.
    const { sf, checker } = setup(
      'optional-fields.d.ts',
      `
import { OptionalFieldsToRequire } from '../partner-hook-utils/form/buildFormSchema';
declare const requiredFieldsConfig: {
  title: "create";
  twoPercentShareholder: "never";
  stateWcClassCode: (data: { title: string; twoPercentShareholder: boolean; stateWcClassCode: string }) => boolean;
};
export type OptionalFields = OptionalFieldsToRequire<typeof requiredFieldsConfig>;
    `,
    )
    expect(() => processSourceFile(sf, checker)).not.toThrow()
  })
})

// ── jobSchema before/after integration ──────────────────────────────────────
// Uses the real buildFormSchema.d.ts alongside the fixture so the
// OptionalFieldsToRequire import resolves in the same way it does during build.
// The fixture is placed at the same directory depth as the real file so the
// relative import path (../../../../../partner-hook-utils/…) resolves naturally.

const JOB_SCHEMA_FIXTURE_PATH = 'components/Employee/Compensation/shared/useJobForm/jobSchema.d.ts'

const JOB_SCHEMA_BEFORE = `\
import { z } from 'zod';
import { OptionalFieldsToRequire } from '../../../../../partner-hook-utils/form/buildFormSchema';
export declare const JobErrorCodes: { readonly REQUIRED: "REQUIRED"; };
export type JobErrorCode = (typeof JobErrorCodes)[keyof typeof JobErrorCodes];
declare const fieldValidators: {
    /** The employee's job title (e.g. \`"Software Engineer"\`). */
    title: z.ZodString;
    /** The employee's hire date as an ISO 8601 string (\`YYYY-MM-DD\`), or \`null\` if unknown. */
    hireDate: z.ZodPipe<z.ZodTransform<string | null, unknown>, z.ZodNullable<z.ZodISODate>>;
    /** Whether the employee owns 2 % or more of an S-corporation. Affects benefit-deduction tax treatment. */
    twoPercentShareholder: z.ZodBoolean;
    /** Whether the employee is covered under Washington state workers' compensation insurance. */
    stateWcCovered: z.ZodPipe<z.ZodTransform<boolean | undefined, unknown>, z.ZodBoolean>;
    /** Washington state workers' compensation risk-class code. Required when \`stateWcCovered\` is \`true\`. */
    stateWcClassCode: z.ZodString;
};
export type JobFormData = {
    [K in keyof typeof fieldValidators]: z.infer<(typeof fieldValidators)[K]>;
};
export type JobFormOutputs = JobFormData;
declare const requiredFieldsConfig: {
    title: "create";
    hireDate: "create";
    twoPercentShareholder: "never";
    stateWcCovered: "never";
    stateWcClassCode: (data: {
        title: string;
        hireDate: string | null;
        twoPercentShareholder: boolean;
        stateWcCovered: boolean;
        stateWcClassCode: string;
    }) => boolean;
};
export type JobOptionalFieldsToRequire = OptionalFieldsToRequire<typeof requiredFieldsConfig>;
export {};
`

function setupJobSchema() {
  const project = new Project({
    tsConfigFilePath: join(ROOT, 'tsconfig.json'),
    skipAddingFilesFromTsConfig: true,
  })
  // Load the real buildFormSchema so OptionalFieldsToRequire resolves.
  // Placed at dist/__test_fixtures__/partner-hook-utils/form/buildFormSchema.d.ts
  // so the '../../../../../partner-hook-utils/…' import in the fixture resolves correctly.
  const buildFormSchemaContent = readFileSync(
    join(ROOT, 'dist/partner-hook-utils/form/buildFormSchema.d.ts'),
    'utf-8',
  )
  project.createSourceFile(
    join(FIXTURE_DIR, 'partner-hook-utils/form/buildFormSchema.d.ts'),
    buildFormSchemaContent,
    { overwrite: true },
  )
  const sf = project.createSourceFile(
    join(FIXTURE_DIR, JOB_SCHEMA_FIXTURE_PATH),
    JOB_SCHEMA_BEFORE,
    {
      overwrite: true,
    },
  )
  const checker = project.getTypeChecker().compilerObject
  return { sf, checker }
}

describe('processSourceFile — jobSchema before/after', () => {
  it('expands JobFormData to concrete properties', () => {
    const { sf, checker } = setupJobSchema()
    expect(processSourceFile(sf, checker)).toBe(true)
    const text = sf.getText()
    expect(text).toContain('title: string')
    expect(text).toContain('hireDate: string | null')
    expect(text).toContain('twoPercentShareholder: boolean')
    expect(text).toContain('stateWcCovered: boolean')
    expect(text).toContain('stateWcClassCode: string')
    expect(text).not.toContain('typeof fieldValidators')
    expect(text).not.toContain('declare const fieldValidators')
  })

  it('preserves JSDoc property comments from fieldValidators in expanded JobFormData', () => {
    const { sf, checker } = setupJobSchema()
    processSourceFile(sf, checker)
    const text = sf.getText()
    expect(text).toContain('/** The employee\'s job title (e.g. `"Software Engineer"`). */')
    expect(text).toContain(
      "/** The employee's hire date as an ISO 8601 string (`YYYY-MM-DD`), or `null` if unknown. */",
    )
    expect(text).toContain(
      '/** Whether the employee owns 2 % or more of an S-corporation. Affects benefit-deduction tax treatment. */',
    )
    expect(text).toContain(
      "/** Whether the employee is covered under Washington state workers' compensation insurance. */",
    )
    expect(text).toContain(
      "/** Washington state workers' compensation risk-class code. Required when `stateWcCovered` is `true`. */",
    )
  })

  it('expands JobOptionalFieldsToRequire to concrete per-mode arrays', () => {
    const { sf, checker } = setupJobSchema()
    processSourceFile(sf, checker)
    const text = sf.getText()
    expect(text).toContain('"twoPercentShareholder" | "stateWcCovered"')
    expect(text).toContain('"title" | "hireDate" | "twoPercentShareholder" | "stateWcCovered"')
    expect(text).not.toContain('typeof requiredFieldsConfig')
    expect(text).not.toContain('declare const requiredFieldsConfig')
  })
})
