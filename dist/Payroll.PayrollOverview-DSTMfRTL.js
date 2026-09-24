const alerts = { "directDepositDeadline": "Para pagar a tus empleados con depósito directo para el {{payDate}}, deberás ejecutar la nómina antes de las {{time}} del {{date}}", "directDepositDeadlineText": "Asegúrate de enviarlo antes de la fecha límite para garantizar pagos puntuales.", "payrollNotCalculated": "La nómina no está calculada", "payrollProcessedMessage": "Se debitarán {{amount}} el {{date}}. Asegúrate de tener estos fondos disponibles.", "payrollProcessedTitle": "Nómina enviada", "payrollProcessingFailedCtaLabel": "Recalcular nómina", "payrollProcessingFailedTitle": "Hubo un error al enviar la nómina", "paystubPdfError": "Hubo un problema al generar el PDF del recibo de pago. Inténtalo de nuevo más tarde.", "wireDetailsSubmittedMessage": "Una vez que recibamos los fondos de tu banco, pagaremos a tu equipo el {{checkDate}}", "wireDetailsSubmittedTitle": "Detalles de la transferencia enviados" };
const cancelCta = "Cancelar nómina";
const cancelDialogDescription = "Cualquier cambio que hayas hecho en esta nómina se guardará.";
const cancelDialogDescriptionDeadline = "Ejecuta esta nómina para {{deadline}} para asegurarte de que tus empleados cobren a tiempo.";
const cancelDialogTitle = "¿Cancelar la nómina del {{startDate}} al {{endDate}}?";
const cancelDialogTitleDismissal = "¿Cancelar la nómina?";
const cancelledEmptyState = "Esta nómina ha sido cancelada.";
const cancellingTitle = "Cancelando la nómina...";
const compensationTypeLabels = { "exempt": "Asalariado / Exento", "nonexempt": "Por hora / No exento" };
const confirmCancelCta = " Sí, cancelar nómina";
const dataLoadingTitle = "Cargando nómina...";
const dataViews = { "companyPaysTab": "La empresa paga", "companyPaysTable": "La empresa paga por empleado", "debitedTable": "Totales debitados por empresa", "employeeTakeHomeTab": "Pago neto del empleado", "employeeTakeHomeTable": "Pago neto del empleado por empleado", "hoursWorkedTab": "Horas trabajadas", "hoursWorkedTable": "Horas trabajadas por empleado", "label": "Detalles de la nómina", "taxesTab": "Gravado y debitado", "taxesTable": "Desglose de impuestos" };
const declineCancelCta = "No, regresar";
const directDepositLabel = "Depósitos directos";
const downloadLoadingMessage = "Generando recibo de pago…";
const downloadPaystubLabel = "Descargar recibo de pago en PDF";
const garnishmentsLabel = "Embargos";
const loadingDescription = "Esto puede tomar uno o dos minutos. Puedes navegar a otra página mientras tanto.";
const loadingTitle = "Enviando nómina...";
const overviewTitle = "Revisar nómina";
const pageSubtitle = "Nómina de {{payrollType}} para <dateWrapper>{{startDate}} - {{endDate}}</dateWrapper>";
const pageSubtitleDismissal = "Nómina de {{payrollType}}";
const payrollReceiptCta = "Ver recibo de nómina";
const payrollSummaryLabel = "Tabla de resumen de nómina";
const payrollSummaryTitle = "Resumen de nómina";
const payrollSummaryTitleFourDay = "Resumen de nómina (Depósito directo de 4 días)";
const payrollSummaryTitleWire = "Resumen de nómina (Transferencia bancaria)";
const reimbursementLabel = "Reembolsos";
const skippedBadge = "Omitida";
const submissionBlockers = { "fastAchOptions": { "description": "La nómina aún se puede financiar seleccionando una de las opciones a continuación. El método de financiación seleccionado solo se usará para este ciclo y no se aplicará a futuras nóminas.", "directDepositDescription": "Retrasa la fecha de pago de tus empleados cuatro días y procesa usando débitos regulares.", "directDepositLabel": "Cambiar a depósito directo de 4 días", "employeePayDate": "Fecha de pago del empleado: {{date}}", "fundingOptionsLabel": "Opciones de financiación", "wireDescription": "Paga a tus empleados a tiempo enviando una transferencia bancaria (wire). Te daremos instrucciones en el siguiente paso.", "wireFastestBadge": "Más rápido", "wireLabel": "Transferencia bancaria (wire)" }, "fast_ach_threshold_exceeded": { "title": "Has excedido el límite en el que puedes procesar la nómina de {{days}}." }, "genericBlockerMessage": "Esta nómina no se puede enviar. Comunícate con el servicio de asistencia para obtener ayuda.", "genericBlockerTitle": "Envío bloqueado", "needs_earned_access_for_fast_ach": { "title": "Todavía no has obtenido acceso a una nómina más rápida." } };
const summaryTitle = "Resumen de nómina";
const tableHeaders = { "byYourCompany": "Por tu empresa", "byYourEmployees": "Por tus empleados", "companyBenefits": "Prestaciones de la empresa", "companyPays": "Pagos de la empresa", "companyTaxes": "Impuestos de la empresa", "compensationType": "Tipo de compensación", "debitAccount": "Cuenta de débito", "debitAmount": "Monto del débito", "debitDate": "Fecha de débito", "doubleOT": "Horas extra (2x)", "employeeBenefits": "Prestaciones del empleado", "employeePayDate": "Fecha de pago del empleado", "footerTotalsDescription": "Todos los empleados en esta nómina", "grossPay": "Pago bruto", "overtime": "Horas extra (1.5x)", "payment": "Pago", "paymentType": "Tipo de pago", "paystub": "Recibo de pago", "reimbursements": "Reembolsos", "taxesTotal": "Total", "timeOff": "Tiempo libre pagado", "totalHours": "Horas totales", "totalPayroll": "Nómina total", "wireAmount": "Monto de la transferencia", "wireTransferDeadline": "Fecha límite para transferencia bancaria" };
const taxesLabel = "Impuestos (empleados y empleadores)";
const Payroll_PayrollOverview = {
  alerts,
  cancelCta,
  cancelDialogDescription,
  cancelDialogDescriptionDeadline,
  cancelDialogTitle,
  cancelDialogTitleDismissal,
  cancelledEmptyState,
  cancellingTitle,
  compensationTypeLabels,
  confirmCancelCta,
  dataLoadingTitle,
  dataViews,
  declineCancelCta,
  directDepositLabel,
  downloadLoadingMessage,
  downloadPaystubLabel,
  garnishmentsLabel,
  loadingDescription,
  loadingTitle,
  overviewTitle,
  pageSubtitle,
  pageSubtitleDismissal,
  payrollReceiptCta,
  payrollSummaryLabel,
  payrollSummaryTitle,
  payrollSummaryTitleFourDay,
  payrollSummaryTitleWire,
  reimbursementLabel,
  skippedBadge,
  submissionBlockers,
  summaryTitle,
  tableHeaders,
  taxesLabel
};
export {
  alerts,
  cancelCta,
  cancelDialogDescription,
  cancelDialogDescriptionDeadline,
  cancelDialogTitle,
  cancelDialogTitleDismissal,
  cancelledEmptyState,
  cancellingTitle,
  compensationTypeLabels,
  confirmCancelCta,
  dataLoadingTitle,
  dataViews,
  declineCancelCta,
  Payroll_PayrollOverview as default,
  directDepositLabel,
  downloadLoadingMessage,
  downloadPaystubLabel,
  garnishmentsLabel,
  loadingDescription,
  loadingTitle,
  overviewTitle,
  pageSubtitle,
  pageSubtitleDismissal,
  payrollReceiptCta,
  payrollSummaryLabel,
  payrollSummaryTitle,
  payrollSummaryTitleFourDay,
  payrollSummaryTitleWire,
  reimbursementLabel,
  skippedBadge,
  submissionBlockers,
  summaryTitle,
  tableHeaders,
  taxesLabel
};
