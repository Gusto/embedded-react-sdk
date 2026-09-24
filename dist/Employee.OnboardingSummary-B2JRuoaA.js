const doneCta = "Listo";
const handedOffAdminDescription = "Ellos completarán por su cuenta los pasos restantes de configuración.";
const handedOffAdminSubtitle = "La invitación de {{name}} va en camino";
const newHireReportCta = "Informe de nueva contratación";
const onboardedAdminDescription = "Comenzaremos a retener y declarar sus impuestos.";
const onboardedAdminSubtitle = "¡Eso es todo! ¡{{name}} está listo para que le paguen!";
const steps = { "admin_review": "Revisión del administrador", "compensation_details": "Puesto y compensación", "employee_form_signing": "Firma de formularios del empleado", "federal_tax_setup": "Detalles de impuestos federales", "file_new_hire_report": "Presentar informe de nueva contratación", "state_tax_setup": "Detalles de impuestos estatales" };
const stepsDescriptions = { "admin_review": "Revisión del administrador", "compensation_details": " Cuál será el o los roles del empleado y su compensación.", "direct_deposit_setup": "Cómo se le pagará al empleado.", "employee_form_signing": "Documentos que requieren la firma del empleado", "federal_tax_setup": "Retenciones de impuestos federales.", "file_new_hire_report": "Indica si es necesario presentar el informe de nueva contratación", "personal_details": "Información básica del empleado y su dirección de casa.", "state_tax_setup": "Retenciones de impuestos estatales" };
const Employee_OnboardingSummary = {
  doneCta,
  handedOffAdminDescription,
  handedOffAdminSubtitle,
  newHireReportCta,
  onboardedAdminDescription,
  onboardedAdminSubtitle,
  steps,
  stepsDescriptions
};
export {
  Employee_OnboardingSummary as default,
  doneCta,
  handedOffAdminDescription,
  handedOffAdminSubtitle,
  newHireReportCta,
  onboardedAdminDescription,
  onboardedAdminSubtitle,
  steps,
  stepsDescriptions
};
