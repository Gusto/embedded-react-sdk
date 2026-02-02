# Start Tech Spec

Start a new technical specification effort for an SDK feature. This command:

1. Clones SDK-273 (template epic) to create a new JIRA epic with standard tickets
2. Searches JIRA/Glean for PRDs, docs, and context
3. Creates a new spec repo OR Notion page with the tech spec

## Workflow

### Step 0: Verify MCP Connections

Before starting, verify both JIRA and Glean MCP servers are connected:

**Check JIRA MCP:**

```
mcp_jira_getAccessibleAtlassianResources
```

**Check Glean MCP:**

```
mcp_glean_default_search({ query: "test", app: "confluence" })
```

**If JIRA MCP fails or returns empty:**

```markdown
⚠️ **JIRA MCP Not Configured**

To use this command, you need to set up the JIRA MCP server:

1. Open Cursor Settings → MCP Servers
2. Add the Atlassian JIRA MCP server
3. Authenticate with your Atlassian account
4. Ensure you have access to the SDK project

Once configured, run this command again.
```

**If Glean MCP fails:**

```markdown
⚠️ **Glean MCP Not Configured**

To use this command, you need to set up the Glean MCP server:

1. Go to https://app.glean.com/settings/mcp
2. Follow the instructions to add Glean MCP to Cursor
3. Restart Cursor after configuration

Without Glean:

- ❌ Cannot search company-wide for PRDs, specs, or documentation
- ❌ Cannot synthesize context from internal knowledge base
- ✅ Can still proceed, but you must manually provide:
  - PRD links
  - Figma links
  - API documentation links
  - Any other relevant internal docs
```

### Step 1: Gather Requirements

Ask the user:

```
I'll help you start a new tech spec! Please provide:

1. **Feature Name**: What's this feature called?
   (e.g., "Employee Self-Onboarding", "Contractor Payments")

2. **Feature Slug**: Short kebab-case name for the repo
   (e.g., "employee-onboarding", "contractor-payments")

3. **T-Spec Ticket Key**: The existing tech spec ticket to move into the epic
   (e.g., SDK-512) - required

4. **New Epic Key** (if already created):
   (e.g., SDK-450) - or leave blank to create one

5. **Output Destination**:
   - `notion` - Create a Notion page (recommended)
   - `repo` - Create a new spec repo at ~/workspace/{slug}-spec/
   - `both` - Both Notion and local repo
```

### Step 2: Clone Epic from SDK-273

SDK-273 is our template epic. Clone it to create the new feature's epic:

1. **Get JIRA Cloud ID:**

   ```
   mcp_jira_getAccessibleAtlassianResources
   ```

2. **Fetch SDK-273 child tickets:**

   ```
   mcp_jira_searchJiraIssuesUsingJql({
     cloudId: "{cloud_id}",
     jql: "parent = SDK-273 ORDER BY created ASC",
     fields: ["summary", "description", "issuetype", "priority", "labels"]
   })
   ```

3. **Create new Epic** (if user doesn't have one):

   ```
   mcp_jira_createJiraIssue({
     cloudId: "{cloud_id}",
     projectKey: "SDK",
     issueTypeName: "Epic",
     summary: "{Feature Name} Implementation",
     description: "Technical specification and implementation epic for {Feature Name}.\n\nCloned from template epic SDK-273."
   })
   ```

4. **Clone each child ticket** from SDK-273, adapting for the new feature:
   - Replace placeholder text with feature name
   - Update epic key references (e.g., SDK-273 → SDK-XXX)
   - Keep the structure and acceptance criteria format
   - Link to the new epic as parent

5. **Move T-Spec ticket into the new epic:**

   ```
   mcp_jira_editJiraIssue({
     cloudId: "{cloud_id}",
     issueIdOrKey: "{tspec_ticket_key}",
     fields: {
       "parent": { "key": "{new_epic_key}" }
     }
   })
   ```

   **Verify the move:**

   ```
   mcp_jira_getJiraIssue({
     cloudId: "{cloud_id}",
     issueIdOrKey: "{tspec_ticket_key}",
     fields: ["summary", "parent", "status"]
   })
   ```

   If the T-Spec ticket doesn't exist, inform the user:

   ```markdown
   ⚠️ **T-Spec Ticket Not Found**

   Could not find ticket `{tspec_ticket_key}`. Please verify:

   - The ticket key is correct (format: SDK-XXX)
   - You have access to view this ticket
   - The ticket exists in the SDK project
   ```

### Step 3: Deep Research with Glean

Conduct comprehensive research to gather all context for the tech spec.

**JIRA Discovery:**

```
mcp_jira_search({ query: "{feature_name} SDK" })
mcp_jira_search({ query: "{feature_name} embedded payroll" })
```

**Glean Discovery** (run in parallel):

```
mcp_glean_default_search({ query: "{feature_name} PRD product requirements", app: "gdrive" })
mcp_glean_default_search({ query: "{feature_name} tech spec technical specification", app: "gdrive" })
mcp_glean_default_search({ query: "{feature_name} SDK embedded", app: "confluence" })
mcp_glean_default_search({ query: "{feature_name} API endpoint", app: "confluence" })
mcp_glean_default_search({ query: "{feature_name} figma design", app: "gdrive" })
```

**Synthesize findings:**

```
mcp_glean_default_chat({
  message: "What do we know about {feature_name} in the Embedded SDK? Include:
  1. PRDs and product requirements
  2. Existing tech specs or RFCs
  3. API endpoints involved
  4. Figma designs
  5. Related JIRA tickets
  6. Any existing implementation context"
})
```

**Read key documents:**

```
mcp_glean_default_read_document({ urls: ["{prd_url}", "{figma_url}", "{api_doc_url}", ...] })
```

**Extract key information for tech spec:**

- Problem statement (from PRD)
- Goals and non-goals
- API endpoints needed
- UI components from Figma
- Timeline/milestones
- Dependencies

### Step 4: Create Spec Repo

Create a new directory at `~/workspace/{slug}-spec/`:

```bash
mkdir -p ~/workspace/{slug}-spec/{diagrams,reports,zod-validation-test/results}
cd ~/workspace/{slug}-spec
```

**Full directory structure:**

Use the cloned epic key (e.g., SDK-450) and the child ticket keys from Step 2 to name the report files:

```
{slug}-spec/
├── TECH_SPEC.md                      # Main tech specification
├── diagrams/                         # Flow diagrams, state machines
├── reports/                          # Individual JIRA ticket reports
│   ├── SDK-XXX_api_inventory.md      # API endpoints needed (use actual cloned ticket key)
│   ├── SDK-XXX_api_verification.md   # SDK type validation results
│   ├── SDK-XXX_domain_stories.md     # User stories from PRD
│   ├── SDK-XXX_skeleton_plan.md      # Implementation plan
│   ├── SDK-XXX_figma_status.md       # Design review status
│   └── SDK-XXX_prd_status.md         # PRD completeness check
└── zod-validation-test/              # API schema validation
    └── results/                      # Test results
        └── .gitkeep
```

> **Note:** Replace `SDK-XXX` with the actual ticket keys from the cloned epic. Each report file should match its corresponding JIRA ticket (e.g., if the API Inventory ticket is SDK-451, name the file `SDK-451_api_inventory.md`).

**Initialize git repo:**

```bash
cd ~/workspace/{slug}-spec
git init
git add .
git commit -m "docs: initialize {feature} tech spec"
```

### Step 5: Run Zod Validation Tests

Validate the `@gusto/embedded-api` Zod schemas against real API responses to catch bugs early.

**Why this matters:**
The embedded-api SDK uses Zod schemas to validate API responses. If the schema doesn't match reality, the SDK throws `ResponseValidationError`. Finding these mismatches during spec phase prevents runtime failures later.

**Step 5a: Get test credentials from gws-flows**

```bash
cd ~/workspace/gws-flows

# Get a company UUID and flow token for testing
bundle exec rake sdk:demo_company

# Or create a fresh demo company
bundle exec rake sdk:create_demo_company
```

This outputs:

- `company_uuid` - The test company
- `flow_token` - Auth token for FeSdkProxy
- `employee_uuid` - A test employee (if available)

**Step 5b: Create a minimal test app**

In the spec repo, create a quick test harness:

```bash
cd ~/workspace/{slug}-spec/zod-validation-test
npm init -y
npm install @gusto/embedded-api tsx typescript
```

**Step 5c: Test via the embedded-api React Query hooks**

The SDK provides React Query hooks that validate responses with Zod schemas. If the schema doesn't match the real API response, it throws `ResponseValidationError`.

**Hook naming convention:**

- Queries: `use{Resource}{Action}Suspense` (e.g., `useEmployeesListSuspense`)
- Mutations: `use{Resource}{Action}Mutation` (e.g., `usePayrollsCreateOffCycleMutation`)

**Create a minimal React app to test:**

```tsx
import { ApiProvider } from './ApiProvider'
import { useEmployeesListSuspense } from '@gusto/embedded-api/react-query/employeesList'
import { usePayrollsListSuspense } from '@gusto/embedded-api/react-query/payrollsList'
import { usePayrollsCreateOffCycleMutation } from '@gusto/embedded-api/react-query/payrollsCreateOffCycle'

function TestHarness({ companyId }: { companyId: string }) {
  // Each hook call triggers Zod validation on the response
  // ResponseValidationError thrown if schema mismatch

  const { data: employees } = useEmployeesListSuspense({ companyId })
  console.log('✅ useEmployeesListSuspense passed')

  const { data: payrolls } = usePayrollsListSuspense({ companyId })
  console.log('✅ usePayrollsListSuspense passed')

  return <div>Tests complete</div>
}

// Wrap with ApiProvider pointing to gws-flows
;<ApiProvider url={`http://localhost:7777/fe_sdk/${FLOW_TOKEN}`}>
  <TestHarness companyId={COMPANY_UUID} />
</ApiProvider>
```

**Test the hooks you'll use in this feature:**

- List through your API inventory
- Call each React Query hook from `@gusto/embedded-api/react-query/*`
- Record which hooks pass/fail Zod validation

**Step 5d: Document findings**

For each endpoint tested, record in `reports/{EPIC}_api_verification.md`:

| Endpoint         | Status  | Notes                           |
| ---------------- | ------- | ------------------------------- |
| `GET /employees` | ✅ Pass |                                 |
| `POST /payrolls` | ❌ Fail | Missing `foo` field in response |

**Zod validation failures indicate:**

1. SDK schema is out of date → File issue on embedded-api
2. API changed without SDK update → File issue on embedded-api
3. New endpoint not yet in SDK → Add to tech spec as blocker

**If gws-flows not available:**

```markdown
## Follow-up: API Validation

- [ ] Run zod-validation-test when gws-flows available
- [ ] Document any schema mismatches in {EPIC}\_api_verification.md
```

### Step 6: Generate Tech Spec Draft

Use the Glean research to populate TECH_SPEC.md with:

- Problem statement (from PRD)
- Goals and non-goals
- API integration table (from api_inventory)
- Component architecture
- Testing plan
- Milestones

**Optional: Create Notion page:**

```
mcp_notion_create_pages({
  pages: [{
    properties: { title: "Tech Spec: {Feature Name}" },
    content: "{full_tech_spec_content}"
  }]
})
```

### Step 7: Present Summary

```markdown
## ✅ Tech Spec Initialized: {Feature Name}

### JIRA Epic

- **New Epic:** [SDK-XXX](https://gustohq.atlassian.net/browse/SDK-XXX)
- **Cloned from:** SDK-273 (template)
- **Tickets created:** {count}
- **T-Spec Ticket:** [{tspec_ticket_key}](https://gustohq.atlassian.net/browse/{tspec_ticket_key}) ✅ Moved to epic

### Spec Repo

- **Location:** ~/workspace/{slug}-spec/
- **TECH_SPEC.md:** Draft generated from Glean research

### Zod Validation

- **Status:** {ran/skipped}
- **Endpoints tested:** {count} from API inventory
- **Failures:** {count} schema mismatches found
- **Report:** reports/{api_verification_ticket}\_api_verification.md

### Context Discovered

- **PRD:** {link if found}
- **Figma:** {link if found}
- **API Docs:** {count} endpoints identified
- **Related docs:** {count} documents

### Next Steps

1. [ ] Review and refine TECH_SPEC.md
2. [ ] Complete reports/{api_inventory_ticket}\_api_inventory.md
3. [ ] Run full zod validation (if skipped)
4. [ ] Finalize PRD with Product
5. [ ] Get Figma designs confirmed
6. [ ] Assign tickets in epic
```

### Step 8: Open Spec Repo in Cursor

Launch a new Cursor instance at the spec repo so the user can start working directly:

```bash
cursor ~/workspace/{slug}-spec
```

This opens the new spec repo in a fresh Cursor window where the user can:

- Continue prompting to flesh out the tech spec
- Run zod validation tests
- Update report files

---

## TECH_SPEC.md Template

```markdown
# Tech Spec: {Feature Name} React SDK Implementation

**{Date}**

---

## Problem

{From PRD - the business problem being solved}

## Goals

- **Goal 1:** {From PRD}
- **Goal 2:** {From PRD}

## Non-Goals

- {What we're NOT doing}

## References

- **PRD:** [{Title}]({url})
- **Epic:** [SDK-XXX](https://gustohq.atlassian.net/browse/SDK-XXX)
- **Figma:** [{Design}]({url})
- **API Docs:** [{API}]({url})

## Technical Implementation

### Architecture Overview

{To be filled in}

### API Integration

| Endpoint | Method | Purpose | Hook |
| -------- | ------ | ------- | ---- |
|          |        |         |      |

## Testing Plan

1. **Unit Tests** - Jest + React Testing Library
2. **Component Tests** - Ladle stories
3. **E2E Tests** - If applicable

## Milestones

| Milestone          | Deliverables | Criteria |
| ------------------ | ------------ | -------- |
| M1: Foundation     |              |          |
| M2: Implementation |              |          |
| M3: Ship           |              |          |

---

_Last Updated: {Date}_
```

---

## Report Templates

Each report follows this header format:

```markdown
# {EPIC}: {Report Name}

**Status:** 📋 Not Started  
**Assignee:** TBD  
**Epic:** [{EPIC}](https://gustohq.atlassian.net/browse/{EPIC})

---
```

Status indicators:

- 📋 Not Started
- 🟡 In Progress
- ✅ Complete
- ❌ Blocked

---

## Follow-up Commands

- "Search for more context about {topic}"
- "Update the API inventory"
- "Create domain stories from PRD"
- "Run zod validation tests"
- "Add new endpoint to zod tests"
- "Sync to Notion"
- "Show the cloned tickets"

---

## Error Handling

- **JIRA MCP not connected:** Display setup instructions, abort workflow
- **JIRA fails:** Continue with Glean, note manual epic cloning needed
- **T-Spec ticket not found:** Warn user, continue with epic creation (ticket can be moved manually)
- **T-Spec move fails:** Log error, provide manual instructions for parent assignment
- **Glean fails:** Use JIRA for context, ask for PRD links manually
- **gws-flows not running:** Skip zod tests, add as follow-up task
- **Zod validation fails:** Document failures in api_verification.md, continue with spec
- **Notion fails:** Create local repo only, retry Notion later
