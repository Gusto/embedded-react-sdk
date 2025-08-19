---
title: Component Types
order: 1
---

## SDK Component Types and “Altitude”

Given that a UI “component” can be anything ranging from a table to an entire end-to-end workflow reflecting the various steps of a user journey (e.g. employee onboarding), we wanted to provide more optionality for our developers by building a mix of components in terms of complexity/granularity.

For each domain in the payroll application (e.g. run payroll, company onboarding, etc.), we include:

- **“Workflow”** SDK components function as a full, off-the-shelf-ready solutions that can either serve as the entirety or the starting point for your build. This component would still have many of the customization and flexibility of the individual SDK components, but would lack the following capabilities:
  - Cannot re-order or remove fields
  - Has less flexibility to support A/B testing due to rigidity of the sub-components
- **“Building Block”** SDK components that represent the individual pieces of the Workflow above. Using these would provide more customization and flexibility, but would be more time-consuming compared to the ready-built Workflow above.

While we generally recommend using the Workflow approach, your build needs may vary and we recommend discussing with a dedicated specialist from our side to determine what makes sense given your goals and your current application.
