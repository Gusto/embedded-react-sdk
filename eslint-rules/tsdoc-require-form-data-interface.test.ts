import { describe, it } from 'vitest'
import { RuleTester } from '@typescript-eslint/rule-tester'
import parser from '@typescript-eslint/parser'
import rule from './tsdoc-require-form-data-interface'

RuleTester.describe = describe
RuleTester.it = it

const ruleTester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: { sourceType: 'module' },
  },
})

ruleTester.run('tsdoc-require-form-data-interface', rule, {
  valid: [
    // Already carries @interface
    `/**\n * Shape.\n *\n * @public\n * @interface\n */\ntype FooFormData = {\n  [K in keyof typeof v]: z.infer<(typeof v)[K]>\n}`,
    `/**\n * Shape.\n *\n * @public\n * @interface\n */\nexport type BarFormData = { name: z.infer<typeof s> }`,

    // Hand-authored interface — not a type alias, renders fine already
    `/**\n * @public\n */\ninterface BazFormData {\n  name: string\n}`,

    // Object alias but not Zod-derived (no z.infer) — out of scope
    `/**\n * @public\n */\ntype PlainFormData = { name: string }`,

    // Zod-derived object but not a FormData name — out of scope
    `/**\n * @public\n */\ntype FieldValues = { name: z.infer<typeof s> }`,

    // FormData alias whose body is not an object shape — out of scope
    `/**\n * @public\n */\ntype AliasFormData = OtherFormData`,

    // No TSDoc comment — left to the require-comment rule
    `type LonelyFormData = { name: z.infer<typeof s> }`,
  ],

  invalid: [
    // Mapped type missing @interface
    {
      code: `/**\n * Shape.\n *\n * @public\n */\ntype FooFormData = {\n  [K in keyof typeof v]: z.infer<(typeof v)[K]>\n}`,
      errors: [{ messageId: 'missingInterface', data: { name: 'FooFormData' } }],
      output: `/**\n * Shape.\n *\n * @public\n * @interface\n */\ntype FooFormData = {\n  [K in keyof typeof v]: z.infer<(typeof v)[K]>\n}`,
    },

    // Object literal missing @interface, on an exported alias (comment before `export`)
    {
      code: `/**\n * Shape.\n *\n * @public\n */\nexport type BarFormData = { name: z.infer<typeof s> }`,
      errors: [{ messageId: 'missingInterface', data: { name: 'BarFormData' } }],
      output: `/**\n * Shape.\n *\n * @public\n * @interface\n */\nexport type BarFormData = { name: z.infer<typeof s> }`,
    },
  ],
})
