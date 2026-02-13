import { FormProvider } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { Job } from '@gusto/embedded-api/models/components/job'
import type { FlsaStatusType } from '@gusto/embedded-api/models/components/flsastatustype'
import type { OnboardingContextInterface } from '../OnboardingFlow/OnboardingFlowComponents'
import { List } from './List'
import { Head } from './Head'
import { Edit } from './Edit'
import { Actions } from './Actions'
import { CompensationProvider } from './useCompensation'
import { useEmployeeCompensation } from './useEmployeeCompensation'
import { Form } from '@/components/Common/Form'
import type { RequireAtLeastOne } from '@/types/Helpers'
import type { PAY_PERIODS } from '@/shared/constants'
import { useComponentDictionary, useI18n } from '@/i18n'
import {
  BaseComponent,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base'
import { useFlow } from '@/components/Flow/useFlow'

export type CompensationDefaultValues = RequireAtLeastOne<{
  rate?: Job['rate']
  title?: Job['title']
  paymentUnit?: (typeof PAY_PERIODS)[keyof typeof PAY_PERIODS]
  flsaStatus?: FlsaStatusType
}>

interface CompensationProps extends CommonComponentInterface<'Employee.Compensation'> {
  employeeId: string
  startDate: string
  defaultValues?: CompensationDefaultValues
}

export function Compensation(props: CompensationProps & BaseComponentInterface) {
  useComponentDictionary('Employee.Compensation', props.dictionary)
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

const Root = ({ employeeId, startDate, className, children, ...props }: CompensationProps) => {
  useI18n('Employee.Compensation')

  const { data, actions, meta, form } = useEmployeeCompensation({
    employeeId,
    startDate,
    defaultValues: props.defaultValues,
  })

  return (
    <section className={className}>
      <CompensationProvider
        value={{
          employeeJobs: data.employeeJobs,
          currentJob: data.currentJob,
          primaryFlsaStatus: data.primaryFlsaStatus,
          showFlsaChangeWarning: meta.showFlsaChangeWarning,
          mode: meta.mode,
          minimumWages: data.minimumWages,
          handleFlsaChange: actions.handleFlsaChange,
          handleDelete: actions.handleDelete,
          handleEdit: actions.handleEdit,
          handleAdd: actions.handleAdd,
          submitWithEffect: actions.submitWithEffect,
          handleCancelAddJob: actions.handleCancelAddJob,
          isPending: meta.isPending,
          state: data.state,
          showTwoPercentStakeholder: data.showTwoPercentStakeholder,
        }}
      >
        <FormProvider {...form}>
          <Form>
            {children ? (
              children
            ) : (
              <>
                <Head />
                <List />
                <Edit />
                <Actions />
              </>
            )}
          </Form>
        </FormProvider>
      </CompensationProvider>
    </section>
  )
}

export const CompensationContextual = () => {
  const { employeeId, onEvent, startDate, defaultValues } = useFlow<OnboardingContextInterface>()
  const { t } = useTranslation('common')

  if (!employeeId || !startDate) {
    throw new Error(
      t('errors.missingParamsOrContext', {
        component: 'Compensation',
        param: !employeeId ? 'employeeId' : 'startDate',
        provider: 'FlowProvider',
      }),
    )
  }
  return (
    <Compensation
      employeeId={employeeId}
      startDate={startDate}
      onEvent={onEvent}
      defaultValues={defaultValues?.compensation}
    />
  )
}
