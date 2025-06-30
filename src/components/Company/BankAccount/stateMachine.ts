import { state, transition, reduce, state as final } from 'robot3'
import type { BankAccountContextInterface, EventPayloads } from './BankAccountComponents'
import {
  BankAccountFormContextual,
  BankAccountVerifyContextual,
  BankAccountListContextual,
} from './BankAccountComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineEventType } from '@/types/Helpers'

export const bankAccountStateMachine = {
  viewBankAccount: state(
    transition(
      componentEvents.COMPANY_BANK_ACCOUNT_CHANGE,
      'addBankAccount',
      reduce((ctx: BankAccountContextInterface) => ({
        ...ctx,
        component: BankAccountFormContextual,
        showVerifiedMessage: false,
      })),
    ),
    transition(
      componentEvents.COMPANY_BANK_ACCOUNT_VERIFY,
      'verifyBankAccount',
      reduce((ctx: BankAccountContextInterface) => ({
        ...ctx,
        component: BankAccountVerifyContextual,
        showVerifiedMessage: false,
      })),
    ),
    transition(componentEvents.COMPANY_BANK_ACCOUNT_DONE, 'done'),
  ),
  addBankAccount: state(
    transition(
      componentEvents.COMPANY_BANK_ACCOUNT_CREATED,
      'viewBankAccount',
      reduce(
        (
          ctx: BankAccountContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.COMPANY_BANK_ACCOUNT_CREATED>,
        ) => ({
          ...ctx,
          component: BankAccountListContextual,
          bankAccount: ev.payload,
        }),
      ),
    ),
    transition(
      componentEvents.COMPANY_BANK_ACCOUNT_CANCEL,
      'viewBankAccount',
      reduce((ctx: BankAccountContextInterface) => ({
        ...ctx,
        component: BankAccountListContextual,
      })),
    ),
  ),
  verifyBankAccount: state(
    transition(
      componentEvents.COMPANY_BANK_ACCOUNT_VERIFIED,
      'viewBankAccount',
      reduce(
        (
          ctx: BankAccountContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.COMPANY_BANK_ACCOUNT_VERIFIED>,
        ): BankAccountContextInterface => ({
          ...ctx,
          component: BankAccountListContextual,
          bankAccount: ev.payload,
          showVerifiedMessage: ev.payload.verificationStatus === 'verified',
        }),
      ),
    ),
    transition(
      componentEvents.CANCEL,
      'viewBankAccount',
      reduce((ctx: BankAccountContextInterface) => ({
        ...ctx,
        component: BankAccountListContextual,
      })),
    ),
  ),
  done: final(),
}
