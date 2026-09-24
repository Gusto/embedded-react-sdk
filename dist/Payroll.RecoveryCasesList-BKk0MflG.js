const columns = { "amountOutstanding": "Monto pendiente", "latestErrorCode": "Último código de error", "originalDebitDate": "Fecha original del débito", "totalAmount": "Monto total" };
const cta = { "resolve": "Resolver" };
const description = "Uno o más pagos no se pudieron procesar debido a un error bancario. Resuelve los casos de recuperación abiertos para continuar procesando la nómina.";
const emptyTableDescription = "No hay casos de recuperación que requieran tu respuesta en este momento.";
const emptyTableTitle = "No hay casos de recuperación";
const labels = { "noLatestErrorCode": "—", "noLatestErrorCodeAriaLabel": "No hay código de error disponible" };
const status = { "lost": "Perdido", "open": "Abierto", "recovered": "Recuperado", "redebit_initiated": "Reintento de débito iniciado", "wire_initiated": "Transferencia iniciada" };
const Payroll_RecoveryCasesList = {
  columns,
  cta,
  description,
  emptyTableDescription,
  emptyTableTitle,
  labels,
  status
};
export {
  columns,
  cta,
  Payroll_RecoveryCasesList as default,
  description,
  emptyTableDescription,
  emptyTableTitle,
  labels,
  status
};
