import { describe, expect, it } from 'vitest'
import {
  createEmployeeStateTaxesSchema,
  EmployeeStateTaxesErrorCodes,
} from './employeeStateTaxesSchema'
import {
  caEmployeeStateTaxes,
  emptyStateTaxes,
  inEmployeeStateTaxes,
  multiStateEmployeeStateTaxes,
  nyEmployeeStateTaxes,
  unknownTypeStateTaxes,
  unsetAnswersStateTaxes,
} from './__fixtures__/stateTaxesFixtures'

describe('createEmployeeStateTaxesSchema', () => {
  describe('CA fixture (live capture)', () => {
    it('admin=false: hides the file_new_hire_report question and validates remaining fields', () => {
      const [schema, config] = createEmployeeStateTaxesSchema(caEmployeeStateTaxes, {
        isAdmin: false,
      })

      const visibleKeys = config.groups[0]!.questions.map(q => q.formKey)
      expect(visibleKeys).toEqual(['filingStatus', 'withholdingAllowance', 'additionalWithholding'])
      expect(visibleKeys).not.toContain('fileNewHireReport')

      const result = schema.safeParse({
        states: {
          CA: { filingStatus: 'S', withholdingAllowance: 1, additionalWithholding: 0 },
        },
      })
      expect(result.success).toBe(true)
    })

    it('admin=true: includes file_new_hire_report and promotes it to radio variant', () => {
      const [, config] = createEmployeeStateTaxesSchema(caEmployeeStateTaxes, { isAdmin: true })

      const fileNewHireReport = config.groups[0]!.questions.find(
        q => q.formKey === 'fileNewHireReport',
      )
      expect(fileNewHireReport).toBeDefined()
      expect(fileNewHireReport!.variant).toBe('radio')
      expect(fileNewHireReport!.isWireSelectWithBooleanOptions).toBe(true)
    })

    it('marks file_new_hire_report as disabled in metadata when an answer is recorded', () => {
      const [, config] = createEmployeeStateTaxesSchema(caEmployeeStateTaxes, { isAdmin: true })
      const metadata = config.getFieldsMetadata()

      expect(metadata['states.CA.fileNewHireReport']?.isDisabled).toBe(true)
    })

    it('reports REQUIRED for missing required field', () => {
      const [schema] = createEmployeeStateTaxesSchema(caEmployeeStateTaxes, { isAdmin: false })

      const result = schema.safeParse({
        states: {
          CA: { filingStatus: '', withholdingAllowance: undefined, additionalWithholding: 0 },
        },
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        const required = result.error.issues
          .filter(i => i.message === EmployeeStateTaxesErrorCodes.REQUIRED)
          .map(i => i.path.join('.'))
        expect(required).toContain('states.CA.filingStatus')
        expect(required).toContain('states.CA.withholdingAllowance')
      }
    })

    it('rejects NaN for number/currency fields with REQUIRED', () => {
      const [schema] = createEmployeeStateTaxesSchema(caEmployeeStateTaxes, { isAdmin: false })

      const result = schema.safeParse({
        states: {
          CA: { filingStatus: 'S', withholdingAllowance: NaN, additionalWithholding: NaN },
        },
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        const required = result.error.issues
          .filter(i => i.message === EmployeeStateTaxesErrorCodes.REQUIRED)
          .map(i => i.path.join('.'))
        expect(required).toContain('states.CA.withholdingAllowance')
        expect(required).toContain('states.CA.additionalWithholding')
      }
    })

    it('exposes options on metadata for select questions', () => {
      const [, config] = createEmployeeStateTaxesSchema(caEmployeeStateTaxes, { isAdmin: false })
      const metadata = config.getFieldsMetadata()

      const filingStatus = metadata['states.CA.filingStatus']
      expect(filingStatus).toMatchObject({
        name: 'states.CA.filingStatus',
        isRequired: true,
        options: [
          { value: 'S', label: 'Single' },
          { value: 'M', label: 'Married one income' },
          { value: 'MD', label: 'Married dual income' },
          { value: 'H', label: 'Head of household' },
          { value: 'E', label: 'Do Not Withhold' },
        ],
      })
    })
  })

  describe('NY fixture (synthesized)', () => {
    it('exposes every variant including admin Date and Select with boolean options', () => {
      const [, config] = createEmployeeStateTaxesSchema(nyEmployeeStateTaxes, { isAdmin: true })
      const variants = config.groups[0]!.questions.map(q => `${q.formKey}:${q.variant}`)

      expect(variants).toEqual([
        'filingStatus:select',
        'withholdingAllowance:number',
        'additionalWithholding:currency',
        'totalAllowancesNyc:number',
        'additionalWithholdingNyc:currency',
        'additionalWithholdingYonkers:currency',
        'fileNewHireReport:radio',
        'healthInsuranceAvailable:select',
        'insuranceQualificationDate:date',
      ])
    })

    it('admin=false hides admin-only questions', () => {
      const [, config] = createEmployeeStateTaxesSchema(nyEmployeeStateTaxes, { isAdmin: false })
      const visible = config.groups[0]!.questions.map(q => q.formKey)

      expect(visible).not.toContain('fileNewHireReport')
      expect(visible).not.toContain('healthInsuranceAvailable')
      expect(visible).not.toContain('insuranceQualificationDate')
    })

    it('accepts a valid Date object for date variant', () => {
      const [schema] = createEmployeeStateTaxesSchema(nyEmployeeStateTaxes, { isAdmin: true })

      const result = schema.safeParse({
        states: {
          NY: {
            filingStatus: 'S',
            withholdingAllowance: 0,
            additionalWithholding: 0,
            totalAllowancesNyc: 0,
            additionalWithholdingNyc: 0,
            additionalWithholdingYonkers: 0,
            fileNewHireReport: true,
            healthInsuranceAvailable: true,
            insuranceQualificationDate: new Date('2024-01-15'),
          },
        },
      })

      expect(result.success).toBe(true)
    })

    it('does not mark file_new_hire_report disabled when no answer is recorded', () => {
      const [, config] = createEmployeeStateTaxesSchema(nyEmployeeStateTaxes, { isAdmin: true })
      const metadata = config.getFieldsMetadata()

      expect(metadata['states.NY.fileNewHireReport']?.isDisabled).toBeUndefined()
    })
  })

  describe('IN fixture (synthesized)', () => {
    it('classifies the autocomplete-as-Select county fields as select variant', () => {
      const [, config] = createEmployeeStateTaxesSchema(inEmployeeStateTaxes, { isAdmin: true })
      const byKey = Object.fromEntries(config.groups[0]!.questions.map(q => [q.formKey, q.variant]))

      expect(byKey).toMatchObject({
        currentEmploymentCounty: 'select',
        currentResidenceCounty: 'select',
      })
    })

    it('classifies admin-only occupational_code as text variant', () => {
      const [, config] = createEmployeeStateTaxesSchema(inEmployeeStateTaxes, { isAdmin: true })
      const occ = config.groups[0]!.questions.find(q => q.formKey === 'occupationalCode')

      expect(occ).toBeDefined()
      expect(occ!.variant).toBe('text')
      expect(occ!.isAdminOnly).toBe(true)
    })
  })

  describe('multi-state fixture', () => {
    it('preserves API response order across states', () => {
      const [, config] = createEmployeeStateTaxesSchema(multiStateEmployeeStateTaxes, {
        isAdmin: false,
      })

      expect(config.groups.map(g => g.state)).toEqual(['CA', 'NY'])
      expect(config.groups[0]!.isWorkState).toBe(true)
      expect(config.groups[1]!.isWorkState).toBe(false)
    })

    it('namespaces each question under its own state path', () => {
      const [, config] = createEmployeeStateTaxesSchema(multiStateEmployeeStateTaxes, {
        isAdmin: false,
      })
      const metadata = config.getFieldsMetadata()

      expect(metadata['states.CA.filingStatus']).toBeDefined()
      expect(metadata['states.NY.filingStatus']).toBeDefined()
    })
  })

  describe('empty / unset / unknown fixtures', () => {
    it('emptyStateTaxes produces an empty group', () => {
      const [, config] = createEmployeeStateTaxesSchema(emptyStateTaxes, { isAdmin: false })

      expect(config.groups).toEqual([{ state: 'TX', isWorkState: true, questions: [] }])
    })

    it('unsetAnswers leaves every required field invalid until populated', () => {
      const [schema] = createEmployeeStateTaxesSchema(unsetAnswersStateTaxes, { isAdmin: false })

      const result = schema.safeParse({ states: { CA: {} } })

      expect(result.success).toBe(false)
      if (!result.success) {
        const required = result.error.issues
          .filter(i => i.message === EmployeeStateTaxesErrorCodes.REQUIRED)
          .map(i => i.path.join('.'))
        expect(required).toEqual(
          expect.arrayContaining([
            'states.CA.filingStatus',
            'states.CA.withholdingAllowance',
            'states.CA.additionalWithholding',
          ]),
        )
      }
    })

    it('unknownType falls through to text variant', () => {
      const [, config] = createEmployeeStateTaxesSchema(unknownTypeStateTaxes, { isAdmin: false })
      const variant = config.groups[0]!.questions[0]!.variant

      expect(variant).toBe('text')
    })
  })
})
