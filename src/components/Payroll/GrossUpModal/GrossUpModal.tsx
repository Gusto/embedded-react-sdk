import { useEffect, useRef, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import type { GrossUpModalProps } from './GrossUpModalTypes'
import styles from './GrossUpModal.module.scss'
import { Flex, NumberInputField } from '@/components/Common'
import { useBase } from '@/components/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { formatNumberAsCurrency } from '@/helpers/formattedStrings'

const GrossUpFormSchema = z.object({
  netPay: z.number().positive(),
})

type GrossUpFormValues = z.infer<typeof GrossUpFormSchema>

export function GrossUpModal({ isOpen, onCalculateGrossUp, onApply, onCancel }: GrossUpModalProps) {
  useI18n('Payroll.GrossUpModal')
  const { t } = useTranslation('Payroll.GrossUpModal')
  const { Modal, Heading, Text, Button, Alert } = useComponentContext()
  const { baseSubmitHandler } = useBase()
  const modalContainerRef = useRef<HTMLDivElement>(null)

  const [calculatedGrossUp, setCalculatedGrossUp] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
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
  }, [isOpen, formHandlers.reset])

  const handleCalculate = async (data: GrossUpFormValues) => {
    setErrorMessage(null)
    setCalculatedGrossUp(null)
    setIsCalculating(true)

    await baseSubmitHandler(null, async () => {
      try {
        const result = await onCalculateGrossUp(data.netPay)

        if (result) {
          setCalculatedGrossUp(result)
        } else {
          setErrorMessage(t('errorMessage'))
        }
      } finally {
        setIsCalculating(false)
      }
    })
  }

  const handleApply = async () => {
    if (calculatedGrossUp) {
      setIsApplying(true)
      await baseSubmitHandler(null, async () => {
        try {
          await onApply(calculatedGrossUp)
        } finally {
          setIsApplying(false)
        }
      })
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      containerRef={modalContainerRef}
      footer={
        <Flex flexDirection="row" gap={12} justifyContent="flex-end">
          <Button
            variant="primary"
            isDisabled={!calculatedGrossUp}
            onClick={handleApply}
            isLoading={isApplying}
          >
            {t('applyCta')}
          </Button>
          <Button variant="secondary" onClick={onCancel}>
            {t('cancelCta')}
          </Button>
        </Flex>
      }
    >
      <FormProvider {...formHandlers}>
        <div className={styles.header}>
          <Heading as="h2" styledAs="h3">
            {t('title')}
          </Heading>
          <Text variant="supporting" as="p">
            {t('description')}
          </Text>
        </div>

        <div className={styles.content}>
          {errorMessage && (
            <div className={styles.alert}>
              <Alert label={errorMessage} status="error" disableScrollIntoView />
            </div>
          )}

          <div className={styles.alert}>
            <Alert label={t('warning')} status="warning" disableScrollIntoView />
          </div>

          <Flex flexDirection="row" gap={8}>
            <NumberInputField
              name="netPay"
              label={t('netPayLabel')}
              format="currency"
              min={0}
              isRequired
            />
            <Button
              variant="secondary"
              className={styles.calculateButton}
              isDisabled={isCalculating}
              onClick={formHandlers.handleSubmit(handleCalculate)}
            >
              {isCalculating ? t('calculatingCta') : t('calculateCta')}
            </Button>
          </Flex>

          {calculatedGrossUp && (
            <>
              <div className={styles.result}>
                <Text size="sm" variant="supporting" weight="semibold">
                  {t('grossPayResult')}
                </Text>
                <Heading as="h3">{formatNumberAsCurrency(parseFloat(calculatedGrossUp))}</Heading>
              </div>
            </>
          )}
        </div>
      </FormProvider>
    </Modal>
  )
}
