const entityTypeAndLegalNameIntro = "Ingresa tu tipo de entidad y el nombre legal de tu empresa. Puedes encontrar esta información en tu <einLink>formulario de asignación de FEIN (Formulario CP575)</einLink>. Necesitamos esto para declarar y pagar tus impuestos correctamente.";
const federalEinDescription = "El Número de Identificación del Empleador Federal (EIN) de tu empresa. Si no tienes uno, por favor <applyLink>solicítalo en línea.</applyLink>";
const federalFilingFormDescription = "Para obtener más información sobre las diferentes presentaciones de formularios de impuestos federales para la nómina, revisa el <irsLink>sitio web del IRS.</irsLink>";
const federalFilingFormPlaceholder = "Selecciona el formulario de declaración...";
const filingForm = { "941": "941 - Declaración Trimestral Federal del Impuesto del Empleador", "944": "944 - Declaración Anual Federal del Impuesto del Empleador" };
const legalEntityNameDescription = "Asegúrate de que este sea el nombre legal de la empresa, no tu DBA.";
const legalEntityNameError = "El nombre legal de la entidad es obligatorio";
const pageTitle = "Información de impuestos federales";
const taxPayerType = { "Association": "Asociación", "C-Corporation": "Corporación tipo C", "Co-ownership": "Copropiedad", "General partnership": "Sociedad general", "Joint venture": "Empresa conjunta", "LLC": "LLC", "LLP": "LLP", "Limited partnership": "Sociedad en comandita", "Non-Profit": "Sin fines de lucro", "S-Corporation": "Corporación S", "Sole proprietor": "Propietario único", "Trusteeship": "Fideicomiso" };
const taxpayerTypeLabel = "Tipo de contribuyente";
const taxpayerTypePlaceholder = "Selecciona el tipo de contribuyente...";
const Company_FederalTaxes = {
  entityTypeAndLegalNameIntro,
  federalEinDescription,
  federalFilingFormDescription,
  federalFilingFormPlaceholder,
  filingForm,
  legalEntityNameDescription,
  legalEntityNameError,
  pageTitle,
  taxPayerType,
  taxpayerTypeLabel,
  taxpayerTypePlaceholder
};
export {
  Company_FederalTaxes as default,
  entityTypeAndLegalNameIntro,
  federalEinDescription,
  federalFilingFormDescription,
  federalFilingFormPlaceholder,
  filingForm,
  legalEntityNameDescription,
  legalEntityNameError,
  pageTitle,
  taxPayerType,
  taxpayerTypeLabel,
  taxpayerTypePlaceholder
};
