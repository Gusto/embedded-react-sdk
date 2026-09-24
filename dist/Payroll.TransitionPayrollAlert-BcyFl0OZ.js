const alertDescription = "Debido a que cambió su calendario de pago, tendrá que ejecutar algunas nóminas de transición. Las nóminas de transición le permiten pagar a los empleados por cualquier día laborado durante los intervalos entre calendarios de pago. Puede optar por omitirlas, pero es su responsabilidad asegurarse de que los empleados reciban su pago correctamente. La funcionalidad de nómina regular se bloquea hasta que ejecute u omita las nóminas de transición.";
const alertTitle = "Nómina de transición - {{dateRange}}";
const runPayroll = "Ejecutar nómina de transición";
const skipDialog = { "body": "Omitir esta nómina significa que los empleados no recibirán pago por el período de transición. Es su responsabilidad asegurarse de que los empleados reciban su pago correctamente.", "confirmCta": "Omitir nómina", "title": "¿Omitir la nómina de transición de {{dateRange}}?" };
const skipPayroll = "Omitir esta nómina";
const skipSuccessAlert = "Se omitió la nómina de transición";
const Payroll_TransitionPayrollAlert = {
  alertDescription,
  alertTitle,
  runPayroll,
  skipDialog,
  skipPayroll,
  skipSuccessAlert
};
export {
  alertDescription,
  alertTitle,
  Payroll_TransitionPayrollAlert as default,
  runPayroll,
  skipDialog,
  skipPayroll,
  skipSuccessAlert
};
