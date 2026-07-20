import { describe, it } from 'vitest'
import { RuleTester } from '@typescript-eslint/rule-tester'
import parser from '@typescript-eslint/parser'
import rule from './tsdoc-require-hook-ready-interface'

RuleTester.describe = describe
RuleTester.it = it

const ruleTester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: { sourceType: 'module' },
  },
})

ruleTester.run('tsdoc-require-hook-ready-interface', rule, {
  valid: [
    // Pure alias already carries @interface
    `/**\n * Ready.\n *\n * @public\n * @interface\n */\nexport type UseFooReady = BaseHookReady<{ a: string }, { b: boolean }>`,
    `/**\n * Ready.\n *\n * @public\n * @interface\n */\ntype UseBarReady = BaseFormHookReady<M, D, F>`,

    // Hand-authored interface extending the base — not a type alias, fine
    `/**\n * @public\n */\ninterface UseBazReady extends BaseHookReady<{ a: string }, {}> {}`,

    // Alias unrelated to the hook-ready bases — out of scope
    `/**\n * @public\n */\nexport type Something = OtherBase<{ a: string }>`,

    // Pure alias with no TSDoc comment — left to the require-comment rule
    `export type UseLonelyReady = BaseHookReady<{ a: string }, {}>`,
  ],

  invalid: [
    // Pure reference missing @interface (exported — comment before `export`)
    {
      code: `/**\n * Ready.\n *\n * @public\n */\nexport type UseFooReady = BaseHookReady<{ a: string }, { b: boolean }>`,
      errors: [
        { messageId: 'missingInterface', data: { name: 'UseFooReady', base: 'BaseHookReady' } },
      ],
      output: `/**\n * Ready.\n *\n * @public\n * @interface\n */\nexport type UseFooReady = BaseHookReady<{ a: string }, { b: boolean }>`,
    },

    // Intersection adding members → should be an interface (not auto-fixable)
    {
      code: `/**\n * Ready.\n *\n * @public\n */\nexport type UseBarReady = BaseHookReady<{ a: string }, {}> & { extra: number }`,
      errors: [
        { messageId: 'shouldBeInterface', data: { name: 'UseBarReady', base: 'BaseHookReady' } },
      ],
    },

    // Intersection on the form base, base not in the first position
    {
      code: `/**\n * Ready.\n *\n * @public\n */\nexport type UseBazReady = { extra: number } & BaseFormHookReady<M, D, F>`,
      errors: [
        {
          messageId: 'shouldBeInterface',
          data: { name: 'UseBazReady', base: 'BaseFormHookReady' },
        },
      ],
    },
  ],
})
