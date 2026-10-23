import { describe, expectTypeOf, it } from 'vitest'
import type { APIModels } from '@/index'
import type { PayrollShowEmployeeCompensations } from '@gusto/embedded-api/models/components/unprocessedpayroll'
import type { EmployeeCompensations } from '@gusto/embedded-api/models/components/payrollreceipt'

describe('APIModels compatibility', () => {
  it('keeps payroll compensation and receipt rows under their existing public names', () => {
    expectTypeOf<APIModels.EmployeeCompensations>().toEqualTypeOf<PayrollShowEmployeeCompensations>()
    expectTypeOf<APIModels.PayrollReceiptEmployeeCompensations>().toEqualTypeOf<EmployeeCompensations>()
    expectTypeOf<APIModels.EmployeeCompensations>().toHaveProperty('hourlyCompensations')
    expectTypeOf<APIModels.EmployeeCompensations>().not.toHaveProperty('employeeFirstName')
    expectTypeOf<APIModels.PayrollReceiptEmployeeCompensations>().toHaveProperty(
      'employeeFirstName',
    )
    expectTypeOf<APIModels.PayrollReceiptEmployeeCompensations>().not.toHaveProperty(
      'hourlyCompensations',
    )
  })

  it('keeps hours and amount breakdowns under their existing public names', () => {
    expectTypeOf<APIModels.PayrollShowBreakdowns>().toHaveProperty('hours')
    expectTypeOf<APIModels.PayrollShowBreakdowns>().not.toHaveProperty('amount')
    expectTypeOf<APIModels.PayrollShowEmployeeCompensationsBreakdowns>().toHaveProperty('amount')
    expectTypeOf<APIModels.PayrollShowEmployeeCompensationsBreakdowns>().not.toHaveProperty('hours')
  })

  it('preserves the renamed employee and contractor model exports', () => {
    expectTypeOf<APIModels.Address>().toHaveProperty('street1')
    expectTypeOf<APIModels.MemberPortalInvitationStatus>().toHaveProperty('status')
    expectTypeOf<APIModels.UpcomingEmployment>().toHaveProperty('startDate')
    expectTypeOf<APIModels.OnboardingDocumentsConfig>().toHaveProperty('i9Document')
    expectTypeOf<APIModels.OnboardingStatus>().toEqualTypeOf<
      | 'admin_onboarding_incomplete'
      | 'admin_onboarding_review'
      | 'self_onboarding_not_invited'
      | 'self_onboarding_invited'
      | 'self_onboarding_started'
      | 'self_onboarding_review'
      | 'onboarding_completed'
    >()
    expectTypeOf<'full_time'>().toExtend<APIModels.CurrentEmploymentStatus>()
  })
})
