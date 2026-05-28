import { describe, it } from 'vitest'
import { RuleTester } from '@typescript-eslint/rule-tester'
import parser from '@typescript-eslint/parser'
import rule from './tsdoc-require-comment'

RuleTester.describe = describe
RuleTester.it = it

const ruleTester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: { sourceType: 'module' },
  },
})

ruleTester.run('tsdoc-require-comment', rule, {
  valid: [
    // Basic export kinds
    `/** @public */\nexport function foo(): void {}`,
    `/** @public */\nexport const foo = 1`,
    `/** @public */\nexport interface Foo { x: number }`,
    `/** @public */\nexport type Foo = { x: number }`,
    `/** @public */\nexport class Foo {}`,
    `/** @public */\nexport enum Foo { A }`,

    // Non-exported symbols are ignored
    `function foo(): void {}`,
    `const foo = 1`,

    // Overloads: a comment on the first signature is sufficient
    [
      `/** @public */`,
      `export function foo(x: string): void`,
      `export function foo(x: number): void`,
      `export function foo(x: string | number): void {}`,
    ].join('\n'),

    // export { foo }: comment lives on the declaration, not the specifier
    `/** @public */\nfunction helper(): void {}\nexport { helper }`,

    // export default
    `/** @public */\nexport default function foo(): void {}`,
    `/** @public */\nexport default class Foo {}`,
  ],

  invalid: [
    {
      code: `export function foo(): void {}`,
      errors: [{ messageId: 'missingTSDoc' }],
    },
    {
      code: `export const foo = 1`,
      errors: [{ messageId: 'missingTSDoc' }],
    },
    {
      code: `export interface Foo { x: number }`,
      errors: [{ messageId: 'missingTSDoc' }],
    },
    {
      code: `export type Foo = { x: number }`,
      errors: [{ messageId: 'missingTSDoc' }],
    },
    {
      code: `export class Foo {}`,
      errors: [{ messageId: 'missingTSDoc' }],
    },
    {
      code: `export enum Foo { A }`,
      errors: [{ messageId: 'missingTSDoc' }],
    },
    // Overloads with no comment: only one error (deduplication by name)
    {
      code: [
        `export function foo(x: string): void`,
        `export function foo(x: number): void`,
        `export function foo(x: string | number): void {}`,
      ].join('\n'),
      errors: [{ messageId: 'missingTSDoc' }],
    },
    // export { foo } with no comment on the declaration
    {
      code: `function helper(): void {}\nexport { helper }`,
      errors: [{ messageId: 'missingTSDoc' }],
    },
    // export default
    {
      code: `export default function foo(): void {}`,
      errors: [{ messageId: 'missingTSDoc' }],
    },
    {
      code: `export default class Foo {}`,
      errors: [{ messageId: 'missingTSDoc' }],
    },
  ],
})
