import { useState } from 'react'
import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import styles from './ContractorDetailsForm.module.scss'
import { normalizeSSN } from '@/helpers/ssn'
import { TextInputField, DatePickerField, Flex } from '@/components/Common'
import { ActionsLayout } from '@/components/Common/ActionsLayout/ActionsLayout'
import { useBase } from '@/components/Base/useBase'
import { Form as HtmlForm } from '@/components/Common/Form/Form'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

const BasicDetailsFormSchema = z.object({
  firstName: z.string().min(1),
  middleInitial: z.string().optional(),
  lastName: z.string().min(1),
  startDate: z.string().optional(),
  ssn: z
    .string()
    .optional()
    .refine(val => !val || val.replace(/\D/g, '').length === 9, 'SSN must be 9 digits'),
  email: z.string().email().optional().or(z.literal('')),
})

type BasicDetailsFormValues = z.infer<typeof BasicDetailsFormSchema>

interface ContractorDetailsFormProps {
  contractor: Contractor
  isPending?: boolean
  onCancel?: () => void
  onSave?: (data: BasicDetailsFormValues) => void | Promise<void>
}

export function ContractorDetailsForm({
  contractor,
  isPending,
  onCancel,
  onSave,
}: ContractorDetailsFormProps) {
  const Components = useComponentContext()
  const { baseSubmitHandler } = useBase()

  const [isEditingSsn, setIsEditingSsn] = useState(!contractor.hasSsn)

  const formMethods = useForm<BasicDetailsFormValues>({
    resolver: zodResolver(BasicDetailsFormSchema),
    defaultValues: {
      firstName: contractor.firstName ?? '',
      middleInitial: contractor.middleInitial ?? '',
      lastName: contractor.lastName ?? '',
      startDate: contractor.startDate ?? '',
      ssn: '',
      email: contractor.email ?? '',
    },
  })

  const handleSubmit = async (data: BasicDetailsFormValues) => {
    await baseSubmitHandler(data, async payload => {
      await onSave?.(payload)
    })
  }

  return (
    <FormProvider {...formMethods}>
      <HtmlForm onSubmit={formMethods.handleSubmit(handleSubmit)}>
        <Flex flexDirection="column" gap={24}>
          <Flex flexDirection="column" gap={4}>
            <Components.Heading as="h2">Edit basic details</Components.Heading>
            <Components.Text variant="supporting">
              Update the contractor&apos;s personal information.
            </Components.Text>
          </Flex>

          <Flex flexDirection="column" gap={20}>
            <TextInputField name="firstName" label="First name" isRequired />
            <TextInputField name="middleInitial" label="Middle initial" />
            <TextInputField name="lastName" label="Last name" isRequired />
            <DatePickerField<string> name="startDate" label="Start date" />
            {contractor.hasSsn && !isEditingSsn ? (
              <div className={styles.lockedField}>
                <Components.Text weight="medium" size="sm">
                  Social security number
                </Components.Text>
                <div className={styles.lockedFieldRow}>
                  <div className={styles.lockedFieldInput}>
                    <Components.TextInput
                      name="ssn"
                      label="Social security number"
                      shouldVisuallyHideLabel
                      value="•••-••-••••"
                      isDisabled
                    />
                  </div>
                  <Components.Button
                    variant="secondary"
                    type="button"
                    className={styles.lockedFieldButton}
                    onClick={() => {
                      setIsEditingSsn(true)
                      formMethods.setValue('ssn', '')
                    }}
                  >
                    Change
                  </Components.Button>
                </div>
                <Components.Text variant="supporting" size="sm">
                  Already on file.
                </Components.Text>
              </div>
            ) : (
              <TextInputField
                name="ssn"
                label="Social security number"
                placeholder="###-##-####"
                maxLength={11}
                transform={normalizeSSN}
                isRequired={isEditingSsn}
              />
            )}
            <TextInputField name="email" label="Email address" />
          </Flex>

          <ActionsLayout>
            <Components.Button variant="secondary" onClick={onCancel}>
              Cancel
            </Components.Button>
            <Components.Button type="submit" isLoading={isPending}>
              Save
            </Components.Button>
          </ActionsLayout>
        </Flex>
      </HtmlForm>
    </FormProvider>
  )
}
