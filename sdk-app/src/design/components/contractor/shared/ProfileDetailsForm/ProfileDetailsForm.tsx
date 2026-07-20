import { useState } from 'react'
import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import { FormProvider, useForm } from 'react-hook-form'
import styles from './LockedField.module.scss'
import { normalizeSSN } from '@/helpers/ssn'
import { normalizeEin } from '@/helpers/federalEin'
import { removeNonDigits } from '@/helpers/formattedStrings'
import { TextInputField, DatePickerField, Flex } from '@/components/Common'
import { ActionsLayout } from '@/components/Common/ActionsLayout/ActionsLayout'
import { Form as HtmlForm } from '@/components/Common/Form/Form'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { CONTRACTOR_TYPE } from '@/shared/constants'

export interface ProfileDetailsFormValues {
  firstName: string
  middleInitial: string
  lastName: string
  businessName: string
  startDate: string
  ssn: string
  ein: string
  email: string
}

interface ProfileDetailsFormProps {
  contractor: Contractor
  heading: string
  description: string
  isPending?: boolean
  showStartDate?: boolean
  showEmail?: boolean
  onCancel?: () => void
  onSubmit: (data: ProfileDetailsFormValues) => void | Promise<void>
}

export function ProfileDetailsForm({
  contractor,
  heading,
  description,
  isPending,
  showStartDate = false,
  showEmail = false,
  onCancel,
  onSubmit,
}: ProfileDetailsFormProps) {
  const Components = useComponentContext()
  const isBusiness = contractor.type === CONTRACTOR_TYPE.BUSINESS

  const [isEditingSsn, setIsEditingSsn] = useState(!contractor.hasSsn)
  const [isEditingEin, setIsEditingEin] = useState(!contractor.hasEin)

  const formMethods = useForm<ProfileDetailsFormValues>({
    defaultValues: {
      firstName: contractor.firstName ?? '',
      middleInitial: contractor.middleInitial ?? '',
      lastName: contractor.lastName ?? '',
      businessName: contractor.businessName ?? '',
      startDate: contractor.startDate ?? '',
      ssn: '',
      ein: '',
      email: contractor.email ?? '',
    },
  })

  return (
    <FormProvider {...formMethods}>
      <HtmlForm onSubmit={formMethods.handleSubmit(onSubmit)}>
        <Flex flexDirection="column" gap={24}>
          <Flex flexDirection="column" gap={4}>
            <Components.Heading as="h2">{heading}</Components.Heading>
            <Components.Text variant="supporting">{description}</Components.Text>
          </Flex>

          <Flex flexDirection="column" gap={20}>
            {isBusiness ? (
              <>
                <TextInputField name="businessName" label="Business name" isRequired />
                {showStartDate && (
                  <DatePickerField<string> name="startDate" label="Start date" isRequired />
                )}
                {contractor.hasEin && !isEditingEin ? (
                  <LockedField
                    label="Employer Identification Number (EIN)"
                    maskedValue="••-•••••••"
                    hint="Already on file."
                    onEdit={() => {
                      setIsEditingEin(true)
                      formMethods.setValue('ein', '')
                    }}
                  />
                ) : (
                  <TextInputField
                    name="ein"
                    label="Employer Identification Number (EIN)"
                    placeholder="##-#######"
                    maxLength={10}
                    transform={normalizeEin}
                    isRequired={isEditingEin}
                    rules={{
                      required: !contractor.hasEin,
                      validate: (v: string) =>
                        !v || v.replace(/-/g, '').length === 9 || 'EIN must be 9 digits',
                    }}
                  />
                )}
                {showEmail && (
                  <TextInputField
                    name="email"
                    label="Email address"
                    rules={{
                      validate: (v: string) =>
                        !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Invalid email address',
                    }}
                  />
                )}
              </>
            ) : (
              <>
                <TextInputField name="firstName" label="First name" isRequired />
                <TextInputField name="middleInitial" label="Middle initial" />
                <TextInputField name="lastName" label="Last name" isRequired />
                {showStartDate && (
                  <DatePickerField<string> name="startDate" label="Start date" isRequired />
                )}
                {contractor.hasSsn && !isEditingSsn ? (
                  <LockedField
                    label="Social security number"
                    maskedValue="•••-••-••••"
                    hint="Already on file."
                    onEdit={() => {
                      setIsEditingSsn(true)
                      formMethods.setValue('ssn', '')
                    }}
                  />
                ) : (
                  <TextInputField
                    name="ssn"
                    label="Social security number"
                    placeholder="###-##-####"
                    maxLength={11}
                    transform={normalizeSSN}
                    isRequired={isEditingSsn}
                    rules={{
                      required: !contractor.hasSsn,
                      validate: (v: string) =>
                        !v || removeNonDigits(v).length === 9 || 'SSN must be 9 digits',
                    }}
                  />
                )}
                {showEmail && (
                  <TextInputField
                    name="email"
                    label="Email address"
                    rules={{
                      validate: (v: string) =>
                        !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Invalid email address',
                    }}
                  />
                )}
              </>
            )}
          </Flex>

          <ActionsLayout>
            {onCancel && (
              <Components.Button variant="secondary" onClick={onCancel}>
                Cancel
              </Components.Button>
            )}
            <Components.Button type="submit" variant="primary" isLoading={isPending}>
              {onCancel ? 'Save' : 'Continue'}
            </Components.Button>
          </ActionsLayout>
        </Flex>
      </HtmlForm>
    </FormProvider>
  )
}

function LockedField({
  label,
  maskedValue,
  hint,
  onEdit,
}: {
  label: string
  maskedValue: string
  hint: string
  onEdit: () => void
}) {
  const Components = useComponentContext()

  return (
    <div className={styles.lockedField}>
      <Components.Text weight="medium" size="sm">
        {label}
      </Components.Text>
      <div className={styles.lockedFieldRow}>
        <div className={styles.lockedFieldInput}>
          <Components.TextInput
            name=""
            label={label}
            shouldVisuallyHideLabel
            value={maskedValue}
            isDisabled
          />
        </div>
        <Components.Button
          variant="secondary"
          type="button"
          className={styles.lockedFieldButton}
          onClick={onEdit}
        >
          Change
        </Components.Button>
      </div>
      <Components.Text variant="supporting" size="sm">
        {hint}
      </Components.Text>
    </div>
  )
}
