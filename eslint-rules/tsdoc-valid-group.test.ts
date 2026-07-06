import { describe, it } from 'vitest'
import { RuleTester } from '@typescript-eslint/rule-tester'
import parser from '@typescript-eslint/parser'
import rule from './tsdoc-valid-group'

RuleTester.describe = describe
RuleTester.it = it

const ruleTester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: { sourceType: 'module' },
  },
})

ruleTester.run('tsdoc-valid-group', rule, {
  valid: [
    // No @group tag — not our concern
    `/** @public */\nexport function useHomeAddressForm() {}`,

    // Valid component groups
    `/**\n * @group Flow components\n * @public\n */\nexport function EmployeeOnboardingFlow() {}`,
    `/**\n * @group Block components\n * @public\n */\nexport function DocumentsCard() {}`,
    `/**\n * @group Components\n * @public\n */\nexport function ApiProvider() {}`,

    // Valid hook groups
    `/**\n * @group Form hooks\n * @public\n */\nexport function useAddressForm() {}`,
    `/**\n * @group Data hooks\n * @public\n */\nexport function useEmployeeList() {}`,
    `/**\n * @group Utility hooks\n * @public\n */\nexport function useStateFields() {}`,
    `/**\n * @group Hooks\n * @public\n */\nexport function useCustomHook() {}`,

    // No TSDoc comment at all
    `export function useHomeAddressForm() {}`,
  ],

  invalid: [
    // Typo in group name
    {
      code: `/**\n * @group Utility Hook\n * @public\n */\nexport function useStateFields() {}`,
      errors: [{ messageId: 'invalidGroup' }],
    },

    // TypeDoc default group name — not in our custom list
    {
      code: `/**\n * @group Functions\n * @public\n */\nexport function useHomeAddressForm() {}`,
      errors: [{ messageId: 'invalidGroup' }],
    },

    // Completely wrong value
    {
      code: `/**\n * @group My Custom Group\n * @public\n */\nexport function useHomeAddressForm() {}`,
      errors: [{ messageId: 'invalidGroup' }],
    },
  ],
})
