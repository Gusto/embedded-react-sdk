const breadcrumbLabel = "Estado de pago para {{contractorName}}";
const debitedColumn = "Debitado";
const errors = { "contractorNotFound": "Contratista no encontrado", "paymentGroupNotFound": "Grupo de pagos del contratista no encontrado", "paymentNotFound": "Pago no encontrado" };
const hoursAmount = "{{hours}} horas a {{rate}}/hr";
const receipt = { "debitDate": "Fecha de débito", "detailsLabel": "Detalles del recibo", "disclaimer": "Este recibo confirma que los fondos se han transferido electrónicamente a la cuenta bancaria del destinatario. Los servicios de transmisión de dinero son proporcionados por Gusto, Inc. de conformidad con sus <licensesLink>licencias</licensesLink>.", "from": "De", "to": "A", "totalLabel": "Total" };
const reimbursement = "Reembolso";
const title = "Estado de pago para {{contractorName}}";
const wageLabel = "Salario";
const Contractor_Payments_PaymentStatement = {
  breadcrumbLabel,
  debitedColumn,
  errors,
  hoursAmount,
  receipt,
  reimbursement,
  title,
  wageLabel
};
export {
  breadcrumbLabel,
  debitedColumn,
  Contractor_Payments_PaymentStatement as default,
  errors,
  hoursAmount,
  receipt,
  reimbursement,
  title,
  wageLabel
};
