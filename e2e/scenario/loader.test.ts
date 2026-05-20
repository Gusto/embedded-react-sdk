import { mkdtempSync, writeFileSync, rmSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { applyTemplates, deepMerge, loadScenario, resolveScenario } from './loader'

describe('deepMerge', () => {
  it('merges nested objects, override wins on conflict', () => {
    const result = deepMerge({ a: 1, nested: { x: 1, y: 2 } }, { a: 2, nested: { y: 99, z: 3 } })
    expect(result).toEqual({ a: 2, nested: { x: 1, y: 99, z: 3 } })
  })

  it('replaces arrays rather than merging them', () => {
    const result = deepMerge({ list: [1, 2, 3] }, { list: [9] })
    expect(result).toEqual({ list: [9] })
  })

  it('returns override when base is primitive', () => {
    expect(deepMerge('a', 'b')).toBe('b')
    expect(deepMerge(null, { x: 1 })).toEqual({ x: 1 })
  })
})

describe('applyTemplates', () => {
  const baseDate = new Date(Date.UTC(2026, 0, 15)) // 2026-01-15 (Thursday)

  it('substitutes {{ts}} with provided value', () => {
    expect(applyTemplates('user+{{ts}}@example.com', { ts: 12345 })).toBe('user+12345@example.com')
  })

  it('substitutes {{relative:+Nd}} with baseDate + N days', () => {
    expect(applyTemplates('{{relative:+14d}}', { baseDate })).toBe('2026-01-29')
    expect(applyTemplates('{{relative:-7d}}', { baseDate })).toBe('2026-01-08')
  })

  it('substitutes {{relative:+Nd:DayName}} with next weekday >= +N', () => {
    // 2026-01-15 is Thursday; +1d -> Friday; expecting Friday stays at Friday
    expect(applyTemplates('{{relative:+1d:Friday}}', { baseDate })).toBe('2026-01-16')
    // 2026-01-15 + 14d = 2026-01-29 (Thursday); next Friday = 2026-01-30
    expect(applyTemplates('{{relative:+14d:Friday}}', { baseDate })).toBe('2026-01-30')
  })

  it('substitutes templates inside nested objects/arrays', () => {
    const result = applyTemplates(
      { email: 'a+{{ts}}@x.com', list: ['x', '{{relative:+1d}}'] },
      { ts: 1, baseDate },
    )
    expect(result).toEqual({ email: 'a+1@x.com', list: ['x', '2026-01-16'] })
  })

  it('throws on unknown template token', () => {
    expect(() => applyTemplates('{{unknown}}', {})).toThrow(/Unknown template token/)
  })
})

describe('resolveScenario + loadScenario (real fragment + minimal scenario)', () => {
  let tmp: string
  let scenarioPath: string

  beforeEach(() => {
    tmp = mkdtempSync(join(tmpdir(), 'scenario-loader-minimal-'))
    mkdirSync(join(tmp, 'fragments'), { recursive: true })
    mkdirSync(join(tmp, 'payroll'), { recursive: true })

    writeFileSync(
      join(tmp, 'fragments/w2-salaried.json'),
      JSON.stringify({
        first_name: 'Alice',
        last_name: 'Anderson',
        email: 'alice+{{ts}}@example.com',
        compensation: { rate: '85000', payment_unit: 'Year', flsa_status: 'Exempt' },
        onboarding_status: 'completed',
      }),
    )

    scenarioPath = join(tmp, 'payroll/minimal.json')
    writeFileSync(
      scenarioPath,
      JSON.stringify({
        name: 'Minimal payroll scenario (1 employee, biweekly)',
        domain: 'payroll',
        baseDemo: 'react_sdk_demo_company_onboarded',
        decorations: {
          locations: [
            {
              key: 'hq',
              street_1: '100 Test St',
              city: 'San Francisco',
              state: 'CA',
              zip: '94105',
              filing_address: true,
              mailing_address: true,
            },
          ],
          employees: [{ key: 'alice', $ref: '../fragments/w2-salaried.json' }],
          paySchedule: {
            frequency: 'Every other week',
            anchor_pay_date: '{{relative:+14d:Friday}}',
            anchor_end_of_pay_period: '{{relative:+13d}}',
          },
          payrolls: [],
        },
      }),
    )
  })

  afterEach(() => {
    rmSync(tmp, { recursive: true, force: true })
  })

  it('resolves the $ref fragment and merges with key', async () => {
    const resolved = await resolveScenario(scenarioPath)
    const employees = (resolved as { decorations: { employees: unknown[] } }).decorations.employees
    expect(employees).toHaveLength(1)
    expect(employees[0]).toMatchObject({
      key: 'alice',
      first_name: 'Alice',
      last_name: 'Anderson',
      compensation: { rate: '85000', payment_unit: 'Year' },
    })
  })

  it('loadScenario substitutes templates and passes schema validation', async () => {
    const scenario = await loadScenario(scenarioPath, {
      ts: 42,
      baseDate: new Date(Date.UTC(2026, 0, 15)),
    })
    expect(scenario.name).toBe('Minimal payroll scenario (1 employee, biweekly)')
    expect(scenario.domain).toBe('payroll')
    const employee = scenario.decorations.employees![0] as { email: string }
    expect(employee.email).toBe('alice+42@example.com')
    expect(scenario.decorations.paySchedule!.anchor_pay_date).toBe('2026-01-30')
    expect(scenario.decorations.paySchedule!.anchor_end_of_pay_period).toBe('2026-01-28')
  })
})

describe('resolveScenario with synthesized fixtures', () => {
  let tmp: string

  beforeEach(() => {
    tmp = mkdtempSync(join(tmpdir(), 'scenario-loader-'))
  })

  afterEach(() => {
    rmSync(tmp, { recursive: true, force: true })
  })

  function write(rel: string, content: object) {
    const path = join(tmp, rel)
    mkdirSync(join(tmp, rel.split('/').slice(0, -1).join('/')), {
      recursive: true,
    })
    writeFileSync(path, JSON.stringify(content))
    return path
  }

  it('detects cyclic $ref chains', async () => {
    write('fragments/a.json', { $ref: '../fragments/b.json' })
    write('fragments/b.json', { $ref: '../fragments/a.json' })
    const scenario = write('scenarios/cycle.json', {
      name: 'cycle',
      domain: 'payroll',
      baseDemo: 'react_sdk_demo',
      decorations: {
        employees: [{ $ref: '../fragments/a.json', key: 'oops' }],
      },
    })
    await expect(resolveScenario(scenario)).rejects.toThrow(/Cyclic \$ref detected/)
  })

  it('overrides win over sibling fields', async () => {
    write('fragments/employee.json', {
      first_name: 'Original',
      last_name: 'Person',
    })
    const scenario = write('scenarios/test.json', {
      name: 'override-test',
      domain: 'payroll',
      baseDemo: 'react_sdk_demo',
      decorations: {
        employees: [
          {
            $ref: '../fragments/employee.json',
            key: 'alice',
            overrides: { first_name: 'Overridden' },
          },
        ],
      },
    })
    const result = (await resolveScenario(scenario)) as {
      decorations: { employees: { first_name: string; last_name: string }[] }
    }
    expect(result.decorations.employees[0]!.first_name).toBe('Overridden')
    expect(result.decorations.employees[0]!.last_name).toBe('Person')
  })

  it('throws when schema validation fails on load', async () => {
    const scenario = write('scenarios/bad.json', {
      // missing required `name`
      domain: 'payroll',
      baseDemo: 'react_sdk_demo',
      decorations: {},
    })
    await expect(loadScenario(scenario)).rejects.toThrow(/Scenario validation failed/)
  })
})
