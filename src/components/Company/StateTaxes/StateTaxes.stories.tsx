import { useEffect, useState } from 'react'
import { http, HttpResponse } from 'msw'
import { setupWorker } from 'msw/browser'
import { fn } from 'storybook/test'
import { StateTaxes } from './StateTaxes'

export default {
  title: 'Domain/Company/StateTax/StateTaxesFlow',
}

const COMPANY_ID = 'company-123'

type Requirement = {
  key: string
  applicable_if: string[]
  label: string
  description: string
  value: string
  metadata: Record<string, unknown>
}

type RequirementSet = {
  state: string
  key: string
  label: string
  effective_from: string | null
  requirements: Requirement[]
}

type StateTaxData = {
  company_uuid: string
  state: string
  requirement_sets: RequirementSet[]
}

// Mutable state that persists across navigations within the story
const stateData: Record<string, StateTaxData> = {
  CA: {
    company_uuid: COMPANY_ID,
    state: 'CA',
    requirement_sets: [
      {
        state: 'CA',
        key: 'registrations',
        label: 'Registrations',
        effective_from: null,
        requirements: [
          {
            key: 'edd-account-number',
            applicable_if: [],
            label: 'EDD Account Number',
            description:
              "If your business has ever run a payroll in California, you should already have an EDD number. If not, learn how to <a target='_blank' data-bypass href='https://edd.ca.gov/en/payroll_taxes/am_i_required_to_register/'>register with the EDD</a>.",
            value: '164-6651-8',
            metadata: { type: 'text' },
          },
        ],
      },
      {
        state: 'CA',
        key: 'taxrates',
        label: 'Tax Rates',
        effective_from: '2025-12-31',
        requirements: [
          {
            key: 'sui-rate',
            applicable_if: [],
            label: 'Unemployment tax rate',
            description:
              "This is the tax rate assigned to you by the state agency—we'll use it to withhold the right unemployment taxes from your payrolls. If you haven't been assigned one yet, <a target='_blank' data-bypass href='https://support.gusto.com/article/106622236100000/State-unemployment-insurance-(SUI)-tax'>find your state's new employer rate</a> and enter it here.",
            value: '0.034',
            metadata: {
              type: 'tax_rate',
              validation: { type: 'min_max', min: '0.015', max: '0.062' },
            },
          },
          {
            key: 'ett-rate',
            applicable_if: [],
            label: 'ETT Rate',
            description:
              "You can <a target='_blank' data-bypass href='https://edd.ca.gov/en/payroll_taxes/rates_and_withholding/'>check your ETT rate online</a> using your EDD number. Most companies are assigned a rate of 0.1%.",
            value: '0.001',
            metadata: {
              type: 'select',
              options: [
                { label: '0.1%', value: '0.001' },
                { label: '0%', value: '0' },
              ],
            },
          },
        ],
      },
    ],
  },
  WA: {
    company_uuid: COMPANY_ID,
    state: 'WA',
    requirement_sets: [
      {
        state: 'WA',
        key: 'registrations',
        label: 'Registrations',
        effective_from: null,
        requirements: [
          {
            key: 'ubi',
            applicable_if: [],
            label: 'Unified Business ID',
            description: 'Your Washington Unified Business ID number.',
            value: '',
            metadata: { type: 'text' },
          },
        ],
      },
      {
        state: 'WA',
        key: 'taxrates',
        label: 'Tax Rates',
        effective_from: '2024-01-01',
        requirements: [
          {
            key: 'sui-rate',
            applicable_if: [],
            label: 'Unemployment Insurance Rate',
            description: 'Your assigned SUI rate from Washington.',
            value: '',
            metadata: { type: 'percent' },
          },
        ],
      },
    ],
  },
}

function getListData() {
  return Object.values(stateData).map(d => ({
    state: d.state,
    setup_complete: d.requirement_sets.every(rs => rs.requirements.every(r => r.value !== '')),
  }))
}

function applyUpdate(
  state: string,
  body: { requirement_sets?: { key: string; requirements: { key: string; value: string }[] }[] },
) {
  const data = stateData[state]
  if (!data || !body.requirement_sets) return data

  for (const incoming of body.requirement_sets) {
    const existingSet = data.requirement_sets.find(rs => rs.key === incoming.key)
    if (!existingSet) continue
    for (const incomingReq of incoming.requirements) {
      const existingReq = existingSet.requirements.find(r => r.key === incomingReq.key)
      if (existingReq) {
        existingReq.value = incomingReq.value
      }
    }
  }

  return data
}

const handlers = [
  http.get('*/v1/companies/:companyId/tax_requirements', () => {
    return HttpResponse.json(getListData())
  }),

  http.get('*/v1/companies/:companyId/tax_requirements/:state', ({ params }) => {
    const state = params.state as string
    const data = stateData[state]
    if (!data) {
      return HttpResponse.json(
        { errors: [{ error_key: 'not_found', message: `No tax data for ${state}` }] },
        { status: 404 },
      )
    }
    return HttpResponse.json(data)
  }),

  http.put('*/v1/companies/:companyId/tax_requirements/:state', async ({ params, request }) => {
    const state = params.state as string
    const body = (await request.json()) as {
      requirement_sets?: { key: string; requirements: { key: string; value: string }[] }[]
    }

    // Validate: check for empty required fields
    const errors: { error_key: string; category: string; message: string }[] = []
    if (body.requirement_sets) {
      for (const rs of body.requirement_sets) {
        for (const req of rs.requirements) {
          if (req.value === '') {
            const existingSet = stateData[state]?.requirement_sets.find(s => s.key === rs.key)
            const existingReq = existingSet?.requirements.find(r => r.key === req.key)
            errors.push({
              error_key: req.key,
              category: 'invalid_attribute_value',
              message: `${existingReq?.label ?? req.key} can't be blank`,
            })
          }
        }
      }
    }

    if (errors.length > 0) {
      return HttpResponse.json({ errors }, { status: 422 })
    }

    const updated = applyUpdate(state, body)
    return HttpResponse.json(updated)
  }),
]

const worker = setupWorker(...handlers)
const workerStarted = worker.start({ onUnhandledRequest: 'bypass' })

function WithMSW({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    void workerStarted.then(() => {
      setReady(true)
    })
  }, [])

  if (!ready) return null
  return <>{children}</>
}

export const Default = () => (
  <WithMSW>
    <StateTaxes companyId={COMPANY_ID} onEvent={fn().mockName('onEvent')} />
  </WithMSW>
)
