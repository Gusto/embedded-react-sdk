import type { Contractor } from '@gusto/embedded-api-v-2025-11-15/models/components/contractor'
import type { Document } from '@gusto/embedded-api-v-2025-11-15/models/components/document'
import type { PrototypeComponent } from '../prototypeTypes'
import { ContractorWelcome } from '../../components/contractor/self-onboarding/ContractorWelcome/ContractorWelcome'
import { ContractorDocumentList } from '../../components/contractor/self-onboarding/ContractorDocumentList/ContractorDocumentList'
import { ContractorDocumentSignature } from '../../components/contractor/self-onboarding/ContractorDocumentSignature/ContractorDocumentSignature'
import { ContractorOnboardingComplete } from '../../components/contractor/self-onboarding/ContractorOnboardingComplete/ContractorOnboardingComplete'
import { ProfileDetailsForm } from '../../components/contractor/shared/ProfileDetailsForm/ProfileDetailsForm'
import { AddressForm } from '../../components/contractor/shared/AddressForm/AddressForm'
import { PaymentMethodForm } from '../../components/contractor/shared/PaymentMethodForm/PaymentMethodForm'
import { CONTRACTOR_TYPE } from '@/shared/constants'

const noop = () => {}

function buildContractor(overrides: Partial<Contractor>): Contractor {
  return {
    uuid: 'contractor-uuid',
    companyUuid: 'company-uuid',
    version: 'contractor-version',
    type: CONTRACTOR_TYPE.INDIVIDUAL,
    wageType: 'Hourly',
    isActive: true,
    firstName: 'Sasha',
    middleInitial: null,
    lastName: 'Singh',
    businessName: null,
    email: 'sasha.singh@example.com',
    ein: null,
    hasEin: false,
    hasSsn: false,
    startDate: '2024-01-01',
    fileNewHireReport: true,
    workState: 'CA',
    onboarded: false,
    onboardingStatus: 'self_onboarding_invited',
    address: null,
    hourlyRate: '50.00',
    paymentMethod: 'Direct Deposit',
    upcomingEmployment: null,
    dismissalDate: null,
    ...overrides,
  } as Contractor
}

function buildDocument(overrides: Partial<Document>): Document {
  return {
    uuid: `doc-${Math.random().toString(36).slice(2, 8)}`,
    name: 'Document',
    title: 'Document',
    description: 'A document to sign',
    requiresSigning: true,
    signedAt: null,
    fields: [],
    ...overrides,
  } as Document
}

// -- Welcome ----------------------------------------------------------

function renderWelcome(props: { contractorName: string; companyName: string }) {
  function WelcomeDemo() {
    return <ContractorWelcome {...props} onStart={noop} />
  }
  return WelcomeDemo
}

// -- DocumentList -----------------------------------------------------

function renderDocumentList(documents: Document[]) {
  function DocumentListDemo() {
    return <ContractorDocumentList documents={documents} onRequestSign={noop} onContinue={noop} />
  }
  return DocumentListDemo
}

// -- DocumentSignature ------------------------------------------------

function renderDocumentSignature(props: {
  title: string
  description?: string
  pdfUrl: string | null
  isPending?: boolean
}) {
  function DocumentSignatureDemo() {
    return (
      <ContractorDocumentSignature
        {...props}
        onSubmit={async () => Promise.resolve()}
        onBack={noop}
      />
    )
  }
  return DocumentSignatureDemo
}

// -- OnboardingComplete -----------------------------------------------

function renderOnboardingComplete() {
  function OnboardingCompleteDemo() {
    return <ContractorOnboardingComplete onDone={noop} />
  }
  return OnboardingCompleteDemo
}

// -- ProfileDetailsForm (shared) --------------------------------------

function renderProfileDetailsForm(args: {
  contractor: Contractor
  heading: string
  description: string
  showStartDate?: boolean
  showEmail?: boolean
}) {
  function ProfileDetailsDemo() {
    return <ProfileDetailsForm {...args} onSubmit={async () => Promise.resolve()} />
  }
  return ProfileDetailsDemo
}

// -- AddressForm (shared) ---------------------------------------------

function renderAddressForm(args: {
  heading: string
  description: string
  defaultValues?: {
    street1?: string
    street2?: string
    city?: string
    state?: string
    zip?: string
  }
}) {
  function AddressFormDemo() {
    return <AddressForm {...args} onSubmit={async () => Promise.resolve()} />
  }
  return AddressFormDemo
}

// -- PaymentMethodForm (shared) ---------------------------------------

function renderPaymentMethodForm(args: {
  heading: string
  description: string
  defaultValues: {
    type: 'Direct Deposit' | 'Check'
    name: string
    routingNumber: string
    accountNumber: string
    accountType: 'Checking' | 'Savings'
  }
}) {
  function PaymentMethodDemo() {
    return <PaymentMethodForm {...args} onSubmit={async () => Promise.resolve()} />
  }
  return PaymentMethodDemo
}

// ---------------------------------------------------------------------

export const components: PrototypeComponent[] = [
  {
    slug: 'welcome',
    name: 'Welcome',
    configurations: [
      {
        slug: 'individual',
        name: 'Individual contractor',
        description: 'Greeting personalized with the contractor\u2019s first name.',
        render: renderWelcome({ contractorName: 'Sasha', companyName: 'Acme Inc' }),
      },
      {
        slug: 'business',
        name: 'Business contractor',
        description: 'Greeting personalized with the business name.',
        render: renderWelcome({ contractorName: 'Pacific Design Co.', companyName: 'Acme Inc' }),
      },
      {
        slug: 'no-name',
        name: 'No contractor name on file',
        description: 'Fallback when the contractor record has neither firstName nor businessName.',
        render: renderWelcome({ contractorName: 'there', companyName: 'Acme Inc' }),
      },
    ],
  },
  {
    slug: 'profile-details',
    name: 'Profile Details',
    configurations: [
      {
        slug: 'individual-fresh',
        name: 'Individual, no SSN on file',
        description:
          'Fresh self-onboarding individual. SSN field is editable; Save button reads "Continue" because there is no cancel handler.',
        render: renderProfileDetailsForm({
          contractor: buildContractor({}),
          heading: 'Complete your profile',
          description: 'Please verify your name and provide your Social Security Number.',
        }),
      },
      {
        slug: 'business-fresh',
        name: 'Business, no EIN on file',
        description: 'Business contractor. Shows business name field and editable EIN.',
        render: renderProfileDetailsForm({
          contractor: buildContractor({
            type: CONTRACTOR_TYPE.BUSINESS,
            businessName: 'Pacific Design Co.',
            firstName: null,
            lastName: null,
            email: 'mason.park@pacificdesign.com',
            hasEin: false,
          }),
          heading: 'Complete your profile',
          description: 'Please verify your business name and provide your EIN.',
        }),
      },
      {
        slug: 'individual-returning',
        name: 'Individual, SSN already on file',
        description:
          'Returning contractor whose SSN was previously submitted. Renders the LockedField with a "Change" button.',
        render: renderProfileDetailsForm({
          contractor: buildContractor({ hasSsn: true }),
          heading: 'Complete your profile',
          description: 'Please verify your name and provide your Social Security Number.',
        }),
      },
    ],
  },
  {
    slug: 'address-form',
    name: 'Address Form',
    configurations: [
      {
        slug: 'empty',
        name: 'Empty',
        description: 'No address on file yet — contractor fills it in from scratch.',
        render: renderAddressForm({
          heading: 'Your home address',
          description: 'Please provide your current mailing address.',
        }),
      },
      {
        slug: 'prefilled',
        name: 'Pre-filled',
        description: 'Contractor returns to the step — address pre-populates from the prior visit.',
        render: renderAddressForm({
          heading: 'Your home address',
          description: 'Please provide your current mailing address.',
          defaultValues: {
            street1: '123 Mission St',
            street2: 'Apt 4B',
            city: 'San Francisco',
            state: 'CA',
            zip: '94103',
          },
        }),
      },
    ],
  },
  {
    slug: 'payment-method-form',
    name: 'Payment Method Form',
    configurations: [
      {
        slug: 'check-default',
        name: 'Check',
        description: 'Default state — Check selected, bank account fields hidden.',
        render: renderPaymentMethodForm({
          heading: 'Set up your payment method',
          description: 'Choose how you\u2019d like to get paid.',
          defaultValues: {
            type: 'Check',
            name: '',
            routingNumber: '',
            accountNumber: '',
            accountType: 'Checking',
          },
        }),
      },
      {
        slug: 'direct-deposit-empty',
        name: 'Direct deposit, empty fields',
        description: 'Direct deposit selected with no bank account on file — all fields empty.',
        render: renderPaymentMethodForm({
          heading: 'Set up your payment method',
          description: 'Choose how you\u2019d like to get paid.',
          defaultValues: {
            type: 'Direct Deposit',
            name: '',
            routingNumber: '',
            accountNumber: '',
            accountType: 'Checking',
          },
        }),
      },
      {
        slug: 'direct-deposit-existing',
        name: 'Direct deposit, existing bank account',
        description:
          'Returning contractor with a bank account already on file — account number renders as masked default.',
        render: renderPaymentMethodForm({
          heading: 'Set up your payment method',
          description: 'Choose how you\u2019d like to get paid.',
          defaultValues: {
            type: 'Direct Deposit',
            name: 'Primary checking',
            routingNumber: '110000000',
            accountNumber: 'XXXXXX1234',
            accountType: 'Checking',
          },
        }),
      },
    ],
  },
  {
    slug: 'document-list',
    name: 'Document List',
    configurations: [
      {
        slug: 'all-unsigned',
        name: 'All unsigned',
        description:
          'Three documents waiting for signature. Continue button disabled until signed.',
        render: renderDocumentList([
          buildDocument({ uuid: 'doc-w9', title: 'W-9', description: 'Tax form' }),
          buildDocument({ uuid: 'doc-nda', title: 'NDA', description: 'Non-disclosure agreement' }),
          buildDocument({
            uuid: 'doc-handbook',
            title: 'Employee Handbook',
            description: 'Company policies',
          }),
        ]),
      },
      {
        slug: 'mixed',
        name: 'Mixed signed and unsigned',
        description: 'One signed, two unsigned. Continue still disabled.',
        render: renderDocumentList([
          buildDocument({
            uuid: 'doc-w9',
            title: 'W-9',
            description: 'Tax form',
            signedAt: new Date('2025-05-15').toISOString(),
          }),
          buildDocument({ uuid: 'doc-nda', title: 'NDA', description: 'Non-disclosure agreement' }),
          buildDocument({
            uuid: 'doc-handbook',
            title: 'Employee Handbook',
            description: 'Company policies',
          }),
        ]),
      },
      {
        slug: 'all-signed',
        name: 'All signed',
        description: 'Every required document signed — Continue button enabled.',
        render: renderDocumentList([
          buildDocument({
            uuid: 'doc-w9',
            title: 'W-9',
            description: 'Tax form',
            signedAt: new Date('2025-05-15').toISOString(),
          }),
          buildDocument({
            uuid: 'doc-nda',
            title: 'NDA',
            description: 'Non-disclosure agreement',
            signedAt: new Date('2025-05-15').toISOString(),
          }),
        ]),
      },
      {
        slug: 'empty',
        name: 'Empty',
        description: 'No documents to sign — empty-state message renders.',
        render: renderDocumentList([]),
      },
    ],
  },
  {
    slug: 'document-signature',
    name: 'Document Signature',
    configurations: [
      {
        slug: 'default',
        name: 'Default',
        description:
          'A typical document signing screen — title, description, View document link to the W-9 PDF, signature input, and agree checkbox.',
        render: renderDocumentSignature({
          title: 'Form W-9',
          description: 'Please review and sign your W-9 to proceed.',
          pdfUrl: '/sample-documents/w9.pdf',
        }),
      },
      {
        slug: 'pending',
        name: 'Submitting',
        description: 'Sign-document mutation is in flight — button shows the loading state.',
        render: renderDocumentSignature({
          title: 'Form W-9',
          description: 'Please review and sign your W-9 to proceed.',
          pdfUrl: '/sample-documents/w9.pdf',
          isPending: true,
        }),
      },
    ],
  },
  {
    slug: 'onboarding-complete',
    name: 'Onboarding Complete',
    configurations: [
      {
        slug: 'default',
        name: 'Default',
        description: 'Final confirmation screen with a Done button.',
        render: renderOnboardingComplete(),
      },
    ],
  },
]
