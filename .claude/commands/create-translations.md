# Create translations

This command creates a new translation file following the i18n guidelines from CONTRIBUTING.md.

## Workflow

1. **Ask for inputs**:
   - Component namespace (e.g., `Employee.ManagementEmployeeList`, `Company.Locations`)
   - Component purpose/description (to help generate relevant keys)
   - Figma URL (optional) - If provided, inspect the design to extract actual copy text for translations

2. **If Figma URL provided**:
   - View the Figma design to identify all text content
   - Extract labels, button text, headings, descriptions, etc.
   - Use actual copy from Figma for translation values instead of placeholders
   - Generate keys based on the text found in the design

3. **Generate starter translation keys**:
   - Ask the user what type of keys they need:
     - Page with title and CTAs (common for forms/flows)
     - List/table with columns and actions
     - Custom (let user specify)
   - Generate appropriate keys based on selection

4. **Follow naming conventions**:
   - Use **camelCase** for all keys
   - Use standard suffixes:
     - `Cta` for buttons (e.g., `submitCta`, `continueCta`, `cancelCta`)
     - `Label` for field/column labels (e.g., `nameLabel`, `emailLabel`)
     - `Description` for help text (e.g., `fieldDescription`)
     - `Title` for headings (e.g., `pageTitle`, `sectionTitle`)
     - `Placeholder` for input placeholders
     - `Error` for error messages
   - Group related keys in nested objects:
     - `validations` for validation errors
     - `labels` for accessibility labels
     - `tabs` for tab labels
     - `alerts` for notifications
     - `table` for table-related text

5. **Create the file**:
   - File path: `src/i18n/en/<ComponentNamespace>.json`
   - Format as pretty JSON with 2-space indentation
   - If Figma provided: Use actual copy from the design
   - If no Figma: Add placeholder text values that describe the key's purpose

6. **Generate types**:
   - Run `npm run i18n:generate` to generate TypeScript types
   - Verify no errors

7. **Provide usage instructions**:
   - Show example of `useI18n()` hook with the namespace
   - Show example of `useTranslation()` with the namespace
   - Remind to update translation values with actual copy

## Standard Templates

### Form/Page Template

```json
{
  "title": "Page or section title",
  "description": "Optional description text",
  "submitCta": "Submit button text",
  "cancelCta": "Cancel",
  "labels": {
    "fieldLabel": "Field label text"
  },
  "validations": {
    "fieldRequired": "Field is required",
    "fieldInvalid": "Field format is invalid"
  }
}
```

### List/Table Template

```json
{
  "title": "Section title",
  "addCta": "Add new item",
  "columnLabel": "Column header",
  "editCta": "Edit item",
  "deleteCta": "Delete item",
  "emptyTableTitle": "No items",
  "emptyTableDescription": "Description when empty",
  "labels": {
    "listLabel": "Accessibility label for list"
  }
}
```

### Tabs Template

```json
{
  "title": "Section title",
  "tabs": {
    "tabId1": "First tab label",
    "tabId2": "Second tab label"
  },
  "labels": {
    "tabsLabel": "Accessibility label for tabs"
  }
}
```

## Example Interactions

### With Figma URL

**User**: "Create translations for Employee.ProfileForm"

**Assistant**:

1. Asks: "Do you have a Figma URL for this component?"
2. User provides: `https://www.figma.com/design/abc123...`
3. Inspects Figma design to extract actual text content
4. Generates translation keys with actual copy from design
5. Creates `src/i18n/en/Employee.ProfileForm.json`
6. Runs `npm run i18n:generate`
7. Shows usage example

### Without Figma URL

**User**: "Create translations for Employee.ProfileForm"

**Assistant**:

1. Asks: "Do you have a Figma URL for this component?" (user says no)
2. Asks: "What type of component is this?"
   - Form with fields and submit button
   - List/table with data
   - Custom
3. Generates appropriate template with placeholders
4. Creates `src/i18n/en/Employee.ProfileForm.json`
5. Runs `npm run i18n:generate`
6. Shows usage example

## Notes

- Only use snake_case for:
  - API enum values that match backend
  - i18next pluralization (e.g., `priority_one`, `priority_two`)
  - Programmatic identifiers matching APIs
- Always validate against CONTRIBUTING.md guidelines
- Remind user to replace placeholder text with actual copy
- Suggest grouping strategy for complex forms
