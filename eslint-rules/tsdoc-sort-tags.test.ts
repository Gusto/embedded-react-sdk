import { describe, it } from 'vitest'
import { RuleTester } from '@typescript-eslint/rule-tester'
import parser from '@typescript-eslint/parser'
import rule from './tsdoc-sort-tags'

RuleTester.describe = describe
RuleTester.it = it

const ruleTester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: { sourceType: 'module' },
  },
})

ruleTester.run('tsdoc-sort-tags', rule, {
  valid: [
    // Single-line comment has only one chunk — early return, never reported
    `/** @internal */\nfunction foo(): void {}`,

    // Description only — still only one chunk
    `/**\n * Description.\n */\nfunction foo(): void {}`,

    // Tag only, no description — single non-description chunk
    `/**\n * @public\n */\nfunction foo(): void {}`,

    // Correctly ordered tags with blank line between description and tag group
    `/**\n * Description.\n *\n * @param x - the input\n * @returns string\n * @public\n */\nfunction foo(x: string): string { return x }`,

    // @remarks in group 2, other tags in group 3, each group separated by a blank line
    `/**\n * Description.\n *\n * @remarks Some notes.\n *\n * @param x - the input\n * @public\n */\nfunction foo(x: string): void {}`,

    // @example as its own group at the end
    `/**\n * Description.\n *\n * @public\n *\n * @example\n * foo()\n */\nfunction foo(): void {}`,

    // Multiple @example blocks — each is its own group
    `/**\n * Description.\n *\n * @public\n *\n * @example\n * foo(1)\n *\n * @example\n * foo(2)\n */\nfunction foo(): void {}`,

    // @components is its own group between @remarks and the other tags
    `/**\n * Description.\n *\n * @remarks Notes.\n *\n * @components\n * - {@link Bar}\n *\n * @public\n */\nfunction foo(): void {}`,
  ],

  invalid: [
    // Tags out of order: @public appears before @param and @returns
    {
      code: `/**\n * Description.\n *\n * @public\n * @param x - the input\n * @returns string\n */\nfunction foo(x: string): string { return x }`,
      output: `/**\n * Description.\n *\n * @param x - the input\n * @returns string\n * @public\n */\nfunction foo(x: string): string { return x }`,
      errors: [{ messageId: 'incorrectGrouping' }],
    },

    // Description not separated from tags by a blank line
    {
      code: `/**\n * Description.\n * @public\n */\nfunction foo(): void {}`,
      output: `/**\n * Description.\n *\n * @public\n */\nfunction foo(): void {}`,
      errors: [{ messageId: 'incorrectGrouping' }],
    },

    // @remarks in wrong position: appears after @param instead of before it
    {
      code: `/**\n * Description.\n *\n * @param x - the input\n * @remarks Some notes.\n * @public\n */\nfunction foo(x: string): void {}`,
      output: `/**\n * Description.\n *\n * @remarks Some notes.\n *\n * @param x - the input\n * @public\n */\nfunction foo(x: string): void {}`,
      errors: [{ messageId: 'incorrectGrouping' }],
    },

    // @example in the middle: must move to end as its own group
    {
      code: `/**\n * Description.\n *\n * @example\n * foo()\n *\n * @param x - the input\n * @public\n */\nfunction foo(x: string): void {}`,
      output: `/**\n * Description.\n *\n * @param x - the input\n * @public\n *\n * @example\n * foo()\n */\nfunction foo(x: string): void {}`,
      errors: [{ messageId: 'incorrectGrouping' }],
    },

    // @components must be its own group, separated from the other tags by a blank line
    {
      code: `/**\n * Description.\n *\n * @components\n * - {@link Bar}\n * @public\n */\nfunction foo(): void {}`,
      output: `/**\n * Description.\n *\n * @components\n * - {@link Bar}\n *\n * @public\n */\nfunction foo(): void {}`,
      errors: [{ messageId: 'incorrectGrouping' }],
    },
  ],
})
