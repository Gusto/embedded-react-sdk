import type { EmployeeStateTaxesList } from '@gusto/embedded-api-v-2025-11-15/models/components/employeestatetaxeslist'

export const caEmployeeStateTaxes: EmployeeStateTaxesList[] = [
  {
    employeeUuid: 'b30b578c-dda4-4bc9-9887-dfbeb32fa304',
    state: 'CA',
    fileNewHireReport: false,
    isWorkState: true,
    questions: [
      {
        isQuestionForAdminOnly: false,
        label: 'Filing Status',
        description:
          "The Head of Household status applies to unmarried individuals who have a relative living with them in their home. If unsure, read the <a target='_blank' data-bypass rel='noopener noreferrer' tabindex='0' href='https://www.ftb.ca.gov/file/personal/filing-status/index.html'>CA Filing Status explanation</a>.\n",
        key: 'filing_status',
        inputQuestionFormat: {
          type: 'Select',
          options: [
            { value: 'S', label: 'Single' },
            { value: 'M', label: 'Married one income' },
            { value: 'MD', label: 'Married dual income' },
            { value: 'H', label: 'Head of household' },
            { value: 'E', label: 'Do Not Withhold' },
          ],
        },
        answers: [{ value: 'S', validFrom: '2010-01-01', validUpTo: null }],
      },
      {
        isQuestionForAdminOnly: false,
        label: 'Withholding Allowance',
        description:
          "This value is needed to calculate the employee's CA income tax withholding. If unsure, use the <a target='_blank' data-bypass rel='noopener noreferrer' tabindex='0' href='https://www.edd.ca.gov/pdf_pub_ctr/de4.pdf'>CA DE-4 form</a> to calculate the value manually.\n",
        key: 'withholding_allowance',
        inputQuestionFormat: { type: 'Number' },
        answers: [{ value: 1, validFrom: '2010-01-01', validUpTo: null }],
      },
      {
        isQuestionForAdminOnly: false,
        label: 'Additional Withholding',
        description: 'You can withhold an additional amount of California income taxes here.',
        key: 'additional_withholding',
        inputQuestionFormat: { type: 'Currency' },
        answers: [{ value: '0.0', validFrom: '2010-01-01', validUpTo: null }],
      },
      {
        isQuestionForAdminOnly: true,
        label: 'File a New Hire Report?',
        description:
          'State law requires you to file a new hire report within 20 days of hiring or re-hiring an employee.',
        key: 'file_new_hire_report',
        inputQuestionFormat: {
          type: 'Select',
          options: [
            { value: true, label: 'Yes, file the state new hire report for me.' },
            { value: false, label: 'No, I have already filed.' },
          ],
        },
        answers: [{ value: false, validFrom: '2010-01-01', validUpTo: null }],
      },
    ],
  },
]

export const nyEmployeeStateTaxes: EmployeeStateTaxesList[] = [
  {
    employeeUuid: 'ny-employee-uuid',
    state: 'NY',
    fileNewHireReport: null,
    isWorkState: true,
    questions: [
      {
        isQuestionForAdminOnly: false,
        label: 'Filing Status',
        description: null,
        key: 'filing_status',
        inputQuestionFormat: {
          type: 'Select',
          options: [
            { value: 'S', label: 'Single' },
            { value: 'M', label: 'Married' },
            { value: 'MH', label: 'Married, but withhold at higher single rate' },
          ],
        },
        answers: [{ value: 'S', validFrom: '2010-01-01', validUpTo: null }],
      },
      {
        isQuestionForAdminOnly: false,
        label: 'Withholding Allowance',
        description: null,
        key: 'withholding_allowance',
        inputQuestionFormat: { type: 'Number' },
        answers: [{ value: 0, validFrom: '2010-01-01', validUpTo: null }],
      },
      {
        isQuestionForAdminOnly: false,
        label: 'Additional Withholding',
        description: null,
        key: 'additional_withholding',
        inputQuestionFormat: { type: 'Currency' },
        answers: [{ value: '0.0', validFrom: '2010-01-01', validUpTo: null }],
      },
      {
        isQuestionForAdminOnly: false,
        label: 'NYC Withholding Allowance',
        description: null,
        key: 'total_allowances_nyc',
        inputQuestionFormat: { type: 'Number' },
        answers: [{ value: 0, validFrom: '2010-01-01', validUpTo: null }],
      },
      {
        isQuestionForAdminOnly: false,
        label: 'NYC Additional Withholding',
        description: null,
        key: 'additional_withholding_nyc',
        inputQuestionFormat: { type: 'Currency' },
        answers: [{ value: '0.0', validFrom: '2010-01-01', validUpTo: null }],
      },
      {
        isQuestionForAdminOnly: false,
        label: 'Yonkers Additional Withholding',
        description: null,
        key: 'additional_withholding_yonkers',
        inputQuestionFormat: { type: 'Currency' },
        answers: [{ value: '0.0', validFrom: '2010-01-01', validUpTo: null }],
      },
      {
        isQuestionForAdminOnly: true,
        label: 'File a New Hire Report?',
        description:
          'State law requires you to file a new hire report within 20 days of hiring or re-hiring an employee.',
        key: 'file_new_hire_report',
        inputQuestionFormat: {
          type: 'Select',
          options: [
            { value: true, label: 'Yes, file the state new hire report for me.' },
            { value: false, label: 'No, I have already filed.' },
          ],
        },
        answers: [],
      },
      {
        isQuestionForAdminOnly: true,
        label: 'Is dependent health insurance available to this employee?',
        description: 'Required for the New York Department of Taxation and Finance.',
        key: 'health_insurance_available',
        inputQuestionFormat: {
          type: 'Select',
          options: [
            { value: true, label: 'Yes' },
            { value: false, label: 'No' },
          ],
        },
        answers: [],
      },
      {
        isQuestionForAdminOnly: true,
        label: 'Date dependent health insurance became available',
        description: null,
        key: 'insurance_qualification_date',
        inputQuestionFormat: { type: 'Date' },
        answers: [],
      },
    ],
  },
]

export const inEmployeeStateTaxes: EmployeeStateTaxesList[] = [
  {
    employeeUuid: 'in-employee-uuid',
    state: 'IN',
    fileNewHireReport: null,
    isWorkState: true,
    questions: [
      {
        isQuestionForAdminOnly: false,
        label: 'Total Exemptions',
        description: null,
        key: 'withholding_allowance',
        inputQuestionFormat: { type: 'Number' },
        answers: [{ value: 1, validFrom: '2010-01-01', validUpTo: null }],
      },
      {
        isQuestionForAdminOnly: false,
        label: 'Dependent Exemptions',
        description: null,
        key: 'dependent_exemptions',
        inputQuestionFormat: { type: 'Number' },
        answers: [{ value: 0, validFrom: '2010-01-01', validUpTo: null }],
      },
      {
        isQuestionForAdminOnly: false,
        label: 'Additional Withholding',
        description: null,
        key: 'additional_withholding',
        inputQuestionFormat: { type: 'Currency' },
        answers: [{ value: '0.0', validFrom: '2010-01-01', validUpTo: null }],
      },
      {
        isQuestionForAdminOnly: false,
        label: 'Current employment county',
        description: 'County of work as of January 1.',
        key: 'current_employment_county',
        inputQuestionFormat: {
          type: 'Select',
          options: [
            { value: 'NA', label: 'Not Applicable' },
            { value: '01', label: 'Adams' },
            { value: '02', label: 'Allen' },
            { value: '49', label: 'Marion' },
          ],
        },
        answers: [],
      },
      {
        isQuestionForAdminOnly: false,
        label: 'Current residence county',
        description: 'County of residence as of January 1.',
        key: 'current_residence_county',
        inputQuestionFormat: {
          type: 'Select',
          options: [
            { value: 'NA', label: 'Not Applicable' },
            { value: '01', label: 'Adams' },
            { value: '02', label: 'Allen' },
            { value: '49', label: 'Marion' },
          ],
        },
        answers: [],
      },
      {
        isQuestionForAdminOnly: true,
        label: 'SOC code',
        description: 'Standard Occupational Classification code for this employee.',
        key: 'occupational_code',
        inputQuestionFormat: { type: 'Text' },
        answers: [],
      },
    ],
  },
]

export const multiStateEmployeeStateTaxes: EmployeeStateTaxesList[] = [
  {
    employeeUuid: 'multi-state-employee-uuid',
    state: 'CA',
    fileNewHireReport: false,
    isWorkState: true,
    questions: [
      {
        isQuestionForAdminOnly: false,
        label: 'Filing Status',
        description: null,
        key: 'filing_status',
        inputQuestionFormat: {
          type: 'Select',
          options: [
            { value: 'S', label: 'Single' },
            { value: 'M', label: 'Married one income' },
          ],
        },
        answers: [{ value: 'S', validFrom: '2010-01-01', validUpTo: null }],
      },
      {
        isQuestionForAdminOnly: false,
        label: 'Withholding Allowance',
        description: null,
        key: 'withholding_allowance',
        inputQuestionFormat: { type: 'Number' },
        answers: [{ value: 1, validFrom: '2010-01-01', validUpTo: null }],
      },
    ],
  },
  {
    employeeUuid: 'multi-state-employee-uuid',
    state: 'NY',
    fileNewHireReport: null,
    isWorkState: false,
    questions: [
      {
        isQuestionForAdminOnly: false,
        label: 'Filing Status',
        description: null,
        key: 'filing_status',
        inputQuestionFormat: {
          type: 'Select',
          options: [
            { value: 'S', label: 'Single' },
            { value: 'M', label: 'Married' },
          ],
        },
        answers: [{ value: 'M', validFrom: '2010-01-01', validUpTo: null }],
      },
      {
        isQuestionForAdminOnly: false,
        label: 'Withholding Allowance',
        description: null,
        key: 'withholding_allowance',
        inputQuestionFormat: { type: 'Number' },
        answers: [{ value: 2, validFrom: '2010-01-01', validUpTo: null }],
      },
    ],
  },
]

export const emptyStateTaxes: EmployeeStateTaxesList[] = [
  {
    employeeUuid: 'tx-employee-uuid',
    state: 'TX',
    fileNewHireReport: false,
    isWorkState: true,
    questions: [],
  },
]

export const unsetAnswersStateTaxes: EmployeeStateTaxesList[] = [
  {
    employeeUuid: 'unset-answers-employee-uuid',
    state: 'CA',
    fileNewHireReport: null,
    isWorkState: true,
    questions: [
      {
        isQuestionForAdminOnly: false,
        label: 'Filing Status',
        description: null,
        key: 'filing_status',
        inputQuestionFormat: {
          type: 'Select',
          options: [
            { value: 'S', label: 'Single' },
            { value: 'M', label: 'Married' },
          ],
        },
        answers: [],
      },
      {
        isQuestionForAdminOnly: false,
        label: 'Withholding Allowance',
        description: null,
        key: 'withholding_allowance',
        inputQuestionFormat: { type: 'Number' },
        answers: [],
      },
      {
        isQuestionForAdminOnly: false,
        label: 'Additional Withholding',
        description: null,
        key: 'additional_withholding',
        inputQuestionFormat: { type: 'Currency' },
        answers: [],
      },
      {
        isQuestionForAdminOnly: true,
        label: 'File a New Hire Report?',
        description: null,
        key: 'file_new_hire_report',
        inputQuestionFormat: {
          type: 'Select',
          options: [
            { value: true, label: 'Yes' },
            { value: false, label: 'No' },
          ],
        },
        answers: [],
      },
    ],
  },
]

export const unknownTypeStateTaxes: EmployeeStateTaxesList[] = [
  {
    employeeUuid: 'unknown-type-employee-uuid',
    state: 'CA',
    fileNewHireReport: null,
    isWorkState: true,
    questions: [
      {
        isQuestionForAdminOnly: false,
        label: 'Mystery Question',
        description: null,
        key: 'mystery_field',
        inputQuestionFormat: { type: 'Hyperloop' as const },
        answers: [{ value: 'ride', validFrom: '2010-01-01', validUpTo: null }],
      },
    ],
  },
]
