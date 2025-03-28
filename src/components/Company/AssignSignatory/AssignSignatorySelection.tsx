import { useTranslation } from 'react-i18next'
import { useFormContext } from 'react-hook-form'
import { SignatoryAssignmentMode, useAssignSignatory } from './AssignSignatory'
import styles from './AssignSignatorySelection.module.scss'
import { RadioGroup } from '@/components/Common'

export const AssignSignatorySelection = () => {
  const { t } = useTranslation('Company.AssignSignatory')
  const { onSignatoryAssignmentModeChange } = useAssignSignatory()

  const { control } = useFormContext()

  return (
    <section className={styles.container}>
      <RadioGroup
        onChange={onSignatoryAssignmentModeChange}
        aria-label={t('signingOptions.label')}
        control={control}
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
