import { fn } from 'storybook/test'
import { PayrollOverviewPresentation } from './PayrollOverviewPresentation'
import { PayrollOverviewStatus } from './PayrollOverviewTypes'

export default {
  title: 'Domain/Payroll/PayrollOverview',
}

const submissionBlockers = [
  {
    blockerType: 'fast_ach_threshold_exceeded',
    blockerName: 'Fast ACH Threshold Exceeded',
    status: 'unresolved' as const,
    unblockOptions: [
      {
        unblockType: 'wire_in',
        checkDate: '2025-09-20',
      },
      {
        unblockType: 'move_to_four_day',
        checkDate: '2025-09-24',
      },
    ],
  },
]

export const PayrollOverviewStory = () => {
  return (
    <PayrollOverviewPresentation
      onEdit={fn().mockName('edit')}
      onSubmit={fn().mockName('submit')}
      taxes={{ 'Some tax': { employee: 100, employer: 200 } }}
      isProcessed={false}
      status={PayrollOverviewStatus.Viewing}
      submissionBlockers={submissionBlockers}
      onUnblockOptionChange={fn().mockName('onUnblockOptionChange')}
      onCancel={fn().mockName('cancel')}
      onPayrollReceipt={fn().mockName('payrollReceipt')}
      onPaystubDownload={fn().mockName('paystubDownload')}
      payrollData={{
        payrollDeadline: new Date('2025-09-24T23:00:00.000Z'),
        checkDate: '2025-09-26',
        processed: false,
        processedDate: null,
        calculatedAt: new Date('2025-09-15T16:25:07.000Z'),
        uuid: '9f2013b1-caa6-4b49-8ae2-abc988615808',
        payrollUuid: '9f2013b1-caa6-4b49-8ae2-abc988615808',
        companyUuid: '624e94a3-da0a-48e1-9f9b-667f8d502ce1',
        offCycle: false,
        external: false,
        payPeriod: {
          startDate: '2025-09-12',
          endDate: '2025-09-18',
          payScheduleUuid: '3bef2adc-5ffb-4575-94d7-2e34c3e7c0ac',
        },
        totals: {
          companyDebit: '15370.81',
          netPayDebit: '10453.44',
          taxDebit: '4917.37',
          reimbursementDebit: '0.00',
          childSupportDebit: '0.00',
          reimbursements: '0.00',
          netPay: '10453.44',
          grossPay: '13754.60',
          employeeBonuses: '0.00',
          employeeCommissions: '0.00',
          employeeCashTips: '0.00',
          employeePaycheckTips: '0.00',
          additionalEarnings: '0.00',
          ownersDraw: '0.00',
          checkAmount: '0.00',
          employerTaxes: '1616.21',
          employeeTaxes: '3301.16',
          benefits: '0.00',
          employeeBenefitsDeductions: '0.00',
          imputedPay: '0.00',
          deferredPayrollTaxes: '0.00',
          otherDeductions: '0.00',
        },
        companyTaxes: [],
        createdAt: new Date('2025-09-15T16:19:04.000Z'),
        submissionBlockers: [
          {
            blockerType: 'fast_ach_threshold_exceeded',
            blockerName: 'Fast ACH Threshold Exceeded',
            status: 'unresolved',
            unblockOptions: [
              {
                unblockType: 'wire_in',
                checkDate: '2025-09-20',
              },
              {
                unblockType: 'move_to_four_day',
                checkDate: '2025-09-24',
              },
            ],
          },
        ],
        processingRequest: {
          status: 'calculate_success',
          errors: [],
        },
        partnerOwnedDisbursement: false,
        employeeCompensations: [
          {
            employeeUuid: '7aef801c-19e3-469c-a8b3-ce3437f9b88f',
            firstName: 'Isaiah',
            lastName: 'Berlin',
            excluded: false,
            version: '0a62b7aaaf503f4f48936b424852035f',
            grossPay: '440',
            netPay: '384',
            checkAmount: '384',
            paymentMethod: 'Direct Deposit',
            memo: null,
            fixedCompensations: [],
            hourlyCompensations: [
              {
                name: 'Regular Hours',
                hours: '20.000',
                amount: '440.0',
                jobUuid: '3834f43e-3905-4690-869b-5e9b4dd4b613',
                compensationMultiplier: 1,
                flsaStatus: 'Nonexempt',
              },
            ],
            paidTimeOff: [
              {
                name: 'Vacation Hours',
                hours: '0.0',
              },
              {
                name: 'Sick Hours',
                hours: '0.0',
              },
              {
                name: 'Holiday Hours',
                hours: '0.0',
              },
            ],
            taxes: [
              {
                name: 'Federal Income Tax',
                employer: false,
                amount: '15.15',
              },
              {
                name: 'Social Security',
                employer: false,
                amount: '27.28',
              },
              {
                name: 'Social Security',
                employer: true,
                amount: '27.28',
              },
              {
                name: 'Medicare',
                employer: false,
                amount: '6.38',
              },
              {
                name: 'Medicare',
                employer: true,
                amount: '6.38',
              },
              {
                name: 'CA State Income Tax',
                employer: false,
                amount: '1.91',
              },
              {
                name: 'FUTA',
                employer: true,
                amount: '2.64',
              },
              {
                name: 'CA SUI',
                employer: true,
                amount: '14.96',
              },
              {
                name: 'CA SDI',
                employer: false,
                amount: '5.28',
              },
              {
                name: 'CA ETT',
                employer: true,
                amount: '0.44',
              },
            ],
            benefits: [],
            deductions: [],
          },
          {
            employeeUuid: 'd73de8ef-a54c-4979-a4d6-f1c64a13963b',
            firstName: 'Patricia',
            lastName: 'Churchland',
            excluded: false,
            version: '476eac712965314180b03aac258fc9ad',
            grossPay: '1500',
            netPay: '1132.26',
            checkAmount: '1132.26',
            paymentMethod: 'Direct Deposit',
            memo: null,
            fixedCompensations: [],
            hourlyCompensations: [
              {
                name: 'Regular Hours',
                hours: '20.000',
                amount: '1500.0',
                jobUuid: 'd1d6b37c-1335-403f-8287-ede733891605',
                compensationMultiplier: 1,
                flsaStatus: 'Exempt',
              },
            ],
            paidTimeOff: [
              {
                name: 'Vacation Hours',
                hours: '0.0',
              },
              {
                name: 'Sick Hours',
                hours: '0.0',
              },
              {
                name: 'Holiday Hours',
                hours: '0.0',
              },
            ],
            taxes: [
              {
                name: 'Federal Income Tax',
                employer: false,
                amount: '168.73',
              },
              {
                name: 'Social Security',
                employer: false,
                amount: '93',
              },
              {
                name: 'Social Security',
                employer: true,
                amount: '93',
              },
              {
                name: 'Medicare',
                employer: false,
                amount: '21.75',
              },
              {
                name: 'Medicare',
                employer: true,
                amount: '21.75',
              },
              {
                name: 'CA State Income Tax',
                employer: false,
                amount: '66.26',
              },
              {
                name: 'FUTA',
                employer: true,
                amount: '9',
              },
              {
                name: 'CA SUI',
                employer: true,
                amount: '51',
              },
              {
                name: 'CA SDI',
                employer: false,
                amount: '18',
              },
              {
                name: 'CA ETT',
                employer: true,
                amount: '1.5',
              },
            ],
            benefits: [],
            deductions: [],
          },
          {
            employeeUuid: '07684391-0dc7-433d-bd3c-7bbbff69df16',
            firstName: 'Soren',
            lastName: 'Kierkegaard',
            excluded: false,
            version: '6d46c042cbb2e7cfc2cb9ba97d22ca23',
            grossPay: '1346.15',
            netPay: '1039.93',
            checkAmount: '1039.93',
            paymentMethod: 'Direct Deposit',
            memo: null,
            fixedCompensations: [],
            hourlyCompensations: [
              {
                name: 'Regular Hours',
                hours: '20.000',
                amount: '1346.15',
                jobUuid: 'b9cea817-e56c-459d-b29a-047be8280e29',
                compensationMultiplier: 1,
                flsaStatus: 'Exempt',
              },
            ],
            paidTimeOff: [
              {
                name: 'Vacation Hours',
                hours: '0.0',
              },
              {
                name: 'Sick Hours',
                hours: '0.0',
              },
              {
                name: 'Holiday Hours',
                hours: '0.0',
              },
            ],
            taxes: [
              {
                name: 'Federal Income Tax',
                employer: false,
                amount: '134.88',
              },
              {
                name: 'Social Security',
                employer: false,
                amount: '83.46',
              },
              {
                name: 'Social Security',
                employer: true,
                amount: '83.46',
              },
              {
                name: 'Medicare',
                employer: false,
                amount: '19.52',
              },
              {
                name: 'Medicare',
                employer: true,
                amount: '19.52',
              },
              {
                name: 'CA State Income Tax',
                employer: false,
                amount: '52.21',
              },
              {
                name: 'FUTA',
                employer: true,
                amount: '8.08',
              },
              {
                name: 'CA SUI',
                employer: true,
                amount: '45.77',
              },
              {
                name: 'CA SDI',
                employer: false,
                amount: '16.15',
              },
              {
                name: 'CA ETT',
                employer: true,
                amount: '1.35',
              },
            ],
            benefits: [],
            deductions: [],
          },
          {
            employeeUuid: '3b7c6f7c-fdde-443b-9aee-f65757da44f0',
            firstName: 'Hannah',
            lastName: 'Arendt',
            excluded: false,
            version: '54bd6765073252071fe6f31c88b39245',
            grossPay: '1173.08',
            netPay: '930.54',
            checkAmount: '930.54',
            paymentMethod: 'Direct Deposit',
            memo: null,
            fixedCompensations: [],
            hourlyCompensations: [
              {
                name: 'Regular Hours',
                hours: '20.000',
                amount: '1173.08',
                jobUuid: '8cbba341-43a0-42dd-a1e2-5e9c448bcb5f',
                compensationMultiplier: 1,
                flsaStatus: 'Exempt',
              },
            ],
            paidTimeOff: [
              {
                name: 'Vacation Hours',
                hours: '0.0',
              },
              {
                name: 'Sick Hours',
                hours: '0.0',
              },
              {
                name: 'Holiday Hours',
                hours: '0.0',
              },
            ],
            taxes: [
              {
                name: 'Federal Income Tax',
                employer: false,
                amount: '101.57',
              },
              {
                name: 'Social Security',
                employer: false,
                amount: '72.73',
              },
              {
                name: 'Social Security',
                employer: true,
                amount: '72.73',
              },
              {
                name: 'Medicare',
                employer: false,
                amount: '17.01',
              },
              {
                name: 'Medicare',
                employer: true,
                amount: '17.01',
              },
              {
                name: 'CA State Income Tax',
                employer: false,
                amount: '37.15',
              },
              {
                name: 'FUTA',
                employer: true,
                amount: '7.04',
              },
              {
                name: 'CA SUI',
                employer: true,
                amount: '39.88',
              },
              {
                name: 'CA SDI',
                employer: false,
                amount: '14.08',
              },
              {
                name: 'CA ETT',
                employer: true,
                amount: '1.17',
              },
            ],
            benefits: [],
            deductions: [],
          },
          {
            employeeUuid: '1563def5-6a6a-463e-b1c2-be746926662e',
            firstName: 'Taylor',
            lastName: 'Swift',
            excluded: false,
            version: '1e9a1215f64c5d619da47d5e22ba5e68',
            grossPay: '2115.38',
            netPay: '1494.84',
            checkAmount: '1494.84',
            paymentMethod: 'Direct Deposit',
            memo: null,
            fixedCompensations: [],
            hourlyCompensations: [
              {
                name: 'Regular Hours',
                hours: '20.000',
                amount: '2115.38',
                jobUuid: '77ef4fe3-242c-4b70-8ff9-5e16ff2ac727',
                compensationMultiplier: 1,
                flsaStatus: 'Exempt',
              },
            ],
            paidTimeOff: [
              {
                name: 'Vacation Hours',
                hours: '0.0',
              },
              {
                name: 'Sick Hours',
                hours: '0.0',
              },
              {
                name: 'Holiday Hours',
                hours: '0.0',
              },
            ],
            taxes: [
              {
                name: 'Federal Income Tax',
                employer: false,
                amount: '304.11',
              },
              {
                name: 'Social Security',
                employer: false,
                amount: '131.16',
              },
              {
                name: 'Social Security',
                employer: true,
                amount: '131.16',
              },
              {
                name: 'Medicare',
                employer: false,
                amount: '30.68',
              },
              {
                name: 'Medicare',
                employer: true,
                amount: '30.68',
              },
              {
                name: 'CA State Income Tax',
                employer: false,
                amount: '129.21',
              },
              {
                name: 'FUTA',
                employer: true,
                amount: '12.69',
              },
              {
                name: 'CA SUI',
                employer: true,
                amount: '71.92',
              },
              {
                name: 'CA SDI',
                employer: false,
                amount: '25.38',
              },
              {
                name: 'CA ETT',
                employer: true,
                amount: '2.12',
              },
            ],
            benefits: [],
            deductions: [],
          },
          {
            employeeUuid: '0a5a4dc1-e1c1-4825-9cf2-8717397c5977',
            firstName: 'Regina',
            lastName: 'Spektor',
            excluded: false,
            version: '92a1c9d8f72c3cbff9bdeab2f1e883e7',
            grossPay: '2115.38',
            netPay: '1494.84',
            checkAmount: '1494.84',
            paymentMethod: 'Direct Deposit',
            memo: null,
            fixedCompensations: [],
            hourlyCompensations: [
              {
                name: 'Regular Hours',
                hours: '20.000',
                amount: '2115.38',
                jobUuid: '9bf4f52b-0592-40bc-8ab5-c0616979c54d',
                compensationMultiplier: 1,
                flsaStatus: 'Exempt',
              },
            ],
            paidTimeOff: [
              {
                name: 'Vacation Hours',
                hours: '0.0',
              },
              {
                name: 'Sick Hours',
                hours: '0.0',
              },
              {
                name: 'Holiday Hours',
                hours: '0.0',
              },
            ],
            taxes: [
              {
                name: 'Federal Income Tax',
                employer: false,
                amount: '304.11',
              },
              {
                name: 'Social Security',
                employer: false,
                amount: '131.16',
              },
              {
                name: 'Social Security',
                employer: true,
                amount: '131.16',
              },
              {
                name: 'Medicare',
                employer: false,
                amount: '30.68',
              },
              {
                name: 'Medicare',
                employer: true,
                amount: '30.68',
              },
              {
                name: 'CA State Income Tax',
                employer: false,
                amount: '129.21',
              },
              {
                name: 'FUTA',
                employer: true,
                amount: '12.69',
              },
              {
                name: 'CA SUI',
                employer: true,
                amount: '71.92',
              },
              {
                name: 'CA SDI',
                employer: false,
                amount: '25.38',
              },
              {
                name: 'CA ETT',
                employer: true,
                amount: '2.12',
              },
            ],
            benefits: [],
            deductions: [],
          },
          {
            employeeUuid: '07192709-2dee-4db8-9f99-b5ea5abdd82c',
            firstName: 'Immanuel',
            lastName: 'Kant',
            excluded: false,
            version: '3e6e9feab3f8402faab4a078e2faa97c',
            grossPay: '440',
            netPay: '384',
            checkAmount: '384',
            paymentMethod: 'Direct Deposit',
            memo: null,
            fixedCompensations: [],
            hourlyCompensations: [
              {
                name: 'Regular Hours',
                hours: '20.000',
                amount: '440.0',
                jobUuid: '41bcabdb-42d0-411c-bee0-24b547a4ad08',
                compensationMultiplier: 1,
                flsaStatus: 'Nonexempt',
              },
            ],
            paidTimeOff: [
              {
                name: 'Vacation Hours',
                hours: '0.0',
              },
              {
                name: 'Sick Hours',
                hours: '0.0',
              },
              {
                name: 'Holiday Hours',
                hours: '0.0',
              },
            ],
            taxes: [
              {
                name: 'Federal Income Tax',
                employer: false,
                amount: '15.15',
              },
              {
                name: 'Social Security',
                employer: false,
                amount: '27.28',
              },
              {
                name: 'Social Security',
                employer: true,
                amount: '27.28',
              },
              {
                name: 'Medicare',
                employer: false,
                amount: '6.38',
              },
              {
                name: 'Medicare',
                employer: true,
                amount: '6.38',
              },
              {
                name: 'CA State Income Tax',
                employer: false,
                amount: '1.91',
              },
              {
                name: 'FUTA',
                employer: true,
                amount: '2.64',
              },
              {
                name: 'CA SUI',
                employer: true,
                amount: '14.96',
              },
              {
                name: 'CA SDI',
                employer: false,
                amount: '5.28',
              },
              {
                name: 'CA ETT',
                employer: true,
                amount: '0.44',
              },
            ],
            benefits: [],
            deductions: [],
          },
          {
            employeeUuid: '9bb707ae-a296-4071-b933-013cd6162bb7',
            firstName: 'Friedrich',
            lastName: 'Nietzsche',
            excluded: false,
            version: '07c4f87425270ae54ff901e1df6accea',
            grossPay: '1538.46',
            netPay: '1154.92',
            checkAmount: '1154.92',
            paymentMethod: 'Direct Deposit',
            memo: null,
            fixedCompensations: [],
            hourlyCompensations: [
              {
                name: 'Regular Hours',
                hours: '20.000',
                amount: '1538.46',
                jobUuid: 'd296ce91-6b8c-42eb-a456-19f8d90caf68',
                compensationMultiplier: 1,
                flsaStatus: 'Exempt',
              },
            ],
            paidTimeOff: [
              {
                name: 'Vacation Hours',
                hours: '0.0',
              },
              {
                name: 'Sick Hours',
                hours: '0.0',
              },
              {
                name: 'Holiday Hours',
                hours: '0.0',
              },
            ],
            taxes: [
              {
                name: 'Federal Income Tax',
                employer: false,
                amount: '177.19',
              },
              {
                name: 'Social Security',
                employer: false,
                amount: '95.39',
              },
              {
                name: 'Social Security',
                employer: true,
                amount: '95.39',
              },
              {
                name: 'Medicare',
                employer: false,
                amount: '22.31',
              },
              {
                name: 'Medicare',
                employer: true,
                amount: '22.31',
              },
              {
                name: 'CA State Income Tax',
                employer: false,
                amount: '70.19',
              },
              {
                name: 'FUTA',
                employer: true,
                amount: '9.23',
              },
              {
                name: 'CA SUI',
                employer: true,
                amount: '52.31',
              },
              {
                name: 'CA SDI',
                employer: false,
                amount: '18.46',
              },
              {
                name: 'CA ETT',
                employer: true,
                amount: '1.54',
              },
            ],
            benefits: [],
            deductions: [],
          },
          {
            employeeUuid: '89540375-9ac7-4dc7-9c05-0e8cf14c1633',
            firstName: 'Arthur',
            lastName: 'Schopenhauer',
            excluded: false,
            version: '94ff40d02a05c159ea4710df95d513e2',
            grossPay: '846.15',
            netPay: '692.6',
            checkAmount: '692.6',
            paymentMethod: 'Direct Deposit',
            memo: null,
            fixedCompensations: [],
            hourlyCompensations: [
              {
                name: 'Regular Hours',
                hours: '20.000',
                amount: '846.15',
                jobUuid: '3716981a-fd79-44bb-b3af-04abf2b4a88c',
                compensationMultiplier: 1,
                flsaStatus: 'Nonexempt',
              },
            ],
            paidTimeOff: [
              {
                name: 'Vacation Hours',
                hours: '0.0',
              },
              {
                name: 'Sick Hours',
                hours: '0.0',
              },
              {
                name: 'Holiday Hours',
                hours: '0.0',
              },
            ],
            taxes: [
              {
                name: 'Federal Income Tax',
                employer: false,
                amount: '62.34',
              },
              {
                name: 'Social Security',
                employer: false,
                amount: '52.46',
              },
              {
                name: 'Social Security',
                employer: true,
                amount: '52.46',
              },
              {
                name: 'Medicare',
                employer: false,
                amount: '12.27',
              },
              {
                name: 'Medicare',
                employer: true,
                amount: '12.27',
              },
              {
                name: 'CA State Income Tax',
                employer: false,
                amount: '16.33',
              },
              {
                name: 'FUTA',
                employer: true,
                amount: '5.08',
              },
              {
                name: 'CA SUI',
                employer: true,
                amount: '28.77',
              },
              {
                name: 'CA SDI',
                employer: false,
                amount: '10.15',
              },
              {
                name: 'CA ETT',
                employer: true,
                amount: '0.85',
              },
            ],
            benefits: [],
            deductions: [],
          },
          {
            employeeUuid: '8e9c8d3d-ce5c-4822-bd27-f197719c1009',
            firstName: 'Alexander',
            lastName: 'Hamilton',
            excluded: false,
            version: '52941bd9a9ad2614c9a6ca303728fd54',
            grossPay: '1500',
            netPay: '1132.26',
            checkAmount: '1132.26',
            paymentMethod: 'Direct Deposit',
            memo: null,
            fixedCompensations: [],
            hourlyCompensations: [
              {
                name: 'Regular Hours',
                hours: '20.000',
                amount: '1500.0',
                jobUuid: '589bfc17-cbfe-4ad2-84b4-425f5ffe548f',
                compensationMultiplier: 1,
                flsaStatus: 'Exempt',
              },
            ],
            paidTimeOff: [
              {
                name: 'Vacation Hours',
                hours: '0.0',
              },
              {
                name: 'Sick Hours',
                hours: '0.0',
              },
              {
                name: 'Holiday Hours',
                hours: '0.0',
              },
            ],
            taxes: [
              {
                name: 'Federal Income Tax',
                employer: false,
                amount: '168.73',
              },
              {
                name: 'Social Security',
                employer: false,
                amount: '93',
              },
              {
                name: 'Social Security',
                employer: true,
                amount: '93',
              },
              {
                name: 'Medicare',
                employer: false,
                amount: '21.75',
              },
              {
                name: 'Medicare',
                employer: true,
                amount: '21.75',
              },
              {
                name: 'CA State Income Tax',
                employer: false,
                amount: '66.26',
              },
              {
                name: 'FUTA',
                employer: true,
                amount: '9',
              },
              {
                name: 'CA SUI',
                employer: true,
                amount: '51',
              },
              {
                name: 'CA SDI',
                employer: false,
                amount: '18',
              },
              {
                name: 'CA ETT',
                employer: true,
                amount: '1.5',
              },
            ],
            benefits: [],
            deductions: [],
          },
          {
            employeeUuid: '2849b9e2-83c2-46b1-9c10-a127da02d117',
            firstName: 'Carlton',
            lastName: 'Emmerich',
            excluded: false,
            version: '2baa71ffc54c15077bbda66faa50e3e9',
            grossPay: '740',
            netPay: '613.25',
            checkAmount: '613.25',
            paymentMethod: 'Direct Deposit',
            memo: null,
            fixedCompensations: [],
            hourlyCompensations: [
              {
                name: 'Regular Hours',
                hours: '20.000',
                amount: '740.0',
                jobUuid: '4bbc8b1e-4c98-4be5-9a99-32c4ad6b0e7c',
                compensationMultiplier: 1,
                flsaStatus: 'Nonexempt',
              },
            ],
            paidTimeOff: [
              {
                name: 'Vacation Hours',
                hours: '0.0',
              },
              {
                name: 'Sick Hours',
                hours: '0.0',
              },
              {
                name: 'Holiday Hours',
                hours: '0.0',
              },
            ],
            taxes: [
              {
                name: 'Federal Income Tax',
                employer: false,
                amount: '49.6',
              },
              {
                name: 'Social Security',
                employer: false,
                amount: '45.88',
              },
              {
                name: 'Social Security',
                employer: true,
                amount: '45.88',
              },
              {
                name: 'Medicare',
                employer: false,
                amount: '10.73',
              },
              {
                name: 'Medicare',
                employer: true,
                amount: '10.73',
              },
              {
                name: 'CA State Income Tax',
                employer: false,
                amount: '11.66',
              },
              {
                name: 'FUTA',
                employer: true,
                amount: '4.44',
              },
              {
                name: 'CA SUI',
                employer: true,
                amount: '25.16',
              },
              {
                name: 'CA SDI',
                employer: false,
                amount: '8.88',
              },
              {
                name: 'CA ETT',
                employer: true,
                amount: '0.74',
              },
            ],
            benefits: [],
            deductions: [],
          },
        ],
      }}
    />
  )
}

export const PayrollOverviewWithWireFunds = () => {
  return (
    <PayrollOverviewPresentation
      onEdit={fn().mockName('edit')}
      onSubmit={fn().mockName('submit')}
      taxes={{ 'Some tax': { employee: 100, employer: 200 } }}
      isProcessed={false}
      status={PayrollOverviewStatus.Viewing}
      submissionBlockers={submissionBlockers}
      selectedUnblockOptions={{ fast_ach_threshold_exceeded: 'wire_in' }}
      onUnblockOptionChange={fn().mockName('onUnblockOptionChange')}
      onCancel={fn().mockName('cancel')}
      onPayrollReceipt={fn().mockName('payrollReceipt')}
      onPaystubDownload={fn().mockName('paystubDownload')}
      payrollData={{
        payrollDeadline: new Date('2025-09-24T23:00:00.000Z'),
        checkDate: '2025-09-26',
        processed: false,
        processedDate: null,
        calculatedAt: new Date('2025-09-15T16:25:07.000Z'),
        uuid: '9f2013b1-caa6-4b49-8ae2-abc988615808',
        payrollUuid: '9f2013b1-caa6-4b49-8ae2-abc988615808',
        companyUuid: '624e94a3-da0a-48e1-9f9b-667f8d502ce1',
        offCycle: false,
        external: false,
        payPeriod: {
          startDate: '2025-09-12',
          endDate: '2025-09-18',
          payScheduleUuid: '3bef2adc-5ffb-4575-94d7-2e34c3e7c0ac',
        },
        totals: {
          companyDebit: '8804.53',
          netPayDebit: '10453.44',
          taxDebit: '4917.37',
          reimbursementDebit: '0.00',
          childSupportDebit: '0.00',
          reimbursements: '0.00',
          netPay: '10453.44',
          grossPay: '13754.60',
          employeeBonuses: '0.00',
          employeeCommissions: '0.00',
          employeeCashTips: '0.00',
          employeePaycheckTips: '0.00',
          additionalEarnings: '0.00',
          ownersDraw: '0.00',
          checkAmount: '0.00',
          employerTaxes: '1616.21',
          employeeTaxes: '3301.16',
          benefits: '0.00',
          employeeBenefitsDeductions: '0.00',
          imputedPay: '0.00',
          deferredPayrollTaxes: '0.00',
          otherDeductions: '0.00',
        },
        companyTaxes: [],
        employeeCompensations: [],
      }}
    />
  )
}

export const PayrollOverviewWith4DayDirectDeposit = () => {
  return (
    <PayrollOverviewPresentation
      onEdit={fn().mockName('edit')}
      onSubmit={fn().mockName('submit')}
      taxes={{ 'Some tax': { employee: 100, employer: 200 } }}
      isProcessed={false}
      status={PayrollOverviewStatus.Viewing}
      submissionBlockers={submissionBlockers}
      selectedUnblockOptions={{ fast_ach_threshold_exceeded: 'move_to_four_day' }}
      onUnblockOptionChange={fn().mockName('onUnblockOptionChange')}
      onCancel={fn().mockName('cancel')}
      onPayrollReceipt={fn().mockName('payrollReceipt')}
      onPaystubDownload={fn().mockName('paystubDownload')}
      payrollData={{
        payrollDeadline: new Date('2025-09-24T23:00:00.000Z'),
        checkDate: '2025-09-26',
        processed: false,
        processedDate: null,
        calculatedAt: new Date('2025-09-15T16:25:07.000Z'),
        uuid: '9f2013b1-caa6-4b49-8ae2-abc988615808',
        payrollUuid: '9f2013b1-caa6-4b49-8ae2-abc988615808',
        companyUuid: '624e94a3-da0a-48e1-9f9b-667f8d502ce1',
        offCycle: false,
        external: false,
        payPeriod: {
          startDate: '2025-09-12',
          endDate: '2025-09-18',
          payScheduleUuid: '3bef2adc-5ffb-4575-94d7-2e34c3e7c0ac',
        },
        totals: {
          companyDebit: '8804.53',
          netPayDebit: '10453.44',
          taxDebit: '4917.37',
          reimbursementDebit: '0.00',
          childSupportDebit: '0.00',
          reimbursements: '0.00',
          netPay: '10453.44',
          grossPay: '13754.60',
          employeeBonuses: '0.00',
          employeeCommissions: '0.00',
          employeeCashTips: '0.00',
          employeePaycheckTips: '0.00',
          additionalEarnings: '0.00',
          ownersDraw: '0.00',
          checkAmount: '0.00',
          employerTaxes: '1616.21',
          employeeTaxes: '3301.16',
          benefits: '0.00',
          employeeBenefitsDeductions: '0.00',
          imputedPay: '0.00',
          deferredPayrollTaxes: '0.00',
          otherDeductions: '0.00',
        },
        companyTaxes: [],
        employeeCompensations: [],
      }}
      bankAccount={{
        uuid: 'bank-uuid',
        name: 'Business Checking',
        hiddenAccountNumber: 'XXXX7235',
        routingNumber: '121000248',
        accountType: 'Checking',
      }}
    />
  )
}

export const WithSkippedEmployee = () => {
  return (
    <PayrollOverviewPresentation
      onEdit={fn().mockName('edit')}
      onSubmit={fn().mockName('submit')}
      taxes={{ 'Federal Income Tax': { employee: 100, employer: 200 } }}
      isProcessed={false}
      status={PayrollOverviewStatus.Viewing}
      onCancel={fn().mockName('cancel')}
      onPayrollReceipt={fn().mockName('payrollReceipt')}
      onPaystubDownload={fn().mockName('paystubDownload')}
      payrollData={{
        payrollDeadline: new Date('2025-09-24T23:00:00.000Z'),
        checkDate: '2025-09-26',
        processed: false,
        processedDate: null,
        calculatedAt: new Date('2025-09-15T16:25:07.000Z'),
        uuid: 'payroll-uuid',
        payrollUuid: 'payroll-uuid',
        companyUuid: 'company-uuid',
        offCycle: false,
        external: false,
        payPeriod: {
          startDate: '2025-09-12',
          endDate: '2025-09-18',
          payScheduleUuid: 'schedule-uuid',
        },
        totals: {
          companyDebit: '5000.00',
          netPayDebit: '4000.00',
          taxDebit: '1000.00',
          reimbursementDebit: '0.00',
          childSupportDebit: '0.00',
          reimbursements: '0.00',
          netPay: '4000.00',
          grossPay: '5000.00',
          employeeBonuses: '0.00',
          employeeCommissions: '0.00',
          employeeCashTips: '0.00',
          employeePaycheckTips: '0.00',
          additionalEarnings: '0.00',
          ownersDraw: '0.00',
          checkAmount: '0.00',
          employerTaxes: '500.00',
          employeeTaxes: '500.00',
          benefits: '0.00',
          employeeBenefitsDeductions: '0.00',
          imputedPay: '0.00',
          deferredPayrollTaxes: '0.00',
          otherDeductions: '0.00',
        },
        companyTaxes: [],
        createdAt: new Date('2025-09-15T16:19:04.000Z'),
        submissionBlockers: [],
        processingRequest: { status: 'calculate_success', errors: [] },
        partnerOwnedDisbursement: false,
        employeeCompensations: [
          {
            employeeUuid: 'emp-active',
            firstName: 'Isaiah',
            lastName: 'Berlin',
            excluded: false,
            version: 'v1',
            grossPay: '5000',
            netPay: '4000',
            checkAmount: '4000',
            paymentMethod: 'Direct Deposit',
            memo: null,
            fixedCompensations: [],
            hourlyCompensations: [
              {
                name: 'Regular Hours',
                hours: '40.000',
                amount: '5000.0',
                jobUuid: 'job-1',
                compensationMultiplier: 1,
                flsaStatus: 'Nonexempt',
              },
            ],
            paidTimeOff: [],
            taxes: [
              { name: 'Federal Income Tax', employer: false, amount: '100' },
              { name: 'Federal Income Tax', employer: true, amount: '200' },
            ],
            benefits: [],
            deductions: [],
          },
          {
            employeeUuid: 'emp-skipped',
            firstName: 'Hannah',
            lastName: 'Arendt',
            excluded: true,
            version: 'v1',
            grossPay: '0',
            netPay: '0',
            checkAmount: '0',
            paymentMethod: 'Direct Deposit',
            memo: null,
            fixedCompensations: [],
            hourlyCompensations: [
              {
                name: 'Regular Hours',
                hours: '0.000',
                amount: '0.0',
                jobUuid: 'job-2',
                compensationMultiplier: 1,
                flsaStatus: 'Nonexempt',
              },
            ],
            paidTimeOff: [],
            taxes: [],
            benefits: [],
            deductions: [],
          },
        ],
      }}
    />
  )
}
