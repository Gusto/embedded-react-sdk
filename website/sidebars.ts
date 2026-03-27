import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';
import apiSidebar from '../docs/api/sidebar';

const sidebars: SidebarsConfig = {
  docs: [
    'what-is-the-gep-react-sdk',
    {
      type: 'category',
      label: 'Deciding to Build with the SDK',
      link: {
        type: 'doc',
        id: 'deciding-to-build-with-the-sdk/deciding-to-build-with-the-sdk',
      },
      items: [
        'deciding-to-build-with-the-sdk/build-pathways-sdk-flows-api',
        'deciding-to-build-with-the-sdk/component-types',
      ],
    },
    {
      type: 'category',
      label: 'Getting Started',
      link: {
        type: 'doc',
        id: 'getting-started/getting-started',
      },
      items: [
        'getting-started/authentication',
        'getting-started/proxy-security-partner-guidance',
      ],
    },
    {
      type: 'category',
      label: 'Integration Guide',
      link: {
        type: 'doc',
        id: 'integration-guide/integration-guide',
      },
      items: [
        'integration-guide/versioning',
        'integration-guide/event-handling',
        'integration-guide/event-types',
        'integration-guide/composition',
        'integration-guide/providing-your-own-data',
        'integration-guide/translation',
        'integration-guide/routing',
        'integration-guide/error-handling',
        'integration-guide/request-interceptors',
        'integration-guide/customizing-sdk-ui',
        'integration-guide/observability',
        'integration-guide/observability-examples',
      ],
    },
    {
      type: 'category',
      label: 'Workflows',
      link: {
        type: 'doc',
        id: 'workflows-overview/workflows-overview',
      },
      items: [
        {
          type: 'category',
          label: 'Employee Onboarding',
          link: {
            type: 'doc',
            id: 'workflows-overview/employee-onboarding/employee-onboarding',
          },
          items: [
            'workflows-overview/employee-onboarding/employee-self-onboarding',
          ],
        },
        'workflows-overview/company-onboarding',
        'workflows-overview/contractor-onboarding',
        'workflows-overview/contractor-payments',
        'workflows-overview/run-payroll',
        'workflows-overview/employee-termination',
        'workflows-overview/information-requests',
      ],
    },
    {
      type: 'category',
      label: 'Component Adapter',
      link: {
        type: 'doc',
        id: 'component-adapter/component-adapter',
      },
      items: [
        'component-adapter/how-the-component-adapter-works',
        'component-adapter/setting-up-your-component-adapter',
        'component-adapter/component-adapter-faq',
        'component-adapter/component-adapter-types',
        'component-adapter/component-inventory',
      ],
    },
    {
      type: 'category',
      label: 'Theming',
      link: {
        type: 'doc',
        id: 'theming/theming',
      },
      items: [
        'theming/theming-guide',
        'theming/theme-variables',
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
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      items: [
        'reference/endpoint-reference',
        'reference/proxy-examples',
      ],
    },
  ],
  api: apiSidebar,
};

export default sidebars;
