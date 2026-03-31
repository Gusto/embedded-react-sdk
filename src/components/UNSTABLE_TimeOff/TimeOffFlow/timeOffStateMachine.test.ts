import { describe, expect, it } from 'vitest'
import { createMachine, interpret, type SendFunction } from 'robot3'
import { timeOffMachine } from './timeOffStateMachine'
import type { TimeOffFlowContextInterface } from './TimeOffFlowComponents'
import { componentEvents } from '@/shared/constants'

type TimeOffState =
  | 'policyList'
  | 'policyTypeSelector'
  | 'policyDetailsForm'
  | 'policySettings'
  | 'addEmployeesToPolicy'
  | 'viewPolicyDetails'
  | 'viewPolicyEmployees'
  | 'holidaySelectionForm'
  | 'addEmployeesHoliday'
  | 'viewHolidayEmployees'
  | 'viewHolidaySchedule'
  | 'final'

function createTestMachine(initialState: TimeOffState = 'policyList') {
  return createMachine(
    initialState,
    timeOffMachine,
    (initialContext: TimeOffFlowContextInterface) => ({
      ...initialContext,
      component: () => null,
      companyId: 'company-123',
    }),
  )
}

function createService(initialState: TimeOffState = 'policyList') {
  const machine = createTestMachine(initialState)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return interpret(machine, () => {}, {} as any)
}

function send(service: ReturnType<typeof createService>, type: string, payload?: unknown) {
  ;(service.send as SendFunction<string>)({ type, payload })
}

function toPolicyTypeSelector(service: ReturnType<typeof createService>) {
  send(service, componentEvents.TIME_OFF_CREATE_POLICY)
  expect(service.machine.current).toBe('policyTypeSelector')
}

function toPolicyDetailsForm(service: ReturnType<typeof createService>) {
  toPolicyTypeSelector(service)
  send(service, componentEvents.TIME_OFF_POLICY_TYPE_SELECTED, { policyType: 'vacation' })
  expect(service.machine.current).toBe('policyDetailsForm')
}

function toPolicySettings(service: ReturnType<typeof createService>) {
  toPolicyDetailsForm(service)
  send(service, componentEvents.TIME_OFF_POLICY_DETAILS_DONE, { policyId: 'policy-123' })
  expect(service.machine.current).toBe('policySettings')
}

function toAddEmployeesToPolicy(service: ReturnType<typeof createService>) {
  toPolicySettings(service)
  send(service, componentEvents.TIME_OFF_POLICY_SETTINGS_DONE)
  expect(service.machine.current).toBe('addEmployeesToPolicy')
}

function toHolidaySelectionForm(service: ReturnType<typeof createService>) {
  toPolicyTypeSelector(service)
  send(service, componentEvents.TIME_OFF_POLICY_TYPE_SELECTED, { policyType: 'holiday' })
  expect(service.machine.current).toBe('holidaySelectionForm')
}

function toAddEmployeesHoliday(service: ReturnType<typeof createService>) {
  toHolidaySelectionForm(service)
  send(service, componentEvents.TIME_OFF_HOLIDAY_SELECTION_DONE)
  expect(service.machine.current).toBe('addEmployeesHoliday')
}

describe('timeOffStateMachine', () => {
  describe('policyList state', () => {
    it('starts in policyList by default', () => {
      const service = createService()
      expect(service.machine.current).toBe('policyList')
    })

    it('transitions to policyTypeSelector on TIME_OFF_CREATE_POLICY', () => {
      const service = createService()

      send(service, componentEvents.TIME_OFF_CREATE_POLICY)

      expect(service.machine.current).toBe('policyTypeSelector')
      expect(service.context.alerts).toBeUndefined()
    })

    it('transitions to viewPolicyDetails on TIME_OFF_VIEW_POLICY with sick/vacation type', () => {
      const service = createService()

      send(service, componentEvents.TIME_OFF_VIEW_POLICY, {
        policyId: 'policy-456',
        policyType: 'vacation',
      })

      expect(service.machine.current).toBe('viewPolicyDetails')
      expect(service.context.policyId).toBe('policy-456')
      expect(service.context.policyType).toBe('vacation')
      expect(service.context.alerts).toBeUndefined()
    })

    it('transitions to viewHolidayEmployees on TIME_OFF_VIEW_POLICY with holiday type', () => {
      const service = createService()

      send(service, componentEvents.TIME_OFF_VIEW_POLICY, {
        policyId: 'policy-789',
        policyType: 'holiday',
      })

      expect(service.machine.current).toBe('viewHolidayEmployees')
      expect(service.context.policyId).toBe('policy-789')
      expect(service.context.policyType).toBe('holiday')
      expect(service.context.alerts).toBeUndefined()
    })
  })

  describe('policyTypeSelector state', () => {
    it('transitions to policyDetailsForm on sick type selection', () => {
      const service = createService()
      toPolicyTypeSelector(service)

      send(service, componentEvents.TIME_OFF_POLICY_TYPE_SELECTED, { policyType: 'sick' })

      expect(service.machine.current).toBe('policyDetailsForm')
      expect(service.context.policyType).toBe('sick')
      expect(service.context.alerts).toBeUndefined()
    })

    it('transitions to policyDetailsForm on vacation type selection', () => {
      const service = createService()
      toPolicyTypeSelector(service)

      send(service, componentEvents.TIME_OFF_POLICY_TYPE_SELECTED, { policyType: 'vacation' })

      expect(service.machine.current).toBe('policyDetailsForm')
      expect(service.context.policyType).toBe('vacation')
    })

    it('transitions to holidaySelectionForm on holiday type selection', () => {
      const service = createService()
      toPolicyTypeSelector(service)

      send(service, componentEvents.TIME_OFF_POLICY_TYPE_SELECTED, { policyType: 'holiday' })

      expect(service.machine.current).toBe('holidaySelectionForm')
      expect(service.context.policyType).toBe('holiday')
      expect(service.context.alerts).toBeUndefined()
    })

    it('transitions to policyList on CANCEL', () => {
      const service = createService()
      toPolicyTypeSelector(service)

      send(service, componentEvents.CANCEL)

      expect(service.machine.current).toBe('policyList')
      expect(service.context.alerts).toBeUndefined()
    })
  })

  describe('sick/vacation creation flow', () => {
    it('transitions policyDetailsForm -> policySettings on POLICY_DETAILS_DONE', () => {
      const service = createService()
      toPolicyDetailsForm(service)

      send(service, componentEvents.TIME_OFF_POLICY_DETAILS_DONE, { policyId: 'policy-123' })

      expect(service.machine.current).toBe('policySettings')
      expect(service.context.policyId).toBe('policy-123')
      expect(service.context.alerts).toBeUndefined()
    })

    it('transitions policySettings -> addEmployeesToPolicy on POLICY_SETTINGS_DONE', () => {
      const service = createService()
      toPolicySettings(service)

      send(service, componentEvents.TIME_OFF_POLICY_SETTINGS_DONE)

      expect(service.machine.current).toBe('addEmployeesToPolicy')
      expect(service.context.alerts).toBeUndefined()
    })

    it('transitions addEmployeesToPolicy -> viewPolicyDetails on ADD_EMPLOYEES_DONE', () => {
      const service = createService()
      toAddEmployeesToPolicy(service)

      send(service, componentEvents.TIME_OFF_ADD_EMPLOYEES_DONE)

      expect(service.machine.current).toBe('viewPolicyDetails')
      expect(service.context.alerts).toBeUndefined()
    })

    it('supports full happy path: policyList -> viewPolicyDetails', () => {
      const service = createService()

      send(service, componentEvents.TIME_OFF_CREATE_POLICY)
      expect(service.machine.current).toBe('policyTypeSelector')

      send(service, componentEvents.TIME_OFF_POLICY_TYPE_SELECTED, { policyType: 'vacation' })
      expect(service.machine.current).toBe('policyDetailsForm')
      expect(service.context.policyType).toBe('vacation')

      send(service, componentEvents.TIME_OFF_POLICY_DETAILS_DONE, { policyId: 'policy-123' })
      expect(service.machine.current).toBe('policySettings')
      expect(service.context.policyId).toBe('policy-123')

      send(service, componentEvents.TIME_OFF_POLICY_SETTINGS_DONE)
      expect(service.machine.current).toBe('addEmployeesToPolicy')

      send(service, componentEvents.TIME_OFF_ADD_EMPLOYEES_DONE)
      expect(service.machine.current).toBe('viewPolicyDetails')
      expect(service.context.policyId).toBe('policy-123')
    })
  })

  describe('holiday creation flow', () => {
    it('transitions holidaySelectionForm -> addEmployeesHoliday on HOLIDAY_SELECTION_DONE', () => {
      const service = createService()
      toHolidaySelectionForm(service)

      send(service, componentEvents.TIME_OFF_HOLIDAY_SELECTION_DONE)

      expect(service.machine.current).toBe('addEmployeesHoliday')
      expect(service.context.alerts).toBeUndefined()
    })

    it('transitions addEmployeesHoliday -> viewHolidayEmployees on HOLIDAY_ADD_EMPLOYEES_DONE', () => {
      const service = createService()
      toAddEmployeesHoliday(service)

      send(service, componentEvents.TIME_OFF_HOLIDAY_ADD_EMPLOYEES_DONE)

      expect(service.machine.current).toBe('viewHolidayEmployees')
      expect(service.context.alerts).toBeUndefined()
    })

    it('supports full happy path: policyList -> viewHolidayEmployees', () => {
      const service = createService()

      send(service, componentEvents.TIME_OFF_CREATE_POLICY)
      send(service, componentEvents.TIME_OFF_POLICY_TYPE_SELECTED, { policyType: 'holiday' })
      expect(service.machine.current).toBe('holidaySelectionForm')

      send(service, componentEvents.TIME_OFF_HOLIDAY_SELECTION_DONE)
      expect(service.machine.current).toBe('addEmployeesHoliday')

      send(service, componentEvents.TIME_OFF_HOLIDAY_ADD_EMPLOYEES_DONE)
      expect(service.machine.current).toBe('viewHolidayEmployees')
    })
  })

  describe('tab switching', () => {
    it('switches from viewPolicyDetails to viewPolicyEmployees', () => {
      const service = createService()
      send(service, componentEvents.TIME_OFF_VIEW_POLICY, {
        policyId: 'policy-123',
        policyType: 'vacation',
      })
      expect(service.machine.current).toBe('viewPolicyDetails')

      send(service, componentEvents.TIME_OFF_VIEW_POLICY_EMPLOYEES)

      expect(service.machine.current).toBe('viewPolicyEmployees')
    })

    it('switches from viewPolicyEmployees to viewPolicyDetails', () => {
      const service = createService()
      send(service, componentEvents.TIME_OFF_VIEW_POLICY, {
        policyId: 'policy-123',
        policyType: 'vacation',
      })
      send(service, componentEvents.TIME_OFF_VIEW_POLICY_EMPLOYEES)
      expect(service.machine.current).toBe('viewPolicyEmployees')

      send(service, componentEvents.TIME_OFF_VIEW_POLICY_DETAILS)

      expect(service.machine.current).toBe('viewPolicyDetails')
    })

    it('switches from viewHolidayEmployees to viewHolidaySchedule', () => {
      const service = createService()
      send(service, componentEvents.TIME_OFF_VIEW_POLICY, {
        policyId: 'policy-123',
        policyType: 'holiday',
      })
      expect(service.machine.current).toBe('viewHolidayEmployees')

      send(service, componentEvents.TIME_OFF_VIEW_HOLIDAY_SCHEDULE)

      expect(service.machine.current).toBe('viewHolidaySchedule')
    })

    it('switches from viewHolidaySchedule to viewHolidayEmployees', () => {
      const service = createService()
      send(service, componentEvents.TIME_OFF_VIEW_POLICY, {
        policyId: 'policy-123',
        policyType: 'holiday',
      })
      send(service, componentEvents.TIME_OFF_VIEW_HOLIDAY_SCHEDULE)
      expect(service.machine.current).toBe('viewHolidaySchedule')

      send(service, componentEvents.TIME_OFF_VIEW_HOLIDAY_EMPLOYEES)

      expect(service.machine.current).toBe('viewHolidayEmployees')
    })
  })

  describe('back to list', () => {
    it('returns to policyList from viewPolicyDetails', () => {
      const service = createService()
      send(service, componentEvents.TIME_OFF_VIEW_POLICY, {
        policyId: 'policy-123',
        policyType: 'vacation',
      })

      send(service, componentEvents.TIME_OFF_BACK_TO_LIST)

      expect(service.machine.current).toBe('policyList')
      expect(service.context.alerts).toBeUndefined()
    })

    it('returns to policyList from viewPolicyEmployees', () => {
      const service = createService()
      send(service, componentEvents.TIME_OFF_VIEW_POLICY, {
        policyId: 'policy-123',
        policyType: 'vacation',
      })
      send(service, componentEvents.TIME_OFF_VIEW_POLICY_EMPLOYEES)

      send(service, componentEvents.TIME_OFF_BACK_TO_LIST)

      expect(service.machine.current).toBe('policyList')
    })

    it('returns to policyList from viewHolidayEmployees', () => {
      const service = createService()
      send(service, componentEvents.TIME_OFF_VIEW_POLICY, {
        policyId: 'policy-123',
        policyType: 'holiday',
      })

      send(service, componentEvents.TIME_OFF_BACK_TO_LIST)

      expect(service.machine.current).toBe('policyList')
    })

    it('returns to policyList from viewHolidaySchedule', () => {
      const service = createService()
      send(service, componentEvents.TIME_OFF_VIEW_POLICY, {
        policyId: 'policy-123',
        policyType: 'holiday',
      })
      send(service, componentEvents.TIME_OFF_VIEW_HOLIDAY_SCHEDULE)

      send(service, componentEvents.TIME_OFF_BACK_TO_LIST)

      expect(service.machine.current).toBe('policyList')
    })
  })

  describe('cancel transitions', () => {
    it('cancels from policyTypeSelector to policyList', () => {
      const service = createService()
      toPolicyTypeSelector(service)

      send(service, componentEvents.CANCEL)

      expect(service.machine.current).toBe('policyList')
      expect(service.context.alerts).toBeUndefined()
    })

    it('cancels from policyDetailsForm to policyList', () => {
      const service = createService()
      toPolicyDetailsForm(service)

      send(service, componentEvents.CANCEL)

      expect(service.machine.current).toBe('policyList')
      expect(service.context.alerts).toBeUndefined()
    })

    it('cancels from policySettings to policyList', () => {
      const service = createService()
      toPolicySettings(service)

      send(service, componentEvents.CANCEL)

      expect(service.machine.current).toBe('policyList')
    })

    it('cancels from addEmployeesToPolicy to policyList', () => {
      const service = createService()
      toAddEmployeesToPolicy(service)

      send(service, componentEvents.CANCEL)

      expect(service.machine.current).toBe('policyList')
    })

    it('cancels from holidaySelectionForm to policyList', () => {
      const service = createService()
      toHolidaySelectionForm(service)

      send(service, componentEvents.CANCEL)

      expect(service.machine.current).toBe('policyList')
    })

    it('cancels from addEmployeesHoliday to policyList', () => {
      const service = createService()
      toAddEmployeesHoliday(service)

      send(service, componentEvents.CANCEL)

      expect(service.machine.current).toBe('policyList')
    })
  })

  describe('error transitions', () => {
    it('policyDetailsForm error transitions to policyTypeSelector with alert', () => {
      const service = createService()
      toPolicyDetailsForm(service)

      send(service, componentEvents.TIME_OFF_POLICY_CREATE_ERROR, {
        alert: { type: 'error', title: 'Failed to create policy' },
      })

      expect(service.machine.current).toBe('policyTypeSelector')
      expect(service.context.alerts).toEqual([{ type: 'error', title: 'Failed to create policy' }])
    })

    it('policyDetailsForm error without alert payload clears alerts', () => {
      const service = createService()
      toPolicyDetailsForm(service)

      send(service, componentEvents.TIME_OFF_POLICY_CREATE_ERROR, {})

      expect(service.machine.current).toBe('policyTypeSelector')
      expect(service.context.alerts).toBeUndefined()
    })

    it('policySettings error transitions to policyDetailsForm with alert', () => {
      const service = createService()
      toPolicySettings(service)

      send(service, componentEvents.TIME_OFF_POLICY_SETTINGS_ERROR, {
        alert: { type: 'error', title: 'Failed to update settings' },
      })

      expect(service.machine.current).toBe('policyDetailsForm')
      expect(service.context.alerts).toEqual([
        { type: 'error', title: 'Failed to update settings' },
      ])
    })

    it('addEmployeesToPolicy error transitions to policySettings with alert', () => {
      const service = createService()
      toAddEmployeesToPolicy(service)

      send(service, componentEvents.TIME_OFF_ADD_EMPLOYEES_ERROR, {
        alert: { type: 'error', title: 'Failed to add employees' },
      })

      expect(service.machine.current).toBe('policySettings')
      expect(service.context.alerts).toEqual([{ type: 'error', title: 'Failed to add employees' }])
    })

    it('holidaySelectionForm error transitions to policyTypeSelector with alert', () => {
      const service = createService()
      toHolidaySelectionForm(service)

      send(service, componentEvents.TIME_OFF_HOLIDAY_CREATE_ERROR, {
        alert: { type: 'error', title: 'Failed to create holiday policy' },
      })

      expect(service.machine.current).toBe('policyTypeSelector')
      expect(service.context.alerts).toEqual([
        { type: 'error', title: 'Failed to create holiday policy' },
      ])
    })

    it('addEmployeesHoliday error transitions to holidaySelectionForm with alert', () => {
      const service = createService()
      toAddEmployeesHoliday(service)

      send(service, componentEvents.TIME_OFF_HOLIDAY_ADD_EMPLOYEES_ERROR, {
        alert: { type: 'error', title: 'Failed to add employees to holiday' },
      })

      expect(service.machine.current).toBe('holidaySelectionForm')
      expect(service.context.alerts).toEqual([
        { type: 'error', title: 'Failed to add employees to holiday' },
      ])
    })
  })

  describe('alert lifecycle', () => {
    it('forward transition after error clears alerts', () => {
      const service = createService()
      toPolicyDetailsForm(service)

      send(service, componentEvents.TIME_OFF_POLICY_CREATE_ERROR, {
        alert: { type: 'error', title: 'Create failed' },
      })
      expect(service.machine.current).toBe('policyTypeSelector')
      expect(service.context.alerts).toEqual([{ type: 'error', title: 'Create failed' }])

      send(service, componentEvents.TIME_OFF_POLICY_TYPE_SELECTED, { policyType: 'sick' })
      expect(service.machine.current).toBe('policyDetailsForm')
      expect(service.context.alerts).toBeUndefined()
    })

    it('cancel clears alerts', () => {
      const service = createService()
      toPolicyDetailsForm(service)

      send(service, componentEvents.TIME_OFF_POLICY_CREATE_ERROR, {
        alert: { type: 'error', title: 'Create failed' },
      })
      expect(service.context.alerts).toBeDefined()

      send(service, componentEvents.CANCEL)
      expect(service.machine.current).toBe('policyList')
      expect(service.context.alerts).toBeUndefined()
    })

    it('create policy clears alerts from policyList', () => {
      const service = createService()

      send(service, componentEvents.TIME_OFF_CREATE_POLICY)
      expect(service.context.alerts).toBeUndefined()
    })

    it('error then retry full flow preserves correct state', () => {
      const service = createService()

      send(service, componentEvents.TIME_OFF_CREATE_POLICY)
      send(service, componentEvents.TIME_OFF_POLICY_TYPE_SELECTED, { policyType: 'vacation' })

      send(service, componentEvents.TIME_OFF_POLICY_CREATE_ERROR, {
        alert: { type: 'error', title: 'Create failed' },
      })
      expect(service.machine.current).toBe('policyTypeSelector')
      expect(service.context.alerts).toHaveLength(1)

      send(service, componentEvents.TIME_OFF_POLICY_TYPE_SELECTED, { policyType: 'vacation' })
      expect(service.machine.current).toBe('policyDetailsForm')
      expect(service.context.alerts).toBeUndefined()

      send(service, componentEvents.TIME_OFF_POLICY_DETAILS_DONE, { policyId: 'policy-456' })
      expect(service.machine.current).toBe('policySettings')
      expect(service.context.policyId).toBe('policy-456')
      expect(service.context.alerts).toBeUndefined()
    })
  })
})
