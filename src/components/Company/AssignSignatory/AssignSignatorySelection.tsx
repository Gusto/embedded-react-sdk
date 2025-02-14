import { useTranslation } from 'react-i18next'
import { useFormContext } from 'react-hook-form'
import { RadioGroup } from '@/components/Common'
import { SignatoryAssignmentMode, useAssignSignatory } from './AssignSignatory'
import styles from './AssignSignatorySelection.module.scss'

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
            value: SignatoryAssignmentMode.create_signatory,
          },
          {
            label: t('signingOptions.appointOther'),
            value: SignatoryAssignmentMode.invite_signatory,
          },
        ]}
      />
    </section>
  )
}
