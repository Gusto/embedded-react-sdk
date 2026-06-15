---
title: What is the GEP React SDK?
description: Introduction to the Gusto Embedded Payroll React SDK — component libraries with built-in business logic that abstract payroll API complexity for React applications.
slug: /
displayed_sidebar: docs
order: 0
---

## Introduction

The Gusto Embedded Payroll React SDK is a React component library for building embedded payroll experiences on top of the Gusto Embedded API. It offers three levels of abstraction — workflows, sub-components, and hooks — so you can choose the right balance of speed and customization for each part of your application.

## What you get

- **Workflows** — embed a complete multi-step payroll experience (company onboarding, running payroll, employee management) with a single React component.
- **Sub-components** — compose exactly the UI your application needs using individual form and data components, with full control over layout and sequencing.
- **Hooks** — headless form and data utilities that let you own your UI entirely while the SDK handles data fetching, validation, and API calls.
- **Theming and component adapters** — make the SDK match your design system, from CSS variable overrides to fully replacing individual UI components.

## Quick example

The following renders a complete, multi-step employee onboarding experience:

```jsx
import { EmployeeOnboarding, GustoProvider } from '@gusto/embedded-react-sdk'
import '@gusto/embedded-react-sdk/style.css'

function App({ companyId }) {
  return (
    <GustoProvider config={{ baseUrl: '/proxy-url/' }}>
      <EmployeeOnboarding.OnboardingFlow companyId={companyId} onEvent={() => {}} />
    </GustoProvider>
  )
}
```

See [Getting Started](./getting-started/getting-started.md) to install and configure the SDK for your application.
