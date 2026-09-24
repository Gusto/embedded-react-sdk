const alerts = { "contractorPaymentUpdated": "Pago actualizado para {{contractorName}}", "noContractorPayments": "Agrega al menos un pago de contratista para continuar." };
const breadcrumbLabel = "Pagar a contratistas";
const contractorTableHeaders = { "contractor": "Contratista", "reimbursement": "Reembolso", "total": "Total", "wage": "Monto fijo", "wageType": "Salario" };
const editContractor = "Editar pago de contratista";
const editContractorPayment = { "errors": { "directDepositNotAvailable": "El depósito directo no está disponible para contratistas configurados para pagos con cheque", "unsupportedPaymentMethod": "Este método de pago no es compatible. Selecciona Cheque o Depósito directo." }, "hoursAdornment": "hrs", "hoursPayDescription": "{{rate}}/hr × horas = {{total}}", "paymentMethodLabel": "Método de pago", "paymentMethods": { "check": "Cheque", "directDeposit": "Depósito directo", "historicalPayment": "Pago histórico" }, "reimbursementLabel": "Reembolso", "saveCta": "Listo", "subtitle": 'Edita las horas, ingresos adicionales y reembolsos del contratista. Las entradas que no apliquen a este contratista están deshabilitadas. Haz clic en "Listo" para aplicar el cambio.', "title": "Editar pago del contratista", "wageLabel": "Monto fijo" };
const emptyTableDescription = "No hay contratistas activos con incorporación completada. Agrega e incorpora contratistas antes de crear pagos.";
const emptyTableTitle = "No hay contratistas disponibles para pago";
const hoursAndPaymentsLabel = "Horas y pagos";
const na = "N/D";
const paymentMethods = { "check": "Cheque", "directDeposit": "Depósito directo", "historicalPayment": "Pago histórico" };
const paymentSpeedNotice_one = "Los pagos por depósito directo enviados antes de las 4 p. m., hora del Pacífico, en un día hábil tardarán {{count}} día hábil en completarse";
const paymentSpeedNotice_other = "Los pagos por depósito directo enviados antes de las 4 p. m. (hora del Pacífico) en un día hábil tardarán {{count}} días hábiles en completarse";
const perHour = "/hr";
const previewPresentation = { "alerts": { "submitPaymentsDeadline": "Para pagar a sus contratistas antes del {{checkDate}}, envíe los pagos antes del {{debitDate}}." }, "contractorTableHeaders": { "contractor": "Contratista", "reimbursement": "Reembolso", "total": "Total", "wage": "Monto fijo", "wageType": "Salario" }, "na": "N/D", "naDebitAccount": "N/D", "paymentMethods": { "check": "Cheque", "directDeposit": "Depósito directo", "historicalPayment": "Pago histórico" }, "paymentSummaryTitle": "Resumen de pagos", "perHour": "/hr", "reviewAndSubmitTitle": "Revisar y enviar", "reviewSubtitle": "Debitarémos fondos el {{debitDate}}", "submissionBlockers": { "fastAchOptions": { "contractorPayDate": "Fecha de pago del contratista: {{date}}", "description": "El pago aún se puede financiar seleccionando una de las siguientes opciones. El método de financiación seleccionado solo se usará para este pago y no se aplicará a pagos futuros.", "directDepositDescription": "Retrasar la fecha de pago del contratista cuatro días y procesar usando débitos regulares.", "directDepositLabel": "Cambiar a depósito directo de 4 días", "fundingOptionsLabel": "Opciones de financiamiento", "wireDescription": "Pague a sus contratistas a tiempo enviando una transferencia bancaria. Le daremos instrucciones en el siguiente paso.", "wireFastestBadge": "Más rápido", "wireLabel": "Transferir fondos" }, "fast_ach_threshold_exceeded": { "title": "Ha excedido el límite en el que puede procesar pagos a contratistas por {{days}}." }, "genericBlockerMessage": "Este pago no se puede enviar. Comunícate con soporte para recibir ayuda.", "genericBlockerTitle": "Envío bloqueado", "needs_earned_access_for_fast_ach": { "title": "Todavía no has obtenido acceso a pagos más rápidos para contratistas." } }, "summaryTableHeaders": { "contractorPayDate": "Fecha de pago del contratista", "debitAccount": "Cuenta de débito", "debitAmount": "Monto del débito", "debitDate": "Fecha de débito", "totalAmount": "Monto total" }, "wageTypes": { "fixed": "Fijo", "hourly": "Por hora" }, "whatYourCompanyPays": "Lo que paga su empresa" };
const successState = { "doneCta": "Listo", "message": "Se ha programado correctamente el pago de {{count}} contratista.", "message_other": "Se han programado correctamente {{count}} pagos de contratistas.", "title": "Grupo de pago creado correctamente", "wireDetailsSubmittedTitle": "Detalles de la transferencia enviados" };
const title = "Pagar a contratistas";
const wageTypes = { "fixed": "Fijo", "hourly": "Por hora" };
const wireDetailsBanner = { "confirmationDescription": "Te notificaremos una vez que hayamos recibido tu transferencia bancaria.", "description": "No podemos pagar a tus contratistas hasta que recibamos tu transferencia bancaria. Puede tomar tiempo desde tu banco al nuestro, por lo que te recomendamos enviarla tan pronto como puedas.", "startWireTransferCta": "Inicia tu transferencia bancaria", "title": "Para realizar el pago, envía una transferencia bancaria antes de {{time}} el {{date}}", "titleFallback": "Se requieren los datos de la transferencia bancaria" };
const Contractor_Payments_CreatePayment = {
  alerts,
  breadcrumbLabel,
  contractorTableHeaders,
  editContractor,
  editContractorPayment,
  emptyTableDescription,
  emptyTableTitle,
  hoursAndPaymentsLabel,
  na,
  paymentMethods,
  paymentSpeedNotice_one,
  paymentSpeedNotice_other,
  perHour,
  previewPresentation,
  successState,
  title,
  wageTypes,
  wireDetailsBanner
};
export {
  alerts,
  breadcrumbLabel,
  contractorTableHeaders,
  Contractor_Payments_CreatePayment as default,
  editContractor,
  editContractorPayment,
  emptyTableDescription,
  emptyTableTitle,
  hoursAndPaymentsLabel,
  na,
  paymentMethods,
  paymentSpeedNotice_one,
  paymentSpeedNotice_other,
  perHour,
  previewPresentation,
  successState,
  title,
  wageTypes,
  wireDetailsBanner
};
