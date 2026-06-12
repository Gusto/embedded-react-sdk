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
      link: { type: 'doc', id: 'workflows-overview/workflows-overview' },
      collapsible: false,
      items: [
        {
          type: 'category',
          label: 'Companies',
          link: { type: 'doc', id: 'workflows-overview/companies' },
          items: [
            {
              type: 'category',
              label: 'Onboard a company',
              link: {
                type: 'doc',
                id: 'workflows-overview/company-onboarding/company-onboarding',
              },
              items: [
                {
                  type: 'doc',
                  id: 'workflows-overview/company-onboarding/workflow',
                  label: 'Workflow',
                },
                {
                  type: 'doc',
                  id: 'workflows-overview/company-onboarding/sub-components',
                  label: 'Sub-components',
                },
              ],
            },
            {
              type: 'category',
              label: 'Information requests',
              link: {
                type: 'doc',
                id: 'workflows-overview/information-requests/information-requests',
              },
              items: [
                {
                  type: 'doc',
                  id: 'workflows-overview/information-requests/workflow',
                  label: 'Workflow',
                },
                {
                  type: 'doc',
                  id: 'workflows-overview/information-requests/sub-components',
                  label: 'Sub-components',
                },
              ],
            },
          ],
        },
        {
          type: 'category',
          label: 'Employees',
          link: { type: 'doc', id: 'workflows-overview/employees' },
          items: [
            {
              type: 'category',
              label: 'Onboard an employee',
              link: {
                type: 'doc',
                id: 'workflows-overview/employee-onboarding/employee-onboarding',
              },
              items: [
                {
                  type: 'doc',
                  id: 'workflows-overview/employee-onboarding/workflow',
                  label: 'Workflow',
                },
                {
                  type: 'doc',
                  id: 'workflows-overview/employee-onboarding/sub-components',
                  label: 'Sub-components',
                },
              ],
            },
            {
              type: 'category',
              label: 'Employee self-onboarding',
              link: {
                type: 'doc',
                id: 'workflows-overview/employee-self-onboarding/employee-self-onboarding',
              },
              items: [
                {
                  type: 'doc',
                  id: 'workflows-overview/employee-self-onboarding/workflow',
                  label: 'Workflow',
                },
                {
                  type: 'doc',
                  id: 'workflows-overview/employee-self-onboarding/sub-components',
                  label: 'Sub-components',
                },
              ],
            },
          ],
        },
        {
          type: 'category',
          label: 'Contractors',
          link: { type: 'doc', id: 'workflows-overview/contractors' },
          items: [
            {
              type: 'category',
              label: 'Contractor onboarding',
              link: {
                type: 'doc',
                id: 'workflows-overview/contractor-onboarding/contractor-onboarding',
              },
              items: [
                {
                  type: 'doc',
                  id: 'workflows-overview/contractor-onboarding/workflow',
                  label: 'Workflow',
                },
                {
                  type: 'doc',
                  id: 'workflows-overview/contractor-onboarding/sub-components',
                  label: 'Sub-components',
                },
              ],
            },
            {
              type: 'category',
              label: 'Contractor payments',
              link: {
                type: 'doc',
                id: 'workflows-overview/contractor-payments/contractor-payments',
              },
              items: [
                {
                  type: 'doc',
                  id: 'workflows-overview/contractor-payments/workflow',
                  label: 'Workflow',
                },
                {
                  type: 'doc',
                  id: 'workflows-overview/contractor-payments/sub-components',
                  label: 'Sub-components',
                },
              ],
            },
          ],
        },
        {
          type: 'category',
          label: 'Payroll',
          link: { type: 'doc', id: 'workflows-overview/payroll' },
          items: [
            {
              type: 'category',
              label: 'Payroll processing',
              link: {
                type: 'doc',
                id: 'workflows-overview/run-payroll/run-payroll',
              },
              items: [
                {
                  type: 'doc',
                  id: 'workflows-overview/run-payroll/workflow',
                  label: 'Workflow',
                },
                {
                  type: 'doc',
                  id: 'workflows-overview/run-payroll/sub-components',
                  label: 'Sub-components',
                },
              ],
            },
            {
              type: 'category',
              label: 'Off-cycle payroll',
              link: {
                type: 'doc',
                id: 'workflows-overview/off-cycle-payroll/off-cycle-payroll',
              },
              items: [
                {
                  type: 'doc',
                  id: 'workflows-overview/off-cycle-payroll/workflow',
                  label: 'Workflow',
                },
                {
                  type: 'doc',
                  id: 'workflows-overview/off-cycle-payroll/sub-components',
                  label: 'Sub-components',
                },
              ],
            },
            {
              type: 'category',
              label: 'Dismissal payroll',
              link: {
                type: 'doc',
                id: 'workflows-overview/dismissal-payroll/dismissal-payroll',
              },
              items: [
                {
                  type: 'doc',
                  id: 'workflows-overview/dismissal-payroll/workflow',
                  label: 'Workflow',
                },
                {
                  type: 'doc',
                  id: 'workflows-overview/dismissal-payroll/sub-components',
                  label: 'Sub-components',
                },
              ],
            },
            {
              type: 'category',
              label: 'Transition payroll',
              link: {
                type: 'doc',
                id: 'workflows-overview/transition-payroll/transition-payroll',
              },
              items: [
                {
                  type: 'doc',
                  id: 'workflows-overview/transition-payroll/workflow',
                  label: 'Workflow',
                },
                {
                  type: 'doc',
                  id: 'workflows-overview/transition-payroll/sub-components',
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
