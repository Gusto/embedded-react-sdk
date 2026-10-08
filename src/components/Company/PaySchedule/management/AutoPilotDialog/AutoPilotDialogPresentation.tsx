import { useTranslation } from 'react-i18next'
import type { PayScheduleAutoPayrollEnablementBlocker } from '@gusto/embedded-api/models/components/payscheduleautopayrollenablementblocker'
import { Flex } from '@/components/Common/Flex'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

/** @internal */
export interface AutoPilotDialogPresentationProps {
  scheduleName: string
  blockers: PayScheduleAutoPayrollEnablementBlocker[]
  isEnableBlocked: boolean
  isLoadingBlockers: boolean
  nextEnabled: boolean
  isSaving: boolean
  hasGenericError: boolean
  errorMessage?: string
  onToggle: (enabled: boolean) => void
  onSave: () => void
  onClose: () => void
}

/** @internal */
export function AutoPilotDialogPresentation({
  scheduleName,
  blockers,
  isEnableBlocked,
  isLoadingBlockers,
  nextEnabled,
  isSaving,
  hasGenericError,
  errorMessage,
  onToggle,
  onSave,
  onClose,
}: AutoPilotDialogPresentationProps) {
  const { t } = useTranslation('Company.Management.AutoPilotDialog')
  const Components = useComponentContext()
  const namedBlockers = blockers
    .map(blocker => blocker.key)
    .filter((key): key is string => Boolean(key))

  return (
    <Components.Dialog
      isOpen
      onClose={onClose}
      onPrimaryActionClick={onSave}
      title={t('title', { scheduleName })}
      primaryActionLabel={t('saveCta')}
      closeActionLabel={t('cancelCta')}
      isPrimaryActionLoading={isSaving}
    >
      <Flex flexDirection="column" gap={16}>
        <Components.Text>{t('description')}</Components.Text>
        <Components.Switch
          label={t('toggleLabel')}
          value={nextEnabled}
          onChange={onToggle}
          isDisabled={isEnableBlocked}
        />
        {isLoadingBlockers ? (
          <Components.Text variant="supporting">{t('checkingEligibility')}</Components.Text>
        ) : isEnableBlocked ? (
          <Components.Alert status="error" label={t('blockers.heading')} disableScrollIntoView>
            <Flex flexDirection="column" gap={12}>
              {/* Blockers without a recognized key can't be labeled individually and would
                  collide on a shared 'generic' React key, so drop them and fall back to a
                  single generic entry if nothing named is left to show. */}
              {(namedBlockers.length > 0 ? namedBlockers : ['generic']).map(key => (
                <Flex key={key} flexDirection="column" gap={4}>
                  <Components.Text weight="semibold">
                    {t(`blockers.${key}.title`, { defaultValue: t('blockers.generic.title') })}
                  </Components.Text>
                  <Components.Text variant="supporting">
                    {t(`blockers.${key}.description`, {
                      defaultValue: t('blockers.generic.description'),
                    })}
                  </Components.Text>
                </Flex>
              ))}
            </Flex>
          </Components.Alert>
        ) : null}
        {hasGenericError ? (
          <Components.Alert status="error" label={t('saveError.title')} disableScrollIntoView>
            {errorMessage ?? t('saveError.description')}
          </Components.Alert>
        ) : null}
      </Flex>
    </Components.Dialog>
  )
}
