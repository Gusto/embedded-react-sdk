import { useEffect, useRef, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import type { GrossUpModalProps } from './GrossUpModalTypes'
import styles from './GrossUpModal.module.scss'
import { ActionsLayout, NumberInputField } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { formatNumberAsCurrency } from '@/helpers/formattedStrings'

const GrossUpFormSchema = z.object({
  netPay: z.number().positive(),
})

type GrossUpFormValues = z.infer<typeof GrossUpFormSchema>

export function GrossUpModal({
  isOpen,
  onCalculateGrossUp,
  isPending,
  onApply,
  onCancel,
}: GrossUpModalProps) {
  useI18n('Payroll.GrossUpModal')
  const { t } = useTranslation('Payroll.GrossUpModal')
  const { Modal, Heading, Text, Button, Alert } = useComponentContext()
  const modalContainerRef = useRef<HTMLDivElement>(null)

  const [calculatedGrossUp, setCalculatedGrossUp] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isApplying, setIsApplying] = useState(false)

  const formHandlers = useForm<GrossUpFormValues>({
    resolver: zodResolver(GrossUpFormSchema),
    defaultValues: { netPay: 0 },
  })

  useEffect(() => {
    if (!isOpen) {
      formHandlers.reset({ netPay: 0 })
      setCalculatedGrossUp(null)
      setErrorMessage(null)
    }
  }, [isOpen, formHandlers])

  const handleCalculate = async (data: GrossUpFormValues) => {
    setErrorMessage(null)
    setCalculatedGrossUp(null)

    const result = await onCalculateGrossUp(data.netPay)

    if (result) {
      setCalculatedGrossUp(result)
    } else {
      setErrorMessage(t('errorMessage'))
    }
  }

  const handleApply = async () => {
    if (calculatedGrossUp) {
      setIsApplying(true)
      try {
        await onApply(parseFloat(calculatedGrossUp))
      } finally {
        setIsApplying(false)
      }
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      containerRef={modalContainerRef}
      footer={
        <ActionsLayout>
          <Button variant="secondary" onClick={onCancel}>
            {t('cancelCta')}
          </Button>
          {calculatedGrossUp ? (
            <Button variant="primary" onClick={handleApply} isLoading={isApplying}>
              {t('applyCta')}
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={formHandlers.handleSubmit(handleCalculate)}
              isLoading={isPending}
            >
              {t('calculateCta')}
            </Button>
          )}
        </ActionsLayout>
      }
    >
      <FormProvider {...formHandlers}>
        <div className={styles.content}>
          <div className={styles.header}>
            <Heading as="h2" styledAs="h3">
              {t('title')}
            </Heading>
            <Text>{t('description')}</Text>
          </div>

          {errorMessage && (
            <div className={styles.alert}>
              <Alert label={errorMessage} status="error" disableScrollIntoView />
            </div>
          )}

          <div className={styles.inputSection}>
            <NumberInputField
              name="netPay"
              label={t('netPayLabel')}
              format="currency"
              min={0}
              isRequired
            />
          </div>

          {calculatedGrossUp && (
            <>
              <div className={styles.alert}>
                <Alert label={t('warning')} status="warning" disableScrollIntoView />
              </div>
              <div className={styles.result}>
                <Text weight="semibold">{t('grossPayResult')}</Text>
                <Heading as="h3" styledAs="h2">
                  {formatNumberAsCurrency(parseFloat(calculatedGrossUp))}
                </Heading>
              </div>
            </>
          )}
        </div>
      </FormProvider>
    </Modal>
  )
}
