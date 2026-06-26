# 🦎 Gusto Embedded React SDK

[![CI](https://github.com/Gusto/embedded-react-sdk/actions/workflows/ci.yaml/badge.svg)](https://github.com/Gusto/embedded-react-sdk/actions/workflows/ci.yaml)

To install:

```bash
npm add @gusto/embedded-react-sdk
```

## SDK Dev App

A standalone development application for building and testing SDK components with live API data is available in [`sdk-app/`](sdk-app/). To get started:

```bash
npm run sdk-app              # Demo environment (default)
npm run sdk-app:staging      # Staging environment
```

See the [SDK Dev App README](sdk-app/README.md) for full setup and usage details.

## Documentation

- [Deciding to build with the SDK](docs/deciding-to-build-with-the-sdk/deciding-to-build-with-the-sdk.md)
  - [Build Pathways - SDK, Flows & APIs](docs/deciding-to-build-with-the-sdk/build-pathways-sdk-flows-api.md)
  - [Component Types](docs/deciding-to-build-with-the-sdk/component-types.md)
- [Getting Started](docs/getting-started/getting-started.md)
  - [Authentication](docs/getting-started/authentication.md)
- [Integration Guide](docs/integration-guide/integration-guide.md)
  - [Versioning](docs/integration-guide/versioning.md)
  - [Event Handling](docs/integration-guide/event-handling.md)
  - [Event Types](docs/reference/events.md)
  - [Error Handling](docs/integration-guide/error-handling.md)
  - [Composition](docs/integration-guide/composition.md)
  - [Providing your own data](docs/integration-guide/providing-your-own-data.md)
  - [Translation](docs/integration-guide/translation.md)
  - [Routing](docs/integration-guide/routing.md)
  - [Request Interceptors](docs/integration-guide/request-interceptors.md)
  - [Customizing SDK UI](docs/integration-guide/customizing-sdk-ui.md)
  - [Observability](docs/integration-guide/observability.md)
  - [Observability Examples](docs/integration-guide/observability-examples.md)
- [Theming](docs/theming/theming.md)
  - [Theming Guide](docs/theming/theming-guide.md)
  - [Theme Variables](docs/reference/theme-variables.md)
- [Component Adapter](docs/component-adapter/component-adapter.md)
  - [How the Component Adapter Works](docs/component-adapter/how-the-component-adapter-works.md)
  - [Component Adapter Types](docs/component-adapter/component-adapter-types.md)
  - [Setting up your Component Adapter](docs/component-adapter/setting-up-your-component-adapter.md)
  - [Component Inventory](docs/reference/component-inventory.md)
  - [Component Adapter FAQ](docs/component-adapter/component-adapter-faq.md)
- [Appendix](docs/appendix/endpoint-reference.md)
  - [Endpoint Reference](docs/appendix/endpoint-reference.md)
  - [Jobs and Compensations](docs/appendix/jobs-and-compensations.md)
  - [Proxy Examples](docs/appendix/proxy-examples.md)
- [Workflows Overview](docs/workflows-overview/workflows-overview.md)
  - [Company Onboarding](docs/workflows-overview/company-onboarding.md)
  - [Contractor Onboarding](docs/workflows-overview/contractor-onboarding.md)
  - [Contractor Payments](docs/workflows-overview/contractor-payments.md)
  - [Employee Onboarding](docs/workflows-overview/employee-onboarding/employee-onboarding.md)
    - [Employee Self-Onboarding](docs/workflows-overview/employee-onboarding/employee-self-onboarding.md)
  - [Employee Dashboard](docs/workflows-overview/employee-dashboard.md)
  - [Employee Termination](docs/workflows-overview/employee-termination.md)
  - [Information Requests](docs/workflows-overview/information-requests.md)
  - [Run Payroll](docs/workflows-overview/run-payroll.md)
  - [Off-Cycle Payroll (Bonus & Correction)](docs/workflows-overview/off-cycle-payroll.md)
  - [Dismissal Payroll](docs/workflows-overview/dismissal-payroll.md)
  - [Transition Payroll](docs/workflows-overview/transition-payroll.md)
- [Hooks (Experimental)](docs/hooks/hooks.md)
  - [useEmployeeDetailsForm](docs/hooks/useEmployeeDetailsForm.md)
  - [useCompensationForm](docs/hooks/useCompensationForm.md)
  - [useFederalTaxesForm](docs/hooks/useFederalTaxesForm.md)
  - [usePayScheduleForm](docs/hooks/usePayScheduleForm.md)
  - [useSignCompanyForm](docs/hooks/useSignCompanyForm.md)
  - [useSignEmployeeForm](docs/hooks/useSignEmployeeForm.md)
  - [useWorkAddressForm](docs/hooks/useWorkAddressForm.md)
