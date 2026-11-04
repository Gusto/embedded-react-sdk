<!-- Partner-facing guide content, published to the SDK docs site. -->

# DashboardFlow

## Tabs <!-- slot: overview -->

The dashboard organizes a company's settings into tabs. Switching tabs emits `company/dashboard/tabChange`.

- **Company details** — the industry classification (title and NAICS code) and the company's work addresses, with their mailing and filing designations.
- **Pay** — the company's funding bank account: name, masked account number, routing number, account type, and micro-deposit verification status. Gusto supports one default company bank account, so this is a single account rather than a list.
- **Taxes** — federal tax details: legal name, tax payer type, federal filing form, and whether an EIN is on file and verified.

The EIN itself is never returned by the API, so the Federal taxes card reports verification status rather than the number.

## Step flow <!-- slot: appendix -->

The dashboard is a hub: the `Dashboard` cards view is the resting state. A card's Edit or Manage CTA opens that section's component, and a "Back to company settings" header returns to the cards. A successful save shows a dismissible success alert.

```mermaid
flowchart LR
  start@{ shape: sm-circ } --> Dashboard
  Dashboard <--> Industry
  Dashboard <--> Locations
  Dashboard <--> BankAccount
  Dashboard <--> FederalTaxes
  linkStyle 1,2,3,4 stroke-width:2.5px
```

Each spoke is a complete component rather than a single form, so it may have screens of its own — `Locations`, for example, has its own address list with add and edit screens. Events raised inside a spoke (`company/location/add/done`, `company/bankAccount/created`, `company/bankAccount/verified`, `company/federalTaxes/updated`) keep the spoke open; only the spoke's own completion event (`company/location/done`, `company/bankAccount/done`, `company/federalTaxes/done`, `company/industry/selected`) or the back header returns to the dashboard.

Because `Industry` and `FederalTaxes` submit without a Cancel button, and `Locations` and `BankAccount` open directly into a form when the company has no record yet, the "Back to company settings" header is the reliable way out of any spoke. It emits `company/dashboard/back`.

Some actions stay on the cards view without a screen swap: switching tabs (`company/dashboard/tabChange`) and dismissing a success alert (`company/dashboard/alertDismissed`).

## Empty states <!-- slot: appendix -->

Each card handles missing data on its own: the Industry card shows "No industry selected" until a NAICS code is saved, the Locations card shows "No locations yet" until the first address is added, and the Bank account card swaps its Manage CTA for "Add bank account" until an account exists. Opening either section from its empty state lands on the screen that creates the missing record.
