import { state, transition, reduce } from 'robot3'
import type { ComponentType } from 'react'
import type { BankAccountContextInterface, EventPayloads } from './bankAccountComponents'
import { BankAccountFormContextual, BankAccountVerifyContextual } from './bankAccountComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'

/**
 * Builds the view/add/verify machine, given the list screen to return to.
 *
 * @remarks
 * Onboarding and management differ only in that screen — onboarding's carries a Continue
 * button that advances the setup flow and management's does not — so taking it as the single
 * parameter lets both surfaces share these transitions. The list is referenced from four
 * transitions, which is why parameterizing it beats duplicating the machine.
 *
 * Same shape as `createLocationsMachine` and `createStateTaxesMachine`.
 *
 * The `CANCEL` transition on `verifyBankAccount` is deliberate and belongs to *this* machine:
 * it returns the micro-deposit form to the list. Any machine hosting this one must not declare
 * its own `CANCEL` transition, since `Flow` re-emits this upward.
 *
 * @param listContextual - The list screen this flow returns to.
 * @returns The machine states, keyed by state name.
 * @internal
 */
export function createBankAccountMachine(listContextual: ComponentType) {
  return {
    viewBankAccount: state<MachineTransition>(
      transition(
        componentEvents.COMPANY_BANK_ACCOUNT_CHANGE,
        'addBankAccount',
        reduce((ctx: BankAccountContextInterface) => ({
          ...ctx,
          component: BankAccountFormContextual as ComponentType,
          showVerifiedMessage: false,
        })),
      ),
      transition(
        componentEvents.COMPANY_BANK_ACCOUNT_VERIFY,
        'verifyBankAccount',
        reduce((ctx: BankAccountContextInterface) => ({
          ...ctx,
          component: BankAccountVerifyContextual as ComponentType,
          showVerifiedMessage: false,
        })),
      ),
    ),
    addBankAccount: state<MachineTransition>(
      transition(
        componentEvents.COMPANY_BANK_ACCOUNT_CREATED,
        'viewBankAccount',
        reduce(
          (
            ctx: BankAccountContextInterface,
            ev: MachineEventType<
              EventPayloads,
              typeof componentEvents.COMPANY_BANK_ACCOUNT_CREATED
            >,
          ) => ({
            ...ctx,
            component: listContextual,
            bankAccount: ev.payload,
          }),
        ),
      ),
      transition(
        componentEvents.COMPANY_BANK_ACCOUNT_CANCEL,
        'viewBankAccount',
        reduce((ctx: BankAccountContextInterface) => ({
          ...ctx,
          component: listContextual,
        })),
      ),
    ),
    verifyBankAccount: state<MachineTransition>(
      transition(
        componentEvents.COMPANY_BANK_ACCOUNT_VERIFIED,
        'viewBankAccount',
        reduce(
          (
            ctx: BankAccountContextInterface,
            ev: MachineEventType<
              EventPayloads,
              typeof componentEvents.COMPANY_BANK_ACCOUNT_VERIFIED
            >,
          ): BankAccountContextInterface => ({
            ...ctx,
            component: listContextual,
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
          component: listContextual,
        })),
      ),
    ),
  }
}
