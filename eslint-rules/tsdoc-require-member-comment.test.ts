import { describe, it } from 'vitest'
import { RuleTester } from '@typescript-eslint/rule-tester'
import parser from '@typescript-eslint/parser'
import rule from './tsdoc-require-member-comment'

RuleTester.describe = describe
RuleTester.it = it

const ruleTester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: { sourceType: 'module' },
  },
})

ruleTester.run('tsdoc-require-member-comment', rule, {
  valid: [
    // All members have any /** */ comment — content doesn't matter
    `/** @public */\nexport interface Foo {\n  /** A description. */\n  x: string\n}`,

    // Method signatures are also covered
    `/** @public */\nexport interface Foo {\n  /** Does something. */\n  bar(): void\n}`,

    // Empty interface — nothing to check
    `/** @public */\nexport interface Foo {}`,

    // @internal interface — members never need docs
    `/** @internal */\nexport interface Foo {\n  x: string\n}`,

    // Non-exported interface — ignored entirely
    `interface Foo {\n  x: string\n}`,

    // export { ExportedLater } with all members documented
    [
      'interface ExportedLater {',
      '  /** documented */',
      '  x: string',
      '}',
      'export { ExportedLater }',
    ].join('\n'),

    // @internal on re-exported interface — members don't need docs
    [
      '/** @internal */',
      'interface ExportedLater {',
      '  x: string',
      '}',
      'export { ExportedLater }',
    ].join('\n'),

    // Interface that is not re-exported, even when another export exists
    [
      'interface NotExported {',
      '  x: string',
      '}',
      '/** @public */',
      'export interface AlsoExported {}',
    ].join('\n'),
  ],

  invalid: [
    // Single undocumented member on inline export
    {
      code: `/** @public */\nexport interface Foo {\n  x: string\n}`,
      errors: [{ messageId: 'missingMemberTSDoc' }],
    },

    // One documented, one not — error only on undocumented
    {
      code: [
        '/** @public */',
        'export interface Foo {',
        '  /** documented */',
        '  x: string',
        '  y: number',
        '}',
      ].join('\n'),
      errors: [{ messageId: 'missingMemberTSDoc' }],
    },

    // Multiple undocumented members — one error per member
    {
      code: `/** @public */\nexport interface Foo {\n  x: string\n  y: number\n}`,
      errors: [{ messageId: 'missingMemberTSDoc' }, { messageId: 'missingMemberTSDoc' }],
    },

    // export { ExportedLater } with undocumented member
    {
      code: ['interface ExportedLater {', '  x: string', '}', 'export { ExportedLater }'].join(
        '\n',
      ),
      errors: [{ messageId: 'missingMemberTSDoc' }],
    },

    // No TSDoc on the interface itself — members still checked
    {
      code: [
        'interface ExportedLater {',
        '  x: string',
        '  y: number',
        '}',
        'export { ExportedLater }',
      ].join('\n'),
      errors: [{ messageId: 'missingMemberTSDoc' }, { messageId: 'missingMemberTSDoc' }],
    },

    // Method signature with no comment
    {
      code: `/** @public */\nexport interface Foo {\n  bar(): void\n}`,
      errors: [{ messageId: 'missingMemberTSDoc' }],
    },
  ],
})
