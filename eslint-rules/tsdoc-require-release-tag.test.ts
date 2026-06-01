import { describe, it } from 'vitest'
import { RuleTester } from '@typescript-eslint/rule-tester'
import parser from '@typescript-eslint/parser'
import rule from './tsdoc-require-release-tag'

RuleTester.describe = describe
RuleTester.it = it

const ruleTester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: { sourceType: 'module' },
  },
})

ruleTester.run('tsdoc-require-release-tag', rule, {
  valid: [
    // All valid release tags
    `/** @public */\nexport function foo(): void {}`,
    `/** @beta */\nexport function foo(): void {}`,
    `/** @alpha */\nexport function foo(): void {}`,
    `/** @internal */\nexport function foo(): void {}`,

    // No comment: rule does not fire without a TSDoc comment present
    `export function foo(): void {}`,

    // Single-star block comment is not TSDoc: not checked
    `/* not TSDoc */\nexport function foo(): void {}`,

    // Release tag alongside other tags
    `/**\n * Description.\n *\n * @param x - the input\n * @returns string\n * @public\n */\nexport function foo(x: string): string { return x }`,

    // export { foo }: release tag on the declaration
    `/** @internal */\nfunction helper(): void {}\nexport { helper }`,
  ],

  invalid: [
    // TSDoc comment present but missing release tag
    {
      code: `/** Description. */\nexport function foo(): void {}`,
      errors: [{ messageId: 'missingReleaseTag' }],
    },
    {
      code: `/**\n * @param x - the input\n * @returns string\n */\nexport function foo(x: string): string { return x }`,
      errors: [{ messageId: 'missingReleaseTag' }],
    },
    // Tag exists in the middle of a line
    {
      code: `/**\n * @param x - this is an @internal property\n */\nexport function foo(x: string): string { return x }`,
      errors: [{ messageId: 'missingReleaseTag' }],
    },
    // export { foo }: comment on declaration but no release tag
    {
      code: `/** Description. */\nfunction helper(): void {}\nexport { helper }`,
      errors: [{ messageId: 'missingReleaseTag' }],
    },
    // export default
    {
      code: `/** Description. */\nexport default function foo(): void {}`,
      errors: [{ messageId: 'missingReleaseTag' }],
    },
  ],
})
