import { useTranslation } from 'react-i18next'
import { useIsMutating } from '@tanstack/react-query'
import {
  useRecoveryCasesRedebitMutation,
  mutationKeyRecoveryCasesRedebit,
} from '@gusto/embedded-api/react-query/recoveryCasesRedebit'
import { useRecoveryCasesGet } from '@gusto/embedded-api/react-query/recoveryCasesGet'
import type { RecoveryCasesContextInterface } from '../RecoveryCasesComponents'
import { useRecoveryCaseErrorCode } from '../useRecoveryCaseErrorCode'
import { BaseComponent, useBase, type BaseComponentInterface } from '@/components/Base'
import type { OnEventType } from '@/components/Base/useBase'
import { Flex } from '@/components/Common'
import { Form } from '@/components/Common/Form'
import { useFlow } from '@/components/Flow/useFlow'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useComponentDictionary, useI18n } from '@/i18n'
import { recoveryCasesEvents, type EventType } from '@/shared/constants'

const RECOVERY_CASES_RESUBMIT_FORM_ID = 'gusto-sdk-recovery-cases-resubmit-form'

interface RecoveryCasesResubmitProps extends BaseComponentInterface<'Payroll.RecoveryCasesResubmit'> {
  recoveryCaseId: string
  onEvent: OnEventType<EventType, unknown>
}

export function RecoveryCasesResubmit(props: RecoveryCasesResubmitProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

function Root({ dictionary, recoveryCaseId }: RecoveryCasesResubmitProps) {
  useComponentDictionary('Payroll.RecoveryCasesResubmit', dictionary)
  const { Heading, Text } = useComponentContext()
  const { onEvent, baseSubmitHandler } = useBase()
  const { companyId } = useFlow<RecoveryCasesContextInterface>()

  const { data: recoveryCasesData } = useRecoveryCasesGet({
    companyUuid: companyId,
  })

  const recoveryCase = recoveryCasesData?.recoveryCaseList?.find(rc => rc.uuid === recoveryCaseId)

  const { title, subtitle, description } = useRecoveryCaseErrorCode(
    recoveryCase?.latestErrorCode ?? undefined,
  )

  const redebitMutation = useRecoveryCasesRedebitMutation()

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await baseSubmitHandler({}, async () => {
      await redebitMutation.mutateAsync({
        request: {
          recoveryCaseUuid: recoveryCaseId,
        },
      })
      onEvent(recoveryCasesEvents.RECOVERY_CASE_RESUBMIT_DONE, {
        recoveryCaseId,
      })
    })
  }

  return (
    <Flex flexDirection="column" gap={16}>
      {title && <Heading as="h2">{title}</Heading>}
      {subtitle && <Text>{subtitle}</Text>}
      {description.length > 0 && description}
      {/*
        This empty form is used to connect the Footer's submit button to the submission logic
        via the form attribute. This is semantically incorrect and hidden from assistive tech.
      */}
      <Form id={RECOVERY_CASES_RESUBMIT_FORM_ID} onSubmit={onSubmit} aria-hidden="true">
        {/* Empty form - submission triggered by footer button via form attribute */}
      </Form>
    </Flex>
  )
}

const Footer = ({ onEvent }: { onEvent: OnEventType<EventType, unknown> }) => {
  useI18n('Payroll.RecoveryCasesResubmit')
  const { t } = useTranslation('Payroll.RecoveryCasesResubmit')
  const { Button } = useComponentContext()

  const isMutating = useIsMutating({
    mutationKey: mutationKeyRecoveryCasesRedebit(),
  })
  const isPending = isMutating > 0

  const handleCancel = () => {
    onEvent(recoveryCasesEvents.RECOVERY_CASE_RESUBMIT_CANCEL)
  }

  return (
    <Flex justifyContent="flex-end" gap={12}>
      <Button variant="secondary" onClick={handleCancel} isDisabled={isPending}>
        {t('cta.cancel')}
      </Button>
      <Button
        variant="primary"
        type="submit"
        form={RECOVERY_CASES_RESUBMIT_FORM_ID}
        isLoading={isPending}
      >
        {t('cta.resubmit')}
      </Button>
    </Flex>
  )
}

RecoveryCasesResubmit.Footer = Footer
