import { useEffect, useRef, useState } from 'react'
import { useForm, type UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { usePayrollsGeneratePrintableChecksMutation } from '@gusto/embedded-api/react-query/payrollsGeneratePrintableChecks'
import { useGeneratedDocumentsGet } from '@gusto/embedded-api/react-query/generatedDocumentsGet'
import {
  PrintingFormat,
  type PrintablePayrollChecksBody,
} from '@gusto/embedded-api/models/components/printablepayrollchecksbody'
import { DocumentType } from '@gusto/embedded-api/models/operations/getv1generateddocumentsdocumenttyperequestuuid'
import { GeneratedDocumentStatus } from '@gusto/embedded-api/models/components/generateddocument'
import { useBase } from '@/components/Base'
import { componentEvents } from '@/shared/constants'

const PrintChecksFormSchema = z.object({
  printingFormat: z.nativeEnum(PrintingFormat),
  startingCheckNumber: z
    .number({ message: 'invalidStartingCheckNumber' })
    .int({ message: 'invalidStartingCheckNumber' })
    .nonnegative({ message: 'invalidStartingCheckNumber' })
    .lt(10_000_000_000, { message: 'invalidStartingCheckNumber' })
    .optional(),
})

/** @internal */
export type PrintChecksFormValues = z.infer<typeof PrintChecksFormSchema>

/** @internal */
export type PrintChecksModalPhase = 'form' | 'generating' | 'succeeded' | 'failed'

interface UsePrintChecksModalParams {
  payrollUuid: string
  isOpen: boolean
}

/** @internal */
export interface UsePrintChecksModalReturn {
  formMethods: UseFormReturn<PrintChecksFormValues>
  phase: PrintChecksModalPhase
  documentUrl: string | null
  errorMessage: string | null
  onSubmit: (data: PrintChecksFormValues) => Promise<void>
  onRetry: () => void
}

const extractErrorMessage = (err: unknown): string | null => {
  if (err && typeof err === 'object' && 'errors' in err && Array.isArray(err.errors)) {
    const [firstError] = err.errors as { message?: string }[]
    if (firstError?.message) return firstError.message
  }
  return err instanceof Error ? err.message : null
}

const buildRequestBody = (data: PrintChecksFormValues): PrintablePayrollChecksBody => ({
  printingFormat: data.printingFormat,
  ...(data.printingFormat === PrintingFormat.Bottom && data.startingCheckNumber
    ? { startingCheckNumber: data.startingCheckNumber }
    : {}),
})

/** @internal */
export function usePrintChecksModal({
  payrollUuid,
  isOpen,
}: UsePrintChecksModalParams): UsePrintChecksModalReturn {
  const { baseSubmitHandler, onEvent } = useBase()
  const [phase, setPhase] = useState<PrintChecksModalPhase>('form')
  const [requestUuid, setRequestUuid] = useState<string | null>(null)
  const [documentUrl, setDocumentUrl] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const printWindowRef = useRef<Window | null>(null)

  const formMethods = useForm<PrintChecksFormValues>({
    resolver: zodResolver(PrintChecksFormSchema),
    defaultValues: { printingFormat: PrintingFormat.Top, startingCheckNumber: 0 },
  })

  const { mutateAsync } = usePayrollsGeneratePrintableChecksMutation()

  const { data } = useGeneratedDocumentsGet(
    {
      documentType: DocumentType.PrintablePayrollChecks,
      requestUuid: requestUuid || '',
    },
    {
      enabled: !!requestUuid,
      refetchInterval: isPolling ? 5_000 : false,
    },
  )

  useEffect(() => {
    if (!isOpen) {
      formMethods.reset({ printingFormat: PrintingFormat.Top, startingCheckNumber: 0 })
      setPhase('form')
      setRequestUuid(null)
      setDocumentUrl(null)
      setErrorMessage(null)
      setIsPolling(false)
      printWindowRef.current?.close()
      printWindowRef.current = null
    }
  }, [isOpen, formMethods.reset])

  useEffect(() => {
    const status = data?.generatedDocument?.status
    if (!isPolling || !status) return

    if (status === GeneratedDocumentStatus.Succeeded) {
      setIsPolling(false)
      const url = data.generatedDocument?.documentUrls?.[0] ?? null
      setDocumentUrl(url)
      setPhase('succeeded')
      if (printWindowRef.current && url) {
        printWindowRef.current.location.href = url
      }
      onEvent(componentEvents.RUN_PAYROLL_PRINT_CHECKS_GENERATED, data.generatedDocument)
    } else if (status === GeneratedDocumentStatus.Failed) {
      setIsPolling(false)
      printWindowRef.current?.close()
      printWindowRef.current = null
      setPhase('failed')
      onEvent(componentEvents.RUN_PAYROLL_PRINT_CHECKS_FAILED)
    }
  }, [data, isPolling, onEvent])

  const onSubmit = async (formData: PrintChecksFormValues) => {
    setErrorMessage(null)
    setPhase('generating')
    try {
      printWindowRef.current = window.open('', '_blank')
    } catch {
      // A blocked or disallowed window.open() should degrade to the fallback link in the
      // succeeded phase, not abort the submission.
      printWindowRef.current = null
    }

    await baseSubmitHandler(formData, async submittedData => {
      try {
        const result = await mutateAsync({
          request: {
            payrollUuid,
            printablePayrollChecksBody: buildRequestBody(submittedData),
          },
        })

        const nextRequestUuid = result.payrollCheck?.requestUuid
        if (!nextRequestUuid) {
          throw new Error('Missing requestUuid in generate-printable-checks response')
        }

        setRequestUuid(nextRequestUuid)
        setIsPolling(true)
        onEvent(componentEvents.RUN_PAYROLL_PRINT_CHECKS_REQUESTED, result.payrollCheck)
      } catch (err) {
        printWindowRef.current?.close()
        printWindowRef.current = null
        setErrorMessage(extractErrorMessage(err))
        setPhase('failed')
        throw err
      }
    })
  }

  const onRetry = () => {
    setErrorMessage(null)
    setRequestUuid(null)
    setDocumentUrl(null)
    setPhase('form')
  }

  return { formMethods, phase, documentUrl, errorMessage, onSubmit, onRetry }
}
