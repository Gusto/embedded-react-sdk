import CaretDown from '@/assets/caret-down.svg?react'
import { Button, Checkbox, Flex, Select, TextField } from '@/components/Common'
import { useProfile } from '@/components/Employee/Profile/Profile'
import { useTheme } from '@/contexts'
import { addressInline } from '@/helpers/formattedStrings'
import { normalizeSSN } from '@/helpers/normalizeSSN'
import { EmployeeOnboardingStatus } from '@/shared/constants'
import { CalendarDate } from '@internationalized/date'
import {
  Calendar,
  CalendarCell,
  CalendarGrid,
  DateInput,
  DatePicker,
  DateSegment,
  Dialog,
  FieldError,
  Group,
  Heading,
  Label,
  ListBoxItem,
  Popover,
  Text,
  type DateValue,
} from 'react-aria-components'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import * as v from 'valibot'

const PersonalDetailsCommonSchema = v.object({
  first_name: v.pipe(v.string(), v.nonEmpty()),
  middle_initial: v.optional(v.string()),
  last_name: v.pipe(v.string(), v.nonEmpty()),
  work_address: v.pipe(v.string(), v.nonEmpty()),
  start_date: v.pipe(
    v.instance(CalendarDate),
    v.transform(input => input.toString()),
    v.nonEmpty(),
  ),
  email: v.pipe(v.string(), v.email()),
})
export const PersonalDetailsSchema = v.variant('self_onboarding', [
  v.object({ ...PersonalDetailsCommonSchema.entries, self_onboarding: v.literal(true) }),
  v.variant('enableSsn', [
    v.object({
      ...PersonalDetailsCommonSchema.entries,
      self_onboarding: v.literal(false),
      enableSsn: v.literal(true),
      ssn: v.pipe(
        v.string(),
        v.transform(input => input.match(/\d*/g)?.join('') ?? ''),
        v.check(input => {
          return /^(?!(000|666|9))\d{3}(?!00)\d{2}(?!0000)\d{4}$/.test(input)
        }),
      ),
      date_of_birth: v.pipe(
        v.instance(CalendarDate),
        v.transform(input => input.toString()),
        v.nonEmpty(),
      ),
    }),
    v.object({
      ...PersonalDetailsCommonSchema.entries,
      self_onboarding: v.literal(false),
      enableSsn: v.literal(false),
      // ssn: v.string(),
      date_of_birth: v.pipe(
        v.instance(CalendarDate),
        v.transform(input => input.toString()),
        v.nonEmpty(),
      ),
    }),
  ]),
])

type NullableDatesMapper<Source> = {
  [Property in keyof Source]: Source[Property] extends CalendarDate
    ? Source[Property] | null
    : Source[Property]
}
export type PersonalDetailsPayload = v.InferOutput<typeof PersonalDetailsSchema>
//Typescript magic to mark date fields as nullable for correct defaultvalues
export type PersonalDetailsInputs = NullableDatesMapper<v.InferInput<typeof PersonalDetailsSchema>>

export const PersonalDetails = () => {
  const { companyLocations, employee } = useProfile()
  const { t } = useTranslation('Employee.Profile')
  const { container } = useTheme()
  const { control, watch, setValue } = useFormContext<PersonalDetailsInputs>()

  const selfOnboardingWatched = watch('self_onboarding')

  return (
    <>
      <Flex>
        <TextField
          control={control}
          name="first_name"
          isRequired
          label={t('firstName')}
          errorMessage={t('validations.firstName')}
        />
        <TextField control={control} name="middle_initial" label={t('middleInitial')} />
      </Flex>
      <TextField
        control={control}
        name="last_name"
        isRequired
        label={t('lastName')}
        errorMessage={t('validations.lastName')}
      />
      <Select
        control={control}
        name="work_address"
        items={companyLocations}
        label={t('workAddress')}
        description={t('workAddressDescription')}
        placeholder={t('workAddressPlaceholder')}
        errorMessage={t('validations.location', { ns: 'common' })}
        isRequired
        validationBehavior="aria"
      >
        {(location: (typeof companyLocations)[0]) => (
          <ListBoxItem id={location.uuid} textValue={location.uuid}>
            {addressInline(location)}
          </ListBoxItem>
        )}
      </Select>
      <Controller
        control={control}
        name="start_date"
        render={({ field, fieldState: { invalid } }) => (
          <DatePicker {...field} isInvalid={invalid} value={field.value as DateValue}>
            <Label>{t('startDateLabel')}</Label>
            <Text slot="description">{t('startDateDescription')}</Text>
            <Group>
              <DateInput>{segment => <DateSegment segment={segment} />}</DateInput>
              <Button>
                <div aria-hidden="true">
                  <CaretDown />
                </div>
              </Button>
            </Group>
            <Popover UNSTABLE_portalContainer={container.current ?? undefined}>
              <Dialog>
                <Calendar>
                  <header>
                    <Button slot="previous">◀</Button>
                    <Heading />
                    <Button slot="next">▶</Button>
                  </header>
                  <CalendarGrid>{date => <CalendarCell date={date} />}</CalendarGrid>
                </Calendar>
              </Dialog>
            </Popover>
            <FieldError>{t('validations.startDate')}</FieldError>
          </DatePicker>
        )}
      />

      <TextField
        control={control}
        name="email"
        label={t('email')}
        description={t('emailDescription')}
        errorMessage={t('validations.email')}
        isRequired
        type="email"
      />
      <Checkbox
        control={control}
        name="self_onboarding"
        isDisabled={
          employee?.onboarded ||
          employee?.onboarding_status === EmployeeOnboardingStatus.ONBOARDING_COMPLETED
        }
      >
        {t('selfOnboardingLabel')}
      </Checkbox>

      {!selfOnboardingWatched && (
        <>
          <TextField
            control={control}
            isRequired
            name="ssn"
            label={t('ssnLabel')}
            errorMessage={t('validations.ssn', { ns: 'common' })}
            inputProps={{
              placeholder: employee?.has_ssn ? t('ssnMask') : '',
              onChange: event => {
                setValue('enableSsn', true)
                setValue('ssn', normalizeSSN(event.target.value))
              },
            }}
          />
          <Controller
            control={control}
            name="date_of_birth"
            render={({ field, fieldState: { invalid } }) => (
              <DatePicker {...field} isInvalid={invalid} value={field.value as DateValue}>
                <Label>{t('dobLabel')}</Label>
                <Group>
                  <DateInput>{segment => <DateSegment segment={segment} />}</DateInput>
                  <Button>
                    <div aria-hidden="true">
                      <CaretDown />
                    </div>
                  </Button>
                </Group>
                <Popover UNSTABLE_portalContainer={container.current ?? undefined}>
                  <Dialog>
                    <Calendar>
                      <header>
                        <Button slot="previous">◀</Button>
                        <Heading />
                        <Button slot="next">▶</Button>
                      </header>
                      <CalendarGrid>{date => <CalendarCell date={date} />}</CalendarGrid>
                    </Calendar>
                  </Dialog>
                </Popover>
                <FieldError>{t('validations.dob', { ns: 'common' })}</FieldError>
              </DatePicker>
            )}
          />
        </>
      )}
    </>
  )
}
