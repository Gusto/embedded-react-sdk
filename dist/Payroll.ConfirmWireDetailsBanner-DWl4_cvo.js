const banner = { "description": "No podemos pagarle a tu equipo hasta que recibamos tu transferencia bancaria. Puede tomar tiempo desde tu banco al nuestro, por lo que te recomendamos enviarla tan pronto como puedas.", "requestLabelContractorPaymentGroup": "Pago a contratista por {{requestedAmount}}", "requestLabelPayroll": "Nómina para {{payrollRange}}", "title": "Para poder procesar la nómina, envía la transferencia bancaria antes de las {{time}} del día {{date}}", "titleMultiple": "Se requieren detalles de transferencia bancaria para {{count}} nóminas o pagos", "titleWithPayroll": "Se requieren detalles de transferencia bancaria para la nómina de {{payrollRange}}" };
const breadcrumbLabel = "Confirmar detalles de la transferencia bancaria";
const cta = { "startWireTransfer": "Inicia tu transferencia bancaria" };
const modal = { "close": "Cerrar", "submitCta": "He realizado una transferencia bancaria", "title": "Instrucciones para la transferencia bancaria" };
const Payroll_ConfirmWireDetailsBanner = {
  banner,
  breadcrumbLabel,
  cta,
  modal
};
export {
  banner,
  breadcrumbLabel,
  cta,
  Payroll_ConfirmWireDetailsBanner as default,
  modal
};
