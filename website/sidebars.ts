import type { SidebarsConfig } from '@docusaurus/plugin-content-docs'
import apiSidebar from '../docs/api/sidebar'

const sidebars: SidebarsConfig = {
  docs: [
    'what-is-the-gep-react-sdk',
    {
      type: 'category',
      label: 'Quickstart',
      link: {
        type: 'doc',
        id: 'quickstart/quickstart',
      },
      items: ['quickstart/first-flow', 'quickstart/next-steps'],
    },
    {
      type: 'category',
      label: 'Concepts',
      link: {
        type: 'doc',
        id: 'concepts/concepts',
      },
      items: [
        'concepts/flows-and-blocks',
        'concepts/provider-and-configuration',
        'concepts/events',
        'concepts/authentication-and-proxy',
        'concepts/composition',
        'concepts/theming-and-customization',
        'concepts/error-handling',
        'concepts/i18n',
      ],
    },
    {
      type: 'category',
      label: 'Components',
      link: {
        type: 'doc',
        id: 'components/components',
      },
      items: [
        {
          type: 'category',
          label: 'Company',
          link: {
            type: 'doc',
            id: 'components/company/company',
          },
          items: [
            {
              type: 'category',
              label: 'Flows',
              items: ['components/company/onboarding-flow'],
            },
            {
              type: 'category',
              label: 'Blocks',
              items: [
                'components/company/assign-signatory',
                'components/company/create-signatory',
                'components/company/invite-signatory',
                'components/company/industry',
                'components/company/document-signer',
                'components/company/document-list',
                'components/company/signature-form',
                'components/company/federal-taxes',
                'components/company/pay-schedule',
                'components/company/locations',
                'components/company/bank-account',
                'components/company/state-taxes',
                'components/company/state-taxes-form',
                'components/company/state-taxes-list',
                'components/company/onboarding-overview',
              ],
            },
          ],
        },
        {
          type: 'category',
          label: 'Employee',
          link: {
            type: 'doc',
            id: 'components/employee/employee',
          },
          items: [
            {
              type: 'category',
              label: 'Flows',
              items: [
                'components/employee/onboarding-flow',
                'components/employee/self-onboarding-flow',
                'components/employee/termination-flow',
              ],
            },
            {
              type: 'category',
              label: 'Blocks',
              items: [
                'components/employee/employee-list',
                'components/employee/profile',
                'components/employee/compensation',
                'components/employee/federal-taxes',
                'components/employee/state-taxes',
                'components/employee/payment-method',
                'components/employee/deductions',
                'components/employee/employee-documents',
                'components/employee/document-signer',
                'components/employee/employment-eligibility',
                'components/employee/onboarding-summary',
                'components/employee/landing',
                'components/employee/terminate-employee',
                'components/employee/termination-summary',
                'components/employee/taxes',
              ],
            },
          ],
        },
        {
          type: 'category',
          label: 'Contractor',
          link: {
            type: 'doc',
            id: 'components/contractor/contractor',
          },
          items: [
            {
              type: 'category',
              label: 'Flows',
              items: [
                'components/contractor/onboarding-flow',
                'components/contractor/payment-flow',
              ],
            },
            {
              type: 'category',
              label: 'Blocks',
              items: [
                'components/contractor/contractor-list',
                'components/contractor/contractor-profile',
                'components/contractor/address',
                'components/contractor/payment-method',
                'components/contractor/new-hire-report',
                'components/contractor/contractor-submit',
                'components/contractor/payments-list',
                'components/contractor/create-payment',
                'components/contractor/payment-history',
                'components/contractor/payment-summary',
                'components/contractor/payment-statement',
              ],
            },
          ],
        },
        {
          type: 'category',
          label: 'Payroll',
          link: {
            type: 'doc',
            id: 'components/payroll/payroll',
          },
          items: [
            {
              type: 'category',
              label: 'Flows',
              items: [
                'components/payroll/payroll-flow',
                'components/payroll/payroll-execution-flow',
                'components/payroll/off-cycle-flow',
                'components/payroll/dismissal-flow',
                'components/payroll/transition-flow',
              ],
            },
            {
              type: 'category',
              label: 'Blocks',
              items: [
                'components/payroll/payroll-landing',
                'components/payroll/payroll-list',
                'components/payroll/payroll-history',
                'components/payroll/payroll-configuration',
                'components/payroll/payroll-edit-employee',
                'components/payroll/payroll-overview',
                'components/payroll/payroll-receipts',
                'components/payroll/payroll-blocker',
                'components/payroll/confirm-wire-details',
                'components/payroll/off-cycle-creation',
                'components/payroll/off-cycle-deductions-setting',
                'components/payroll/off-cycle-reason-selection',
                'components/payroll/transition-creation',
                'components/payroll/recovery-cases',
              ],
            },
          ],
        },
        {
          type: 'category',
          label: 'Information Requests',
          link: {
            type: 'doc',
            id: 'components/information-requests/information-requests',
          },
          items: [
            {
              type: 'category',
              label: 'Flows',
              items: ['components/information-requests/information-requests-flow'],
            },
            {
              type: 'category',
              label: 'Blocks',
              items: [
                'components/information-requests/information-request-list',
                'components/information-requests/information-request-form',
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      link: {
        type: 'doc',
        id: 'guides/guides',
      },
      items: [
        'guides/versioning',
        'guides/routing',
        'guides/request-interceptors',
        'guides/providing-your-own-data',
        'guides/observability',
        'guides/component-adapter',
        'guides/proxy-setup',
        'guides/theme-variables',
      ],
    },
    {
      type: 'category',
      label: 'Hooks (Experimental)',
      link: {
        type: 'doc',
        id: 'hooks/hooks',
      },
      items: [
        'hooks/useEmployeeDetailsForm',
        'hooks/useCompensationForm',
        'hooks/useWorkAddressForm',
        'hooks/usePayScheduleForm',
        'hooks/useSignCompanyForm',
        'hooks/useSignEmployeeForm',
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      items: ['reference/endpoint-reference', 'reference/proxy-examples'],
    },
  ],
  api: apiSidebar,
}

export default sidebars
