import { FormProvider } from 'react-hook-form'
import type { OnboardingContextInterface } from '../OnboardingFlow/OnboardingFlowComponents'
import { AdminPersonalDetails } from './AdminPersonalDetails'
import { SelfPersonalDetails } from './SelfPersonalDetails'
import { Head } from './Head'
import { Actions } from './Actions'
import { HomeAddress } from './HomeAddress'
import { WorkAddress } from './WorkAddress'
import { ProfileProvider } from './useProfile'
import { useEmployeeProfileWithData } from './useEmployeeProfile'
import type { ProfileDefaultValues } from './useEmployeeProfile'
import { Grid } from '@/components/Common/Grid/Grid'
import { Form } from '@/components/Common/Form'
import {
  BaseComponent,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base'
import { useI18n } from '@/i18n'
import { useFlow } from '@/components/Flow/useFlow'
import { ensureRequired } from '@/helpers/ensureRequired'
import { useComponentDictionary } from '@/i18n/I18n'

export type { ProfileDefaultValues }

interface ProfileProps extends CommonComponentInterface<'Employee.Profile'> {
  employeeId?: string
  companyId: string
  defaultValues?: ProfileDefaultValues
  isAdmin?: boolean
  isSelfOnboardingEnabled?: boolean
}

export function Profile(props: ProfileProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

const Root = ({
  isAdmin = false,
  isSelfOnboardingEnabled = true,
  dictionary,
  ...props
}: ProfileProps) => {
  useI18n('Employee.Profile')
  useI18n('Employee.HomeAddress')
  useComponentDictionary('Employee.Profile', dictionary)

  const { children, className = '' } = props

  const { data, actions, meta, form } = useEmployeeProfileWithData({
    companyId: props.companyId,
    employeeId: props.employeeId,
    defaultValues: props.defaultValues,
    isAdmin,
    isSelfOnboardingEnabled,
  })

  return (
    <section className={className}>
      <ProfileProvider
        value={{
          companyLocations: data.companyLocations,
          workAddresses: data.workAddresses,
          employee: data.employee,
          isSelfOnboardingIntended: data.isSelfOnboardingIntended,
          handleCancel: actions.handleCancel,
          isAdmin: meta.isAdmin,
          isSelfOnboardingEnabled: meta.isSelfOnboardingEnabled,
          hasCompletedSelfOnboarding: data.hasCompletedSelfOnboarding,
          isPending: meta.isPending,
        }}
      >
        <FormProvider {...form}>
          <Form onSubmit={actions.onSubmit}>
            {children ? (
              children
            ) : (
              <>
                <Grid gridTemplateColumns="1fr" gap={24}>
                  <Head />
                  <AdminPersonalDetails />
                  <SelfPersonalDetails />
                  <HomeAddress />
                  <WorkAddress />
                </Grid>
                <Actions />
              </>
            )}
          </Form>
        </FormProvider>
      </ProfileProvider>
    </section>
  )
}

export const ProfileContextual = () => {
  const { companyId, employeeId, onEvent, isAdmin, defaultValues, isSelfOnboardingEnabled } =
    useFlow<OnboardingContextInterface>()

  return (
    <Profile
      companyId={ensureRequired(companyId)}
      employeeId={employeeId}
      onEvent={onEvent}
      isAdmin={isAdmin}
      defaultValues={defaultValues?.profile}
      isSelfOnboardingEnabled={isSelfOnboardingEnabled}
    />
  )
}
