import { Fragment } from 'react/jsx-runtime'
import { useTranslation } from 'react-i18next'
import { Form } from '../Form'
import {
  useStateTaxesForm,
  StateTaxesFormProvider,
  type StateTaxesFormReady,
} from '../hooks/useStateTaxes'
import { ActionsLayout, Grid } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { BaseBoundaries, BaseLayout } from '@/components/Base'
import type { STATES_ABBR } from '@/shared/constants'

const exampleStateTaxesEvents = {
  STATE_TAXES_UPDATED: 'state_taxes_updated',
} as const

type ExampleStateTaxesEvent = (typeof exampleStateTaxesEvents)[keyof typeof exampleStateTaxesEvents]

interface ExampleStateTaxesProps {
  employeeId: string
  isAdmin?: boolean
  onEvent?: (event: ExampleStateTaxesEvent, data?: unknown) => void
}

export function ExampleStateTaxes({ employeeId, isAdmin, onEvent }: ExampleStateTaxesProps) {
  return (
    <BaseBoundaries>
      <ExampleStateTaxesRoot employeeId={employeeId} isAdmin={isAdmin} onEvent={onEvent} />
    </BaseBoundaries>
  )
}

function ExampleStateTaxesRoot({ employeeId, isAdmin, onEvent }: ExampleStateTaxesProps) {
  const stateTaxesForm = useStateTaxesForm({ employeeId, isAdmin })
  const Components = useComponentContext()

  if (stateTaxesForm.isLoading) {
    return <BaseLayout isLoading />
  }

  const { onSubmit, isPending, errors } = stateTaxesForm

  const handleSubmit = async () => {
    const result = await onSubmit()
    if (result) {
      onEvent?.(exampleStateTaxesEvents.STATE_TAXES_UPDATED, result.data)
    }
  }

  return (
    <BaseLayout error={errors.error} fieldErrors={errors.fieldErrors}>
      <Form onSubmit={handleSubmit}>
        <StateTaxesFormFields form={stateTaxesForm} />
        <ActionsLayout>
          <Components.Button type="submit" isLoading={isPending}>
            Save
          </Components.Button>
        </ActionsLayout>
      </Form>
    </BaseLayout>
  )
}

export interface StateTaxesFormFieldsProps {
  form: StateTaxesFormReady
}

export function StateTaxesFormFields({ form }: StateTaxesFormFieldsProps) {
  const { Fields, data } = form
  const Components = useComponentContext()
  const { t: statesHash } = useTranslation('common', { keyPrefix: 'statesHash' })

  return (
    <StateTaxesFormProvider form={form}>
      {data.employeeStateTaxes.map(stateData => {
        const stateAbbr = stateData.state
        if (!stateAbbr) return null

        const stateFields = Fields[stateAbbr]
        if (!stateFields || Object.keys(stateFields).length === 0) return null

        return (
          <Fragment key={stateAbbr}>
            <Components.Heading as="h2">
              {statesHash(stateAbbr as (typeof STATES_ABBR)[number])}
            </Components.Heading>
            <Grid gap={20}>
              {Object.entries(stateFields).map(([key, FieldComponent]) => (
                <FieldComponent key={key} />
              ))}
            </Grid>
          </Fragment>
        )
      })}
    </StateTaxesFormProvider>
  )
}
