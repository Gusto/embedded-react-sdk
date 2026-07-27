export type Category = (typeof CATEGORIES)[number]

export const CATEGORIES = ['Examples', 'Companies', 'Contractors', 'Employees', 'Payroll'] as const

export interface PrototypeEntry {
  name: string
  path: string
  description: string
  children?: PrototypeEntry[]
}

export type CategorizedRegistry = Record<Category, PrototypeEntry[]>

export const categorizedRegistry: CategorizedRegistry = {
  Examples: [
    {
      name: 'Component Showcase',
      path: '/design/component-showcase',
      description:
        'A single page demonstrating SDK components like Button, TextInput, Select, Alert, and more.',
    },
  ],
  Companies: [
    {
      name: 'State Taxes with Future Rates',
      path: '/design/state-taxes-with-future-rates',
      description:
        'Extends the company state tax onboarding component with an effective-dated tax rate history and a dialog for scheduling future rates.',
      children: [
        {
          name: 'Prototype',
          path: '/design/state-taxes-with-future-rates',
          description: 'Live prototype against the real API.',
        },
        {
          name: 'Component states',
          path: '/design/state-taxes-with-future-rates/component-states',
          description: 'Browse individual components and configurations with mock data.',
        },
      ],
    },
  ],
  Contractors: [
    {
      name: 'Contractor Management',
      path: '/design/contractor-management',
      description:
        'A prototype flow for managing contractors — view the list and drill into individual profiles.',
      children: [
        {
          name: 'Prototype',
          path: '/design/contractor-management',
          description: 'Live prototype against the real API.',
        },
        {
          name: 'Component states',
          path: '/design/contractor-management/component-states',
          description: 'Browse individual components and configurations with mock data.',
        },
      ],
    },
    {
      name: 'Create Historical Payment',
      path: '/design/create-historical-payment',
      description:
        'Record a contractor payment that already happened outside Gusto — paid date, per-contractor amounts, no funding.',
      children: [
        {
          name: 'Prototype',
          path: '/design/create-historical-payment',
          description: 'Live prototype against the real API.',
        },
        {
          name: 'Component states',
          path: '/design/create-historical-payment/component-states',
          description: 'Browse form configurations with mock data.',
        },
      ],
    },
    {
      name: 'Contractor Self-Onboarding',
      path: '/design/contractor-self-onboarding',
      description: 'The contractor-facing onboarding experience after receiving an invite link.',
      children: [
        {
          name: 'Prototype',
          path: '/design/contractor-self-onboarding',
          description: 'Live prototype against the real API.',
        },
        {
          name: 'Component states',
          path: '/design/contractor-self-onboarding/component-states',
          description: 'Browse individual components and configurations with mock data.',
        },
      ],
    },
  ],
  Employees: [
    {
      name: 'Employee Management',
      path: '/design/employee-management',
      description:
        'A prototype for managing employees — list active, onboarding, and dismissed employees, and rehire dismissed employees.',
      children: [
        {
          name: 'Prototype',
          path: '/design/employee-management',
          description: 'Live prototype against the real API.',
        },
        {
          name: 'Component states',
          path: '/design/employee-management/component-states',
          description: 'Browse individual components and configurations with mock data.',
        },
      ],
    },
    {
      name: 'Compensation History',
      path: '/design/employee-compensation-history',
      description:
        'A read-only view of an employee’s compensation history across all of their jobs, with a job filter for multi-job employees.',
      children: [
        {
          name: 'Prototype',
          path: '/design/employee-compensation-history/prototype',
          description: 'Live prototype against the real API.',
        },
        {
          name: 'Component states',
          path: '/design/employee-compensation-history/component-states',
          description: 'Browse individual components and configurations with mock data.',
        },
      ],
    },
  ],
  Payroll: [
    {
      name: 'Regular rate of pay',
      path: '/design/regular-rate-of-pay',
      description:
        'A duplicate of the PayrollEditEmployee form for design iteration — adjust the UI independently of the live SDK component.',
      children: [
        {
          name: 'Prototype',
          path: '/design/regular-rate-of-pay',
          description: 'Live prototype against the real API.',
        },
        {
          name: 'Component states',
          path: '/design/regular-rate-of-pay/component-states',
          description: 'Browse individual components and configurations with mock data.',
        },
      ],
    },
  ],
}
