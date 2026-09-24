const initialSetupCta = "Comenzar incorporación";
const initialSetupDescription = "Necesitamos cierta información para preparar tu empresa para la nómina.";
const initialSetupTitle = "Empecemos";
const missingRequirementsCta = "Continuar incorporación";
const missingRequirementsDescription = "Necesitamos un poco más de información para dejar tu empresa lista para la nómina.";
const onboardingCompletedCta = "Listo";
const onboardingCompletedTitle = "¡Perfecto! Nosotros nos encargamos a partir de aquí.";
const stepDescriptions = { "add_addresses": "Tus direcciones postal y para declaraciones, y todas las direcciones donde tengas empleados trabajando físicamente en los Estados Unidos.", "add_bank_info": "La cuenta bancaria que usarás para la nómina.", "add_employees": "Agrega a tus empleados para poder ejecutar la nómina.", "external_payroll": "Nómina externa", "federal_tax_setup": "Ingresa la información de tu cuenta de impuestos federales.", "payroll_schedule": "Seleccionar un calendario de pago", "select_industry": "Configura la industria de tu empresa", "sign_all_forms": "Firma los documentos requeridos para completar la configuración.", "state_setup": "Ingresa los detalles de impuestos estatales para los estados donde tus empleados trabajarán físicamente.", "verify_bank_info": "Verifica la información de tu cuenta bancaria." };
const stepTitles = { "add_addresses": "Agregar direcciones de la empresa", "add_bank_info": "Cuenta de nómina", "add_employees": "Agregar empleados", "external_payroll": "Nómina externa", "federal_tax_setup": "Información fiscal federal de la empresa", "payroll_schedule": "Seleccionar un calendario de pago", "select_industry": "Seleccionar industria", "sign_all_forms": "Firmar documentos" };
const Company_OnboardingOverview = {
  initialSetupCta,
  initialSetupDescription,
  initialSetupTitle,
  missingRequirementsCta,
  missingRequirementsDescription,
  onboardingCompletedCta,
  onboardingCompletedTitle,
  stepDescriptions,
  stepTitles
};
export {
  Company_OnboardingOverview as default,
  initialSetupCta,
  initialSetupDescription,
  initialSetupTitle,
  missingRequirementsCta,
  missingRequirementsDescription,
  onboardingCompletedCta,
  onboardingCompletedTitle,
  stepDescriptions,
  stepTitles
};
