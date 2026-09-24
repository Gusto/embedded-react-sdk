const amountLabel = "Monto total enviado";
const bankNameDescription = "El banco donde iniciaste la transferencia bancaria";
const bankNameLabel = "Banco emisor";
const bankNamePlaceholder = "Ingresa una institución financiera";
const confirmationAlert = { "content": "Una vez que recibamos los fondos de tu banco, le pagaremos a tu equipo el {{checkDate}}.", "emptyTitle": "Detalles de la transferencia enviados", "title": "Datos de la transferencia enviados para la nómina de {{payrollRange}}" };
const dateLabel = "Fecha de envío";
const description = "Ingresa los datos de la transferencia bancaria que enviaste a través de tu banco.";
const notesLabel = "Notas adicionales";
const title = "Confirma los datos de la transferencia para {{payrollRange}}";
const validations = { "amount": "Se requiere el monto total enviado", "bankName": "Se requiere el banco emisor", "date": "La fecha de envío es obligatoria" };
const Payroll_ConfirmWireDetailsForm = {
  amountLabel,
  bankNameDescription,
  bankNameLabel,
  bankNamePlaceholder,
  confirmationAlert,
  dateLabel,
  description,
  notesLabel,
  title,
  validations
};
export {
  amountLabel,
  bankNameDescription,
  bankNameLabel,
  bankNamePlaceholder,
  confirmationAlert,
  dateLabel,
  Payroll_ConfirmWireDetailsForm as default,
  description,
  notesLabel,
  title,
  validations
};
