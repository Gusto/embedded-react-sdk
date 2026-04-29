import { useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { useContractorsGetSuspense } from '@gusto/embedded-api/react-query/contractorsGet'
import { useContractorsUpdateMutation } from '@gusto/embedded-api/react-query/contractorsUpdate'
import { ContractorType as ApiContractorType } from '@gusto/embedded-api/models/components/contractor'
import type { ContractorUpdateRequestBody } from '@gusto/embedded-api/models/components/contractorupdaterequestbody'
import styles from './ContractorSelfProfile.module.scss'
import { BaseComponent, useBase } from '@/components/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Flex } from '@/components/Common'
import { Form } from '@/components/Common/Form'
import { TextInputField } from '@/components/Common/Fields/TextInputField'
import { ActionsLayout } from '@/components/Common/ActionsLayout/ActionsLayout'
import { normalizeSSN } from '@/helpers/ssn'
import { removeNonDigits } from '@/helpers/formattedStrings'
import { componentEvents } from '@/shared/constants'

interface ContractorSelfProfileProps {
  contractorId: string
  onEvent: (...args: unknown[]) => void
}

interface SelfProfileFormData {
  firstName: string
  middleInitial: string
  lastName: string
  businessName: string
  ssn: string
  ein: string
}

export function ContractorSelfProfile(props: ContractorSelfProfileProps) {
  return (
    <BaseComponent onEvent={props.onEvent}>
      <ContractorSelfProfileForm contractorId={props.contractorId} />
    </BaseComponent>
  )
}

function ContractorSelfProfileForm({ contractorId }: { contractorId: string }) {
  const Components = useComponentContext()
  const { onEvent, baseSubmitHandler } = useBase()

  const {
    data: { contractor },
  } = useContractorsGetSuspense({ contractorUuid: contractorId })

  const { mutateAsync: updateContractor } = useContractorsUpdateMutation()

  const isIndividual = contractor?.type === ApiContractorType.Individual

  const formMethods = useForm<SelfProfileFormData>({
    defaultValues: {
      firstName: contractor?.firstName ?? '',
      middleInitial: contractor?.middleInitial ?? '',
      lastName: contractor?.lastName ?? '',
      businessName: contractor?.businessName ?? '',
      ssn: '',
      ein: '',
    },
  })

  const [isEditingSsn, setIsEditingSsn] = useState(!contractor?.hasSsn)
  const [isEditingEin, setIsEditingEin] = useState(!contractor!.hasEin)

  const { handleSubmit, formState } = formMethods

  const onSubmit = async (data: SelfProfileFormData) => {
    await baseSubmitHandler(data, async () => {
      const payload: ContractorUpdateRequestBody = {
        version: contractor!.version!,
        selfOnboarding: true,
        ...(isIndividual
          ? {
              firstName: data.firstName,
              middleInitial: data.middleInitial || undefined,
              lastName: data.lastName,
              ssn: data.ssn ? removeNonDigits(data.ssn) : undefined,
            }
          : {
              businessName: data.businessName,
              ein: data.ein ? data.ein.replace(/-/g, '') : undefined,
            }),
      }

      await updateContractor({
        request: {
          contractorUuid: contractorId,
          contractorUpdateRequestBody: payload,
        },
      })

      onEvent(componentEvents.CONTRACTOR_PROFILE_DONE, {
        contractorId,
        selfOnboarding: true,
      })
    })
  }

  return (
    <FormProvider {...formMethods}>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Flex flexDirection="column" gap={24}>
          <Flex flexDirection="column" gap={4}>
            <Components.Heading as="h2">Complete your profile</Components.Heading>
            <Components.Text variant="supporting">
              {isIndividual
                ? 'Please verify your name and provide your Social Security Number.'
                : 'Please verify your business name and provide your EIN.'}
            </Components.Text>
          </Flex>

          <Flex flexDirection="column" gap={20}>
            {isIndividual ? (
              <>
                <TextInputField name="firstName" label="First name" isRequired />
                <TextInputField name="middleInitial" label="Middle initial" />
                <TextInputField name="lastName" label="Last name" isRequired />
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
                    rules={{
                      required: !contractor.hasSsn,
                      validate: (v: string) =>
                        !v || removeNonDigits(v).length === 9 || 'SSN must be 9 digits',
                    }}
                  />
                )}
              </>
            ) : (
              <>
                <TextInputField name="businessName" label="Business name" isRequired />
                {contractor!.hasEin && !isEditingEin ? (
                  <div className={styles.lockedField}>
                    <Components.Text weight="medium" size="sm">
                      Employer Identification Number (EIN)
                    </Components.Text>
                    <div className={styles.lockedFieldRow}>
                      <div className={styles.lockedFieldInput}>
                        <Components.TextInput
                          name="ein"
                          label="Employer Identification Number (EIN)"
                          shouldVisuallyHideLabel
                          value="••-•••••••"
                          isDisabled
                        />
                      </div>
                      <Components.Button
                        variant="secondary"
                        type="button"
                        className={styles.lockedFieldButton}
                        onClick={() => {
                          setIsEditingEin(true)
                          formMethods.setValue('ein', '')
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
                    name="ein"
                    label="Employer Identification Number (EIN)"
                    isRequired={isEditingEin}
                    rules={{
                      required: !contractor!.hasEin,
                      validate: (v: string) =>
                        !v || v.replace(/-/g, '').length === 9 || 'EIN must be 9 digits',
                    }}
                  />
                )}
              </>
            )}
          </Flex>

          <ActionsLayout>
            <Components.Button type="submit" variant="primary" isDisabled={formState.isSubmitting}>
              {formState.isSubmitting ? 'Saving...' : 'Continue'}
            </Components.Button>
          </ActionsLayout>
        </Flex>
      </Form>
    </FormProvider>
  )
}
