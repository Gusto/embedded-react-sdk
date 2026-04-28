import { Suspense, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import { useContractorsGetSuspense } from '@gusto/embedded-api/react-query/contractorsGet'
import { useContractorPaymentMethodGetBankAccountsSuspense } from '@gusto/embedded-api/react-query/contractorPaymentMethodGetBankAccounts'
import {
  useContractorPaymentMethodGetSuspense,
  buildContractorPaymentMethodGetQuery,
} from '@gusto/embedded-api/react-query/contractorPaymentMethodGet'
import { useContractorPaymentMethodUpdateMutation } from '@gusto/embedded-api/react-query/contractorPaymentMethodUpdate'
import { useContractorPaymentMethodsCreateBankAccountMutation } from '@gusto/embedded-api/react-query/contractorPaymentMethodsCreateBankAccount'
import { useContractorDocumentsGetAllSuspense } from '@gusto/embedded-api/react-query/contractorDocumentsGetAll'
import { useContractorsGetAddressSuspense } from '@gusto/embedded-api/react-query/contractorsGetAddress'
import { useContractorsUpdateAddressMutation } from '@gusto/embedded-api/react-query/contractorsUpdateAddress'
import { useContractorsUpdateMutation } from '@gusto/embedded-api/react-query/contractorsUpdate'
import { useContractorsUpdateOnboardingStatusMutation } from '@gusto/embedded-api/react-query/contractorsUpdateOnboardingStatus'
import { useGustoEmbeddedContext } from '@gusto/embedded-api/react-query/_context'
import { useQueryClient } from '@tanstack/react-query'
import { contractorName } from '../components/contractorName'
import { ContractorAddress } from '../components/ContractorAddress'
import { ContractorAddressForm } from '../components/ContractorAddressForm'
import { ContractorDetails } from '../components/ContractorDetails'
import { ContractorPaymentMethod } from '../components/ContractorPaymentMethod'
import { ContractorPaymentMethodForm } from '../components/ContractorPaymentMethodForm'
import { ContractorDocuments } from '../components/ContractorDocuments'
import { ContractorPay } from '../components/ContractorPay'
import { ContractorPayForm } from '../components/ContractorPayForm'
import { ContractorDetailsForm } from '../components/ContractorDetailsForm'
import { Skeleton } from '../components/Skeleton'
import { Flex } from '@/components/Common'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import { BaseComponent } from '@/components/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import {
  componentEvents,
  ContractorOnboardingStatus,
  STATES_ABBR,
  type EventType,
} from '@/shared/constants'
import CaretLeftIcon from '@/assets/icons/caret-left.svg?react'

export interface ContractorProfileContextInterface extends FlowContextInterface {
  contractorId: string
  successMessage?: string
  selectedTab: string
  component: React.ComponentType | null
}

function useContractorData(contractorId: string) {
  const { data } = useContractorsGetSuspense({ contractorUuid: contractorId })
  return data.contractor
}

function ProfileSkeleton() {
  const Components = useComponentContext()

  return (
    <Flex flexDirection="column" gap={24}>
      <Flex flexDirection="column" gap={4}>
        <Skeleton width={200} height={28} />
        <Skeleton width={80} height={18} />
      </Flex>
      <Flex flexDirection="column" gap={24}>
        <Components.Box header={<Skeleton width={120} height={32} />}>
          <Skeleton width="100%" height={331} />
        </Components.Box>
        <Components.Box header={<Skeleton width={120} height={32} />}>
          <Skeleton width="100%" height={88} />
        </Components.Box>
      </Flex>
    </Flex>
  )
}

function ProfileViewData() {
  const { contractorId } = useFlow<ContractorProfileContextInterface>()
  const Components = useComponentContext()

  const contractor = useContractorData(contractorId)

  if (!contractor) {
    return <Components.Text>No contractor found for this contractor ID.</Components.Text>
  }

  return <ProfileViewContent contractor={contractor} />
}

export function ProfileViewContextual() {
  const { contractorId: routeContractorId } = useParams<{ contractorId: string }>()
  const navigate = useNavigate()
  const Components = useComponentContext()

  return (
    <Flex flexDirection="column" gap={32}>
      {routeContractorId && (
        <div>
          <Components.Button
            variant="secondary"
            onClick={() => {
              void navigate('..')
            }}
          >
            <CaretLeftIcon /> Back to contractors
          </Components.Button>
        </div>
      )}
      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileViewData />
      </Suspense>
    </Flex>
  )
}

function ProfileViewContent({ contractor }: { contractor: Contractor }) {
  const { onEvent, successMessage, selectedTab } = useFlow<ContractorProfileContextInterface>()
  const Components = useComponentContext()
  const navigate = useNavigate()
  const [localTab, setLocalTab] = useState(selectedTab)
  const [isDismissed, setIsDismissed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const isReviewState =
    isSubmitting ||
    contractor.onboardingStatus === ContractorOnboardingStatus.ADMIN_ONBOARDING_REVIEW ||
    contractor.onboardingStatus === ContractorOnboardingStatus.SELF_ONBOARDING_REVIEW
  const isEditable =
    contractor.isActive ||
    isReviewState ||
    contractor.onboardingStatus === ContractorOnboardingStatus.ONBOARDING_COMPLETED

  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false)
  const [fileNewHireReport, setFileNewHireReport] = useState('no')
  const [workState, setWorkState] = useState('')
  const [stateError, setStateError] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)

  const { data: bankAccountsData } = useContractorPaymentMethodGetBankAccountsSuspense({
    contractorUuid: contractor.uuid,
  })
  const bankAccounts = bankAccountsData.contractorBankAccountList ?? []

  const { data: paymentMethodData } = useContractorPaymentMethodGetSuspense({
    contractorUuid: contractor.uuid,
  })
  const paymentMethod = paymentMethodData.contractorPaymentMethod

  const { data: addressData } = useContractorsGetAddressSuspense({
    contractorUuid: contractor.uuid,
  })
  const address = addressData.contractorAddress

  const { data: documentsData } = useContractorDocumentsGetAllSuspense({
    contractorUuid: contractor.uuid,
  })
  const documents = documentsData.documents ?? []

  const { mutateAsync: updatePaymentMethod, isPending: isPaymentMethodPending } =
    useContractorPaymentMethodUpdateMutation()

  const { mutateAsync: updateContractor, isPending: isUpdatePending } =
    useContractorsUpdateMutation()
  const { mutateAsync: updateOnboardingStatus, isPending: isStatusPending } =
    useContractorsUpdateOnboardingStatusMutation()
  const isSubmitPending = isUpdatePending || isStatusPending

  const contractorWithAddress = {
    ...contractor,
    address: address ?? contractor.address,
  } as Contractor

  const handleRemoveAccount = async () => {
    try {
      await updatePaymentMethod({
        request: {
          contractorUuid: contractor.uuid,
          requestBody: {
            version: paymentMethod?.version ?? '',
            type: 'Check',
          },
        },
      })
      onEvent('contractor/paymentMethod/removed' as EventType)
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Failed to remove payment method. Please try again.',
      )
    }
  }

  const handleCloseSubmitModal = () => {
    setIsSubmitModalOpen(false)
    setFileNewHireReport('no')
    setWorkState('')
    setStateError(false)
  }

  const [submitError, setSubmitError] = useState('')

  const handleSubmitContractor = async () => {
    if (fileNewHireReport === 'yes' && !workState) {
      setStateError(true)
      return
    }

    setSubmitError('')
    setIsSubmitting(true)

    try {
      await updateContractor({
        request: {
          contractorUuid: contractor.uuid,
          contractorUpdateRequestBody: {
            version: contractor.version!,
            fileNewHireReport: fileNewHireReport === 'yes',
            workState: fileNewHireReport === 'yes' ? workState : null,
          },
        },
      })

      await updateOnboardingStatus({
        request: {
          contractorUuid: contractor.uuid,
          requestBody: { onboardingStatus: 'onboarding_completed' },
        },
      })

      void navigate(`..?success=${encodeURIComponent('Contractor submitted successfully')}`, {
        replace: true,
      })
    } catch (error) {
      setIsSubmitting(false)
      setSubmitError(
        error instanceof Error ? error.message : 'Something went wrong. Please try again.',
      )
    }
  }

  const editCallbacks = {
    onEditDetails: () => {
      onEvent('contractor/details/edit' as EventType)
    },
    onEditAddress: () => {
      onEvent('contractor/address/edit' as EventType)
    },
    onEditCompensation: () => {
      onEvent('contractor/compensation/edit' as EventType)
    },
    onAddPaymentMethod: () => {
      onEvent('contractor/paymentMethod/add' as EventType)
    },
    onEditPaymentMethod: () => {
      onEvent('contractor/paymentMethod/edit' as EventType)
    },
  }

  const tabs = [
    {
      id: 'basic-details',
      label: 'Details',
      content: (
        <Flex flexDirection="column" gap={24}>
          <ContractorDetails
            contractor={contractor}
            onEdit={isEditable ? editCallbacks.onEditDetails : undefined}
          />
          <ContractorAddress
            contractor={contractorWithAddress}
            onEdit={isEditable ? editCallbacks.onEditAddress : undefined}
          />
        </Flex>
      ),
    },
    {
      id: 'pay',
      label: 'Pay',
      content: (
        <Flex flexDirection="column" gap={24}>
          <ContractorPaymentMethod
            paymentMethodType={paymentMethod?.type ?? 'Check'}
            bankAccounts={bankAccounts}
            onAddPaymentMethod={isEditable ? editCallbacks.onAddPaymentMethod : undefined}
            onEditPaymentMethod={isEditable ? editCallbacks.onEditPaymentMethod : undefined}
            onRemoveAccount={isEditable ? handleRemoveAccount : undefined}
            isRemovingAccount={isPaymentMethodPending}
          />
          <ContractorPay
            contractor={contractor}
            onEdit={isEditable ? editCallbacks.onEditCompensation : undefined}
          />
        </Flex>
      ),
    },
    {
      id: 'documents',
      label: 'Documents',
      content: <ContractorDocuments documents={documents} />,
    },
  ]

  if (isReviewState) {
    return (
      <Flex flexDirection="column" gap={24}>
        <Flex flexDirection="column" gap={4}>
          <Components.Alert
            label="This contractor has completed onboarding and is awaiting review. Please verify their information and submit when ready."
            status="warning"
            disableScrollIntoView
          />
          {errorMessage && (
            <Components.Alert
              disableScrollIntoView
              label={errorMessage}
              status="error"
              onDismiss={() => {
                setErrorMessage(null)
              }}
            />
          )}
          {successMessage && !isDismissed && (
            <Components.Alert
              disableScrollIntoView
              label={successMessage}
              status="success"
              onDismiss={() => {
                setIsDismissed(true)
              }}
            />
          )}
        </Flex>
        <Flex justifyContent="space-between" alignItems="center">
          <Flex flexDirection="column" gap={4}>
            <Components.Heading as="h1" styledAs="h2">
              {contractorName(contractor)}
            </Components.Heading>
            <Components.Text variant="supporting">Contractor</Components.Text>
          </Flex>
          <Components.Button
            variant="primary"
            onClick={() => {
              setIsSubmitModalOpen(true)
            }}
          >
            Submit contractor
          </Components.Button>
        </Flex>
        <ContractorDetails contractor={contractor} onEdit={editCallbacks.onEditDetails} />
        <ContractorAddress
          contractor={contractorWithAddress}
          onEdit={editCallbacks.onEditAddress}
        />
        <ContractorPay contractor={contractor} onEdit={editCallbacks.onEditCompensation} />
        <ContractorPaymentMethod
          paymentMethodType={paymentMethod?.type ?? 'Check'}
          bankAccounts={bankAccounts}
          onAddPaymentMethod={editCallbacks.onAddPaymentMethod}
          onEditPaymentMethod={editCallbacks.onEditPaymentMethod}
          onRemoveAccount={handleRemoveAccount}
          isRemovingAccount={isPaymentMethodPending}
        />
        <Components.Dialog
          isOpen={isSubmitModalOpen}
          onClose={handleCloseSubmitModal}
          onPrimaryActionClick={() => {
            void handleSubmitContractor()
          }}
          isPrimaryActionLoading={isSubmitPending}
          primaryActionLabel="Submit contractor"
          closeActionLabel="Cancel"
          title="File new hire report"
        >
          <div ref={dialogRef}>
            <Flex flexDirection="column" gap={16}>
              <Components.Text>
                Would you like to file a new hire report with the state for this contractor?
              </Components.Text>
              <Components.RadioGroup
                label="File new hire report"
                shouldVisuallyHideLabel
                value={fileNewHireReport}
                onChange={value => {
                  setFileNewHireReport(value)
                  if (value === 'no') {
                    setWorkState('')
                    setStateError(false)
                  }
                }}
                options={[
                  { value: 'no', label: 'No, I have already filed a new hire report' },
                  { value: 'yes', label: 'Yes, file a new hire report' },
                ]}
              />
              {fileNewHireReport === 'yes' && (
                <Components.Select
                  label="Work state"
                  value={workState || null}
                  onChange={value => {
                    setWorkState(value)
                    setStateError(false)
                  }}
                  options={STATES_ABBR.map(s => ({ label: s, value: s }))}
                  isInvalid={stateError}
                  errorMessage={stateError ? 'Please select a state' : undefined}
                  placeholder=""
                  isRequired
                  portalContainer={dialogRef.current ?? undefined}
                />
              )}
              {submitError && <Components.Alert status="error" label={submitError} />}
            </Flex>
          </div>
        </Components.Dialog>
      </Flex>
    )
  }

  return (
    <Flex flexDirection="column" gap={24}>
      {errorMessage && (
        <Components.Alert
          disableScrollIntoView
          label={errorMessage}
          status="error"
          onDismiss={() => {
            setErrorMessage(null)
          }}
        />
      )}
      {successMessage && !isDismissed && (
        <Components.Alert
          disableScrollIntoView
          label={successMessage}
          status="success"
          onDismiss={() => {
            setIsDismissed(true)
          }}
        />
      )}
      <Flex flexDirection="column" gap={4}>
        <Flex alignItems="center" gap={8}>
          <Components.Heading as="h1" styledAs="h2">
            {contractorName(contractor)}
          </Components.Heading>
          {!contractor.isActive && contractor.dismissalDate && (
            <Components.Badge status="error">Dismissed</Components.Badge>
          )}
        </Flex>
        <Components.Text variant="supporting">Contractor</Components.Text>
      </Flex>
      <Components.Tabs onSelectionChange={setLocalTab} tabs={tabs} selectedId={localTab} />
    </Flex>
  )
}

function EditAddressContent() {
  const { contractorId, onEvent } = useFlow<ContractorProfileContextInterface>()

  const contractor = useContractorData(contractorId)
  const { data: addressData } = useContractorsGetAddressSuspense({
    contractorUuid: contractorId,
  })
  const address = addressData.contractorAddress

  const { mutateAsync: updateAddress, isPending } = useContractorsUpdateAddressMutation()

  if (!contractor) return null

  const contractorWithAddress = {
    ...contractor,
    address: address ?? contractor.address,
  } as Contractor

  const handleSave = async (data: {
    street1: string
    street2?: string
    city: string
    state: string
    zip: string
  }) => {
    await updateAddress({
      request: {
        contractorUuid: contractor.uuid,
        requestBody: {
          version: address?.version ?? '',
          street1: data.street1,
          street2: data.street2,
          city: data.city,
          state: data.state,
          zip: data.zip,
        },
      },
    })
    onEvent(componentEvents.CONTRACTOR_ADDRESS_UPDATED)
  }

  return (
    <ContractorAddressForm
      contractor={contractorWithAddress}
      isPending={isPending}
      onCancel={() => {
        onEvent(componentEvents.CANCEL)
      }}
      onSave={handleSave}
    />
  )
}

export function EditAddressContextual() {
  return (
    <BaseComponent onEvent={() => {}}>
      <EditAddressContent />
    </BaseComponent>
  )
}

function AddPaymentMethodContent() {
  const { contractorId, onEvent } = useFlow<ContractorProfileContextInterface>()

  const contractor = useContractorData(contractorId)

  const queryClient = useQueryClient()
  const gustoClient = useGustoEmbeddedContext()
  const { mutateAsync: updatePaymentMethod, isPending: isPaymentMethodPending } =
    useContractorPaymentMethodUpdateMutation()
  const { mutateAsync: createBankAccount, isPending: isBankAccountPending } =
    useContractorPaymentMethodsCreateBankAccountMutation()

  if (!contractor) return null

  const handleSave = async (data: {
    name: string
    routingNumber: string
    accountNumber: string
    accountType: 'Checking' | 'Savings'
  }) => {
    await createBankAccount({
      request: {
        contractorUuid: contractor.uuid,
        requestBody: {
          name: data.name,
          routingNumber: data.routingNumber,
          accountNumber: data.accountNumber,
          accountType: data.accountType,
        },
      },
    })

    const getPaymentMethodQuery = buildContractorPaymentMethodGetQuery(gustoClient, {
      contractorUuid: contractor.uuid,
    })
    const updatedPaymentMethod = await queryClient.fetchQuery(getPaymentMethodQuery)
    const version = updatedPaymentMethod.contractorPaymentMethod?.version ?? ''

    await updatePaymentMethod({
      request: {
        contractorUuid: contractor.uuid,
        requestBody: {
          version,
          type: 'Direct Deposit',
        },
      },
    })

    onEvent(componentEvents.CONTRACTOR_PAYMENT_METHOD_UPDATED)
  }

  return (
    <ContractorPaymentMethodForm
      variant="add"
      isPending={isPaymentMethodPending || isBankAccountPending}
      onCancel={() => {
        onEvent(componentEvents.CANCEL)
      }}
      onSave={handleSave}
    />
  )
}

export function AddPaymentMethodContextual() {
  return (
    <BaseComponent onEvent={() => {}}>
      <AddPaymentMethodContent />
    </BaseComponent>
  )
}

function EditPaymentMethodContent() {
  const { contractorId, onEvent } = useFlow<ContractorProfileContextInterface>()

  const contractor = useContractorData(contractorId)
  const { data: bankAccountsData } = useContractorPaymentMethodGetBankAccountsSuspense({
    contractorUuid: contractorId,
  })
  const bankAccounts = bankAccountsData.contractorBankAccountList ?? []

  const queryClient = useQueryClient()
  const gustoClient = useGustoEmbeddedContext()
  const { mutateAsync: updatePaymentMethod, isPending: isPaymentMethodPending } =
    useContractorPaymentMethodUpdateMutation()
  const { mutateAsync: createBankAccount, isPending: isBankAccountPending } =
    useContractorPaymentMethodsCreateBankAccountMutation()

  if (!contractor) return null

  const handleSave = async (data: {
    name: string
    routingNumber: string
    accountNumber: string
    accountType: 'Checking' | 'Savings'
  }) => {
    await createBankAccount({
      request: {
        contractorUuid: contractor.uuid,
        requestBody: {
          name: data.name,
          routingNumber: data.routingNumber,
          accountNumber: data.accountNumber,
          accountType: data.accountType,
        },
      },
    })

    const getPaymentMethodQuery = buildContractorPaymentMethodGetQuery(gustoClient, {
      contractorUuid: contractor.uuid,
    })
    const updatedPaymentMethod = await queryClient.fetchQuery(getPaymentMethodQuery)
    const version = updatedPaymentMethod.contractorPaymentMethod?.version ?? ''

    await updatePaymentMethod({
      request: {
        contractorUuid: contractor.uuid,
        requestBody: {
          version,
          type: 'Direct Deposit',
        },
      },
    })

    onEvent(componentEvents.CONTRACTOR_PAYMENT_METHOD_UPDATED)
  }

  return (
    <ContractorPaymentMethodForm
      variant="edit"
      bankAccount={bankAccounts[0]}
      isPending={isPaymentMethodPending || isBankAccountPending}
      onCancel={() => {
        onEvent(componentEvents.CANCEL)
      }}
      onSave={handleSave}
    />
  )
}

export function EditPaymentMethodContextual() {
  return (
    <BaseComponent onEvent={() => {}}>
      <EditPaymentMethodContent />
    </BaseComponent>
  )
}

function EditCompensationContent() {
  const { contractorId, onEvent } = useFlow<ContractorProfileContextInterface>()

  const contractor = useContractorData(contractorId)
  const { mutateAsync: updateContractor, isPending } = useContractorsUpdateMutation()

  if (!contractor) return null

  const handleSave = async (data: { wageType: 'Fixed' | 'Hourly'; hourlyRate?: string }) => {
    await updateContractor({
      request: {
        contractorUuid: contractor.uuid,
        contractorUpdateRequestBody: {
          version: contractor.version ?? '',
          wageType: data.wageType,
          ...(data.wageType === 'Hourly' ? { hourlyRate: data.hourlyRate } : {}),
        },
      },
    })
    onEvent(componentEvents.CONTRACTOR_UPDATED)
  }

  return (
    <ContractorPayForm
      contractor={contractor}
      isPending={isPending}
      onCancel={() => {
        onEvent(componentEvents.CANCEL)
      }}
      onSave={handleSave}
    />
  )
}

export function EditCompensationContextual() {
  return (
    <BaseComponent onEvent={() => {}}>
      <EditCompensationContent />
    </BaseComponent>
  )
}

function EditBasicDetailsContent() {
  const { contractorId, onEvent } = useFlow<ContractorProfileContextInterface>()

  const contractor = useContractorData(contractorId)
  const { mutateAsync: updateContractor, isPending } = useContractorsUpdateMutation()

  if (!contractor) return null

  const handleSave = async (data: {
    firstName: string
    middleInitial?: string
    lastName: string
    startDate?: string
    ssn?: string
    email?: string
  }) => {
    await updateContractor({
      request: {
        contractorUuid: contractor.uuid,
        contractorUpdateRequestBody: {
          version: contractor.version ?? '',
          firstName: data.firstName,
          middleInitial: data.middleInitial || undefined,
          lastName: data.lastName,
          startDate: data.startDate || undefined,
          ...(data.ssn ? { ssn: data.ssn } : {}),
          email: data.email || undefined,
        },
      },
    })
    onEvent(componentEvents.CONTRACTOR_UPDATED)
  }

  return (
    <ContractorDetailsForm
      contractor={contractor}
      isPending={isPending}
      onCancel={() => {
        onEvent(componentEvents.CANCEL)
      }}
      onSave={handleSave}
    />
  )
}

export function EditBasicDetailsContextual() {
  return (
    <BaseComponent onEvent={() => {}}>
      <EditBasicDetailsContent />
    </BaseComponent>
  )
}
