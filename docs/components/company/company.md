---
title: Company
sidebar_position: 1
---

The Company domain provides components for onboarding a company onto Gusto's embedded payroll platform. These components handle tax setup, bank account configuration, pay schedules, location management, signatory assignment, and document signing.

## Flow

| Component | Description |
| --- | --- |
| [Company.OnboardingFlow](./onboarding-flow.md) | End-to-end company onboarding workflow that orchestrates all onboarding steps in sequence. |

## Blocks

| Component | Description |
| --- | --- |
| [Company.AssignSignatory](./assign-signatory.md) | Allows users to choose between creating a new signatory or inviting someone else. |
| [Company.CreateSignatory](./create-signatory.md) | Standalone form for creating a signatory with full personal details. |
| [Company.InviteSignatory](./invite-signatory.md) | Standalone form for inviting someone to become the company signatory. |
| [Company.Industry](./industry.md) | Industry selection for the company. |
| [Company.DocumentSigner](./document-signer.md) | Interface for reading and signing required company documents. |
| [Company.DocumentList](./document-list.md) | Displays the list of company forms available for signing. |
| [Company.SignatureForm](./signature-form.md) | Form for reviewing and signing an individual company document. |
| [Company.FederalTaxes](./federal-taxes.md) | Form for entering federal tax information (EIN, tax payer type, filing form). |
| [Company.PaySchedule](./pay-schedule.md) | Manages company pay schedules with create, edit, and preview functionality. |
| [Company.Locations](./locations.md) | Manages company addresses including mailing and filing locations. |
| [Company.BankAccount](./bank-account.md) | Manages company bank account setup and verification. |
| [Company.StateTaxes](./state-taxes.md) | Orchestrated state tax setup switching between list and edit views. |
| [Company.StateTaxesList](./state-taxes-list.md) | Displays the list of state tax requirements for a company. |
| [Company.StateTaxesForm](./state-taxes-form.md) | Form for editing state tax requirements for a specific state. |
| [Company.OnboardingOverview](./onboarding-overview.md) | Displays onboarding progress and outstanding requirements. |
