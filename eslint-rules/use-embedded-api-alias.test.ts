import { describe, it } from 'vitest'
import { RuleTester } from '@typescript-eslint/rule-tester'
import parser from '@typescript-eslint/parser'
import rule from './use-embedded-api-alias'

RuleTester.describe = describe
RuleTester.it = it

const ruleTester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: { sourceType: 'module' },
  },
})

ruleTester.run('use-embedded-api-alias', rule, {
  valid: [
    // Already using the alias
    `import { useEmployeesListSuspense } from '@gusto/embedded-api/react-query/employeesList'`,
    `export type { Employee } from '@gusto/embedded-api/models/components/employee'`,
    // Unrelated packages are untouched
    `import { useForm } from 'react-hook-form'`,
    // The dated string in a non-specifier position (e.g. a query key) is left alone
    `const key = ['@gusto/embedded-api-v-2026-02-01', 'Locations']`,
    `queryClient.invalidateQueries({ queryKey: ['@gusto/embedded-api-v-2026-02-01', 'get'] })`,
    // A vi.mock of an unrelated module
    `vi.mock('@tanstack/react-query')`,
  ],
  invalid: [
    {
      code: `import { usePayrollsPrepareMutation } from '@gusto/embedded-api-v-2026-02-01/react-query/payrollsPrepare'`,
      output: `import { usePayrollsPrepareMutation } from '@gusto/embedded-api/react-query/payrollsPrepare'`,
      errors: [
        {
          messageId: 'useAlias',
          data: { dated: '@gusto/embedded-api-v-2026-02-01/react-query/payrollsPrepare' },
        },
      ],
    },
    {
      code: `import type { PayrollPrepared } from "@gusto/embedded-api-v-2026-02-01/models/components/payroll"`,
      output: `import type { PayrollPrepared } from "@gusto/embedded-api/models/components/payroll"`,
      errors: [{ messageId: 'useAlias' }],
    },
    {
      code: `export { PlaidStatus } from '@gusto/embedded-api-v-2099-12-31/models/components/companybankaccount'`,
      output: `export { PlaidStatus } from '@gusto/embedded-api/models/components/companybankaccount'`,
      errors: [{ messageId: 'useAlias' }],
    },
    {
      code: `export * from '@gusto/embedded-api-v-2026-02-01/models/components/employee'`,
      output: `export * from '@gusto/embedded-api/models/components/employee'`,
      errors: [{ messageId: 'useAlias' }],
    },
    {
      code: `const m = await import('@gusto/embedded-api-v-2026-02-01/core')`,
      output: `const m = await import('@gusto/embedded-api/core')`,
      errors: [{ messageId: 'useAlias' }],
    },
    {
      code: `vi.mock('@gusto/embedded-api-v-2026-02-01/react-query/employeesList', () => ({}))`,
      output: `vi.mock('@gusto/embedded-api/react-query/employeesList', () => ({}))`,
      errors: [{ messageId: 'useAlias' }],
    },
    // Bare specifier (no subpath) still routes to the alias
    {
      code: `import GustoEmbedded from '@gusto/embedded-api-v-2026-02-01'`,
      output: `import GustoEmbedded from '@gusto/embedded-api'`,
      errors: [{ messageId: 'useAlias' }],
    },
  ],
})
