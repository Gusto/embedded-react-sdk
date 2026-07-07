import { useMemo } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import z from 'zod'
import { useContractorsGetSuspense } from '@gusto/embedded-api/react-query/contractorsGet'
import { useContractorsUpdateMutation } from '@gusto/embedded-api/react-query/contractorsUpdate'
import { BaseComponent, useBase } from '@/components/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Form } from '@/components/Common/Form'
import { ActionsLayout } from '@/components/Common/ActionsLayout'
import { Flex, RadioGroupField, SelectField } from '@/components/Common'
import { componentEvents, STATES_ABBR } from '@/shared/constants'

const NewHireReportSchema = z.union([
  z.object({
    fileNewHireReport: z.boolean().refine(v => v),
    state: z.string().min(1),
  }),
  z.object({
    fileNewHireReport: z.boolean().refine(v => !v),
  }),
])

type NewHireReportInputs = z.input<typeof NewHireReportSchema>

interface ContractorNewHireReportProps {
  contractorId: string
  selfOnboarding?: boolean
  onEvent: (eventType: string, data?: unknown) => void
}

export function ContractorNewHireReport(props: ContractorNewHireReportProps) {
  return (
    <BaseComponent onEvent={props.onEvent}>
      <Root contractorId={props.contractorId} selfOnboarding={props.selfOnboarding} />
    </BaseComponent>
  )
}

function Root({
  contractorId,
  selfOnboarding = false,
}: {
  contractorId: string
  selfOnboarding?: boolean
}) {
  const { onEvent, baseSubmitHandler } = useBase()
  const Components = useComponentContext()

  const {
    data: { contractor },
  } = useContractorsGetSuspense({ contractorUuid: contractorId })
  const contractorDetails = contractor!

  const { mutateAsync: updateContractor, isPending } = useContractorsUpdateMutation()

  const defaultValues = useMemo(
    () => ({
      fileNewHireReport: contractorDetails.fileNewHireReport || false,
      state: contractorDetails.workState || null,
    }),
    [contractorDetails],
  )

  const formMethods = useForm({
    resolver: zodResolver(NewHireReportSchema),
    defaultValues,
  })

  const watchedDoFile = useWatch({ control: formMethods.control, name: 'fileNewHireReport' })

  const onSubmit = async (data: NewHireReportInputs) => {
    await baseSubmitHandler(data, async payload => {
      const contractorResponse = await updateContractor({
        request: {
          contractorUuid: contractorId,
          contractorUpdateRequestBody: {
            type: contractorDetails.type,
            selfOnboarding,
            fileNewHireReport: payload.fileNewHireReport,
            workState: 'state' in payload ? payload.state : null,
            version: contractorDetails.version!,
          },
        },
      })
      onEvent(componentEvents.CONTRACTOR_NEW_HIRE_REPORT_UPDATED, contractorResponse)
      onEvent(componentEvents.CONTRACTOR_NEW_HIRE_REPORT_DONE)
    })
  }

  return (
    <FormProvider {...formMethods}>
      <Form onSubmit={formMethods.handleSubmit(onSubmit)}>
        <Flex flexDirection="column" gap={24}>
          <header>
            <Components.Heading as="h2">New hire report</Components.Heading>
            <Components.Text>
              Some states require you to report new hires to the state within a certain time frame.
              Would you like Gusto to file a new hire report for this contractor?
            </Components.Text>
          </header>

          <RadioGroupField
            name="fileNewHireReport"
            label="File new hire report"
            shouldVisuallyHideLabel
            options={[
              { value: true, label: 'Yes, file the report for me' },
              { value: false, label: 'No, I have already filed or will file on my own' },
            ]}
          />

          {watchedDoFile && (
            <SelectField
              name="state"
              options={STATES_ABBR.map(s => ({ label: s, value: s }))}
              label="Work state"
              placeholder=""
              errorMessage="Please select a state"
              isRequired
            />
          )}

          <ActionsLayout>
            <Components.Button type="submit" variant="primary" isDisabled={isPending}>
              {isPending ? 'Saving...' : 'Continue'}
            </Components.Button>
          </ActionsLayout>
        </Flex>
      </Form>
    </FormProvider>
  )
}
