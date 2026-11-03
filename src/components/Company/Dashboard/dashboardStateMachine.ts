import { transition, reduce, state } from 'robot3'
import type { DashboardTab } from './Dashboard'
import {
  DashboardViewContextual,
  IndustryContextual,
  LocationsContextual,
  FederalTaxesContextual,
  type DashboardContextInterface,
} from './DashboardComponents'
import { componentEvents } from '@/shared/constants'
import type { FlowHeaderConfig } from '@/components/Flow/useFlow'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'

type EventPayloads = {
  [componentEvents.COMPANY_DASHBOARD_TAB_CHANGE]: { tab: DashboardTab }
}

/**
 * Back affordance rendered above every spoke.
 *
 * @remarks
 * Uses a dedicated `COMPANY_DASHBOARD_BACK` event rather than the generic
 * `componentEvents.CANCEL`. The spokes are themselves `Flow`-driven components,
 * and `Flow` re-emits every event to its parent — so a `CANCEL` transition here
 * would fire whenever a user cancelled an *inner* screen (a location form, say),
 * ejecting them from the whole spoke instead of returning them to that spoke's
 * own list. Several spokes also have no cancel affordance of their own at all
 * (`Industry` and `FederalTaxes` are submit-only; `Locations` opens straight
 * into a form when the company has no addresses), so this header is the only
 * reliable way back to the dashboard.
 *
 * @internal
 */
const spokeHeader: FlowHeaderConfig = {
  type: 'minimal',
  back: {
    labelKey: 'backToDashboardCta',
    namespace: 'Company.Dashboard',
    event: componentEvents.COMPANY_DASHBOARD_BACK,
  },
}

const toSpoke = (component: DashboardContextInterface['component']) =>
  reduce((ctx: DashboardContextInterface): DashboardContextInterface => ({
    ...ctx,
    component,
    header: spokeHeader,
    successAlert: null,
  }))

const returnToIndex = reduce((ctx: DashboardContextInterface): DashboardContextInterface => ({
  ...ctx,
  component: DashboardViewContextual,
  header: null,
  successAlert: null,
}))

const returnToIndexWithAlert = (alert: DashboardContextInterface['successAlert']) =>
  reduce((ctx: DashboardContextInterface): DashboardContextInterface => ({
    ...ctx,
    component: DashboardViewContextual,
    header: null,
    successAlert: alert,
  }))

/**
 * Hub-and-spoke machine backing `CompanyManagement.DashboardFlow`.
 *
 * @remarks
 * Deliberately has no final state: the dashboard is a management surface a host
 * can keep mounted indefinitely, so there is no terminal step to model one
 * around. No state transitions on `componentEvents.CANCEL` — see
 * {@link spokeHeader} for why.
 *
 * @internal
 */
export const dashboardStateMachine = {
  index: state<MachineTransition>(
    transition(
      componentEvents.COMPANY_MANAGEMENT_INDUSTRY_EDIT_REQUESTED,
      'industry',
      toSpoke(IndustryContextual),
    ),
    transition(
      componentEvents.COMPANY_MANAGEMENT_LOCATIONS_EDIT_REQUESTED,
      'locations',
      toSpoke(LocationsContextual),
    ),
    transition(
      componentEvents.COMPANY_MANAGEMENT_FEDERAL_TAXES_EDIT_REQUESTED,
      'federalTaxes',
      toSpoke(FederalTaxesContextual),
    ),
    transition(
      componentEvents.COMPANY_DASHBOARD_ALERT_DISMISSED,
      'index',
      reduce((ctx: DashboardContextInterface): DashboardContextInterface => ({
        ...ctx,
        successAlert: null,
      })),
    ),
    transition(
      componentEvents.COMPANY_DASHBOARD_TAB_CHANGE,
      'index',
      reduce(
        (
          ctx: DashboardContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.COMPANY_DASHBOARD_TAB_CHANGE>,
        ): DashboardContextInterface => ({
          ...ctx,
          selectedTab: ev.payload.tab,
        }),
      ),
    ),
  ),
  industry: state<MachineTransition>(
    transition(
      componentEvents.COMPANY_INDUSTRY_SELECTED,
      'index',
      returnToIndexWithAlert('industryUpdated'),
    ),
    transition(componentEvents.COMPANY_DASHBOARD_BACK, 'index', returnToIndex),
  ),
  locations: state<MachineTransition>(
    // COMPANY_LOCATION_CREATED / _UPDATED are intentionally absent: they fire on
    // every save *inside* the Locations sub-flow and must not eject the user
    // from it. Only the list's own "done" signal returns to the dashboard.
    transition(componentEvents.COMPANY_LOCATION_DONE, 'index', returnToIndex),
    transition(componentEvents.COMPANY_DASHBOARD_BACK, 'index', returnToIndex),
  ),
  federalTaxes: state<MachineTransition>(
    // COMPANY_FEDERAL_TAXES_UPDATED also fires on save, immediately before
    // COMPANY_FEDERAL_TAXES_DONE; transitioning on the latter alone keeps the
    // alert tied to a single, unambiguous completion signal.
    transition(
      componentEvents.COMPANY_FEDERAL_TAXES_DONE,
      'index',
      returnToIndexWithAlert('federalTaxesUpdated'),
    ),
    transition(componentEvents.COMPANY_DASHBOARD_BACK, 'index', returnToIndex),
  ),
}
