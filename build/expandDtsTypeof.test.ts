// @vitest-environment node
import { describe, it, expect } from 'vitest'
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
  it('returns false and leaves text unchanged when all consts are exported', () => {
    const input = `export declare const config: { title: string };
export type Keys = keyof typeof config;
`
    const { sf, checker } = setup('all-exported.d.ts', input)
    expect(processSourceFile(sf, checker)).toBeNull()
    expect(sf.getText()).toBe(input)
  })

  it('returns false and leaves text unchanged for a file with no variable declarations', () => {
    const input = `export type Foo = string;\n`
    const { sf, checker } = setup('no-vars.d.ts', input)
    expect(processSourceFile(sf, checker)).toBeNull()
    expect(sf.getText()).toBe(input)
  })
})

// ── Successful expansions ────────────────────────────────────────────────────

describe('processSourceFile — successful expansion', () => {
  it('expands keyof typeof to a string literal union and removes the orphaned const', () => {
    const { sf, checker } = setup(
      'keyof.d.ts',
      `declare const validators: { title: string; age: number; };
export type FormFields = keyof typeof validators;
`,
    )
    expect(processSourceFile(sf, checker)).not.toBeNull()
    expect(sf.getText()).toMatchInlineSnapshot(`
      "export type FormFields = "title" | "age";
      "
    `)
  })

  it('expands an indexed access (value union) type and removes the orphaned const', () => {
    const { sf, checker } = setup(
      'indexed.d.ts',
      `declare const STATUS: { active: "active"; inactive: "inactive" };
export type Status = (typeof STATUS)[keyof typeof STATUS];
`,
    )
    expect(processSourceFile(sf, checker)).not.toBeNull()
    expect(sf.getText()).toMatchInlineSnapshot(`
      "export type Status = "active" | "inactive";
      "
    `)
  })

  it('expands a mapped type to a concrete object type and removes the orphaned const', () => {
    const { sf, checker } = setup(
      'mapped.d.ts',
      `declare const validators: { title: string; active: boolean; };
export type FormData = { [K in keyof typeof validators]: (typeof validators)[K] };
`,
    )
    expect(processSourceFile(sf, checker)).not.toBeNull()
    expect(sf.getText()).toMatchInlineSnapshot(`
      "export type FormData = { title: string; active: boolean; };
      "
    `)
  })

  it('preserves JSDoc property comments when expanding a mapped type', () => {
    const { sf, checker } = setup(
      'mapped-with-jsdoc.d.ts',
      `declare const validators: {
  /** The job title. */
  title: string;
  /** Whether active. */
  active: boolean;
};
export type FormData = { [K in keyof typeof validators]: (typeof validators)[K] };
`,
    )
    expect(processSourceFile(sf, checker)).not.toBeNull()
    expect(sf.getText()).toMatchInlineSnapshot(`
      "export type FormData = {
            /** The job title. */
            title: string
            /** Whether active. */
            active: boolean
          };
      "
    `)
  })

  it('does not add spurious comments when the const has no property JSDoc', () => {
    const { sf, checker } = setup(
      'mapped-no-jsdoc.d.ts',
      `declare const validators: { title: string; active: boolean; };
export type FormData = { [K in keyof typeof validators]: (typeof validators)[K] };
`,
    )
    expect(processSourceFile(sf, checker)).not.toBeNull()
    expect(sf.getText()).toMatchInlineSnapshot(`
      "export type FormData = { title: string; active: boolean; };
      "
    `)
  })

  it('returns false on a second call when nothing is left to expand', () => {
    const { sf, checker } = setup(
      'unchanged.d.ts',
      `declare const validators: { name: string };
export type FormFields = keyof typeof validators;
`,
    )
    expect(processSourceFile(sf, checker)).not.toBeNull()
    expect(processSourceFile(sf, checker)).toBeNull()
  })
})

// ── Orphan removal ───────────────────────────────────────────────────────────

describe('processSourceFile — orphan declare const removal', () => {
  it('keeps a declare const still referenced by a function return type', () => {
    const { sf, checker } = setup(
      'keep-const.d.ts',
      `declare const validators: { title: string };
export type FormFields = keyof typeof validators;
export declare function getDefault(): typeof validators;
`,
    )
    processSourceFile(sf, checker)
    expect(sf.getText()).toMatchInlineSnapshot(`
      "declare const validators: { title: string };
      export type FormFields = "title";
      export declare function getDefault(): typeof validators;
      "
    `)
  })

  it('removes two different declare consts when neither is referenced after expansion', () => {
    const { sf, checker } = setup(
      'two-orphans.d.ts',
      `declare const validators: { name: string };
declare const config: { mode: string };
export type FormFields = keyof typeof validators;
export type ConfigKey = keyof typeof config;
`,
    )
    processSourceFile(sf, checker)
    expect(sf.getText()).toMatchInlineSnapshot(`
      "export type FormFields = "name";
      export type ConfigKey = "mode";
      "
    `)
  })
})

// ── Skipped cases ────────────────────────────────────────────────────────────

describe('processSourceFile — skipped cases', () => {
  it('skips generic type aliases and leaves the file unchanged', () => {
    const input = `declare const config: { a: string };
export type Wrap<T> = T extends typeof config ? true : false;
`
    const { sf, checker } = setup('generic.d.ts', input)
    expect(processSourceFile(sf, checker)).toBeNull()
    expect(sf.getText()).toBe(input)
  })

  it('skips non-exported type aliases and leaves the file unchanged', () => {
    const input = `declare const config: { a: string };
type Private = keyof typeof config;
`
    const { sf, checker } = setup('unexported-alias.d.ts', input)
    expect(processSourceFile(sf, checker)).toBeNull()
    expect(sf.getText()).toBe(input)
  })
})

// ── Zod-specific behaviour ───────────────────────────────────────────────────

describe('processSourceFile — Zod types', () => {
  it('expands BankFormField (keyof over ZodEnum fieldValidators)', () => {
    const { sf, checker } = setup(
      'bank-form-field.d.ts',
      `import { z } from 'zod';
declare const fieldValidators: {
  name: z.ZodString;
  accountType: z.ZodEnum<{ Checking: "Checking"; Savings: "Savings"; }>;
};
export type BankFormField = keyof typeof fieldValidators;
`,
    )
    expect(processSourceFile(sf, checker)).not.toBeNull()
    expect(sf.getText()).toMatchInlineSnapshot(`
      "import { z } from 'zod';
      export type BankFormField = "name" | "accountType";
      "
    `)
  })

  it('expands BankFormData (ZodEnum in mapped type body) to a concrete object type', () => {
    const { sf, checker } = setup(
      'bank-form-data-only.d.ts',
      `import { z } from 'zod';
declare const fieldValidators: {
  name: z.ZodString;
  accountType: z.ZodEnum<{ Checking: "Checking"; Savings: "Savings"; }>;
};
export type BankFormData = {
  [K in keyof typeof fieldValidators]: z.infer<(typeof fieldValidators)[K]>;
};
`,
    )
    expect(processSourceFile(sf, checker)).not.toBeNull()
    expect(sf.getText()).toMatchInlineSnapshot(`
      "import { z } from 'zod';
      export type BankFormData = { name: string; accountType: "Checking" | "Savings"; };
      "
    `)
  })

  it('expands BankFormField and leaves BankFormData intact when it cannot be resolved', () => {
    const { sf, checker } = setup(
      'bank-both.d.ts',
      `import { z } from 'zod';
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
    expect(sf.getText()).toMatchInlineSnapshot(`
      "import { z } from 'zod';
      export type BankFormField = "name" | "accountType";
      export type BankFormData = { name: string; accountType: "Checking" | "Savings"; };
      "
    `)
  })

  it('expands JobFormData (ZodString + ZodBoolean only) to a concrete object type', () => {
    const { sf, checker } = setup(
      'job-form-data.d.ts',
      `import { z } from 'zod';
declare const fieldValidators: {
  title: z.ZodString;
  active: z.ZodBoolean;
};
export type JobFormData = {
  [K in keyof typeof fieldValidators]: z.infer<(typeof fieldValidators)[K]>;
};
`,
    )
    expect(processSourceFile(sf, checker)).not.toBeNull()
    expect(sf.getText()).toMatchInlineSnapshot(`
      "import { z } from 'zod';
      export type JobFormData = { title: string; active: boolean; };
      "
    `)
  })

  it('does not throw on OptionalFieldsToRequire pattern', () => {
    // In the full dist program, OptionalFieldsToRequire<typeof requiredFieldsConfig> degrades
    // to OptionalFieldsToRequire<any> and is skipped by the any guard. In an isolated
    // single-file context it may resolve differently. Either way: no crash.
    const input = `import { OptionalFieldsToRequire } from '../partner-hook-utils/form/buildFormSchema';
declare const requiredFieldsConfig: {
  title: "create";
  twoPercentShareholder: "never";
  stateWcClassCode: (data: { title: string; twoPercentShareholder: boolean; stateWcClassCode: string }) => boolean;
};
export type OptionalFields = OptionalFieldsToRequire<typeof requiredFieldsConfig>;
`
    const { sf, checker } = setup('optional-fields.d.ts', input)
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

// Minimal declaration for the types the jobSchema fixture imports.
// Inlined so the test runs without a prior build (no dist/ required).
// Keep in sync with the OptionalOnCreate/OptionalOnUpdate/OptionalFieldsToRequire
// definitions in src/partner-hook-utils/form/buildFormSchema.ts.
const BUILD_FORM_SCHEMA_DTS = `
type OptionalOnCreate<TConfig> = \`\${{
  [K in keyof TConfig & string]: TConfig[K] extends 'update' | 'never' ? K : never;
}[keyof TConfig & string]}\`;
type OptionalOnUpdate<TConfig> = \`\${{
  [K in keyof TConfig & string]: TConfig[K] extends 'create' | 'never' ? K : never;
}[keyof TConfig & string]}\`;
export type OptionalFieldsToRequire<TConfig> = {
  create?: Array<OptionalOnCreate<TConfig>>;
  update?: Array<OptionalOnUpdate<TConfig>>;
};
`

function setupJobSchema() {
  const project = new Project({
    tsConfigFilePath: join(ROOT, 'tsconfig.json'),
    skipAddingFilesFromTsConfig: true,
  })
  // Placed at dist/__test_fixtures__/partner-hook-utils/form/buildFormSchema.d.ts
  // so the '../../../../../partner-hook-utils/…' import in the fixture resolves correctly.
  project.createSourceFile(
    join(FIXTURE_DIR, 'partner-hook-utils/form/buildFormSchema.d.ts'),
    BUILD_FORM_SCHEMA_DTS,
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
  it('transforms the full jobSchema fixture to the expected output', () => {
    const { sf, checker } = setupJobSchema()
    expect(processSourceFile(sf, checker)).not.toBeNull()
    expect(sf.getText()).toMatchInlineSnapshot(`
      "import { z } from 'zod';
      import { OptionalFieldsToRequire } from '../../../../../partner-hook-utils/form/buildFormSchema';
      export declare const JobErrorCodes: { readonly REQUIRED: "REQUIRED"; };
      export type JobErrorCode = (typeof JobErrorCodes)[keyof typeof JobErrorCodes];
      export type JobFormData = {
            /** The employee's job title (e.g. \`"Software Engineer"\`). */
            title: string
            /** The employee's hire date as an ISO 8601 string (\`YYYY-MM-DD\`), or \`null\` if unknown. */
            hireDate: string | null
            /** Whether the employee owns 2 % or more of an S-corporation. Affects benefit-deduction tax treatment. */
            twoPercentShareholder: boolean
            /** Whether the employee is covered under Washington state workers' compensation insurance. */
            stateWcCovered: boolean
            /** Washington state workers' compensation risk-class code. Required when \`stateWcCovered\` is \`true\`. */
            stateWcClassCode: string
          };
      export type JobFormOutputs = JobFormData;
      export type JobOptionalFieldsToRequire = { create?: ("twoPercentShareholder" | "stateWcCovered")[] | undefined; update?: ("title" | "hireDate" | "twoPercentShareholder" | "stateWcCovered")[] | undefined; };
      export {};
      "
    `)
  })
})
