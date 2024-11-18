// import { parseDate } from '@internationalized/date'
// import { useState } from 'react'
// import {
//   Button,
//   DateField,
//   // DateInput,
//   Form,
//   Input,
//   Label,
//   Link,
//   // eslint-disable-next-line no-restricted-imports
//   TextField,
//   type DateValue,
// } from 'react-aria-components'
// import { Trans, useTranslation } from 'react-i18next'
// import * as v from 'valibot'
// import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
// import { Select, SelectItem } from '@/components/Common'
// import { useI18n } from '@/i18n'
// import { useCreatePaySchedule, usePaySchedulePreview } from '@/api/queries/company'

// interface SetupPayrollScheduleProps {
//   companyId: string
// }

// const DateString = v.pipe(v.string(), v.regex(/^\d{4}-\d{2}-\d{2}$/))

// const PaySchedulePreview = v.object({
//   pay_periods: v.array(
//     v.object({
//       check_data: v.optional(DateString),
//       start_date: DateString,
//       end_date: DateString,
//       run_payroll_by: DateString,
//     }),
//   ),
//   holidays: v.array(DateString),
// })

// export function SetupPayrollSchedule(props: SetupPayrollScheduleProps & BaseComponentInterface) {
//   const { companyId } = props
//   useI18n('Payroll.PayrollSchedule')
//   const { t } = useTranslation('Payroll.PayrollSchedule')
//   const payFrequencies = [
//     { id: 'weekly', name: t('payFrequency.weekly') },
//     { id: 'biweekly', name: t('payFrequency.biweekly') },
//     { id: 'semimonthly', name: t('payFrequency.semimonthly') },
//     { id: 'semimonthly_custom', name: t('payFrequency.semimonthly_custom') },
//     { id: 'monthly', name: t('payFrequency.monthly') },
//   ] as const
//   type PayFrequency = (typeof payFrequencies)[number]['id']
//   const [frequency, setPayFrequency] = useState<PayFrequency>(payFrequencies[0]['id'])
//   const [day1, setDay1] = useState<number | null>(null)
//   const [day2, setDay2] = useState<number | null>(null)
//   const [anchorPayDate, setAnchorPayDate] = useState<DateValue | null>(null)
//   const [anchorEndOfPayPeriod, setAnchorEndOfPayPeriod] = useState<DateValue | null>(null)

//   const { mutate } = useCreatePaySchedule(companyId, {
//     onSuccess: () => {
//       setPayFrequency(payFrequencies[0]['id'])
//       setDay1(null)
//       setDay2(null)
//       setAnchorPayDate(null)
//       setAnchorEndOfPayPeriod(null)
//       alert('Payroll schedule created')
//     },
//     onError: (error: unknown) => {
//       if (error instanceof Error) {
//         alert(`there was an error: ${error.message}`)
//       } else {
//         alert(`there was an error: ${String(error)}`)
//       }
//     },
//   })

//   const params = getPayScheduleParams(frequency, day1, day2, anchorPayDate, anchorEndOfPayPeriod)
//   const { data: rawSchedulePreviewData } = usePaySchedulePreview(companyId, params)
//   const schedulePreviewData = v.safeParse(PaySchedulePreview, rawSchedulePreviewData)
//   const deadline = schedulePreviewData.success
//     ? parseDate(schedulePreviewData.output.pay_periods[0].run_payroll_by)
//     : null

//   return (
//     <BaseComponent {...props}>
//       <p>{JSON.stringify(deadline)}</p>
//       <h2>{t('pageTitle')}</h2>
//       <p>
//         <Trans t={t} i18nKey="helpOne">
//           Pick what frequency you&apos;d like to run payroll. If you need help, you can{' '}
//           <Link
//             href="https://gusto.com/blog/payroll/best-payroll-schedule-small-business"
//             target="_blank"
//           >
//             read more about how to choose a pay schedule
//           </Link>
//           .
//         </Trans>
//       </p>
//       <p>
//         <Trans t={t} i18nKey="helpTwo">
//           Why do we need to ask for this? We need to know when to pay your employees.{' '}
//           <Link href="https://www.dol.gov/agencies/whd/state/payday" target="_blank">
//             Some states have laws around when you must pay your employees
//           </Link>
//           . Please choose pay schedules that are legal for your employees
//         </Trans>
//       </p>
//       <p>{t('helpThree')}</p>
//       <Form>
//         <TextField name="custom_name">
//           <Label>{t('labels.name', { ns: 'common' })}</Label>
//           <Input />
//         </TextField>
//         <Select
//           label={t('payFrequency')}
//           items={payFrequencies}
//           name="frequency"
//           selectedKey={frequency}
//           onSelectionChange={(x: string) => {
//             setPayFrequency(x as PayFrequency)
//           }}
//         >
//           {(x: (typeof payFrequencies)[0]) => <SelectItem>{x.name}</SelectItem>}
//         </Select>
//         {frequency === 'semimonthly_custom' ? (
//           <>
//             <Select
//               label={t('day_1.label')}
//               name="day_1"
//               items={Array.from({ length: 17 }, (_, i) => ({ id: i + 1, name: i + 1 }))}
//               onSelectionChange={(x: string) => {
//                 setDay1(Number(x))
//               }}
//             >
//               {(x: (typeof payFrequencies)[0]) => <SelectItem>{x.name}</SelectItem>}
//             </Select>

//             <Select
//               label={t('day_1.label')}
//               name="day_1"
//               items={Array.from({ length: 18 }, (_, i) => ({ id: i + 14, name: i + 14 }))}
//               onSelectionChange={(x: string) => {
//                 setDay2(Number(x))
//               }}
//             >
//               {(x: (typeof payFrequencies)[0]) => <SelectItem>{x.name}</SelectItem>}
//             </Select>
//           </>
//         ) : null}

//         <DateField name="anchor_pay_date">
//           <Label>{t('anchor_pay_date.label')}</Label>
//           {/* <DateInput onChange={setAnchorPayDate} value={anchorPayDate}/> */}
//         </DateField>

//         <DateField name="deadline" isDisabled>
//           <Label>{t('deadline_to_run_payroll.label')}</Label>
//           {/* <DateInput isDisabled value={deadline} /> */}
//         </DateField>
//         <DateField name="anchor_end_of_pay_period">
//           <Label>{t('anchor_end_of_pay_period.label')}</Label>
//           <p>{t('anchor_end_of_pay_period.help')}</p>
//           {/* <DateInput onChange={setAnchorEndOfPayPeriod} value={anchorEndOfPayPeriod} /> */}
//         </DateField>
//         <Button
//           onPress={() => {
//             mutate(params)
//           }}
//         >
//           {t('labels.submit', { ns: 'common' })}
//         </Button>
//       </Form>
//     </BaseComponent>
//   )
// }

// function getPayScheduleParams(
//   frequency: 'weekly' | 'biweekly' | 'semimonthly' | 'semimonthly_custom' | 'monthly',
//   day1: number | null,
//   day2: number | null,
//   anchorPayDate: DateValue | null,
//   anchorEndOfPayPeriod: DateValue | null,
// ) {
//   switch (frequency) {
//     case 'weekly':
//       if (!anchorPayDate || !anchorEndOfPayPeriod) return null
//       return {
//         frequency: 'Every week',
//         anchor_pay_date: anchorPayDate.toString(),
//         anchor_end_of_pay_period: anchorEndOfPayPeriod.toString(),
//       } as const
//     case 'biweekly':
//       if (!anchorPayDate || !anchorEndOfPayPeriod) return null
//       return {
//         frequency: 'Every other week',
//         anchor_pay_date: anchorPayDate.toString(),
//         anchor_end_of_pay_period: anchorEndOfPayPeriod.toString(),
//       } as const
//     case 'semimonthly':
//       if (!anchorPayDate || !anchorEndOfPayPeriod) return null
//       return {
//         frequency: 'Twice per month',
//         day_1: 15,
//         day_2: 31,
//         anchor_pay_date: anchorPayDate.toString(),
//         anchor_end_of_pay_period: anchorEndOfPayPeriod.toString(),
//       } as const
//     case 'semimonthly_custom':
//       if (!day1 || !day2 || !anchorPayDate || !anchorEndOfPayPeriod) return null
//       return {
//         frequency: 'Twice per month',
//         day_1: day1,
//         day_2: day2,
//         anchor_pay_date: anchorPayDate.toString(),
//         anchor_end_of_pay_period: anchorEndOfPayPeriod.toString(),
//       } as const
//     case 'monthly':
//       if (!anchorPayDate || !anchorEndOfPayPeriod) return null
//       return {
//         frequency: 'Monthly',
//         day_1: 31,
//         anchor_pay_date: anchorPayDate.toString(),
//         anchor_end_of_pay_period: anchorEndOfPayPeriod.toString(),
//       } as const
//     default:
//       throw new Error('Invalid frequency')
//   }
// }
