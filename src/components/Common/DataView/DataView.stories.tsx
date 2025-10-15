import { action } from '@ladle/react'
import { DataView } from '@/components/Common/DataView/DataView'
import { useDataView } from '@/components/Common/DataView/useDataView'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
import TrashCanSvg from '@/assets/icons/trashcan.svg?react'
import PencilSvg from '@/assets/icons/pencil.svg?react'

// Adding a meta object for title
export default {
  title: 'UI/Components/DataView', // Creates nesting structure for UI components
}

const compensationData = [
  {
    jobTitle: 'Administrator',
    payType: 'By the hour',
    amount: '$32.00',
    payTimePeriod: 'Annually',
  },
  { jobTitle: 'Key Holder', payType: 'By the hour', amount: '$20.00', payTimePeriod: 'Annually' },
  {
    jobTitle: 'Administrator',
    payType: 'By the hour',
    amount: '$32.00',
    payTimePeriod: 'Annually',
  },
  {
    jobTitle: 'Key Holder',
    payType: 'By the hour',
    amount: '$20.00',
    payTimePeriod: 'Annually',
  },
  {
    jobTitle: 'Software Engineer',
    payType: 'By the hour',
    amount: '$45.00',
    payTimePeriod: 'Annually',
  },
  {
    jobTitle: 'Project Manager',
    payType: 'By the hour',
    amount: '$50.00',
    payTimePeriod: 'Annually',
  },
  {
    jobTitle: 'Data Analyst',
    payType: 'By the hour',
    amount: '$38.00',
    payTimePeriod: 'Annually',
  },
  {
    jobTitle: 'Sales Associate',
    payType: 'By the hour',
    amount: '$15.00',
    payTimePeriod: 'Annually',
  },
  {
    jobTitle: 'Graphic Designer',
    payType: 'By the project',
    amount: '$2,000.00',
    payTimePeriod: 'Per project',
  },
  {
    jobTitle: 'Marketing Specialist',
    payType: 'By the hour',
    amount: '$35.00',
    payTimePeriod: 'Annually',
  },
  {
    jobTitle: 'Customer Service Representative',
    payType: 'By the hour',
    amount: '$18.00',
    payTimePeriod: 'Annually',
  },
  {
    jobTitle: 'UX/UI Designer',
    payType: 'By the hour',
    amount: '$40.00',
    payTimePeriod: 'Annually',
  },
  {
    jobTitle: 'Network Administrator',
    payType: 'By the hour',
    amount: '$42.00',
    payTimePeriod: 'Annually',
  },
  {
    jobTitle: 'Content Writer',
    payType: 'By the word',
    amount: '$0.15',
    payTimePeriod: 'Per word',
  },
  {
    jobTitle: 'Data Scientist',
    payType: 'By the hour',
    amount: '$55.00',
    payTimePeriod: 'Annually',
  },
  {
    jobTitle: 'Web Developer',
    payType: 'By the project',
    amount: '$3,500.00',
    payTimePeriod: 'Per project',
  },
  {
    jobTitle: 'Human Resources Manager',
    payType: 'By the hour',
    amount: '$48.00',
    payTimePeriod: 'Annually',
  },
  {
    jobTitle: 'Accountant',
    payType: 'By the hour',
    amount: '$40.00',
    payTimePeriod: 'Annually',
  },
  {
    jobTitle: 'Legal Advisor',
    payType: 'By the hour',
    amount: '$100.00',
    payTimePeriod: 'Annually',
  },
]

export const DataViewDefault = () => {
  const { ...dataProps } = useDataView({
    data: compensationData,
    columns: [
      { key: 'jobTitle', title: 'Job Title' },
      { key: 'payType', title: 'Pay Type' },
      { key: 'amount', title: 'Amount' },
      { key: 'payTimePeriod', title: 'Pay Time Period' },
    ],
  })

  return <DataView label="Data View Default" {...dataProps} />
}

export const DataViewSelectable = () => {
  const { ...dataProps } = useDataView({
    data: compensationData,
    columns: [
      { key: 'jobTitle', title: 'Job Title' },
      { key: 'payType', title: 'Pay Type' },
      { key: 'amount', title: 'Amount' },
      { key: 'payTimePeriod', title: 'Pay Time Period' },
    ],
    onSelect: (item, checked) => {
      action('onSelect')({
        item,
        checked,
      })
    },
  })

  return <DataView label="Data View Selectable" {...dataProps} />
}

export const DataViewWithMenu = () => {
  const { ...dataProps } = useDataView({
    data: compensationData,
    columns: [
      { key: 'jobTitle', title: 'Job Title' },
      { key: 'payType', title: 'Pay Type' },
      { key: 'amount', title: 'Amount' },
      { key: 'payTimePeriod', title: 'Pay Time Period' },
    ],
    itemMenu: item => {
      return (
        <HamburgerMenu
          items={[
            { label: 'Edit', icon: <PencilSvg aria-hidden />, onClick: () => {} },
            { label: 'Delete', icon: <TrashCanSvg aria-hidden />, onClick: () => {} },
          ]}
        />
      )
    },
  })

  return <DataView label="Data View with Menu" {...dataProps} />
}

export const DataViewSelectableWithMenu = () => {
  const { ...dataProps } = useDataView({
    data: compensationData,
    columns: [
      { key: 'jobTitle', title: 'Job Title' },
      { key: 'payType', title: 'Pay Type' },
      { key: 'amount', title: 'Amount' },
      { key: 'payTimePeriod', title: 'Pay Time Period' },
    ],
    itemMenu: item => {
      return (
        <HamburgerMenu
          items={[
            { label: 'Edit', icon: <PencilSvg aria-hidden />, onClick: () => {} },
            { label: 'Delete', icon: <TrashCanSvg aria-hidden />, onClick: () => {} },
          ]}
        />
      )
    },
    onSelect: (item, checked) => {
      action('onSelect')({
        item,
        checked,
      })
    },
  })

  return <DataView label="Data View Selectable with Menu" {...dataProps} />
}

export const DataViewEmpty = () => {
  const { ...dataProps } = useDataView({
    data: [] as typeof compensationData,
    columns: [
      { key: 'jobTitle', title: 'Job Title' },
      { key: 'payType', title: 'Pay Type' },
      { key: 'amount', title: 'Amount' },
      { key: 'payTimePeriod', title: 'Pay Time Period' },
    ],
    emptyState: () => <div style={{ textAlign: 'center', padding: '1rem' }}>No data available</div>,
  })

  return <DataView label="Data View Selectable with Menu" {...dataProps} />
}

export const DataViewWithPagination = () => {
  const { ...dataProps } = useDataView({
    data: compensationData,
    columns: [
      { key: 'jobTitle', title: 'Job Title' },
      { key: 'payType', title: 'Pay Type' },
      { key: 'amount', title: 'Amount' },
      { key: 'payTimePeriod', title: 'Pay Time Period' },
    ],
    pagination: {
      currentPage: 1,
      totalPages: 10,
      itemsPerPage: '5',
      handleFirstPage: () => {},
      handlePreviousPage: () => {},
      handleNextPage: () => {},
      handleLastPage: () => {},
      handleItemsPerPageChange: () => {},
    },
  })

  return <DataView label="Data View with Pagination" {...dataProps} />
}

export const DataViewWithFooter = () => {
  const sampleData = [
    { jobTitle: 'Software Engineer', hourlyRate: 45, hoursWorked: 40 },
    { jobTitle: 'Project Manager', hourlyRate: 50, hoursWorked: 38 },
    { jobTitle: 'Data Analyst', hourlyRate: 38, hoursWorked: 40 },
    { jobTitle: 'UX Designer', hourlyRate: 40, hoursWorked: 35 },
  ]

  const { ...dataProps } = useDataView({
    data: sampleData,
    columns: [
      { key: 'jobTitle', title: 'Job Title' },
      {
        key: 'hourlyRate',
        title: 'Hourly Rate',
        render: item => `$${item.hourlyRate.toFixed(2)}`,
      },
      { key: 'hoursWorked', title: 'Hours Worked' },
      {
        title: 'Total Pay',
        render: item => `$${(item.hourlyRate * item.hoursWorked).toFixed(2)}`,
      },
    ],
    footer: () => ({
      jobTitle: 'Total',
      hourlyRate: '$43.25',
      hoursWorked: '153',
      'column-3': '$6,620.00', // Total Pay column doesn't have a key
    }),
  })

  return <DataView label="Data View with Footer" {...dataProps} />
}
