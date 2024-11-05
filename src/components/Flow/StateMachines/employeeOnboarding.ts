import { transition, reduce, state } from 'robot3'
import {
  ProfileContextual,
  DeductionsContextual,
  TaxesContextual,
  EmployeeListContextual,
  PaymentMethodContextual,
  OnboardingSummaryContextual,
  EditDeductionsContextual,
  CompensationContextual,
} from '@/components/Employee'
import { EventType, componentEvents } from '@/shared/constants'
import type { EmployeeOnboardingContextInterface } from '@/components/Flow/EmployeeOnboardingFlow'

type MachineEventType = { type: EventType; payload: Record<string, unknown> }

const cancelTransition = (target: string, component?: React.ComponentType) =>
  transition(
    componentEvents.CANCEL,
    target,
    reduce(
      (ctx: EmployeeOnboardingContextInterface): EmployeeOnboardingContextInterface => ({
        ...ctx,
        component: component ?? EmployeeListContextual,
      }),
    ),
  )

export const employeeOnboardingMachine = {
  index: state(
    transition(
      componentEvents.EMPLOYEE_CREATE,
      'employeeProfile',
      reduce(
        (ctx: EmployeeOnboardingContextInterface): EmployeeOnboardingContextInterface => ({
          ...ctx,
          employeeId: undefined,
          component: ProfileContextual,
        }),
      ),
    ),
    transition(
      componentEvents.EMPLOYEE_UPDATE,
      'employeeProfile',
      reduce(
        (
          ctx: EmployeeOnboardingContextInterface,
          ev: MachineEventType,
        ): EmployeeOnboardingContextInterface => {
          return {
            ...ctx,
            component: ProfileContextual,
            employeeId: ev.payload.employeeId as string,
          }
        },
      ),
    ),
  ),
  employeeProfile: state(
    transition(
      componentEvents.EMPLOYEE_PROFILE_DONE,
      'compensation',
      reduce(
        (
          ctx: EmployeeOnboardingContextInterface,
          ev: MachineEventType,
        ): EmployeeOnboardingContextInterface => ({
          ...ctx,
          component: CompensationContextual,
          employeeId: ev.payload.uuid as string,
        }),
      ),
    ),
    cancelTransition('index'),
  ),
  compensation: state(
    transition(
      componentEvents.EMPLOYEE_COMPENSATION_DONE,
      'employeeTaxes',
      reduce((ctx: EmployeeOnboardingContextInterface) => ({
        ...ctx,
        component: TaxesContextual,
      })),
    ),
    cancelTransition('index'),
  ),
  // employeeAddresses: state(
  //   transition(
  //     componentEvents.EMPLOYEE_HOME_ADDRESS,
  //     'employeeHomeAddress',
  //     reduce((ctx: EmployeeOnboardingContextInterface) => ({
  //       ...ctx,
  //       component: HomeAddressFormContextual,
  //     })),
  //   ),
  //   cancelTransition('index'),
  //   // errorTransition('index'),
  // ),
  // employeeHomeAddress: state(
  //   transition(
  //     componentEvents.EMPLOYEE_HOME_ADDRESS_UPDATED,
  //     'employeeFederalTaxes',
  //     reduce((ctx: EmployeeOnboardingContextInterface, ev: MachineEventType) => ({
  //       ...ctx,
  //       component: FederalTaxesContextual,
  //       employeeId: ev.payload.employee_uuid as string,
  //     })),
  //   ),
  //   cancelTransition('index'),
  //   // errorTransition('index'),
  // ),
  employeeTaxes: state(
    transition(
      componentEvents.EMPLOYEE_TAXES_DONE,
      'paymentMethod',
      reduce((ctx: EmployeeOnboardingContextInterface) => ({
        ...ctx,
        component: PaymentMethodContextual,
      })),
    ),
    cancelTransition('index'),
  ),
  paymentMethod: state(
    transition(
      componentEvents.EMPLOYEE_PAYMENT_METHOD_DONE,
      'deductions',
      reduce((ctx: EmployeeOnboardingContextInterface) => ({
        ...ctx,
        component: DeductionsContextual,
      })),
    ),
    // transition(
    //   componentEvents.EMPLOYEE_SPLIT_PAYMENT,
    //   'splitPaycheck',
    //   reduce((ctx: EmployeeOnboardingContextInterface, ev: MachineEventType) => {
    //     return {
    //       ...ctx,
    //       component: SplitPaycheckContextual,
    //       employeeId: ev.payload.employeeId as string,
    //       paymentMethod: ev.payload.paymentMethod as PaymentMethodType,
    //     };
    //   }),
    // ),
    cancelTransition('index'),
  ),
  bankAccount: state(
    transition(
      componentEvents.EMPLOYEE_BANK_ACCOUNT_CREATED,
      'paymentMethod',
      reduce((ctx: EmployeeOnboardingContextInterface) => ({
        ...ctx,
        component: PaymentMethodContextual,
      })),
    ),
    cancelTransition('paymentMethod', PaymentMethodContextual),
  ),
  splitPaycheck: state(
    transition(
      componentEvents.EMPLOYEE_PAYMENT_METHOD_UPDATED,
      'paymentMethod',
      reduce((ctx: EmployeeOnboardingContextInterface) => ({
        ...ctx,
        component: PaymentMethodContextual,
      })),
    ),
    cancelTransition('paymentMethod', PaymentMethodContextual),
  ),
  deductions: state(
    transition(
      componentEvents.EMPLOYEE_SUMMARY_VIEW,
      'summary',
      reduce((ctx: EmployeeOnboardingContextInterface) => ({
        ...ctx,
        component: OnboardingSummaryContextual,
      })),
    ),
    transition(
      componentEvents.EMPLOYEE_DEDUCTION_CREATE,
      'deductionEdit',
      reduce((ctx: EmployeeOnboardingContextInterface) => ({
        ...ctx,
        component: EditDeductionsContextual,
      })),
    ),
    cancelTransition('index'),
  ),
  deductionEdit: state(
    transition(
      componentEvents.EMPLOYEE_DEDUCTION_UPDATED,
      'deductions',
      reduce((ctx: EmployeeOnboardingContextInterface) => ({
        ...ctx,
        component: DeductionsContextual,
      })),
    ),
    cancelTransition('deductions', DeductionsContextual),
  ),

  summary: state(
    transition(
      componentEvents.EMPLOYEES_LIST,
      'index',
      reduce(
        (ctx: EmployeeOnboardingContextInterface): EmployeeOnboardingContextInterface => ({
          ...ctx,
          employeeId: undefined,
          component: EmployeeListContextual,
        }),
      ),
    ),
    transition(
      componentEvents.EMPLOYEE_CREATE,
      'addEmployee',
      reduce(
        (ctx: EmployeeOnboardingContextInterface): EmployeeOnboardingContextInterface => ({
          ...ctx,
          component: ProfileContextual,
        }),
      ),
    ),
  ),
}
