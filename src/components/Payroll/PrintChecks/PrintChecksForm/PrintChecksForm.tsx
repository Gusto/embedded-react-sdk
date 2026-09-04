import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { usePayrollsGeneratePrintableChecksMutation } from '@gusto/embedded-api/react-query/payrollsGeneratePrintableChecks'
import {
  PrintingFormat,
  type PrintablePayrollChecksBody,
} from '@gusto/embedded-api/models/components/printablepayrollchecksbody'
import { useGenerationPoll } from './useGenerationPoll'
import { BaseComponent, useBase, type BaseComponentInterface } from '@/components/Base'
import type { OnEventType } from '@/components/Base/useBase'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useComponentDictionary, useI18n } from '@/i18n'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import { ActionsLayout, Flex, NumberInputField, RadioGroupField } from '@/components/Common'
import { Form } from '@/components/Common/Form'
import { printChecksEvents, type EventType } from '@/shared/constants'
import type { RadioGroupOption } from '@/index'

interface PrintChecksFormProps extends BaseComponentInterface<'Payroll.PrintChecksForm'> {
  payrollId: string
  /** Whether a generate-and-poll cycle is in flight; disables the fields while true. */
  isGenerating?: boolean
}

// The Footer is rendered by the top-level orchestrator as a sibling of this component (not a
// child), so it can only read shared state — like whether a generate-and-poll cycle is in
// flight — via the machine's FlowContext rather than as a prop. This narrow interface describes
// only the field Footer needs, rather than depending on the orchestrator's full context type.
interface PrintChecksFormFlowContext extends FlowContextInterface {
  isGenerating?: boolean
}

const PrintChecksFormSchema = z.object({
  printingFormat: z.nativeEnum(PrintingFormat),
  startingCheckNumber: z
    .number({ message: 'invalidStartingCheckNumber' })
    .int({ message: 'invalidStartingCheckNumber' })
    .nonnegative({ message: 'invalidStartingCheckNumber' })
    .lt(10_000_000_000, { message: 'invalidStartingCheckNumber' })
    .optional(),
})

type PrintChecksFormValues = z.infer<typeof PrintChecksFormSchema>

const PRINT_CHECKS_FORM_ID = 'gusto-sdk-print-checks-form'

const isErrorList = (val: unknown): val is { message?: string }[] =>
  Array.isArray(val) && val.every(entry => typeof entry === 'object' && entry !== null)

const extractErrorMessage = (err: unknown): string | null => {
  if (err && typeof err === 'object' && 'errors' in err && isErrorList(err.errors)) {
    const [firstError] = err.errors
    if (firstError?.message) return firstError.message
  }
  return err instanceof Error ? err.message : null
}

const buildRequestBody = (data: PrintChecksFormValues): PrintablePayrollChecksBody => ({
  printingFormat: data.printingFormat,
  ...(data.printingFormat === PrintingFormat.Bottom && data.startingCheckNumber !== undefined
    ? { startingCheckNumber: data.startingCheckNumber }
    : {}),
})

// Navigates directly to `url` via a synthetic anchor click rather than `fetch`-ing it into a blob:
// the generated-document URL is a signed, cross-origin S3 URL with `response-content-disposition:
// attachment` baked into its query string, so a direct browser-level request downloads it via that
// response header — but a `fetch()` from JS is subject to CORS, which the bucket doesn't allow, and
// fails outright. A plain navigation isn't subject to CORS and never opens a new tab or navigates
// the host page, since the browser intercepts the download instead of rendering a response.
const downloadGeneratedChecks = (url: string) => {
  const link = document.createElement('a')
  link.href = url
  link.rel = 'noopener noreferrer'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/** @internal */
export function PrintChecksForm(props: PrintChecksFormProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

const Root = ({ dictionary, payrollId, isGenerating }: PrintChecksFormProps) => {
  useComponentDictionary('Payroll.PrintChecksForm', dictionary)
  useI18n('Payroll.PrintChecksForm')
  const { t } = useTranslation('Payroll.PrintChecksForm')
  const { onEvent, baseSubmitHandler } = useBase()

  const formMethods = useForm<PrintChecksFormValues>({
    resolver: zodResolver(PrintChecksFormSchema),
    defaultValues: { printingFormat: PrintingFormat.Top, startingCheckNumber: 0 },
  })

  const printingFormat = useWatch<PrintChecksFormValues, 'printingFormat'>({
    name: 'printingFormat',
    control: formMethods.control,
  })

  const { mutateAsync } = usePayrollsGeneratePrintableChecksMutation()

  const { start: startGenerationPoll } = useGenerationPoll({
    onSucceeded: url => {
      onEvent(printChecksEvents.PRINT_CHECKS_GENERATE_SUCCEEDED, { documentUrl: url })
      if (url) {
        downloadGeneratedChecks(url)
      }
    },
    onFailed: () => {
      onEvent(printChecksEvents.PRINT_CHECKS_GENERATE_FAILED, { errorMessage: null })
    },
  })

  const onSubmit = async (formData: PrintChecksFormValues) => {
    onEvent(printChecksEvents.PRINT_CHECKS_GENERATE_START)

    await baseSubmitHandler(formData, async submittedData => {
      try {
        const result = await mutateAsync({
          request: {
            payrollUuid: payrollId,
            printablePayrollChecksBody: buildRequestBody(submittedData),
          },
        })

        const nextRequestUuid = result.payrollCheck?.requestUuid
        if (!nextRequestUuid) {
          throw new Error('Missing requestUuid in generate-printable-checks response')
        }

        startGenerationPoll(nextRequestUuid)
      } catch (err) {
        onEvent(printChecksEvents.PRINT_CHECKS_GENERATE_FAILED, {
          errorMessage: extractErrorMessage(err),
        })
        throw err
      }
    })
  }

  const startingCheckNumberErrorCode = formMethods.formState.errors.startingCheckNumber?.message
  const startingCheckNumberErrorMessage = startingCheckNumberErrorCode
    ? t('validations.startingCheckNumber')
    : undefined

  const printingFormatOptions: RadioGroupOption[] = [
    {
      value: PrintingFormat.Top,
      label: t('customStockLabel'),
      description: t('customStockDescription'),
    },
    {
      value: PrintingFormat.Bottom,
      label: t('blankStockLabel'),
      description: t('blankStockDescription'),
    },
  ]

  return (
    <FormProvider {...formMethods}>
      <Form id={PRINT_CHECKS_FORM_ID} onSubmit={formMethods.handleSubmit(onSubmit)}>
        <Flex flexDirection="column" gap={20}>
          <RadioGroupField
            name="printingFormat"
            label={t('modalTitle')}
            options={printingFormatOptions}
            isRequired
            isDisabled={isGenerating}
          />
          {printingFormat === PrintingFormat.Bottom && (
            <NumberInputField
              name="startingCheckNumber"
              label={t('startingCheckNumberLabel')}
              description={t('startingCheckNumberDescription')}
              errorMessage={startingCheckNumberErrorMessage}
              isDisabled={isGenerating}
              min={0}
            />
          )}
        </Flex>
      </Form>
    </FormProvider>
  )
}

const Footer = ({ onEvent }: { onEvent: OnEventType<EventType, unknown> }) => {
  useI18n('Payroll.PrintChecksForm')
  const { t } = useTranslation('Payroll.PrintChecksForm')
  const { Button } = useComponentContext()
  const { isGenerating } = useFlow<PrintChecksFormFlowContext>()

  return (
    <ActionsLayout>
      <Button
        variant="secondary"
        onClick={() => {
          onEvent(printChecksEvents.PRINT_CHECKS_CANCEL)
        }}
        isDisabled={isGenerating}
      >
        {t('cancelCta')}
      </Button>
      <Button variant="primary" type="submit" form={PRINT_CHECKS_FORM_ID} isDisabled={isGenerating}>
        {isGenerating ? t('submitCtaLoading') : t('submitCta')}
      </Button>
    </ActionsLayout>
  )
}
PrintChecksForm.Footer = Footer
