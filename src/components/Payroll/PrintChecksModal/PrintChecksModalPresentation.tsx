import { useId } from 'react'
import { FormProvider, useWatch, type UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { PrintingFormat } from '@gusto/embedded-api/models/components/printablepayrollchecksbody'
import type { PrintChecksFormValues, PrintChecksModalPhase } from './usePrintChecksModal'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { ActionsLayout, Flex, NumberInputField, RadioGroupField } from '@/components/Common'
import { Form } from '@/components/Common/Form'
import { useI18n } from '@/i18n'
import type { RadioGroupOption } from '@/index'

interface PrintChecksModalPresentationProps {
  isOpen: boolean
  onClose: () => void
  formMethods: UseFormReturn<PrintChecksFormValues>
  phase: PrintChecksModalPhase
  documentUrl: string | null
  errorMessage: string | null
  onSubmit: (data: PrintChecksFormValues) => void
  onRetry: () => void
}

/** @internal */
export const PrintChecksModalPresentation = ({
  isOpen,
  onClose,
  formMethods,
  phase,
  documentUrl,
  errorMessage,
  onSubmit,
  onRetry,
}: PrintChecksModalPresentationProps) => {
  const formId = useId()
  useI18n('Payroll.PrintChecksModal')
  const { t } = useTranslation('Payroll.PrintChecksModal')
  const { Modal, Button, Heading, Text, Alert, Link } = useComponentContext()

  const printingFormat = useWatch<PrintChecksFormValues, 'printingFormat'>({
    name: 'printingFormat',
    control: formMethods.control,
  })

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

  const isGenerating = phase === 'generating'
  const isFormPhase = phase === 'form' || phase === 'generating'

  const footer = isFormPhase ? (
    <ActionsLayout>
      <Button variant="secondary" onClick={onClose} isDisabled={isGenerating}>
        {t('cancelCta')}
      </Button>
      <Button variant="primary" type="submit" form={formId} isDisabled={isGenerating}>
        {isGenerating ? t('submitCtaLoading') : t('submitCta')}
      </Button>
    </ActionsLayout>
  ) : (
    <ActionsLayout>
      <Button variant="secondary" onClick={onClose}>
        {t('closeCta')}
      </Button>
    </ActionsLayout>
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} footer={footer}>
      {phase === 'succeeded' && (
        <Flex flexDirection="column" gap={16}>
          <Heading as="h2">{t('succeededTitle')}</Heading>
          <Text variant="supporting">{t('succeededDescription')}</Text>
          {documentUrl && (
            <Link href={documentUrl} target="_blank" rel="noreferrer">
              {t('viewChecksCta')}
            </Link>
          )}
        </Flex>
      )}
      {phase === 'failed' && (
        <Flex flexDirection="column" gap={16}>
          <Alert status="error" disableScrollIntoView label={t('failedTitle')}>
            {errorMessage}
          </Alert>
          <Button variant="secondary" onClick={onRetry}>
            {t('retryCta')}
          </Button>
        </Flex>
      )}
      {isFormPhase && (
        <FormProvider {...formMethods}>
          <Form id={formId} onSubmit={formMethods.handleSubmit(onSubmit)}>
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
      )}
    </Modal>
  )
}
