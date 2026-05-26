import type { ApiClient } from './runner'

/**
 * Hard health gate run during e2e-setup against every scenario's
 * provisioned company. The gate decides whether the artifact gets written
 * — if any company fails the gate, e2e-setup throws and downstream e2e
 * shards never run against a broken company.
 *
 * Closes the existing pre-test validation gap: today globalSetup's
 * isExistingStateValid only does a shallow 5s /locations ping, which
 * passes for companies that are subtly broken (onboarding incomplete,
 * unsigned forms, payroll blockers, signatory failed identity
 * verification).
 *
 * Each check is opt-in via per-scenario flags in the scenario JSON.
 */

interface OnboardingStatusResponse {
  onboarding_completed?: boolean
}

interface SignatorySummary {
  uuid: string
  identity_verification_status?: string
}

interface PayrollBlocker {
  key: string
  message: string
}

export interface HealthGateRequirements {
  /** GET /companies/:id/onboarding_status must return onboarding_completed=true */
  requireOnboarded: boolean
  /** GET /companies/:id/signatories must include one with identity_verification_status='Pass' */
  requireSignatory: boolean
  /** GET /companies/:id/payrolls/blockers must return an empty array */
  requireNoBlockers: boolean
}

/**
 * Run all opt-in health checks against a company. Throws with a multi-line
 * message listing every failed check if the company is not ready for
 * downstream tests. Returns silently if all checks pass.
 *
 * Each check that fails contributes its own line to the error so a single
 * gate failure can describe multiple issues at once — useful when a
 * factory has produced a broadly-degraded company.
 */
export async function assertCompanyIsReadyForTests(
  api: ApiClient,
  companyId: string,
  requirements: HealthGateRequirements,
): Promise<void> {
  const failures: string[] = []

  if (requirements.requireOnboarded) {
    try {
      const status = await api.get<OnboardingStatusResponse>(
        `/companies/${companyId}/onboarding_status`,
      )
      if (status.onboarding_completed !== true) {
        failures.push(
          `onboarding_completed is ${status.onboarding_completed ?? 'undefined'}, expected true`,
        )
      }
    } catch (error) {
      failures.push(`could not read onboarding_status: ${String(error)}`)
    }
  }

  if (requirements.requireSignatory) {
    try {
      const signatories = await api.get<SignatorySummary[]>(`/companies/${companyId}/signatories`)
      const verified = signatories.find(
        s => s.identity_verification_status === 'Pass' || s.identity_verification_status === 'pass',
      )
      if (!verified) {
        const detail =
          signatories.length === 0
            ? 'no signatory exists'
            : `no signatory with identity_verification_status=Pass; got: ${signatories
                .map(s => s.identity_verification_status ?? '?')
                .join(', ')}`
        failures.push(detail)
      }
    } catch (error) {
      failures.push(`could not read signatories: ${String(error)}`)
    }
  }

  if (requirements.requireNoBlockers) {
    try {
      const blockers = await api.get<PayrollBlocker[]>(`/companies/${companyId}/payrolls/blockers`)
      if (blockers.length > 0) {
        const detail = `${blockers.length} payroll blocker(s):\n${blockers
          .map(b => `      - ${b.key}: ${b.message}`)
          .join('\n')}`
        failures.push(detail)
      }
    } catch (error) {
      failures.push(`could not read payroll blockers: ${String(error)}`)
    }
  }

  if (failures.length === 0) return

  throw new Error(
    `Company ${companyId.slice(0, 8)} failed pre-test health check:\n${failures
      .map(f => `    - ${f}`)
      .join('\n')}\nRefusing to write artifact — downstream tests would fail against this company.`,
  )
}
