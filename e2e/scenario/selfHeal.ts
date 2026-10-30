import type { ApiClient } from './runner'

/**
 * Self-heal helpers that bring a freshly-provisioned demo company up to a
 * payroll-ready state via the public gws-flows API. Extracted from the
 * Playwright-based ensureCompanyIsPayrollReady so the same logic can run in
 * e2e-setup against any company, not just inside a Playwright test fixture.
 *
 * The healthy `react_sdk_demo_company_onboarded` factory output should
 * already have a verified signatory and signed forms. These helpers are a
 * defensive layer for the cases where the factory's seeding finishes
 * partially: the company has employees + open pay period but is missing
 * the signatory or has unsigned forms.
 *
 * Idempotent: safe to call against an already-ready company. The helpers
 * GET first and only POST/PUT when work is required.
 */

interface SignatoryPayload {
  first_name: string
  last_name: string
  title: string
  phone: string
  birthday: string
  email: string
  ssn: string
  home_address: {
    street_1: string
    city: string
    state: string
    zip: string
  }
}

const CANONICAL_TEST_SIGNATORY: Omit<SignatoryPayload, 'email'> = {
  first_name: 'Signer',
  last_name: 'Canary',
  title: 'CEO',
  phone: '4155551234',
  birthday: '1980-01-15',
  ssn: '123456789',
  home_address: {
    street_1: '425 California St',
    city: 'San Francisco',
    state: 'CA',
    zip: '94104',
  },
}

interface Signatory {
  uuid: string
  identity_verification_status?: string
}

interface CompanyForm {
  uuid: string
  name?: string
  title?: string
  requires_signing?: boolean
}

/**
 * Ensure the company has at least one signatory and all required forms are
 * signed. Creates a signatory if none exist; iterates unsigned forms and
 * signs each via PUT /forms/:uuid/sign.
 *
 * Does NOT block on signatory identity_verification_status — the demo
 * backend's verification is asynchronous. The caller's health gate
 * (assertCompanyIsReadyForTests) is responsible for asserting the final
 * Pass state.
 */
export async function ensureSignatoryAndSignedForms(
  api: ApiClient,
  companyId: string,
  log: (msg: string) => void,
): Promise<void> {
  const signatories = await api.get<Signatory[]>(`/companies/${companyId}/signatories`)

  if (signatories.length === 0) {
    log(`  No signatory found; creating canonical test signatory`)
    await api.post<Signatory>(`/companies/${companyId}/signatories`, {
      ...CANONICAL_TEST_SIGNATORY,
      email: `signer-canary+${Date.now()}@example.com`,
    })
  } else {
    log(
      `  ${signatories.length} signatory(ies) already present (statuses: ${signatories
        .map(s => s.identity_verification_status ?? '?')
        .join(', ')})`,
    )
  }

  const forms = await api.get<CompanyForm[]>(`/companies/${companyId}/forms`)
  const unsigned = forms.filter(f => f.requires_signing)

  if (unsigned.length === 0) {
    log(`  All ${forms.length} company form(s) already signed`)
    return
  }

  log(`  Signing ${unsigned.length} unsigned form(s) of ${forms.length} total`)
  for (const form of unsigned) {
    await api.put(`/forms/${form.uuid}/sign`, {
      signature_text: `${CANONICAL_TEST_SIGNATORY.first_name} ${CANONICAL_TEST_SIGNATORY.last_name}`,
      agree: true,
      signed_by_ip_address: '127.0.0.1',
    })
  }
}
