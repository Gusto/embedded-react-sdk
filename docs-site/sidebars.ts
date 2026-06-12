import type { SidebarsConfig } from '@docusaurus/plugin-content-docs'

const sidebars: SidebarsConfig = {
  docs: [
    {
      type: 'category',
      label: 'Getting Started',
      link: { type: 'doc', id: 'getting-started/getting-started' },
      collapsed: true,
      items: ['getting-started/authentication', 'getting-started/proxy-security-partner-guidance'],
    },
    {
      type: 'category',
      label: 'Build methods',
      link: { type: 'doc', id: 'build-methods/build-methods' },
      items: ['build-methods/workflows', 'build-methods/sub-components', 'build-methods/hooks'],
    },
    {
      type: 'category',
      label: 'Surfaces',
      link: { type: 'doc', id: 'surfaces/surfaces' },
      collapsible: false,
      items: [
        {
          type: 'category',
          label: 'Companies',
          link: { type: 'doc', id: 'surfaces/companies' },
          items: [
            {
              type: 'category',
              label: 'Onboard a company',
              link: {
                type: 'doc',
                id: 'surfaces/company-onboarding/company-onboarding',
              },
              items: [
                {
                  type: 'doc',
                  id: 'surfaces/company-onboarding/workflow',
                  label: 'Workflow',
                },
                {
                  type: 'doc',
                  id: 'surfaces/company-onboarding/sub-components',
                  label: 'Sub-components',
                },
              ],
            },
            {
              type: 'category',
              label: 'Information requests',
              link: {
                type: 'doc',
                id: 'surfaces/information-requests/information-requests',
              },
              items: [
                {
                  type: 'doc',
                  id: 'surfaces/information-requests/workflow',
                  label: 'Workflow',
                },
                {
                  type: 'doc',
                  id: 'surfaces/information-requests/sub-components',
                  label: 'Sub-components',
                },
              ],
            },
          ],
        },
        {
          type: 'category',
          label: 'Employees',
          link: { type: 'doc', id: 'surfaces/employees' },
          items: [
            {
              type: 'category',
              label: 'Onboard an employee',
              link: {
                type: 'doc',
                id: 'surfaces/employee-onboarding/employee-onboarding',
              },
              items: [
                {
                  type: 'doc',
                  id: 'surfaces/employee-onboarding/workflow',
                  label: 'Workflow',
                },
                {
                  type: 'doc',
                  id: 'surfaces/employee-onboarding/sub-components',
                  label: 'Sub-components',
                },
              ],
            },
            {
              type: 'category',
              label: 'Employee self-onboarding',
              link: {
                type: 'doc',
                id: 'surfaces/employee-self-onboarding/employee-self-onboarding',
              },
              items: [
                {
                  type: 'doc',
                  id: 'surfaces/employee-self-onboarding/workflow',
                  label: 'Workflow',
                },
                {
                  type: 'doc',
                  id: 'surfaces/employee-self-onboarding/sub-components',
                  label: 'Sub-components',
                },
              ],
            },
          ],
        },
        {
          type: 'category',
          label: 'Contractors',
          link: { type: 'doc', id: 'surfaces/contractors' },
          items: [
            {
              type: 'category',
              label: 'Contractor onboarding',
              link: {
                type: 'doc',
                id: 'surfaces/contractor-onboarding/contractor-onboarding',
              },
              items: [
                {
                  type: 'doc',
                  id: 'surfaces/contractor-onboarding/workflow',
                  label: 'Workflow',
                },
                {
                  type: 'doc',
                  id: 'surfaces/contractor-onboarding/sub-components',
                  label: 'Sub-components',
                },
              ],
            },
            {
              type: 'category',
              label: 'Contractor payments',
              link: {
                type: 'doc',
                id: 'surfaces/contractor-payments/contractor-payments',
              },
              items: [
                {
                  type: 'doc',
                  id: 'surfaces/contractor-payments/workflow',
                  label: 'Workflow',
                },
                {
                  type: 'doc',
                  id: 'surfaces/contractor-payments/sub-components',
                  label: 'Sub-components',
                },
              ],
            },
          ],
        },
        {
          type: 'category',
          label: 'Payroll',
          link: { type: 'doc', id: 'surfaces/payroll' },
          items: [
            {
              type: 'category',
              label: 'Payroll processing',
              link: {
                type: 'doc',
                id: 'surfaces/run-payroll/run-payroll',
              },
              items: [
                {
                  type: 'doc',
                  id: 'surfaces/run-payroll/workflow',
                  label: 'Workflow',
                },
                {
                  type: 'doc',
                  id: 'surfaces/run-payroll/sub-components',
                  label: 'Sub-components',
                },
              ],
            },
            {
              type: 'category',
              label: 'Off-cycle payroll',
              link: {
                type: 'doc',
                id: 'surfaces/off-cycle-payroll/off-cycle-payroll',
              },
              items: [
                {
                  type: 'doc',
                  id: 'surfaces/off-cycle-payroll/workflow',
                  label: 'Workflow',
                },
                {
                  type: 'doc',
                  id: 'surfaces/off-cycle-payroll/sub-components',
                  label: 'Sub-components',
                },
              ],
            },
            {
              type: 'category',
              label: 'Dismissal payroll',
              link: {
                type: 'doc',
                id: 'surfaces/dismissal-payroll/dismissal-payroll',
              },
              items: [
                {
                  type: 'doc',
                  id: 'surfaces/dismissal-payroll/workflow',
                  label: 'Workflow',
                },
                {
                  type: 'doc',
                  id: 'surfaces/dismissal-payroll/sub-components',
                  label: 'Sub-components',
                },
              ],
            },
            {
              type: 'category',
              label: 'Transition payroll',
              link: {
                type: 'doc',
                id: 'surfaces/transition-payroll/transition-payroll',
              },
              items: [
                {
                  type: 'doc',
                  id: 'surfaces/transition-payroll/workflow',
                  label: 'Workflow',
                },
                {
                  type: 'doc',
                  id: 'surfaces/transition-payroll/sub-components',
                  label: 'Sub-components',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Component Adapter',
      link: { type: 'doc', id: 'component-adapter/component-adapter' },
      items: [
        'component-adapter/how-the-component-adapter-works',
        'component-adapter/setting-up-your-component-adapter',
        'component-adapter/component-adapter-types',
        'component-adapter/component-inventory',
        'component-adapter/component-adapter-faq',
      ],
    },
    {
      type: 'category',
      label: 'Theming',
      link: { type: 'doc', id: 'theming/theming' },
      items: ['theming/theme-variables', 'theming/theming-guide'],
    },
    {
      type: 'category',
      label: 'Integration Guide',
      link: { type: 'doc', id: 'integration-guide/integration-guide' },
      items: [
        'integration-guide/versioning',
        'integration-guide/event-handling',
        'integration-guide/event-types',
        'integration-guide/request-interceptors',
        'integration-guide/customizing-sdk-ui',
        'integration-guide/composition',
        'integration-guide/providing-your-own-data',
        'integration-guide/translation',
        'integration-guide/routing',
        'integration-guide/error-handling',
        'integration-guide/observability',
        'integration-guide/observability-examples',
      ],
    },
    {
      type: 'category',
      label: 'Hooks (Experimental)',
      link: { type: 'doc', id: 'hooks/hooks' },
      items: [
        'hooks/useEmployeeDetailsForm',
        'hooks/useCompensationForm',
        'hooks/useWorkAddressForm',
      ],
    },
    {
      type: 'category',
      label: 'API Reference',
      link: { type: 'doc', id: 'api/index' },
      items: [{ type: 'autogenerated', dirName: 'api' }],
    },
    {
      type: 'category',
      label: 'Appendix',
      collapsed: true,
      items: [
        'reference/endpoint-reference',
        'reference/jobs-and-compensations',
        'reference/proxy-examples',
      ],
    },
  ],
}

export default sidebars
