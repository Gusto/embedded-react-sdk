import type { SubmitHandler } from 'react-hook-form'
import { useForm, useWatch } from 'react-hook-form'
import { useMemo } from 'react'
import z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useContractorsGetSuspense } from '@gusto/embedded-api/react-query/contractorsGet'
import { useContractorsUpdateMutation } from '@gusto/embedded-api/react-query/contractorsUpdate'
import { useBase } from '@/components/Base'
import type { OnEventType } from '@/components/Base/useBase'
import { type EventType, componentEvents } from '@/shared/constants'

const NewHireReportSchema = z.union([
  z.object({
    fileNewHireReport: z.boolean().refine(v => v),
    state: z.string().min(1),
  }),
  z.object({
    fileNewHireReport: z.boolean().refine(v => !v),
  }),
])

export type NewHireReportSchemaInputs = z.input<typeof NewHireReportSchema>

export interface UseContractorNewHireReportProps {
  contractorId: string
  selfOnboarding?: boolean
  onEvent?: OnEventType<EventType, unknown>
}

export function useContractorNewHireReport({
  contractorId,
  selfOnboarding = false,
}: UseContractorNewHireReportProps) {
  const { onEvent, baseSubmitHandler } = useBase()

  const {
    data: { contractor },
  } = useContractorsGetSuspense({ contractorUuid: contractorId })
  const contractorDetails = contractor!

  const { mutateAsync: updateContractor, isPending: updateContractorPending } =
    useContractorsUpdateMutation()

  const defaultValues = useMemo(
    () => ({
      fileNewHireReport: contractorDetails.fileNewHireReport || false,
      state: contractorDetails.workState || null,
    }),
    [contractorDetails],
  )

  const formMethods = useForm({
    resolver: zodResolver(NewHireReportSchema),
    defaultValues: defaultValues,
  })

  const watchedDoFile = useWatch({ control: formMethods.control, name: 'fileNewHireReport' })

  const onSubmit: SubmitHandler<NewHireReportSchemaInputs> = async data => {
    await baseSubmitHandler(data, async payload => {
      const contractorResponse = await updateContractor({
        request: {
          contractorUuid: contractorId,
          requestBody: {
            type: contractorDetails.type,
            selfOnboarding: selfOnboarding,
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

  return {
    data: {
      contractorDetails,
      watchedDoFile,
      defaultValues,
    },
    actions: {
      onSubmit,
    },
    meta: {
      isPending: updateContractorPending,
    },
    form: {
      formMethods,
    },
  }
}
