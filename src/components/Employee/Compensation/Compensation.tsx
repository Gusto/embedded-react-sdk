import { valibotResolver } from '@hookform/resolvers/valibot'
import { useEffect, useMemo, useState } from 'react'
import { Form } from 'react-aria-components'
import { FormProvider, useForm, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import * as v from 'valibot'
import {
  BaseComponent,
  type BaseComponentInterface,
  useBase,
  type CommonComponentInterface,
  createCompoundContext,
} from '@/components/Base'
import { useFlow, type EmployeeOnboardingContextInterface } from '@/components/Flow'
import { yearlyRate } from '@/helpers/payRateCalculator'
import { useI18n } from '@/i18n'
import { componentEvents, FLSA_OVERTIME_SALARY_LIMIT, FlsaStatus } from '@/shared/constants'
import { Actions } from './Actions'
import { Edit } from './Edit'
import { Head } from './Head'
import { List } from './List'
import type { Schemas } from '@/types/schema'
import {
  useCreateEmployeeJob,
  useDeleteEmployeeJob,
  useGetEmployeeJobs,
  useUpdateEmployeeCompensation,
  useUpdateEmployeeJob,
} from '@/api/queries/employee'

interface CompensationProps extends CommonComponentInterface {
  employeeId: string
  startDate: string
  defaultValues?: Pick<Schemas['Job'], 'rate' | 'title' | 'payment_unit'>
}
type MODE =
  | 'LIST'
  | 'ADD_ADDITIONAL_JOB'
  | 'ADD_INITIAL_JOB'
  | 'EDIT_ADDITIONAL_JOB'
  | 'EDIT_INITIAL_JOB'
  | 'PROCEED'

type CompensationContextType = {
  employeeJobs: Schemas['Job'][]
  currentJob?: Schemas['Job'] | null
  primaryFlsaStatus?: string
  isPending: boolean
  mode: MODE
  showFlsaChangeWarning: boolean
  submitWithEffect: (newMode: MODE) => void
  handleAdd: () => void
  handleEdit: (uuid: string) => void
  handleDelete: (uuid: string) => void
  handleFlsaChange: (status: string | number) => void
  handleCancelAddJob: () => void
}
const [useCompensation, CompensationProvider] =
  createCompoundContext<CompensationContextType>('CompensationContext')
export { useCompensation }

const CompensationSchema = v.intersect([
  v.object({
    job_title: v.pipe(v.string(), v.nonEmpty()),
  }),
  v.variant('flsa_status', [
    v.pipe(
      v.object({
        flsa_status: v.union([
          v.literal(FlsaStatus.EXEMPT),
          v.literal(FlsaStatus.SALARIED_NONEXEMPT),
          v.literal(FlsaStatus.NONEXEMPT),
        ]),
        payment_unit: v.union([
          v.literal('Hour'),
          v.literal('Week'),
          v.literal('Month'),
          v.literal('Year'),
        ]),
        rate: v.pipe(v.number(), v.minValue(1), v.transform(String)),
      }),
      //Exempt salary threshold validation:
      v.forward(
        v.check(input => {
          return (
            //TODO: this should not be validated for non-primary jobs for NONEXEMPT
            input.flsa_status !== FlsaStatus.EXEMPT ||
            yearlyRate(Number(input.rate), input.payment_unit) >= FLSA_OVERTIME_SALARY_LIMIT
          )
        }),
        ['flsa_status'],
      ),
    ),
    v.object({
      flsa_status: v.literal(FlsaStatus.OWNER),
      payment_unit: v.literal('Paycheck'),
      rate: v.pipe(v.number(), v.minValue(1), v.transform(String)),
    }),
    v.object({
      flsa_status: v.union([
        v.literal(FlsaStatus.COMMISSION_ONLY_EXEMPT),
        v.literal(FlsaStatus.COMISSION_ONLY_NONEXEMPT),
      ]),
      payment_unit: v.literal('Year'),
      rate: v.pipe(v.literal(0), v.transform(String)),
    }),
  ]),
])
export type CompensationInputs = v.InferInput<typeof CompensationSchema>
export type CompensationOutputs = v.InferOutput<typeof CompensationSchema>

export function Compensation(props: CompensationProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

const findCurrentCompensation = (employeeJob?: Schemas['Job'] | null) => {
  return employeeJob?.compensations?.find(
    comp => comp.uuid === employeeJob.current_compensation_uuid,
  )
}

const Root = ({ employeeId, startDate, className, children, ...props }: CompensationProps) => {
  useI18n('Employee.Compensation')
  const { baseSubmitHandler, onEvent } = useBase()
  const { data: employeeJobs } = useGetEmployeeJobs(employeeId)

  //Job being edited/created
  const [currentJob, setCurrentJob] = useState<Schemas['Job'] | null>(
    employeeJobs.length === 1 ? (employeeJobs[0] ?? null) : null,
  )

  const [mode, setMode] = useState<MODE>(() => {
    if (!employeeJobs.length) {
      return 'ADD_INITIAL_JOB'
    }

    const currentCompensation = findCurrentCompensation(employeeJobs[0])

    if (employeeJobs.length === 1 && currentCompensation?.flsa_status !== FlsaStatus.NONEXEMPT) {
      return 'EDIT_INITIAL_JOB'
    }

    return 'LIST'
  })

  const [showFlsaChangeWarning, setShowFlsaChangeWarning] = useState(false)
  //Getting current compensation for a job -> the one with the most recent effective date
  const currentCompensation = findCurrentCompensation(currentJob)
  /** Returns FLSA status of a current compensation of a primary job:
   * Employees can have multiple jobs, with multiple compensations, but only 1 job is primary with 1 current compensation
   */
  const primaryFlsaStatus = useMemo<string | undefined>(() => {
    return employeeJobs.reduce<string | undefined>((prev, curr) => {
      const compensation = curr.compensations?.find(
        comp => comp.uuid === curr.current_compensation_uuid,
      )
      if (!curr.primary || !compensation) return prev
      return compensation.flsa_status ?? prev
    }, undefined)
  }, [employeeJobs])

  const defaultValues: CompensationInputs = useMemo(() => {
    return {
      job_title:
        currentJob?.title && currentJob.title !== ''
          ? currentJob.title
          : (props.defaultValues?.title ?? ''),
      flsa_status: currentCompensation?.flsa_status ?? primaryFlsaStatus,
      rate: Number(currentCompensation?.rate ?? props.defaultValues?.rate ?? 0),
      payment_unit:
        currentCompensation?.payment_unit ?? props.defaultValues?.payment_unit ?? 'Hour',
    } as CompensationInputs
  }, [currentJob, currentCompensation, primaryFlsaStatus, props.defaultValues])

  const formMethods = useForm<CompensationInputs, unknown, CompensationOutputs>({
    resolver: valibotResolver(CompensationSchema),
    defaultValues,
  })
  const { resetField, setValue, handleSubmit, reset } = formMethods
  useEffect(() => {
    reset(defaultValues)
  }, [currentJob, defaultValues, reset])

  const updateCompensationMutation = useUpdateEmployeeCompensation(employeeId)
  const createEmployeeJobMutation = useCreateEmployeeJob()
  const updateEmployeeJobMutation = useUpdateEmployeeJob()
  const deleteEmployeeJobMutation = useDeleteEmployeeJob(employeeId)

  const submitWithEffect = async (newMode?: MODE) => {
    if (mode === 'LIST' && newMode === 'PROCEED') {
      onEvent(componentEvents.EMPLOYEE_COMPENSATION_DONE)
      return
    }
    //If no job has been modified, switch to edit mode
    if (!currentJob && mode === 'LIST') {
      setMode('ADD_ADDITIONAL_JOB')
      return
    }
    //Performing post-submit state setting only on success
    await handleSubmit(async (data: CompensationOutputs) => {
      await onSubmit(data)
      switch (newMode) {
        case 'LIST':
          setMode('LIST')
          setCurrentJob(null)
          reset(defaultValues)
          break
        default:
          onEvent(componentEvents.EMPLOYEE_COMPENSATION_DONE)
      }
    })()
  }
  const handleAdd = () => {
    setMode('ADD_ADDITIONAL_JOB')
    setCurrentJob(null)
    reset(defaultValues)
  }

  const handleCancelAddJob = () => {
    if (employeeJobs.length > 0) {
      setMode('LIST')
    } else {
      setMode('ADD_INITIAL_JOB')
    }

    setCurrentJob(null)
    reset(defaultValues)
  }

  const handleEdit = (uuid: string) => {
    const selectedJob = employeeJobs.find(job => uuid === job.uuid)
    if (selectedJob) {
      setMode('EDIT_ADDITIONAL_JOB')
      setCurrentJob(selectedJob)
    }
  }

  const handleDelete = async (uuid: string) => {
    await deleteEmployeeJobMutation.mutateAsync(uuid)
    onEvent(componentEvents.EMPLOYEE_JOB_DELETED)
  }

  /**Update dependent field values upon change in FLSA type */
  const handleFlsaChange = (value: string | number) => {
    //Attempting to change flsa status from nonexempt should prompt user about deletion of other jobs associated with the employee
    if (currentCompensation?.flsa_status === FlsaStatus.NONEXEMPT && employeeJobs.length > 1) {
      setShowFlsaChangeWarning(true)
    }
    if (value === FlsaStatus.OWNER) {
      setValue('payment_unit', 'Paycheck')
      resetField('rate', { defaultValue: Number(currentCompensation?.rate) })
    } else if (
      value === FlsaStatus.COMISSION_ONLY_NONEXEMPT ||
      value === FlsaStatus.COMMISSION_ONLY_EXEMPT
    ) {
      setValue('payment_unit', 'Year')
      setValue('rate', 0)
    } else {
      //reset fields
      resetField('payment_unit', { defaultValue: currentCompensation?.payment_unit })
      resetField('rate', { defaultValue: Number(currentCompensation?.rate) })
    }
  }

  const onSubmit: SubmitHandler<CompensationOutputs> = async data => {
    await baseSubmitHandler(data, async payload => {
      const { job_title, ...compensationData } = payload
      let updatedJobData: Awaited<ReturnType<typeof createEmployeeJobMutation.mutateAsync>>
      //Note: some of the type fixes below are due to the fact that API incorrectly defines current_compensation_uuid as optional
      if (!currentJob) {
        //Adding new job for NONEXEMPT
        updatedJobData = await createEmployeeJobMutation.mutateAsync({
          employee_id: employeeId,
          body: { title: job_title, hire_date: startDate },
        })
        onEvent(componentEvents.EMPLOYEE_JOB_CREATED, updatedJobData)
      } else {
        updatedJobData = await updateEmployeeJobMutation.mutateAsync({
          job_id: currentJob.uuid,
          body: {
            title: job_title,
            version: currentJob.version as string,
            hire_date: startDate,
          },
        })
        onEvent(componentEvents.EMPLOYEE_JOB_UPDATED, updatedJobData)
      }
      const compensation = await updateCompensationMutation.mutateAsync({
        compensation_id: updatedJobData.current_compensation_uuid as string,
        body: {
          version: updatedJobData.compensations?.find(
            comp => comp.uuid === updatedJobData.current_compensation_uuid,
          )?.version as string,
          ...compensationData,
        },
      })
      setShowFlsaChangeWarning(false)
      onEvent(componentEvents.EMPLOYEE_COMPENSATION_UPDATED, compensation)
    })
  }
  return (
    <section className={className}>
      <CompensationProvider
        value={{
          employeeJobs,
          currentJob,
          primaryFlsaStatus,
          showFlsaChangeWarning,
          mode,
          handleFlsaChange,
          handleDelete,
          handleEdit,
          handleAdd,
          submitWithEffect,
          handleCancelAddJob,
          isPending:
            updateCompensationMutation.isPending ||
            createEmployeeJobMutation.isPending ||
            updateEmployeeJobMutation.isPending ||
            deleteEmployeeJobMutation.isPending,
        }}
      >
        <FormProvider {...formMethods}>
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

Compensation.Head = Head
Compensation.List = List
Compensation.Actions = Actions
Compensation.Edit = Edit

export const CompensationContextual = () => {
  const { employeeId, onEvent, startDate } = useFlow<EmployeeOnboardingContextInterface>()
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
  return <Compensation employeeId={employeeId} startDate={startDate} onEvent={onEvent} />
}
