import { useTranslation } from 'react-i18next'
import { SignatoryAssignmentMode, useAssignSignatory } from './useAssignSignatory'
import styles from './AssignSignatorySelection.module.scss'
import { RadioGroupField } from '@/components/Common'

export const AssignSignatorySelection = () => {
  const { t } = useTranslation('Company.AssignSignatory')
  const { onSignatoryAssignmentModeChange } = useAssignSignatory()

  return (
    <section className={styles.container}>
      <RadioGroupField
        onChange={onSignatoryAssignmentModeChange}
        label={t('signingOptions.label')}
        shouldVisuallyHideLabel
        name="signatoryAssignmentMode"
        options={[
          {
            label: t('signingOptions.selfSign'),
            value: SignatoryAssignmentMode.createSignatory,
          },
          {
            label: t('signingOptions.appointOther'),
            value: SignatoryAssignmentMode.inviteSignatory,
          },
        ]}
      />
    </section>
  )
}
