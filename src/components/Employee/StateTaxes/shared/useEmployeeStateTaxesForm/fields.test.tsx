import { describe, expect, it } from 'vitest'
import { createStateFields } from './fields'
import {
  caEmployeeStateTaxes,
  emptyStateTaxes,
  inEmployeeStateTaxes,
  multiStateEmployeeStateTaxes,
  nyEmployeeStateTaxes,
  unknownTypeStateTaxes,
} from './__fixtures__/stateTaxesFixtures'

describe('createStateFields', () => {
  it('binds each question to a typed Field component with stable questionId', () => {
    const groups = createStateFields(caEmployeeStateTaxes, { isAdmin: false })

    expect(groups).toHaveLength(1)
    const ca = groups[0]!
    expect(ca.state).toBe('CA')
    expect(ca.questions).toHaveLength(3)

    const filingStatus = ca.questions.find(q => q.questionId === 'filingStatus')!
    expect(filingStatus.type).toBe('select')
    expect(filingStatus.label).toBe('Filing Status')
    expect(typeof filingStatus.Field).toBe('function')
  })

  it('promotes file_new_hire_report to radio when admin', () => {
    const groups = createStateFields(caEmployeeStateTaxes, { isAdmin: true })
    const ca = groups[0]!
    const fileNewHireReport = ca.questions.find(q => q.questionId === 'fileNewHireReport')

    expect(fileNewHireReport).toBeDefined()
    expect(fileNewHireReport!.type).toBe('radio')
  })

  it('hides admin-only questions when isAdmin is false', () => {
    const groups = createStateFields(caEmployeeStateTaxes, { isAdmin: false })
    const ca = groups[0]!

    expect(ca.questions.find(q => q.questionId === 'fileNewHireReport')).toBeUndefined()
  })

  it('produces all six variants from the NY fixture', () => {
    const groups = createStateFields(nyEmployeeStateTaxes, { isAdmin: true })
    const variants = new Set(groups[0]!.questions.map(q => q.type))

    expect(variants).toContain('select')
    expect(variants).toContain('radio')
    expect(variants).toContain('number')
    expect(variants).toContain('currency')
    expect(variants).toContain('date')
  })

  it('produces text variant for IN occupational_code (admin)', () => {
    const groups = createStateFields(inEmployeeStateTaxes, { isAdmin: true })
    const occ = groups[0]!.questions.find(q => q.questionId === 'occupationalCode')

    expect(occ).toBeDefined()
    expect(occ!.type).toBe('text')
  })

  it('preserves API response order across multi-state', () => {
    const groups = createStateFields(multiStateEmployeeStateTaxes, { isAdmin: false })

    expect(groups.map(g => g.state)).toEqual(['CA', 'NY'])
    expect(groups[0]!.questions.map(q => q.questionId)).toEqual([
      'filingStatus',
      'withholdingAllowance',
    ])
    expect(groups[1]!.questions.map(q => q.questionId)).toEqual([
      'filingStatus',
      'withholdingAllowance',
    ])
  })

  it('skips groups whose questions array is empty (e.g. no-income-tax states like TX)', () => {
    const groups = createStateFields(emptyStateTaxes, { isAdmin: false })

    expect(groups).toEqual([])
  })

  it('skips groups that become empty after admin-only filtering', () => {
    const adminOnlyState = [
      {
        ...caEmployeeStateTaxes[0]!,
        state: 'XX',
        questions: caEmployeeStateTaxes[0]!.questions!.map(q => ({
          ...q,
          isQuestionForAdminOnly: true,
        })),
      },
    ]

    const groups = createStateFields(adminOnlyState, { isAdmin: false })

    expect(groups).toEqual([])
  })

  it('falls through unknown wire types to text variant', () => {
    const groups = createStateFields(unknownTypeStateTaxes, { isAdmin: false })
    const mystery = groups[0]!.questions[0]!

    expect(mystery.type).toBe('text')
    expect(mystery.questionId).toBe('mysteryField')
  })
})
