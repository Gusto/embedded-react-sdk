import { describe, expect, it } from 'vitest'
import { createMachine, interpret } from 'robot3'
import { onboardingMachine } from './onboardingStateMachine'
import {
  ContractorListContextual,
  type OnboardingFlowContextInterface,
} from './OnboardingFlowComponents'
import { componentEvents, ContractorOnboardingStatus } from '@/shared/constants'

/**
 * Routing contract for the contractor admin onboarding machine.
 *
 * The new hire report step is gated on the contractor's `onboardingStatus`,
 * carried by `contractor/profile/done`: the machine interprets an initial-pass
 * status (`admin_onboarding_incomplete`, `self_onboarding_not_invited`) as
 * "show the report" and any later status as "skip straight to submit". These
 * tests drive the pure state machine (no React) to pin that interpretation on
 * both the full admin path and the shortened self-onboarding path.
 */

const startFlow = () => {
  const machine = createMachine(
    'list',
    onboardingMachine,
    (initialContext: OnboardingFlowContextInterface) => ({
      ...initialContext,
      component: ContractorListContextual,
      companyId: 'company-1',
      selfOnboarding: false,
    }),
  )
  return interpret(machine, () => {})
}

const send = (
  service: ReturnType<typeof startFlow>,
  type: string,
  payload: Record<string, unknown> = {},
) => {
  service.send({ type, payload })
}

const advanceToProfile = (service: ReturnType<typeof startFlow>) => {
  send(service, componentEvents.CONTRACTOR_CREATE)
}

describe('contractor onboarding machine — new hire report gating', () => {
  it('keeps the new hire report on the full admin path during the initial pass', () => {
    const service = startFlow()
    advanceToProfile(service)
    send(service, componentEvents.CONTRACTOR_PROFILE_DONE, {
      contractorId: 'c-1',
      onboardingStatus: ContractorOnboardingStatus.ADMIN_ONBOARDING_INCOMPLETE,
      selfOnboarding: false,
    })
    expect(service.machine.current).toBe('address')

    send(service, componentEvents.CONTRACTOR_ADDRESS_DONE)
    expect(service.machine.current).toBe('paymentMethod')

    send(service, componentEvents.CONTRACTOR_PAYMENT_METHOD_DONE)
    expect(service.machine.current).toBe('newHireReport')
    expect(service.context.header).toMatchObject({ currentStep: 4, totalSteps: 5 })

    send(service, componentEvents.CONTRACTOR_NEW_HIRE_REPORT_DONE)
    expect(service.machine.current).toBe('submit')
  })

  it('skips the new hire report on the full admin path once past the initial pass', () => {
    const service = startFlow()
    advanceToProfile(service)
    send(service, componentEvents.CONTRACTOR_PROFILE_DONE, {
      contractorId: 'c-1',
      onboardingStatus: ContractorOnboardingStatus.ADMIN_ONBOARDING_REVIEW,
      selfOnboarding: false,
    })
    expect(service.machine.current).toBe('address')

    send(service, componentEvents.CONTRACTOR_ADDRESS_DONE)
    expect(service.machine.current).toBe('paymentMethod')

    send(service, componentEvents.CONTRACTOR_PAYMENT_METHOD_DONE)
    expect(service.machine.current).toBe('submit')
    expect(service.context.header).toMatchObject({ currentStep: 4, totalSteps: 4 })
  })

  it('keeps the new hire report on the self-onboarding path during the initial pass', () => {
    const service = startFlow()
    advanceToProfile(service)
    send(service, componentEvents.CONTRACTOR_PROFILE_DONE, {
      contractorId: 'c-1',
      onboardingStatus: ContractorOnboardingStatus.SELF_ONBOARDING_NOT_INVITED,
      selfOnboarding: true,
    })
    expect(service.machine.current).toBe('newHireReport')
    expect(service.context.header).toMatchObject({ currentStep: 2, totalSteps: 3 })

    send(service, componentEvents.CONTRACTOR_NEW_HIRE_REPORT_DONE)
    expect(service.machine.current).toBe('submit')
  })

  it('skips the new hire report on the self-onboarding path once past the initial pass', () => {
    const service = startFlow()
    advanceToProfile(service)
    send(service, componentEvents.CONTRACTOR_PROFILE_DONE, {
      contractorId: 'c-1',
      onboardingStatus: ContractorOnboardingStatus.ONBOARDING_COMPLETED,
      selfOnboarding: true,
    })
    expect(service.machine.current).toBe('submit')
    expect(service.context.header).toMatchObject({ currentStep: 2, totalSteps: 2 })
  })
})
