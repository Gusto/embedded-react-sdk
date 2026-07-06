import { describe, it } from 'vitest'
import { RuleTester } from '@typescript-eslint/rule-tester'
import parser from '@typescript-eslint/parser'
import rule from './no-literal-api-query-namespace'

RuleTester.describe = describe
RuleTester.it = it

const ruleTester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: { sourceType: 'module' },
  },
})

ruleTester.run('no-literal-api-query-namespace', rule, {
  valid: [
    // Already using the constant
    `const key = [API_QUERY_NAMESPACE, 'Locations']`,
    // Import specifier with a subpath is owned by use-embedded-api-alias, not this rule
    `import { useFoo } from '@gusto/embedded-api-v-2026-02-01/react-query/foo'`,
    // The bare alias (no version) is not the dated namespace
    `const s = '@gusto/embedded-api'`,
    // A bare date is the header value, not the namespace literal
    `const d = '2026-02-01'`,
    // Test files are excluded (vi.mock hoisting can't reference the imported constant)
    {
      code: `const key = ['@gusto/embedded-api-v-2026-02-01', 'holidayPayPolicies']`,
      filename: 'src/components/Foo/Foo.test.tsx',
    },
    // sdk-app is excluded (can't import the SDK-internal constant)
    {
      code: `queryClient.removeQueries({ queryKey: ['@gusto/embedded-api-v-2026-02-01', 'Contractors'] })`,
      filename: 'sdk-app/src/design/prototypes/contractor-management/ContractorList.tsx',
    },
  ],
  invalid: [
    // Bare namespace literal, no existing import → replace + insert import
    {
      code: `queryClient.invalidateQueries({ queryKey: ['@gusto/embedded-api-v-2026-02-01', 'Locations'] })`,
      output: `import { API_QUERY_NAMESPACE } from '@/contexts/ApiProvider/apiVersion'\nqueryClient.invalidateQueries({ queryKey: [API_QUERY_NAMESPACE, 'Locations'] })`,
      filename: 'src/components/Locations/LocationForm.tsx',
      errors: [{ messageId: 'useConstant', data: { value: '@gusto/embedded-api-v-2026-02-01' } }],
    },
    // Import already present → replace only
    {
      code: `import { API_QUERY_NAMESPACE } from '@/contexts/ApiProvider/apiVersion'\nconst key = ['@gusto/embedded-api-v-2026-02-01', 'x']`,
      output: `import { API_QUERY_NAMESPACE } from '@/contexts/ApiProvider/apiVersion'\nconst key = [API_QUERY_NAMESPACE, 'x']`,
      filename: 'src/foo.ts',
      errors: [{ messageId: 'useConstant' }],
    },
    // Version-agnostic: any dated namespace matches
    {
      code: `const key = ['@gusto/embedded-api-v-2099-12-31', 'x']`,
      output: `import { API_QUERY_NAMESPACE } from '@/contexts/ApiProvider/apiVersion'\nconst key = [API_QUERY_NAMESPACE, 'x']`,
      filename: 'src/foo.ts',
      errors: [{ messageId: 'useConstant' }],
    },
  ],
})
