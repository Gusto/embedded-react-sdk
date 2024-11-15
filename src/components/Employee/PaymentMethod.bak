// import {
//   useGetEmployeePaymentMethod,
//   useGetEmployeeBankAccounts,
//   useUpdateEmployeePaymentMethod,
//   useDeleteEmployeeBankAccount,
// } from '@gusto/embedded-api';
// import { valibotResolver } from '@hookform/resolvers/valibot';
// import { Form, Label, Radio, RadioGroup } from 'react-aria-components';
// import { Controller, useForm, type SubmitHandler } from 'react-hook-form';
// import { Trans, useTranslation } from 'react-i18next';
// import * as v from 'valibot';
// import { useBase, BaseComponent, type BaseComponentInterface } from '@/components/Base';
// import { Button, Flex, useAsyncError } from '@/components/Common';
// import { useFlow, type EmployeeOnboardingContextInterface } from '@/components/Flow';
// import { componentEvents } from '@/shared/constants';

// interface PaymentMethodProps {
//   employeeId: string;
// }

// enum SPLIT_BY {
//   percentage = 'Percentage',
//   amount = 'Amount',
// }

// enum PAYMENT_METHODS {
//   check = 'Check',
//   directDeposit = 'Direct Deposit',
// }

// const PaymentMethodSchema = v.object({
//   type: v.picklist(['Check', 'Direct Deposit']),
// });
// export type PaymentMethodInputs = v.InferInput<typeof PaymentMethodSchema>;
// export type PaymentMethodPayload = v.InferOutput<typeof PaymentMethodSchema>;

// export const PaymentMethod = (props: PaymentMethodProps & BaseComponentInterface) => {
//   const { employeeId, onEvent } = props;
//   const { setError } = useBase();
//   const { t } = useTranslation('Employee.PaymentMethod');
//   const { data: paymentMethod } = useGetEmployeePaymentMethod(employeeId);
//   const { data: bankAccounts } = useGetEmployeeBankAccounts(employeeId);
//   const { control, handleSubmit, watch } = useForm<PaymentMethodInputs>({
//     resolver: valibotResolver(PaymentMethodSchema),
//     defaultValues: { type: paymentMethod.type },
//   });
//   const throwError = useAsyncError();
//   const watchedType = watch('type');

//   const { mutate: mutatePaymentMethod, isPending: isPendingPaymentUpdate } =
//     useUpdateEmployeePaymentMethod(employeeId, {
//       onSuccess: (data: typeof paymentMethod) => {
//         onEvent(componentEvents.EMPLOYEE_PAYMENT_METHOD_UPDATED, data);
//       },
//       onError: setError,
//     });

//   const { mutate: deleteBankAccount, isPending: isPendingBankAccountDelete } =
//     useDeleteEmployeeBankAccount(employeeId, {
//       onSuccess: (data: typeof paymentMethod) => {
//         onEvent(componentEvents.EMPLOYEE_BANK_ACCOUNT_DELETED, data);
//       },
//       onError: setError,
//     });

//   const onSubmit: SubmitHandler<PaymentMethodPayload> = data => {
//     // If there's no bank account information - redirect to add bank account
//     if (bankAccounts.length < 1 && watchedType === PAYMENT_METHODS.directDeposit) {
//       handleAdd();
//       return;
//     }
//     try {
//       const body =
//         data.type === PAYMENT_METHODS.check
//           ? { version: paymentMethod.version as string }
//           : {
//               ...paymentMethod,
//               version: paymentMethod.version as string,
//               split_by: paymentMethod.split_by ?? SPLIT_BY.percentage,
//               splits: paymentMethod.splits ?? [],
//             };
//       mutatePaymentMethod({
//         body: { ...body, type: data.type },
//       });
//     } catch (err) {
//       throwError(err);
//     }
//   };

//   const handleAdd = () => {
//     onEvent(componentEvents.EMPLOYEE_BANK_ACCOUNT_CREATE, { employeeId });
//   };
//   const handleSplit = () => {
//     onEvent(componentEvents.EMPLOYEE_SPLIT_PAYMENT, { employeeId, paymentMethod });
//   };
//   return (
//     <BaseComponent {...props}>
//       <h2>{t('title')}</h2>
//       <Trans t={t} i18nKey="description" components={{ item: <p /> }} />
//       <Form onSubmit={handleSubmit(onSubmit)}>
//         <Controller
//           control={control}
//           name="type"
//           render={({ field, fieldState: { invalid } }) => (
//             <RadioGroup {...field} isInvalid={invalid}>
//               <Label>{t('paymentFieldsetLegend')}</Label>
//               <Radio value={PAYMENT_METHODS.directDeposit}>{t('directDepositLabel')}</Radio>
//               <Radio value={PAYMENT_METHODS.check}>{t('checkLabel')}</Radio>
//             </RadioGroup>
//           )}
//         />
//         {watchedType === 'Direct Deposit' && (
//           <>
//             <h2>{t('bankAccountTitle')}</h2>
//             <p>{t('bankAccountDescription')}</p>
//             <Button onPress={handleAdd}>{t('addBankAccountCTA')}</Button>
//             {bankAccounts.map(ba => (
//               <article key={ba.uuid}>
//                 <ul>
//                   <li>
//                     <h6>{ba.name}</h6>
//                     <p>{t('nameLabel')}</p>
//                   </li>
//                   <li>
//                     <h6>{ba.routing_number}</h6>
//                     <p>{t('routingNumberLabel')}</p>
//                   </li>
//                   <li>
//                     <h6>{ba.hidden_account_number}</h6>
//                     <p>{t('accountNumberLabel')}</p>
//                   </li>
//                   <li>
//                     <h6>{ba.account_type}</h6>
//                     <p>{t('accountTypeLabel')}</p>
//                   </li>
//                 </ul>
//                 <Button
//                   onPress={() => {
//                     deleteBankAccount(ba.uuid);
//                   }}
//                   isLoading={isPendingBankAccountDelete}
//                 >
//                   {t('deleteBankAccountCTA')}
//                 </Button>
//               </article>
//             ))}
//           </>
//         )}
//         {bankAccounts.length > 1 && (
//           <>
//             <h2>{t('splitTitle')}</h2>
//             <p>{t('splitDescription')}</p>
//             <Button onPress={handleSplit}>{t('splitCta')}</Button>
//           </>
//         )}
//         <Flex>
//           <Button
//             type="button"
//             variant="secondary"
//             onPress={() => {
//               onEvent(componentEvents.CANCEL);
//             }}
//           >
//             {t('cancelCta')}
//           </Button>
//           <Button type="submit" isLoading={isPendingPaymentUpdate}>
//             {t('submitCta')}
//           </Button>
//         </Flex>
//       </Form>
//     </BaseComponent>
//   );
// };

// export const PaymentMethodContextual = () => {
//   const { employeeId, onEvent } = useFlow<EmployeeOnboardingContextInterface>();
//   const { t } = useTranslation('common');

//   if (!employeeId) {
//     throw new Error(
//       t('errors.missingParamsOrContext', {
//         component: 'PaymentMethod',
//         param: 'employeeId',
//         provider: 'FlowProvider',
//       }),
//     );
//   }
//   return <PaymentMethod employeeId={employeeId} onEvent={onEvent} />;
// };
