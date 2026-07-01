import { describe, it } from 'vitest'
import { RuleTester } from '@typescript-eslint/rule-tester'
import parser from '@typescript-eslint/parser'
import rule from './tsdoc-require-form-fields-component-type'

RuleTester.describe = describe
RuleTester.it = it

const ruleTester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: { sourceType: 'module' },
  },
})

ruleTester.run('tsdoc-require-form-fields-component-type', rule, {
  valid: [
    // Members typed as ComponentType<*FieldProps> — the exemplar shape
    `export interface FooFormFields {\n  Name: ComponentType<NameFieldProps>\n}`,
    // Conditionally rendered field, still ComponentType
    `export interface FooFormFields {\n  Name: ComponentType<NameFieldProps> | undefined\n}`,
    // typeof of something that isn't a *Field — out of scope
    `export interface FooFormFields {\n  Preparer: PreparerFieldGroup\n}`,
    `interface Bar {\n  value: typeof someConfig\n}`,
  ],

  invalid: [
    // Bare typeof {Field}Field
    {
      code: `export interface FooFormFields {\n  Name: typeof NameField\n}`,
      errors: [
        {
          messageId: 'useComponentType',
          data: { member: 'Name', field: 'NameField', iface: 'FooFormFields' },
        },
      ],
    },
    // typeof {Field}Field inside a union (conditionally rendered field)
    {
      code: `export interface FooFormFields {\n  UsedPreparer: typeof UsedPreparerField | undefined\n}`,
      errors: [
        {
          messageId: 'useComponentType',
          data: { member: 'UsedPreparer', field: 'UsedPreparerField', iface: 'FooFormFields' },
        },
      ],
    },
    // Not name-gated — a misnamed Fields interface is caught too
    {
      code: `export interface PayScheduleFields {\n  Frequency: typeof FrequencyField\n}`,
      errors: [
        {
          messageId: 'useComponentType',
          data: { member: 'Frequency', field: 'FrequencyField', iface: 'PayScheduleFields' },
        },
      ],
    },
  ],
})
