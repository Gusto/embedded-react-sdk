export interface paths {
    "/v1/token_info": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get info about the current access token
         * @description Returns scope and resource information associated with the current access token.
         */
        get: operations["get-v1-token-info"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/oauth/token": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Refresh access token
         * @description Exchange a refresh token for a new access token.
         *
         *     The previous `refresh_token` will be revoked on the first usage of the new `access_token`.
         *
         *     The `expires_in` value is provided in seconds from when the `access_token` was generated.
         */
        post: operations["refresh-access-token"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/partner_managed_companies": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Create a partner managed company
         * @description Create a partner managed company. When you successfully call the API, it does the following:
         *     * Creates a new company in Gusto
         *     * Creates a new user using the provided email if the user does not already exist.
         *     * Makes the user the primary payroll administrator of the new company.
         *
         *     In response, you will receive oauth access tokens for the created company.
         *
         *     IMPORTANT: the returned access and refresh tokens are reserved for this company only. They cannot be used to access other companies AND previously granted tokens cannot be used to access this company.
         *
         *     > 📘 System Access Authentication
         *     >
         *     > this endpoint uses the [Bearer Auth scheme with the system-level access token in the HTTP Authorization header](https://docs.gusto.com/embedded-payroll/docs/system-access)
         */
        post: operations["post-v1-partner-managed-companies"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/companies/{company_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get a company
         * @description Get a company.
         *     The employees:read scope is required to return home_address and non-work locations.
         *     The company_admin:read scope is required to return primary_payroll_admin.
         *     The signatories:read scope is required to return primary_signatory.
         *
         *     scope: `companies:read`
         */
        get: operations["get-v1-companies"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/partner_managed_companies/{company_uuid}/migrate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Migrate company to embedded payroll
         * @description Migrate an existing Gusto customer to your embedded payroll product.
         *
         *     To use this endpoint, the customer will need to connect their Gusto account to your application using [OAuth2](https://docs.gusto.com/embedded-payroll/docs/oauth2) then view and [accept the Embedded Payroll Terms of Service](https://docs.gusto.com/embedded-payroll/reference/post-partner-managed-companies-company_uuid-accept_terms_of_service).
         *
         *     scope: `partner_managed_companies:write`
         */
        put: operations["put-v1-partner-managed-companies-company-uuid-migrate"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/partner_managed_companies/{company_uuid}/accept_terms_of_service": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Accept terms of service for a company user
         * @description Accept the Gusto Embedded Payroll's [Terms of Service](https://flows.gusto.com/terms).
         *     The user must have a role in the company in order to accept the Terms of Service.
         *
         *     scope: `terms_of_services:write`
         */
        post: operations["post-partner-managed-companies-company_uuid-accept_terms_of_service"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/partner_managed_companies/{company_uuid}/retrieve_terms_of_service": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Retrieve terms of service status for a company user
         * @description Retrieve the user acceptance status of the Gusto Embedded Payroll's [Terms of Service](https://flows.gusto.com/terms).
         *
         *     scope: `terms_of_services:read`
         */
        post: operations["post-partner-managed-companies-company_uuid-retrieve_terms_of_service"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/invoices/{invoice_period}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieve invoicing data for companies
         * @description Retrieve data for active companies used to calculate invoices for Gusto Embedded Payroll. A company is considered active for an invoice period if they are an active partner managed company, have run payroll or created contractor payments since becoming a partner managed company, and are not suspended at any point during the invoice period.  This endpoint forces pagination, with 100 results returned at a time. You can learn more about our pagination here: [pagination guide](https://docs.gusto.com/embedded-payroll/docs/pagination)
         *
         *     > 📘 System Access Authentication
         *     >
         *     > This endpoint uses the [Bearer Auth scheme with the system-level access token in the HTTP Authorization header](https://docs.gusto.com/embedded-payroll/docs/system-access)
         *
         *     scope: `invoices:read`
         */
        get: operations["get-invoices-invoice-period"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/companies/{company_id}/federal_tax_details": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Federal Tax Details
         * @description Fetches attributes relevant for a company's federal taxes.
         *
         *     scope: `company_federal_taxes:read`
         */
        get: operations["get-v1-companies-company_id-federal_tax_details"];
        /**
         * Update Federal Tax Details
         * @description Updates attributes relevant for a company's federal taxes.
         *     This information is required is to onboard a company for use with Gusto Embedded Payroll.
         *
         *     scope: `company_federal_taxes:write`
         */
        put: operations["put-v1-companies-company_id-federal_tax_details"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/companies/{company_id}/industry_selection": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get a company industry selection
         * @description Get industry selection for the company.
         *
         *     scope: `companies:read`
         */
        get: operations["get-v1-company-industry"];
        /**
         * Update a company industry selection
         * @description Update the company industry selection by passing in industry classification codes: [NAICS code](https://www.naics.com), [SICS code](https://siccode.com/) and industry title. Our UI is leveraging [Middesk API](https://docs.middesk.com/reference/introduction) to determine industry classification codes.
         *
         *     scope: `companies:write`
         */
        put: operations["put-v1-company-industry"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/companies/{company_id}/admins": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get all the admins at a company
         * @description Returns a list of all the admins at a company
         *
         *     scope: `company_admin:read`
         */
        get: operations["get-v1-companies-company_id-admins"];
        put?: never;
        /**
         * Create an admin for the company
         * @description Creates a new admin for a company.
         *     If the email matches an existing user, this will create an admin account for the current user. Otherwise, this will create a new user.
         *
         *     scope: `company_admin:write`
         */
        post: operations["post-v1-companies-company_id-admins"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/companies/{company_uuid}/signatories": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get all company signatories
         * @description Returns company signatories. Currently we only support a single signatory per company.
         *
         *     scope: `signatories:read`
         */
        get: operations["get-v1-companies-company_uuid-signatories"];
        put?: never;
        /**
         * Create a signatory
         * @description Create a company signatory with complete information.
         *     A signatory can legally sign forms once the identity verification process is successful.
         *     The signatory should be an officer, owner, general partner or LLC member manager, plan administrator, fiduciary, or an authorized representative who is designated to sign agreements on the company's behalf. An officer is the president, vice president, treasurer, chief accounting officer, etc. There can only be a single primary signatory in a company.
         *
         *     scope: `signatories:manage`
         */
        post: operations["post-v1-company-signatories"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/companies/{company_uuid}/signatories/invite": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Invite a signatory
         * @description Create a signatory with minimal information. This signatory can be invited to provide more information through the `PUT /v1/companies/{company_uuid}/signatories/{signatory_uuid}` endpoint. This will start the identity verification process and allow the signatory to be verified to sign documents.
         */
        post: operations["post-v1-companies-company_uuid-signatories-invite"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/companies/{company_uuid}/signatories/{signatory_uuid}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Update a signatory
         * @description Update a signatory that has been either invited or created. If the signatory has been created with minimal information through the `POST /v1/companies/{company_uuid}/signatories/invite` endpoint, then the first update must contain all attributes specified in the request body in order to start the identity verification process.
         *
         *     scope: `signatories:write`
         */
        put: operations["put-v1-companies-company_uuid-signatories-signatory_uuid"];
        post?: never;
        /**
         * Delete a signatory
         * @description Delete a company signatory.
         *
         *     scope: `signatories:manage`
         */
        delete: operations["delete-v1-companies-company_uuid-signatories-signatory_uuid"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/companies/{company_uuid}/onboarding_status": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get the company's onboarding status
         * @description Get company's onboarding status.
         *     The data returned helps inform the required onboarding steps and respective completion status.
         *
         *     scope: `company_onboarding_status:read`
         */
        get: operations["get-v1-company-onboarding-status"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/companies/{company_uuid}/finish_onboarding": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Finish company onboarding
         * @description Finalize a given company's onboarding process.
         *
         *     ### Approve a company in demo
         *     After a company is finished onboarding, Gusto requires an additional step to review and approve that company.
         *     In production environments, this step is required for risk-analysis purposes.
         *
         *     We provide the endpoint `PUT '/v1/companies/{company_uuid}/approve'` to facilitate company approvals in the demo environment.
         *
         *     ```shell
         *     PUT '/v1/companies/89771af8-b964-472e-8064-554dfbcb56d9/approve'
         *
         *     # Response: Company object, with company_status: 'Approved'
         *     ```
         *
         *     scope: `companies:write`
         */
        put: operations["get-v1-company-finish-onboarding"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/companies/{company_id}/custom_fields": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get the custom fields of a company
         * @description Returns a list of the custom fields of the company. Useful when you need to know the schema of custom fields for an entire company
         *
         *     scope: `companies:read`
         */
        get: operations["get-v1-companies-company_id-custom_fields"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/companies/{company_uuid}/flows": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Create a flow
         * @description Generate a link to access a pre-built workflow in Gusto white-label UI. For security, all generated flows will expire within 1 hour of inactivity or 24 hours from creation time, whichever comes first.
         *
         *     scope: `flows:write`
         */
        post: operations["post-v1-company-flows"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/companies/{company_id}/locations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get company locations
         * @description Company locations represent all addresses associated with a company. These can be filing addresses, mailing addresses, and/or work locations; one address may serve multiple, or all, purposes.
         *
         *     Since all company locations are subsets of locations, retrieving or updating an individual record should be done via the locations endpoints.
         *
         *     scope: `companies:read`
         */
        get: operations["get-v1-companies-company_id-locations"];
        put?: never;
        /**
         * Create a company location
         * @description Company locations represent all addresses associated with a company. These can be filing addresses, mailing addresses, and/or work locations; one address may serve multiple, or all, purposes.
         *
         *     Since all company locations are subsets of locations, retrieving or updating an individual record should be done via the locations endpoints.
         *
         *     scope: `companies.write`
         */
        post: operations["post-v1-companies-company_id-locations"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/locations/{location_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get a location
         * @description Get a location.
         *
         *     scope: `companies:read`
         */
        get: operations["get-v1-locations-location_id"];
        /**
         * Update a location
         * @description Update a location.
         *
         *     scope: `companies.write`
         */
        put: operations["put-v1-locations-location_id"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/locations/{location_uuid}/minimum_wages": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get minimum wages for a location
         * @description Get minimum wages for a location
         *
         *     scope: `companies:read`
         */
        get: operations["get-v1-locations-location_uuid-minimum_wages"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/companies/{company_id}/bank_accounts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get all company bank accounts
         * @description Returns company bank accounts. Currently, we only support a single default bank account per company.
         *
         *     scope: `company_bank_accounts:read`
         */
        get: operations["get-v1-companies-company_id-bank-accounts"];
        put?: never;
        /**
         * Create a company bank account
         * @description This endpoint creates a new company bank account.
         *
         *     Upon being created, two verification deposits are automatically sent to the bank account, and the bank account's verification_status is 'awaiting_deposits'.
         *
         *     When the deposits are successfully transferred, the verification_status changes to 'ready_for_verification', at which point the verify endpoint can be used to verify the bank account.
         *     After successful verification, the bank account's verification_status is 'verified'.
         *
         *     scope: `company_bank_accounts:write`
         *
         *     > 🚧 Warning
         *     >
         *     > If a default bank account exists, it will be disabled and the new bank account will replace it as the company's default funding method.
         */
        post: operations["post-v1-companies-company_id-bank-accounts"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/companies/{company_id}/bank_accounts/{bank_account_uuid}/verify": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Verify a company bank account
         * @description Verify a company bank account by confirming the two micro-deposits sent to the bank account. Note that the order of the two deposits specified in request parameters does not matter. There's a maximum of 5 verification attempts, after which we will automatically initiate a new set of micro-deposits and require the bank account to be verified with the new micro-deposits.
         *
         *     ### Bank account verification in demo
         *
         *     We provide the endpoint `POST '/v1/companies/{company_id}/bank_accounts/{bank_account_uuid}/send_test_deposits'` to facilitate bank account verification in the demo environment. This endpoint simulates the micro-deposits transfer and returns them in the response. You can call this endpoint as many times as you wish to retrieve the values of the two micro deposits.
         *
         *     ```
         *       POST '/v1/companies/89771af8-b964-472e-8064-554dfbcb56d9/bank_accounts/ade55e57-4800-4059-9ecd-fa29cfeb6dd2/send_test_deposits'
         *
         *       {
         *         "deposit_1": 0.02,
         *         "deposit_2": 0.42
         *       }
         *     ```
         *
         *     scope: `company_bank_accounts:write`
         */
        put: operations["put-v1-companies-company_id-bank-accounts-verify"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/companies/{company_uuid}/external_payrolls": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get external payrolls for a company
         * @description Get an external payroll for a given company.
         *
         *     scope: `external_payrolls:read`
         */
        get: operations["get-v1-company-external-payrolls"];
        put?: never;
        /**
         * Create a new external payroll for a company
         * @description Creates a new external payroll for the company.
         *
         *     scope: `external_payrolls:write`
         */
        post: operations["post-v1-external-payroll"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/companies/{company_uuid}/external_payrolls/{external_payroll_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get an external payroll
         * @description Get an external payroll for a given company.
         *
         *     scope: `external_payrolls:read`
         */
        get: operations["get-v1-external-payroll"];
        /**
         * Update an external payroll
         * @description Update an external payroll with a list of external payroll items
         *
         *     scope: `external_payrolls:write`
         */
        put: operations["put-v1-external-payroll"];
        post?: never;
        /**
         * Delete an external payroll
         * @description Delete an external payroll.
         *
         *     scope: `external_payrolls:write`
         */
        delete: operations["delete-v1-external-payroll"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/companies/{company_uuid}/external_payrolls/{external_payroll_id}/calculate_taxes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get tax suggestions for an external payroll
         * @description Get tax suggestions for an external payroll. Earnings and/or benefits
         *     data must be saved prior to the calculation in order to retrieve accurate
         *     tax calculation.
         *
         *     scope: `external_payrolls:read`
         */
        get: operations["get-v1-external-payroll-calculate-taxes"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/companies/{company_uuid}/external_payrolls/tax_liabilities": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get tax liabilities
         * @description Get tax liabilities from aggregate external payrolls for a company.
         *
         *     scope: `external_payrolls:read`
         */
        get: operations["get-v1-tax-liabilities"];
        /**
         * Update tax liabilities
         * @description Update tax liabilities for a company.
         *
         *     scope: `external_payrolls:write`
         */
        put: operations["put-v1-tax-liabilities"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/companies/{company_uuid}/external_payrolls/tax_liabilities/finish": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Finalize tax liabilities options and convert into processed payrolls
         * @description Finalizes tax liabilities for a company. All external payrolls edit action will be disabled.
         *
         *     scope: `external_payrolls:write`
         */
        put: operations["put-v1-tax-liabilities-finish"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/companies/{company_uuid}/payment_configs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get a company's payment configs
         * @description Get payment speed for the company and fast payment limit (1-day is only applicable to partners that opt in).
         *
         *     scope: `company_payment_configs:read`
         */
        get: operations["get-v1-company-payment-configs"];
        /**
         * Update a company's payment configs
         * @description Update payment speed and fast payment limit for a company. At least one of `payment_speed` or `fast_payment_limit` parameters is required. 1-day option is only applicable to partners that opt in.
         *
         *     scope: `company_payment_configs:write`
         */
        put: operations["put-v1-company-payment-configs"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/companies/{company_id}/pay_schedules": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get the pay schedules for a company
         * @description The pay schedule object in Gusto captures the details of when employees work and when they should be paid. A company can have multiple pay schedules.
         *
         *     scope: `pay_schedules:read`
         */
        get: operations["get-v1-companies-company_id-pay_schedules"];
        put?: never;
        /**
         * Create a new pay schedule
         * @description If a company does not have any pay schedules, this endpoint will create a single pay schedule and assign it to all employees. This is a common use case during company onboarding.
         *
         *     If a company has an existing active pay schedule and want to support multiple pay schedules, this endpoint will create a pay schedule that is not assigned to any employee.
         *
         *     Be sure to **[check state laws](https://www.dol.gov/agencies/whd/state/payday)** to know what schedule is right for your customers.
         */
        post: operations["post-v1-companies-company_id-pay_schedules"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/companies/{company_id}/pay_schedules/preview": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Preview pay schedule dates
         * @description Provides a preview of a pay schedule with the specified parameters
         *
         *     scope: `pay_schedules:write`
         */
        get: operations["get-v1-companies-company_id-pay_schedules-preview"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/companies/{company_id}/pay_schedules/{pay_schedule_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get a pay schedule
         * @description The pay schedule object in Gusto captures the details of when employees work and when they should be paid. A company can have multiple pay schedules.
         *
         *     scope: `pay_schedules:read`
         */
        get: operations["get-v1-companies-company_id-pay_schedules-pay_schedule_id"];
        /**
         * Update a pay schedule
         * @description Updates a pay schedule.
         *
         *     scope: `pay_schedules:write`
         */
        put: operations["put-v1-companies-company_id-pay_schedules-pay_schedule_id"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/companies/{company_id}/pay_periods": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get pay periods for a company
         * @description Pay periods are the foundation of payroll. Compensation, time & attendance, taxes, and expense reports all rely on when they happened. To begin submitting information for a given payroll, we need to agree on the time period.
         *
         *     By default, this endpoint returns pay periods starting from 6 months ago to the date today.  Use the `start_date` and `end_date` parameters to change the scope of the response.  End dates can be up to 3 months in the future and there is no limit on start dates.
         *
         *     Starting in version '2023-04-01', the eligible_employees attribute was removed from the response.  The eligible employees for a payroll are determined by the employee_compensations returned from the payrolls#prepare endpoint.
         *
         *     scope: `payrolls:read`
         */
        get: operations["get-v1-companies-company_id-pay_periods"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/companies/{company_id}/pay_periods/unprocessed_termination_pay_periods": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get termination pay periods for a company
         * @description When a payroll admin terminates an employee and selects "Dismissal Payroll" as the employee's final payroll, their last pay period will appear on the list.
         *
         *     This endpoint returns the unprocessed pay periods for past and future terminated employees in a given company.
         *
         *     scope: `payrolls:read`
         */
        get: operations["get-v1-companies-company_id-unprocessed_termination_pay_periods"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/companies/{company_id}/pay_schedules/assignments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get pay schedule assignments for a company
         * @description This endpoint returns the current pay schedule assignment for a company, with pay schedule and employee/department mappings depending on the pay schedule type.
         *
         *     scope: `pay_schedules:read`
         */
        get: operations["get-v1-companies-company_id-pay_schedules-assignments"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/companies/{company_id}/pay_schedules/assignment_preview": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Preview pay schedule assignments for a company
         * @description This endpoints returns the employee changes, including pay period and transition pay periods, for changing the pay schedule.
         *
         *     scope: `pay_schedules:write`
         */
        post: operations["post-v1-companies-company_id-pay_schedules-assignment_preview"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/companies/{company_id}/pay_schedules/assign": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Assign pay schedules for a company
         * @description This endpoints assigns employees to specified pay schedules based on the pay schedule type.
         *
         *     scope: `pay_schedules:write`
         */
        post: operations["post-v1-companies-company_id-pay_schedules-assign"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/companies/{company_id}/employees": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get employees of a company
         * @description Get all of the employees, onboarding, active and terminated, for a given company.
         *
         *     scope: `employees:read`
         */
        get: operations["get-v1-companies-company_id-employees"];
        put?: never;
        /**
         * Create an employee
         * @description Create an employee.
         *
         *     scope: `employees:manage`
         */
        post: operations["post-v1-employees"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/companies/{company_uuid}/departments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get all departments of a company
         * @description Get all of the departments for a given company with the employees and contractors assigned to that department.
         *
         *     scope: `departments:read`
         */
        get: operations["get-companies-departments"];
        put?: never;
        /**
         * Create a department
         * @description Create a department
         *
         *     scope: `departments:write`
         */
        post: operations["post-departments"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/departments/{department_uuid}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get a department
         * @description Get a department given the UUID
         *
         *     scope: `departments:read`
         *
         */
        get: operations["get-department"];
        /**
         * Update a department
         * @description Update a department
         *
         *     scope: `departments:write`
         */
        put: operations["put-departments"];
        post?: never;
        /**
         * Delete a department
         * @description Delete a department. You cannot delete a department until all employees and contractors have been removed.
         *
         *     scope: `departments:write`
         *
         */
        delete: operations["delete-department"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/departments/{department_uuid}/add": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Add people to a department
         * @description Add employees and contractors to a department
         *
         *     scope: `departments:write`
         *
         */
        put: operations["put-add-people-to-department"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/departments/{department_uuid}/remove": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Remove people from a department
         * @description Remove employees and contractors from a department
         *
         *     scope: `departments:write`
         *
         */
        put: operations["put-remove-people-from-department"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/employees/{employee_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get an employee
         * @description Get an employee.
         *
         *     scope: `employees:read`
         *
         */
        get: operations["get-v1-employees"];
        /**
         * Update an employee
         * @description Update an employee.
         *
         *     scope: `employees:write`
         */
        put: operations["put-v1-employees"];
        post?: never;
        /**
         * Delete an onboarding employee
         * @description Use this endpoint to delete an employee who is in onboarding. Deleting
         *     an onboarded employee is not allowed and will return a 422 response. Please check out the Terminations api
         *     if you need to terminate an onboarded employee.
         *
         *     scope: `employees:manage`
         */
        delete: operations["delete-v1-employee"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/employees/{employee_id}/terminations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get terminations for an employee
         * @description Terminations are created whenever an employee is scheduled to leave the company. The only things required are an effective date (their last day of work) and whether they should receive their wages in a one-off termination payroll or with the rest of the company.
         *
         *     Note that some states require employees to receive their final wages within 24 hours (unless they consent otherwise,) in which case running a one-off payroll may be the only option.
         *
         *     scope: `employments:read`
         */
        get: operations["get-v1-employees-employee_id-terminations"];
        put?: never;
        /**
         * Create an employee termination
         * @description Terminations are created whenever an employee is scheduled to leave the company. The only things required are an effective date (their last day of work) and whether they should receive their wages in a one-off termination payroll or with the rest of the company.
         *
         *     Note that some states require employees to receive their final wages within 24 hours (unless they consent otherwise,) in which case running a one-off payroll may be the only option.
         *
         *     scope: `employments:write`
         */
        post: operations["post-v1-employees-employee_id-terminations"];
        /**
         * Delete an employee termination
         * @description Delete an employee termination.
         *
         *     scope: `employments:write`
         */
        delete: operations["delete-v1-employees-employee_id-terminations"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/terminations/{employee_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Update an employee termination
         * @description Terminations are created whenever an employee is scheduled to leave the company. The only things required are an effective date (their last day of work) and whether they should receive their wages in a one-off termination payroll or with the rest of the company.
         *
         *     Note that some states require employees to receive their final wages within 24 hours (unless they consent otherwise,) in which case running a one-off payroll may be the only option.
         *
         *     scope: `employments:write`
         */
        put: operations["put-v1-terminations-employee_id"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/employees/{employee_id}/rehire": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get an employee rehire
         * @description Retrieve an employee's rehire, which contains information on when the employee returns to work.
         *
         *     scope: `employments:read`
         */
        get: operations["get-v1-employees-employee_id-rehire"];
        /**
         * Update an employee rehire
         * @description Update an employee's rehire.
         *
         *     scope: `employments:write`
         */
        put: operations["put-v1-employees-employee_id-rehire"];
        /**
         * Create an employee rehire
         * @description Rehire is created whenever an employee is scheduled to return to the company.
         *
         *     scope: `employments:write`
         */
        post: operations["post-v1-employees-employee_id-rehire"];
        /**
         * Delete an employee rehire
         * @description Delete an employee rehire. An employee rehire cannot be deleted if it's active (past effective date).
         *
         *     scope: `employments:write`
         */
        delete: operations["delete-v1-employees-employee_id-rehire"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/employees/{employee_id}/employment_history": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get employment history for an employee
         * @description Retrieve the employment history for a given employee, which includes termination and rehire.
         *
         *     scope: `employments:read`
         */
        get: operations["get-v1-employees-employee_id-employment_history"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/employees/{employee_id}/home_addresses": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get an employee's home addresses
         * @description The home address of an employee is used to determine certain tax information about them. Addresses are geocoded on create and update to ensure validity.
         *
         *     Supports home address effective dating and courtesy withholding.
         *
         *     scope: `employees:read`
         */
        get: operations["get-v1-employees-employee_id-home_addresses"];
        put?: never;
        /**
         * Create an employee's home address
         * @description The home address of an employee is used to determine certain tax information about them. Addresses are geocoded on create and update to ensure validity.
         *
         *     Supports home address effective dating and courtesy withholding.
         *
         *     scope: `employees:write`
         */
        post: operations["post-v1-employees-employee_id-home_addresses"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/home_addresses/{home_address_uuid}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get an employee's home address
         * @description The home address of an employee is used to determine certain tax information about them. Addresses are geocoded on create and update to ensure validity.
         *
         *     Supports home address effective dating and courtesy withholding.
         *
         *     scope: `employees:read`
         */
        get: operations["get-v1-home_addresses-home_address_uuid"];
        /**
         * Update an employee's home address
         * @description The home address of an employee is used to determine certain tax information about them. Addresses are geocoded on create and update to ensure validity.
         *
         *     Supports home address effective dating and courtesy withholding.
         *
         *     scope: `employees:write`
         */
        put: operations["put-v1-home_addresses-home_address_uuid"];
        post?: never;
        /**
         * Delete an employee's home address
         * @description Used for deleting an employee's home address.  Cannot delete the employee's active home address.
         *
         *     scope: `employees:write`
         */
        delete: operations["delete-v1-home_addresses-home_address_uuid"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/employees/{employee_id}/work_addresses": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get an employee's work addresses
         * @description Returns a list of an employee's work addresses. Each address includes its effective date and a boolean
         *     signifying if it is the currently active work address.
         *
         *     scope: `employees:read`
         */
        get: operations["get-v1-employees-employee_id-work_addresses"];
        put?: never;
        /**
         * Create an employee work address
         * @description The work address of an employee describes when an employee began working at an associated company location.
         *
         *     scope: `employees:manage`
         */
        post: operations["post-v1-employees-employee_id-work_addresses"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/work_addresses/{work_address_uuid}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get an employee work address
         * @description The work address of an employee is used for payroll tax purposes.
         *
         *     scope: `employees:read`
         */
        get: operations["get-v1-work_addresses-work_address_uuid"];
        /**
         * Update an employee work address
         * @description The work address of an employee is used for payroll tax purposes.
         *
         *     scope: `employees:manage`
         */
        put: operations["put-v1-work_addresses-work_address_uuid"];
        post?: never;
        /**
         * Delete an employee's work address
         * @description Used for deleting an employee's work address.  Cannot delete the employee's active work address.
         *
         *     scope: `employees:manage`
         */
        delete: operations["delete-v1-work_addresses-work_address_uuid"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/employees/{employee_id}/custom_fields": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get an employee's custom fields
         * @description Returns a list of the employee's custom fields.
         *
         *     scope: `employees:read`
         */
        get: operations["get-v1-employees-employee_id-custom_fields"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/employees/{employee_id}/onboarding_status": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get the employee's onboarding status
         * @description # Description
         *     Retrieves an employee's onboarding status. The data returned helps inform the required onboarding steps and respective completion status.
         *
         *     scope: `employees:read`
         *
         *     ## onboarding_status
         *
         *     ### Admin-facilitated onboarding
         *     | onboarding_status | Description |
         *     |:------------------|------------:|
         *     | `admin_onboarding_incomplete` | Admin needs to complete the full employee-onboarding. |
         *     | `onboarding_completed` | Employee has been fully onboarded and verified. |
         *
         *     ### Employee self-onboarding
         *     | onboarding_status | Description |
         *     |:------------------|------------:|
         *     | `admin_onboarding_incomplete` | Admin needs to enter basic information about the employee. |
         *     | `self_onboarding_pending_invite` | Admin has the intention to invite the employee to self-onboard (e.g., marking a checkbox), but the system has not yet sent the invitation. |
         *     | `self_onboarding_invited` | Employee has been sent an invitation to self-onboard. |
         *     | `self_onboarding_invited_started` | Employee has started the self-onboarding process. |
         *     | `self_onboarding_invited_overdue` | Employee's start date has passed, and employee has still not completed self-onboarding. |
         *     | `self_onboarding_completed_by_employee` | Employee has completed entering in their information. The status should be updated via API to "self_onboarding_awaiting_admin_review" from here, once the Admin has started reviewing. |
         *     | `self_onboarding_awaiting_admin_review` | Admin has started to verify the employee's information. |
         *     | `onboarding_completed` | Employee has been fully onboarded and verified. |
         *
         *     ## onboarding_steps
         *
         *     | onboarding_steps | Requirement(s) to be completed |
         *     |:-----------------|-------------------------------:|
         *     | `personal_details` | Add employee's first name, last name, email, date of birth, social security number |
         *     | `compensation_details` | Associate employee to a job & compensation. |
         *     | `add_work_address` | Add employee work address. |
         *     | `add_home_address` | Add employee home address. |
         *     | `federal_tax_setup` | Set up federal tax withholdings. |
         *     | `state_tax_setup` | Set up state tax withholdings. |
         *     | `direct_deposit_setup` | (optional) Set up employee's direct deposit. |
         *     | `employee_form_signing` | Employee forms (e.g., W4, direct deposit authorization) are generated & signed. |
         *     | `file_new_hire_report` | File a new hire report for this employee. |
         *     | `admin_review` | Admin reviews & confirms employee details (only required for Employee self-onboarding) |
         */
        get: operations["get-v1-employees-employee_id-onboarding_status"];
        /**
         * Update the employee's onboarding status
         * @description scope: `employees:manage`
         *
         *     Updates an employee's onboarding status.
         *     Below is a list of valid onboarding status changes depending on the intended action to be performed on behalf of the employee.
         *
         *     | Action | current onboarding_status | new onboarding_status |
         *     |:------------------|:------------:|----------:|
         *     | Mark an employee as self-onboarding | `admin_onboarding_incomplete` | `self_onboarding_pending_invite` |
         *     | Invite an employee to self-onboard | `admin_onboarding_incomplete` or `self_onboarding_pending_invite` | `self_onboarding_invited` |
         *     | Cancel an employee's self-onboarding | `self_onboarding_invited` or `self_onboarding_pending_invite` | `admin_onboarding_incomplete` |
         *     | Review an employee's self-onboarded info | `self_onboarding_completed_by_employee` | `self_onboarding_awaiting_admin_review` |
         *     | Finish an employee's onboarding | `admin_onboarding_incomplete` or `self_onboarding_awaiting_admin_review` | `onboarding_completed` |
         */
        put: operations["put-v1-employees-employee_id-onboarding_status"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/employees/{employee_id}/finish_onboarding": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Finish onboarding an employee
         * @description This endpoint is currently supported but will eventually be deprecated; please use `/v1/employees/{employee_id}/onboarding_status` instead.
         *
         *     Call this endpoint as the very last step of employee onboarding to complete their onboarding. When successful, the employee's `onboarded` attribute will be updated to true, indicating that they can be included in company's payrolls.
         */
        put: operations["put-v1-employee-finish-onboarding"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/employees/{employee_uuid}/federal_taxes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get an employee's federal taxes
         * @description Get attributes relevant for an employee's federal taxes.
         *
         *      scope: `employee_federal_taxes:read`
         */
        get: operations["get-v1-employees-employee_id-federal_taxes"];
        /**
         * Update an employee's federal taxes
         * @description Update attributes relevant for an employee's federal taxes.
         *
         *     scope: `employee_federal_taxes:write`
         */
        put: operations["put-v1-employees-employee_id-federal_taxes"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/employees/{employee_uuid}/state_taxes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get an employee's state taxes
         * @description Get attributes relevant for an employee's state taxes.
         *
         *     The data required to correctly calculate an employee's state taxes varies by both home and work location. This API returns information about each question that must be answered grouped by state. Mostly commonly, an employee lives and works in the same state and will only have questions for a single state. The response contains metadata about each question, the type of answer expected, and the current answer stored in Gusto for that question.
         *
         *     Answers are represented by an array. Today, this array can only be empty or contain exactly one element, but is designed to allow for forward compatibility with effective-dated fields. Until effective dated answers are supported, the `valid_from` and `valid_up_to` must always be `"2010-01-01"` and `null` respectively.
         *
         *     ## About filing new hire reports
         *     Payroll Admins are responsible for filing a new hire report for each Employee. The `file_new_hire_report` question will only be listed if:
         *     - the `employee.onboarding_status` is one of the following:
         *       - `admin_onboarding_incomplete`
         *       - `self_onboarding_awaiting_admin_review`
         *     - that employee's work state requires filing a new hire report
         *
         *     scope: `employee_state_taxes:read`
         *
         */
        get: operations["get-v1-employees-employee_id-state_taxes"];
        /**
         * Update an employee's state taxes
         * @description Update attributes relevant for an employee's state taxes.
         *
         *     As described for the GET endpoint, the answers must be supplied in the effective-dated format, but currently only a single answer will be accepted - `valid_from` and `valid_up_to` must be `"2010-01-01"` and `null` respectively.
         *
         *     scope: `employee_state_taxes:write`
         */
        put: operations["put-v1-employees-employee_id-state_taxes"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/employees/{employee_id}/bank_accounts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get all employee bank accounts
         * @description Returns all employee bank accounts.
         *
         *     scope: `employee_payment_methods:read`
         */
        get: operations["get-v1-employees-employee_id-bank_accounts"];
        put?: never;
        /**
         * Create an employee bank account
         * @description Creates an employee bank account. An employee can have multiple
         *     bank accounts. Note that creating an employee bank account will also update
         *     the employee's payment method.
         *
         *     scope: `employee_payment_methods:write`
         */
        post: operations["post-v1-employees-employee_id-bank_accounts"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/employees/{employee_id}/bank_accounts/{bank_account_uuid}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Update an employee bank account
         * @description Updates an employee bank account.
         *
         *     scope: `employee_payment_methods:write`
         */
        put: operations["put-v1-employees-employee_id-bank_accounts"];
        post?: never;
        /**
         * Delete an employee bank account
         * @description Deletes an employee bank account. To update an employee's bank
         *     account details, delete the bank account first and create a new one.
         *
         *     scope: `employee_payment_methods:write`
         */
        delete: operations["delete-v1-employees-employee_id-bank_accounts-bank_account_id"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/employees/{employee_id}/payment_method": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get an employee's payment method
         * @description Fetches an employee's payment method. An employee payment method
         *     describes how the payment should be split across the employee's associated
         *     bank accounts.
         *
         *     scope: `employee_payment_methods:read`
         */
        get: operations["get-v1-employees-employee_id-payment_method"];
        /**
         * Update an employee's payment method
         * @description Updates an employee's payment method. Note that creating an employee
         *     bank account will also update the employee's payment method.
         *
         *     scope: `employee_payment_methods:write`
         */
        put: operations["put-v1-employees-employee_id-payment_method"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/employees/{employee_id}/jobs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get jobs for an employee
         * @description Get all of the jobs that an employee holds.
         *
         *     scope: `jobs:read`
         */
        get: operations["get-v1-employees-employee_id-jobs"];
        put?: never;
        /**
         * Create a job
         * @description Create a job.
         *
         *     scope: `jobs:write`
         */
        post: operations["post-v1-jobs-job_id"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/employees/{employee_uuid}/time_off_activities": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get employee time off activities
         * @description Get employee time off activities.
         *
         *     scope: `employee_time_off_activities:read`
         */
        get: operations["get-version-employees-time_off_activities"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/jobs/{job_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get a job
         * @description Get a job.
         *
         *     scope: `jobs:read`
         */
        get: operations["get-v1-jobs-job_id"];
        /**
         * Update a job
         * @description Update a job.
         *
         *     scope: `jobs:write`
         */
        put: operations["put-v1-jobs-job_id"];
        post?: never;
        /**
         * Delete an individual job
         * @description Deletes a specific job that an employee holds.
         *
         *     scope: `jobs:write`
         */
        delete: operations["delete-v1-jobs-job_id"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/jobs/{job_id}/compensations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get compensations for a job
         * @description Compensations contain information on how much is paid out for a job. Jobs may have many compensations, but only one that is active. The current compensation is the one with the most recent `effective_date`. By default the API returns only the current compensation - see the `include` query parameter for retrieving all compensations.
         *
         *     Note: Currently the API does not support creating multiple compensations per job - creating a compensation with the same `job_uuid` as another will fail with a relevant error.
         *
         *     Use `flsa_status` to determine if an employee is eligible for overtime.
         *
         *     scope: `jobs:read`
         */
        get: operations["get-v1-jobs-job_id-compensations"];
        put?: never;
        /**
         * Create a compensation
         * @description Compensations contain information on how much is paid out for a job. Jobs may have many compensations, but only one that is active. The current compensation is the one with the most recent `effective_date`.
         *
         *     scope: `jobs:write`
         */
        post: operations["post-v1-compensations-compensation_id"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/compensations/{compensation_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get a compensation
         * @description Compensations contain information on how much is paid out for a job. Jobs may have many compensations, but only one that is active. The current compensation is the one with the most recent `effective_date`.
         *
         *     scope: `jobs:read`
         *
         */
        get: operations["get-v1-compensations-compensation_id"];
        /**
         * Update a compensation
         * @description Compensations contain information on how much is paid out for a job. Jobs may have many compensations, but only one that is active. The current compensation is the one with the most recent `effective_date`.
         *
         *     scope: `jobs:write`
         */
        put: operations["put-v1-compensations-compensation_id"];
        post?: never;
        /**
         * Delete a compensation
         * @description Compensations contain information on how much is paid out for a job. Jobs may have many compensations, but only one that is active. The current compensation is the one with the most recent `effective_date`. This endpoint deletes a compensation for a job that hasn't been processed on payroll.
         *
         *     scope: `jobs:write`
         *
         */
        delete: operations["delete-v1-compensations-compensation_id"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/companies/{company_id}/earning_types": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get all earning types for a company
         * @description A payroll item in Gusto is associated to an earning type to name the type of earning described by the payroll item.
         *
         *     #### Default Earning Type
         *     Certain earning types are special because they have tax considerations. Those earning types are mostly the same for every company depending on its legal structure (LLC, Corporation, etc.)
         *
         *     #### Custom Earning Type
         *     Custom earning types are all the other earning types added specifically for a company.
         *
         *     scope: `payrolls:read`
         */
        get: operations["get-v1-companies-company_id-earning_types"];
        put?: never;
        /**
         * Create a custom earning type
         * @description Create a custom earning type.
         *
         *     If an inactive earning type exists with the same name, this will reactivate it instead of creating a new one.
         *
         *     scope: `payrolls:write`
         */
        post: operations["post-v1-companies-company_id-earning_types"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/companies/{company_id}/earning_types/{earning_type_uuid}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Update an earning type
         * @description Update an earning type.
         *
         *     scope: `payrolls:write`
         */
        put: operations["put-v1-companies-company_id-earning_types-earning_type_uuid"];
        post?: never;
        /**
         * Deactivate an earning type
         * @description Deactivate an earning type.
         *
         *     scope: `payrolls:write`
         */
        delete: operations["delete-v1-companies-company_id-earning_types-earning_type_uuid"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/companies/{company_id}/contractors": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get contractors of a company
         * @description Get all contractors, active and inactive, individual and business, for a company.
         *
         *     scope: `contractors:read`
         */
        get: operations["get-v1-companies-company_id-contractors"];
        put?: never;
        /**
         * Create a contractor
         * @description Create an individual or business contractor.
         *
         *     scope: `contractors:manage`
         */
        post: operations["post-v1-companies-company_id-contractors"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/contractors/{contractor_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get a contractor
         * @description Get a contractor.
         *
         *     scope: `contractors:read`
         */
        get: operations["get-v1-contractors-contractor_id"];
        /**
         * Update a contractor
         * @description Update a contractor.
         *
         *     scope: `contractors:write`
         *
         *     > 🚧 Warning
         *     >
         *     > Watch out when changing a contractor's type (when the contractor is finished onboarding). Specifically, changing contractor type can be dangerous since Gusto won’t recognize and file two separate 1099s if they simply change from business to individual
         */
        put: operations["put-v1-contractors-contractor_id"];
        post?: never;
        /**
         * Delete a contractor
         * @description A contractor can only be deleted when there are no contractor payments.
         *
         *     scope: `contractors:manage`
         */
        delete: operations["delete-v1-contractors-contractor_id"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/contractors/{contractor_uuid}/bank_accounts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get all contractor bank accounts
         * @description Returns all contractor bank accounts.
         *
         *     scope: `contractor_payment_methods:read`
         */
        get: operations["get-v1-contractors-contractor_uuid-bank_accounts"];
        put?: never;
        /**
         * Create a contractor bank account
         * @description Creates a contractor bank account.
         *
         *     Note: We currently only support one bank account per contractor. Using this endpoint on a contractor who already has a bank account will just replace it.
         *
         *     scope: `contractor_payment_methods:write`
         */
        post: operations["post-v1-contractors-contractor_uuid-bank_accounts"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/webhook_subscriptions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List webhook subscriptions
         * @description Returns all webhook subscriptions associated with the provided Partner API token.
         *
         *     > 📘 System Access Authentication
         *     >
         *     > This endpoint uses the [Bearer Auth scheme with the system-level access token in the HTTP Authorization header](https://docs.gusto.com/embedded-payroll/docs/system-access).
         *
         *     scope: `webhook_subscriptions:read`
         */
        get: operations["get-v1-webhook-subscriptions"];
        put?: never;
        /**
         * Create a webhook subscription
         * @description Create a webhook subscription to receive events of the specified subscription_types whenever there is a state change.
         *
         *     > 📘 System Access Authentication
         *     >
         *     > This endpoint uses the [Bearer Auth scheme with the system-level access token in the HTTP Authorization header](https://docs.gusto.com/embedded-payroll/docs/system-access).
         *
         *     scope: `webhook_subscriptions:write`
         */
        post: operations["post-v1-webhook-subscription"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/webhook_subscriptions/{webhook_subscription_uuid}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get a webhook subscription
         * @description Returns the Webhook Subscription associated with the provided UUID.
         *
         *     > 📘 System Access Authentication
         *     >
         *     > This endpoint uses the [Bearer Auth scheme with the system-level access token in the HTTP Authorization header](https://docs.gusto.com/embedded-payroll/docs/system-access).
         *
         *     scope: `webhook_subscriptions:read`
         *
         */
        get: operations["get-v1-webhook-subscription-uuid"];
        /**
         * Update a webhook subscription
         * @description Updates the Webhook Subscription associated with the provided UUID.
         *
         *     > 📘 System Access Authentication
         *     >
         *     > This endpoint uses the [Bearer Auth scheme with the system-level access token in the HTTP Authorization header](https://docs.gusto.com/embedded-payroll/docs/system-access).
         *
         *     scope: `webhook_subscriptions:write`
         *
         */
        put: operations["put-v1-webhook-subscription-uuid"];
        post?: never;
        /**
         * Delete a webhook subscription
         * @description Deletes the Webhook Subscription associated with the provided UUID.
         *
         *     > 📘 System Access Authentication
         *     >
         *     > This endpoint uses the [Bearer Auth scheme with the system-level access token in the HTTP Authorization header](https://docs.gusto.com/embedded-payroll/docs/system-access).
         *
         *     scope: `webhook_subscriptions:write`
         *
         */
        delete: operations["delete-v1-webhook-subscription-uuid"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/webhook_subscriptions/{webhook_subscription_uuid}/verify": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Verify the webhook subscription
         * @description When a webhook subscription is created, a `verification_token` is POSTed to the registered webhook subscription URL. This `verify` endpoint needs to be called with `verification_token` before webhook events can be sent to the registered webhook URL.
         *
         *     Use the /v1/webhook_subscriptions/{webhook_subscription_uuid}/request_verification_token API to resend the `verification_token` to the Subscriber.
         *
         *     > 📘 System Access Authentication
         *     >
         *     > This endpoint uses the [Bearer Auth scheme with the system-level access token in the HTTP Authorization header](https://docs.gusto.com/embedded-payroll/docs/system-access).
         *
         *     scope: `webhook_subscriptions:write`
         *
         */
        put: operations["put-v1-verify-webhook-subscription-uuid"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/webhook_subscriptions/{webhook_subscription_uuid}/request_verification_token": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Request the webhook subscription verification_token
         * @description Request that the webhook subscription `verification_token` be POSTed to the Subscription URL.
         *
         *     > 📘 System Access Authentication
         *     >
         *     > This endpoint uses the [Bearer Auth scheme with the system-level access token in the HTTP Authorization header](https://docs.gusto.com/embedded-payroll/docs/system-access).
         *
         *     scope: `webhook_subscriptions:read`
         *
         */
        get: operations["get-v1-webhook-subscription-verification-token-uuid"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/contractors/{contractor_uuid}/forms": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get all contractor forms
         * @description Get a list of all contractor's forms
         *
         *     scope: `contractor_forms:read`
         */
        get: operations["get-v1-contractor-forms"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/contractors/{contractor_uuid}/forms/{form_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get a contractor form
         * @description Get a contractor form
         *
         *     scope: `contractor_forms:read`
         */
        get: operations["get-v1-contractor-form"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/contractors/{contractor_uuid}/forms/{form_id}/pdf": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get the contractor form pdf
         * @description Get the link to the form PDF
         *
         *     scope: `contractor_forms:read`
         */
        get: operations["get-v1-contractor-form-pdf"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/sandbox/generate_1099": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Generate a 1099 form [DEMO]
         * @description > 🚧 Demo action
         *     >
         *     > This action is only available in the Demo environment
         *
         *     Generates a 1099 document for testing purposes.
         *
         *     scope: `contractors:write`
         */
        post: operations["post-v1-sandbox-generate_1099"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/sandbox/generate_w2": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Generate a W2 form [DEMO]
         * @description > 🚧 Demo action
         *     >
         *     > This action is only available in the Demo environment
         *
         *     Generates a W2 document for testing purposes.
         *
         *     scope: `employees:write`
         */
        post: operations["post-v1-sandbox-generate_w2"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/contractors/{contractor_uuid}/payment_method": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get a contractor's payment method
         * @description Fetches a contractor's payment method. A contractor payment method
         *     describes how the payment should be split across the contractor's associated
         *     bank accounts.
         *
         *     scope: `contractor_payment_methods:read`
         */
        get: operations["get-v1-contractors-contractor_uuid-payment_method"];
        /**
         * Update a contractor's payment method
         * @description Updates a contractor's payment method. Note that creating a contractor
         *     bank account will also update the contractor's payment method.
         *
         *     scope: `contractor_payment_methods:write`
         */
        put: operations["put-v1-contractors-contractor_id-payment_method"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/contractors/{contractor_uuid}/onboarding_status": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get the contractor's onboarding status
         * @description Retrieves a contractor's onboarding status. The data returned helps inform the required onboarding steps and respective completion status.
         *
         *     scope: `contractors:read`
         *
         *     ## onboarding_status
         *
         *     ### Admin-facilitated onboarding
         *     | onboarding_status | Description |
         *     |:------------------|------------:|
         *     | `admin_onboarding_incomplete` | Admin needs to enter basic information about the contractor. |
         *     | `admin_onboarding_review` | All information has been completed and admin needs to confirm onboarding. |
         *     | `onboarding_completed` | Contractor has been fully onboarded and verified. |
         *
         *     ### Contractor self-onboarding
         *
         *     | onboarding_status | Description |
         *     | --- | ----------- |
         *     | `admin_onboarding_incomplete` | Admin needs to enter basic information about the contractor. |
         *     | `self_onboarding_not_invited` | Admin has the intention to invite the contractor to self-onboard (e.g., marking a checkbox), but the system has not yet sent the invitation. |
         *     | `self_onboarding_invited` | Contractor has been sent an invitation to self-onboard. |
         *     | `self_onboarding_started` | Contractor has started the self-onboarding process. |
         *     | `self_onboarding_review` | Admin needs to review contractors's entered information and confirm onboarding. |
         *     | `onboarding_completed` | Contractor has been fully onboarded and verified. |
         *
         *     ## onboarding_steps
         *
         *     | onboarding_steps | Requirement(s) to be completed |
         *     |:-----------------|-------------------------------:|
         *     | `basic_details` | Add individual contractor's first name, last name, social security number or Business name and EIN depending on the contractor type |
         *     | `add_address` | Add contractor address. |
         *     | `compensation_details` | Add contractor compensation. |
         *     | `payment_details` | Set up contractor's direct deposit or set to check. |
         *     | `sign_documents` | Contractor forms (e.g., W9) are generated & signed. |
         *     | `file_new_hire_report` | Contractor new hire report is generated. |
         */
        get: operations["get-v1-contractors-contractor_uuid-onboarding_status"];
        /**
         * Change the contractor's onboarding status
         * @description Updates a contractor's onboarding status.
         *
         *     scope: `contractors:write`
         *
         *     Below is a list of valid onboarding status changes depending on the intended action to be performed on behalf of the contractor.
         *
         *     | Action | current onboarding_status | new onboarding_status |
         *     |:------------------|:------------:|----------:|
         *     | Mark a contractor as self-onboarding | `admin_onboarding_incomplete` | `self_onboarding_not_invited` |
         *     | Invite a contractor to self-onboard | `admin_onboarding_incomplete` or `self_onboarding_not_invited` | `self_onboarding_invited` |
         *     | Cancel a contractor's self-onboarding | `self_onboarding_invited` or `self_onboarding_not_invited` | `admin_onboarding_incomplete` |
         *     | Review a contractor's self-onboarded info | `self_onboarding_started` | `self_onboarding_review` |
         *     | Finish a contractor's onboarding | `admin_onboarding_incomplete` or `self_onboarding_review` | `onboarding_completed` |
         */
        put: operations["put-v1-contractors-contractor_uuid-onboarding_status"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/contractors/{contractor_uuid}/address": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get a contractor address
         * @description The address of a contractor is used to determine certain tax information about them. Addresses are geocoded on create and update to ensure validity.
         *
         *     scope: `contractors:read`
         */
        get: operations["get-v1-contractors-contractor_uuid-address"];
        /**
         * Update a contractor's address
         * @description The address of a contractor is used to determine certain tax information about them. Addresses are geocoded on create and update to ensure validity.
         *
         *     scope: `contractors:write`
         */
        put: operations["put-v1-contractors-contractor_uuid-address"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/companies/{company_id}/payrolls": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get all payrolls for a company
         * @description Returns a list of payrolls for a company. You can change the payrolls returned by updating the processing_status, payroll_types, start_date, & end_date params.
         *
         *     By default, will return processed, regular payrolls for the past 6 months.
         *
         *     Notes:
         *     * Dollar amounts are returned as string representations of numeric decimals, are represented to the cent.
         *     * end_date can be at most 3 months in the future and start_date and end_date can't be more than 1 year apart.
         *
         *     scope: `payrolls:read`
         */
        get: operations["get-v1-companies-company_id-payrolls"];
        put?: never;
        /**
         * Create an off-cycle payroll
         * @description Creates a new, unprocessed, off-cycle payroll.
         *
         *     ## `off_cycle_reason`
         *     - External benefits and deductions will be included when the `off_cycle_reason` is set to `Correction`.
         *     - All benefits and deductions are blocked when the `off_cycle_reason` is set to `Bonus`.
         *
         *     scope: `payrolls:run`
         */
        post: operations["post-v1-companies-company_id-payrolls"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/companies/{company_id}/payroll_reversals": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get approved payroll reversals
         * @description Returns all approved Payroll Reversals for a Company.
         *
         *     scope: `payrolls:read`
         */
        get: operations["get-v1-companies-company_id-payroll_reversals"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/companies/{company_id}/payrolls/{payroll_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get a single payroll
         * @description Returns a payroll. If payroll is calculated or processed, will return employee_compensations and totals.
         *
         *     Notes:
         *     * Hour and dollar amounts are returned as string representations of numeric decimals.
         *     * Hours are represented to the thousands place; dollar amounts are represented to the cent.
         *     * Every eligible compensation is returned for each employee. If no data has yet be inserted for a given field, it defaults to “0.00” (for fixed amounts) or “0.000” (for hours ).
         *     * To return future payrolls, you must include an `end_date` in the future.
         *     * To return future payrolls, you must include an `end_date` in the future.
         *     * When include parameter with benefits value is passed, employee_benefits:read scope is required to return benefits
         *       * Benefits containing PHI are only visible with the `employee_benefits:read:phi` scope
         *
         *     scope: `payrolls:read`
         */
        get: operations["get-v1-companies-company_id-payrolls-payroll_id"];
        /**
         * Update a payroll by ID
         * @description This endpoint allows you to update information for one or more employees for a specific **unprocessed** payroll.  You can think of the **unprocessed**
         *     payroll object as a template of fields that you can update.  You cannot modify the structure of the payroll object through this endpoint, only values
         *     of the fields included in the payroll.  If you do not include specific employee compensations or fixed/hourly compensations in your request body, they
         *     will not be removed from the payroll.
         *
         *     scope: `payrolls:write`
         */
        put: operations["put-v1-companies-company_id-payrolls"];
        post?: never;
        /**
         * Delete a payroll
         * @description This endpoint allows you to delete an **unprocessed** payroll.
         *
         *     By default the payroll and associated data is deleted synchronously. To request an asynchronous delete, use the `async=true` query parameter. In both cases validation of ability to delete will be performed and an Unprocessable Entity error will be returned if the payroll is not able to be deleted. A successful synchronous delete will return `204/No Content`. When a payroll has been enqueued for asynchronous deletion, `202/Accepted` will be returned.
         *
         *     scope: `payrolls:run`
         */
        delete: operations["delete-v1-companies-company_id-payrolls"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/companies/{company_id}/payrolls/{payroll_id}/prepare": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Prepare a payroll for update
         * @description This endpoint will build the payroll and get it ready for making updates. This includes adding/removing eligible employees from the Payroll and updating the check_date, payroll_deadline, and payroll_status_meta dates & times.
         *
         *     Notes:
         *      * Will null out calculated_at & totals if a payroll has already been calculated.
         *      * Will return the version param used for updating the payroll
         *
         *     scope: `payrolls:write`
         */
        put: operations["put-v1-companies-company_id-payrolls-payroll_id-prepare"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/payrolls/{payroll_uuid}/receipt": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get a single payroll receipt
         * @description Returns a payroll receipt.
         *
         *     Notes:
         *     * Hour and dollar amounts are returned as string representations of numeric decimals.
         *     * Dollar amounts are represented to the cent.
         *     * If no data has yet be inserted for a given field, it defaults to “0.00” (for fixed amounts).
         *
         *     scope: `payrolls:read`
         */
        get: operations["get-v1-payment-receipts-payrolls-payroll_uuid"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/payrolls/{payroll_id}/employees/{employee_id}/calculate_accruing_time_off_hours": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Calculate accruing time off hours
         * @description Returns a list of accruing time off for each time off policy associated with the employee.
         *
         *     Factors affecting the accrued hours:
         *       * the time off policy accrual method (whether they get pay per hour worked, per hour paid, with / without overtime, accumulate time off based on pay period / calendar year / anniversary)
         *       * how many hours of work during this pay period
         *       * how many hours of PTO / sick hours taken during this pay period (for per hour paid policies only)
         *       * company pay schedule frequency (for per pay period)
         *
         *     If none of the parameters is passed in, the accrued time off hour will be 0.
         *
         *     scope: `payrolls:read`
         */
        post: operations["post-v1-payrolls-payroll_id-calculate_accruing_time_off_hours"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/companies/{company_uuid}/payrolls/blockers": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get all payroll blockers for a company
         * @description Returns a list of reasons that prevent the company from running payrolls. See the [payroll blockers guide](https://docs.gusto.com/embedded-payroll/docs/payroll-blockers) for a complete list of reasons.
         *
         *     The list is empty if there are no payroll blockers.
         *
         *     scope: `payrolls:run`
         */
        get: operations["get-v1-companies-payroll-blockers-company_uuid"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/companies/{company_uuid}/payrolls/skip": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Skip a payroll
         * @description Submits a $0 payroll for employees associated with the pay schedule to skip payroll. This submission is asynchronous and a successful request responds with a 202 HTTP status. Upon success, the payroll is transitioned to the `processed` state.
         *
         *     If the company is blocked from running payroll due to issues like incomplete setup, missing information or other compliance issues, the response will be 422 Unprocessable Entity with a categorization of the blockers as described in the error responses.
         *
         *     scope: `payrolls:run`
         */
        post: operations["post-companies-payroll-skip-company_uuid"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/payrolls/{payroll_uuid}/gross_up": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Calculate gross up
         * @description Calculates gross up earnings for an employee's payroll, given net earnings. This endpoint is only applicable to off-cycle unprocessed payrolls.
         *
         *     The gross up amount must then be mapped to the corresponding fixed compensation earning type to get the correct payroll amount. For example, for bonus off-cycles, the gross up amount should be set with the Bonus earning type in the payroll `fixed_compensations` field.
         *
         *     scope: `payrolls:run`
         */
        post: operations["post-payrolls-gross-up-payroll_uuid"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/contractor_payments/{contractor_payment_uuid}/receipt": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get a single contractor payment receipt
         * @description Returns a contractor payment receipt.
         *
         *     Notes:
         *     * Receipts are only available for direct deposit payments and are only available once those payments have been funded.
         *     * Payroll Receipt requests for payrolls which do not have receipts available (e.g. payment by check) will return a 404 status.
         *     * Hour and dollar amounts are returned as string representations of numeric decimals.
         *     * Dollar amounts are represented to the cent.
         *     * If no data has yet be inserted for a given field, it defaults to “0.00” (for fixed amounts).
         *
         *     scope: `payrolls:read`
         */
        get: operations["get-v1-contractor_payments-contractor_payment_uuid-receipt"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/contractor_payments/{contractor_payment_uuid}/fund": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Fund a contractor payment [DEMO]
         * @description > 🚧 Demo action
         *     >
         *     > This action is only available in the Demo environment
         *
         *     Simulate funding a contractor payment. Funding only occurs automatically in the production environment when bank transactions are generated. Use this action in the demo environment to transition a contractor payment's `status` from `Unfunded` to `Funded`. A `Funded` status is required for generating a contractor payment receipt.
         *
         *     scope: `payrolls:run`
         */
        put: operations["get-v1-contractor_payments-contractor_payment_uuid-fund"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/companies/{company_id}/payrolls/{payroll_id}/calculate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Calculate a payroll
         * @description Performs calculations for taxes, benefits, and deductions for an unprocessed payroll. The calculated payroll details provide a preview of the actual values that will be used when the payroll is run.
         *
         *     This calculation is asynchronous and a successful request responds with a 202 HTTP status. To view the details of the calculated payroll, use the GET /v1/companies/{company_id}/payrolls/{payroll_id} endpoint with *include=taxes,benefits,deductions* params.
         *     In v2023-04-01, *show_calculation=true* is no longer required.
         *
         *     If the company is blocked from running payroll due to issues like incomplete setup, missing information or other compliance issues, the response will be 422 Unprocessable Entity with a categorization of the blockers as described in the error responses.
         */
        put: operations["put-v1-companies-company_id-payrolls-payroll_id-calculate"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/companies/{company_id}/payrolls/{payroll_id}/submit": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Submit payroll
         * @description Submits an unprocessed payroll to be calculated and run. This submission is asynchronous and a successful request responds with a 202 HTTP status. Upon success, transitions the payroll to the `processed` state.
         *
         *     If the company is blocked from running payroll due to issues like incomplete setup, missing information or other compliance issues, the response will be 422 Unprocessable Entity with a categorization of the blockers as described in the error responses.
         *
         *     scope: `payrolls:run`
         */
        put: operations["put-v1-companies-company_id-payrolls-payroll_id-submit"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/companies/{company_id}/payrolls/{payroll_id}/cancel": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Cancel a payroll
         * @description Transitions a `processed` payroll back to the `unprocessed` state. A payroll can be canceled if it meets both criteria:
         *     - `processed` is true
         *     - Current time is earlier than 3:30pm PT on the payroll_deadline
         *
         *     scope: `payrolls:run`
         *
         */
        put: operations["put-api-v1-companies-company_id-payrolls-payroll_id-cancel"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/companies/{company_id}/contractor_payments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get contractor payments for a company
         * @description Returns an object containing individual contractor payments, within a given time period, including totals.
         *
         *     scope: `payrolls:read`
         */
        get: operations["get-v1-companies-company_id-contractor_payments"];
        put?: never;
        /**
         * Create a contractor payment
         * @description Pay a contractor. Information needed depends on the contractor's wage type (hourly vs fixed)
         *
         *     scope: `payrolls:run`
         */
        post: operations["post-v1-companies-company_id-contractor_payments"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/companies/{company_id}/contractor_payments/{contractor_payment_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get a single contractor payment
         * @description Returns a single contractor payment.
         *     scope: `payrolls:read`
         */
        get: operations["get-v1-companies-company_id-contractor_payment-contractor-payment"];
        put?: never;
        post?: never;
        /**
         * Cancel a contractor payment
         * @description Cancels and deletes a contractor payment. If the contractor payment has already started processing, the payment cannot be cancelled.
         *
         *     scope: `payrolls:run`
         */
        delete: operations["delete-v1-companies-company_id-contractor_payment-contractor-payment"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/companies/{company_id}/contractor_payment_groups": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get contractor payment groups for a company
         * @description Returns a list of minimal contractor payment groups within a given time period, including totals but not associated contractor payments.
         *
         *     scope: `payrolls:read`
         */
        get: operations["get-v1-companies-company_id-contractor_payment_groups"];
        put?: never;
        /**
         * Create a contractor payment group
         * @description Pay a group of contractors. Information needed depends on the contractor's wage type (hourly vs fixed)
         *
         *     scope: `payrolls:run`
         */
        post: operations["post-v1-companies-company_id-contractor_payment_groups"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/companies/{company_id}/contractor_payment_groups/preview": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Preview a contractor payment group
         * @description Preview a group of contractor payments. Request will validate inputs and return preview of the contractor payment group including the expected debit_date.  Uuid will be null in the response.
         *
         *     scope: `payrolls:read`
         */
        post: operations["post-v1-companies-company_id-contractor_payment_groups-preview"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/contractor_payment_groups/{contractor_payment_group_uuid}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Fetch a contractor payment group
         * @description Returns a contractor payment group with all associated contractor payments.
         *
         *     scope: `payrolls:read`
         */
        get: operations["get-v1-contractor_payment_groups-contractor_payment_group_id"];
        put?: never;
        post?: never;
        /**
         * Cancel a contractor payment group
         * @description Cancels a contractor payment group and all associated contractor payments. All contractor payments must be cancellable, unfunded.
         *
         *     scope: `payrolls:run`
         */
        delete: operations["delete-v1-contractor_payment_groups-contractor_payment_group_id"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/contractor_payment_groups/{contractor_payment_group_uuid}/fund": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Fund a contractor payment group [DEMO]
         * @description > 🚧 Demo action
         *     >
         *     > This action is only available in the Demo environment
         *
         *     Simulate funding a contractor payment group. Funding only occurs automatically in the production environment when bank transactions are generated. Use this action in the demo environment to transition a contractor payment group's `status` from `Unfunded` to `Funded`. A `Funded` status is required for generating a contractor payment receipt.
         *
         *     scope: `payrolls:run`
         */
        put: operations["put-v1-contractor_payment_groups-contractor_payment_group_id-fund"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/companies/{company_id}/forms": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get all company forms
         * @description Get a list of all company's forms
         *
         *     scope: `company_forms:read`
         */
        get: operations["get-v1-company-forms"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/forms/{form_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get a company form
         * @description Get a company form
         *
         *     scope: `company_forms:read`
         */
        get: operations["get-v1-company-form"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/forms/{form_id}/pdf": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get a company form pdf
         * @description Get the link to the form PDF
         *
         *     scope: `company_forms:read`
         */
        get: operations["get-v1-company-form-pdf"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/forms/{form_id}/sign": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Sign a company form
         * @description Sign a company form. Company forms must be signed by the company signatory.
         *
         *     scope: `company_forms:sign`
         */
        put: operations["put-v1-company-form-sign"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/employees/{employee_id}/forms": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get all employee forms
         * @description Get a list of all employee's forms
         *
         *     scope: `employee_forms:read`
         */
        get: operations["get-v1-employee-forms"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/employees/{employee_id}/forms/{form_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get an employee form
         * @description Get an employee form
         *
         *     scope: `employee_forms:read`
         */
        get: operations["get-v1-employee-form"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/employees/{employee_id}/forms/{form_id}/pdf": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get the employee form pdf
         * @description Get the link to the form PDF
         *
         *     scope: `employee_forms:read`
         */
        get: operations["get-v1-employee-form-pdf"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/employees/{employee_id}/forms/{form_id}/sign": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Sign an employee form
         * @description Sign an employee form
         *
         *     scope: `employee_forms:sign`
         */
        put: operations["put-v1-employee-form-sign"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/payrolls/{payroll_id}/employees/{employee_id}/pay_stub": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get an employee pay stub (pdf)
         * @description Get an employee's pay stub for the specified payroll. By default, an application/pdf response will be returned. No other content types are currently supported, but may be supported in the future.
         *
         *     scope: `pay_stubs:read`
         */
        get: operations["get-v1-payrolls-payroll_uuid-employees-employee_uuid-pay_stub"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/employees/{employee_id}/pay_stubs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get an employee's pay stubs
         * @description Get an employee's pay stubs
         *
         *     scope: `pay_stubs:read`
         */
        get: operations["get-v1-employees-employee_uuid-pay_stubs"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/generated_documents/{document_type}/{request_uuid}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get a generated document
         * @description Get a generated document given the request_uuid. The response will include the generation request's status and, if complete, the relevant document urls.
         *
         *     scope: `generated_documents:read`
         */
        get: operations["get-v1-generated_documents-document_type-request_uuid"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/payrolls/{payroll_id}/generated_documents/printable_payroll_checks": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Generate payroll printable checks (pdf)
         * @description This endpoint initiates the generation of employee checks for the payroll specified by payroll_id. A generation status and corresponding generated document request_uuid will be returned. Use the generated document GET endpoint with document_type: `printable_payroll_checks` and request_uuid to poll the check generation process and retrieve the generated check URL upon completion.
         *
         *     scope: `generated_documents:write`
         */
        post: operations["post-v1-payrolls-payroll_uuid-generated_documents-printable_payroll_checks"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/companies/{company_uuid}/reports": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Create a custom report
         * @description Create a custom report for a company. This endpoint initiates creating a custom report with custom columns, groupings, and filters. The `request_uuid` in the response can then be used to poll for the status and report URL upon completion using the report GET endpoint.
         *
         *     scope: `company_reports:write`
         */
        post: operations["post-companies-company_uuid-reports"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/reports/{report_uuid}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get a report
         * @description Get a company's report given the `request_uuid`. The response will include the report request's status and, if complete, the report URL.
         *
         *     scope: `company_reports:read`
         */
        get: operations["get-reports-report_uuid"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/companies/{company_uuid}/report_templates/{report_type}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get a report template
         * @description Get a company's report template. The only supported report type is `payroll_journal`. The resulting columns and groupings from this endpoint can be used as a guidance to create the report using the POST create report endpoint.
         *
         *     scope: `company_reports:write`
         */
        get: operations["get-companies-company_uuid-report-templates-report_type"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/companies/{company_id}/company_benefits": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get benefits for a company
         * @description Company benefits represent the benefits that a company is offering to employees. This ties together a particular supported benefit with the company-specific information for the offering of that benefit.
         *
         *     Note that company benefits can be deactivated only when no employees are enrolled.
         *
         *     Benefits containing PHI are only visible to applications with the `company_benefits:read:phi` scope.
         *
         *     scope: `company_benefits:read`
         */
        get: operations["get-v1-companies-company_id-company_benefits"];
        put?: never;
        /**
         * Create a company benefit
         * @description Company benefits represent the benefits that a company is offering to employees. This ties together a particular supported benefit with the company-specific information for the offering of that benefit.
         *
         *     Note that company benefits can be deactivated only when no employees are enrolled.
         *
         *     scope: `company_benefits:write`
         */
        post: operations["post-v1-companies-company_id-company_benefits"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/company_benefits/{company_benefit_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get a company benefit
         * @description Company benefits represent the benefits that a company is offering to employees. This ties together a particular supported benefit with the company-specific information for the offering of that benefit.
         *
         *     Note that company benefits can be deactivated only when no employees are enrolled.
         *
         *     When with_employee_benefits parameter with true value is passed, employee_benefits:read scope is required to return employee_benefits.
         *
         *     scope: `company_benefits:read`
         */
        get: operations["get-v1-company_benefits-company_benefit_id"];
        /**
         * Update a company benefit
         * @description Company benefits represent the benefits that a company is offering to employees. This ties together a particular supported benefit with the company-specific information for the offering of that benefit.
         *
         *     Note that company benefits can be deactivated only when no employees are enrolled.
         *
         *     scope: `company_benefits:write`
         */
        put: operations["put-v1-company_benefits-company_benefit_id"];
        post?: never;
        /**
         * Delete a company benefit
         * @description The following must be true in order to delete a company benefit
         *       - There are no employee benefits associated with the company benefit
         *       - There are no payroll items associated with the company benefit
         *       - The benefit is not managed by a Partner or by Gusto (type must be 'External')
         *
         *     scope: `company_benefits:write`
         */
        delete: operations["delete-v1-company_benefits-company_benefit_id"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/benefits": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get all benefits supported by Gusto
         * @description Returns all benefits supported by Gusto.
         *
         *     The benefit object in Gusto contains high level information about a particular benefit type and its tax considerations. When companies choose to offer a benefit, they are creating a Company Benefit object associated with a particular benefit.
         *
         *     scope: `benefits:read`
         */
        get: operations["get-v1-benefits"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/benefits/{benefit_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get a supported benefit by ID
         * @description Returns a benefit supported by Gusto.
         *
         *     The benefit object in Gusto contains high level information about a particular benefit type and its tax considerations. When companies choose to offer a benefit, they are creating a Company Benefit object associated with a particular benefit.
         *
         *     scope: `benefits:read`
         */
        get: operations["get-v1-benefits-benefit_id"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/company_benefits/{company_benefit_id}/summary": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get company benefit summary by company benefit id.
         * @description Returns summary benefit data for the requested company benefit id.
         *
         *     Benefits containing PHI are only visible to applications with the `company_benefits:read:phi` scope.
         *
         *     scope: `company_benefits:read`
         */
        get: operations["get-v1-benefits-company_benefit_id-summary"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/benefits/{benefit_id}/requirements": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get benefit fields requirements by ID
         * @description Returns field requirements for the requested benefit type.
         *
         *     scope: `benefits:read`
         */
        get: operations["get-v1-benefits-benefits_id-requirements"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/employees/{employee_id}/employee_benefits": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get all benefits for an employee
         * @description Employee benefits represent an employee enrolled in a particular company benefit. It includes information specific to that employee’s enrollment.
         *
         *     Returns an array of all employee benefits for this employee
         *
         *     Benefits containing PHI are only visible to applications with the `employee_benefits:read:phi` scope.
         *
         *     scope: `employee_benefits:read`
         */
        get: operations["get-v1-employees-employee_id-employee_benefits"];
        put?: never;
        /**
         * Create an employee benefit
         * @description Employee benefits represent an employee enrolled in a particular company benefit. It includes information specific to that employee’s enrollment.
         *
         *     scope: `employee_benefits:write`
         */
        post: operations["post-v1-employees-employee_id-employee_benefits"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/employee_benefits/{employee_benefit_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get an employee benefit
         * @description Employee benefits represent an employee enrolled in a particular company benefit. It includes information specific to that employee’s enrollment.
         *
         *     Benefits containing PHI are only visible to applications with the `employee_benefits:read:phi` scope.
         *
         *     scope: `employee_benefits:read`
         */
        get: operations["get-v1-employee_benefits-employee_benefit_id"];
        /**
         * Update an employee benefit
         * @description Employee benefits represent an employee enrolled in a particular company benefit. It includes information specific to that employee’s enrollment.
         *
         *     scope: `employee_benefits:write`
         */
        put: operations["put-v1-employee_benefits-employee_benefit_id"];
        post?: never;
        /**
         * Delete an employee benefit
         * @description Employee benefits represent an employee enrolled in a particular company benefit. It includes information specific to that employee’s enrollment.
         *
         *     scope: `employee_benefits:write`
         */
        delete: operations["delete-v1-employee_benefits-employee_benefit_id"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/employees/{employee_id}/ytd_benefit_amounts_from_different_company": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Create year-to-date benefit amounts from a different company
         * @description Year-to-date benefit amounts from a different company represents the amount of money added to an employee's plan during a current year, made outside of the current contribution when they were employed at a different company.
         *
         *     This endpoint only supports passing outside contributions for 401(k) benefits.
         *
         *     scope: `employee_benefits:write`
         */
        post: operations["post-employee-ytd-benefit-amounts-from-different-company"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/employees/{employee_id}/garnishments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get garnishments for an employee
         * @description Garnishments, or employee deductions, are fixed amounts or percentages deducted from an employee’s pay. They can be deducted a specific number of times or on a recurring basis. Garnishments can also have maximum deductions on a yearly or per-pay-period bases. Common uses for garnishments are court-ordered payments for child support or back taxes. Some companies provide loans to their employees that are repaid via garnishments.
         *
         *     scope: `garnishments:read`
         */
        get: operations["get-v1-employees-employee_id-garnishments"];
        put?: never;
        /**
         * Create a garnishment
         * @description Garnishments, or employee deductions, are fixed amounts or percentages deducted from an employee’s pay. They can be deducted a specific number of times or on a recurring basis. Garnishments can also have maximum deductions on a yearly or per-pay-period bases. Common uses for garnishments are court-ordered payments for child support or back taxes. Some companies provide loans to their employees that are repaid via garnishments.
         *
         *     scope: `garnishments:write`
         */
        post: operations["post-v1-employees-employee_id-garnishments"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/garnishments/{garnishment_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get a garnishment
         * @description Garnishments, or employee deductions, are fixed amounts or percentages deducted from an employee’s pay. They can be deducted a specific number of times or on a recurring basis. Garnishments can also have maximum deductions on a yearly or per-pay-period bases. Common uses for garnishments are court-ordered payments for child support or back taxes. Some companies provide loans to their employees that are repaid via garnishments.
         *
         *     scope: `garnishments:read`
         */
        get: operations["get-v1-garnishments-garnishment_id"];
        /**
         * Update a garnishment
         * @description Garnishments, or employee deductions, are fixed amounts or percentages deducted from an employee’s pay. They can be deducted a specific number of times or on a recurring basis. Garnishments can also have maximum deductions on a yearly or per-pay-period bases. Common uses for garnishments are court-ordered payments for child support or back taxes. Some companies provide loans to their employees that are repaid via garnishments.
         *
         *     scope: `garnishments:write`
         */
        put: operations["put-v1-garnishments-garnishment_id"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/plaid/processor_token": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Create a bank account from a plaid processor token
         * @description This endpoint creates a new **verified** bank account by using a plaid processor token to retrieve its information.
         *
         *     scope: `plaid_processor:write`
         *
         *     > 📘
         *     > To create a token please use the [plaid api](https://plaid.com/docs/api/processors/#processortokencreate) and select "gusto" as processor.
         *
         *     > 🚧 Warning - Company Bank Accounts
         *     >
         *     > If a default company bank account exists, it will be disabled and the new bank account will replace it as the company's default funding method.
         */
        post: operations["post-v1-plaid-processor_token"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/companies/{company_uuid}/tax_requirements/{state}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get State Tax Requirements
         * @description Get all tax requirements for a given state.
         *
         *     ### Metadata Examples
         *
         *     ```json select
         *     {
         *       "type": "select",
         *       "options": [
         *         { "label": "Semiweekly",  value: "Semi-weekly" },
         *         { "label": "Monthly",  value: "Monthly" },
         *         { "label": "Quarterly",  value: "Quarterly" },
         *       ]
         *     }
         *     ```
         *     ```json radio
         *     {
         *       "type": "radio",
         *       "options": [
         *         { "label": "No, we cannot reimburse",  value: false, short_label: "Not Reimbursable" },
         *         { "label": "Yes, we can reimburse",  value: true, short_label: "Reimbursable" },
         *       ]
         *     }
         *     ```
         *     ```json account_number
         *     {
         *       "type": "account_number",
         *       "mask": "######-##',
         *       "prefix": null
         *     }
         *     ```
         *     ```json tax_rate
         *     {
         *       "type": "tax_rate",
         *       "validation": {
         *         "type": "min_max",
         *         "min": "0.0004",
         *         "max": "0.081"
         *       }
         *     }
         *     ```
         *
         *     scope: `company_tax_requirements:read`
         *
         */
        get: operations["get-v1-companies-company_uuid-tax_requirements-state"];
        /**
         * Update State Tax Requirements
         * @description Update State Tax Requirements
         *
         *     scope: `company_tax_requirements:write`
         */
        put: operations["put-v1-companies-company_uuid-tax_requirements-state"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/companies/{company_uuid}/tax_requirements": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get All Tax Requirement States
         * @description Returns objects describing the states that have tax requirements for the company
         *
         *     scope: `company_tax_requirements:read`
         */
        get: operations["get-v1-companies-company_uuid-tax_requirements"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/companies/{company_uuid}/contractor_payments/preview": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Preview contractor payment debit date
         * @description Returns a debit_date dependent on the ACH payment speed of the company.
         *
         *     If the payment method is Check or Historical payment, the debit_date will be the same as the check_date.
         *
         *     scope: `payrolls:read`
         */
        get: operations["get-companies-company_uuid-contractor_payments-preview"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/time_off_policies/{time_off_policy_uuid}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get a time off policy
         * @description Get a time off policy
         *
         *     scope: `time_off_policies:read`
         */
        get: operations["get-time_off_policies-time_off_policy_uuid"];
        /**
         * Update a time off policy
         * @description Update a time off policy
         *
         *     scope: `time_off_policies:write`
         */
        put: operations["put-time_off_policies-time_off_policy_uuid"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/companies/{company_uuid}/time_off_policies": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get all time off policies
         * @description Get all time off policies for a company
         *
         *     scope: `time_off_policies:read`
         */
        get: operations["get-companies-company_uuid-time_off_policies"];
        put?: never;
        /**
         * Create a time off policy
         * @description Create a time off policy
         *
         *     scope: `time_off_policies:write`
         */
        post: operations["post-companies-company_uuid-time_off_policies"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/time_off_policies/{time_off_policy_uuid}/add_employees": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Add employees to a time off policy
         * @description Add employees to a time off policy. Employees are required to have at least one job to be added to a time off policy. Accepts starting balances for non-unlimited policies
         *
         *     scope: `time_off_policies:write`
         */
        put: operations["put-version-time_off_policies-time_off_policy_uuid-add_employees"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/time_off_policies/{time_off_policy_uuid}/remove_employees": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Remove employees from a time off policy
         * @description Remove employees from a time off policy
         *
         *     scope: `time_off_policies:write`
         */
        put: operations["put-v1-time_off_policies-time_off_policy_uuid-remove_employees"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/companies/{company_uuid}/holiday_pay_policy": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get a company's holiday pay policy
         * @description Get a company's holiday pay policy
         *
         *     scope: `holiday_pay_policies:read`
         */
        get: operations["get-companies-company_uuid-holiday_pay_policy"];
        /**
         * Update a company's holiday pay policy
         * @description Update a company's holiday pay policy
         *
         *     scope: `holiday_pay_policies:write`
         */
        put: operations["put-companies-company_uuid-holiday_pay_policy"];
        /**
         * Create a holiday pay policy for a company
         * @description Create a holiday pay policy for a company
         *
         *     scope: `holiday_pay_policies:write`
         */
        post: operations["post-companies-company_uuid-holiday_pay_policy"];
        /**
         * Delete a company's holiday pay policy
         * @description Delete a company's holiday pay policy
         *
         *     scope: `holiday_pay_policies:write`
         */
        delete: operations["delete-companies-company_uuid-holiday_pay_policy"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/companies/{company_uuid}/holiday_pay_policy/add": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Add employees to a company's holiday pay policy
         * @description Add employees to a company's holiday pay policy
         *
         *     scope: `holiday_pay_policies:write`
         */
        put: operations["put-companies-company_uuid-holiday_pay_policy-add"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/companies/{company_uuid}/holiday_pay_policy/remove": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Remove employees from a company's holiday pay policy
         * @description Remove employees from a company's holiday pay policy
         *
         *     scope: `holiday_pay_policies:write`
         */
        put: operations["put-companies-company_uuid-holiday_pay_policy-remove"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/companies/{company_uuid}/paid_holidays": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Preview a company's paid holidays
         * @description Preview a company's paid holidays
         *
         *     scope: `holiday_pay_policies:read`
         */
        get: operations["get-companies-company_uuid-paid_holidays"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/time_off_policies/{time_off_policy_uuid}/balance": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Update employee time off hour balances
         * @description Updates time off hours balances for employees for a time off policy
         *
         *     scope: `time_off_policies:write`
         */
        put: operations["put-version-time_off_policies-time_off_policy_uuid-balance"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/time_off_policies/{time_off_policy_uuid}/deactivate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Deactivate a time off policy
         * @description Deactivate a time off policy
         *
         *     scope: `time_off_policies:write`
         */
        put: operations["put-v1-time_off_policies-time_off_policy_uuid-deactivate"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notifications/{notification_uuid}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get a notification's details
         * @description Upon receiving a notification webhook event, use this endpoint to fetch the notification's details. The notification details include basic suggested content that can help you build notifications in your platform.
         *
         *     Note: partners are responsible for the delivery and any custom state management of notifications in their application. Refer to our [partner notification guide](https://docs.gusto.com/embedded-payroll/docs/partner-notifications) for more details.
         *
         *     If the notification UUID is not found, the response will be 404 Not Found. If the notification's supporting data is no longer valid, the response will be 422 Unprocessable Entity.
         *
         *     scope: `notifications:read`
         */
        get: operations["get-notifications-notification_uuid"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/events": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get all events
         * @description Fetch all events, going back up to 30 days, that your partner application has the required scopes for. Note that a partner does NOT have to have verified webhook subscriptions in order to utilize this endpoint.
         *
         *     > 📘 System Access Authentication
         *     >
         *     > This endpoint uses the [Bearer Auth scheme with the system-level access token in the HTTP Authorization header](https://docs.gusto.com/embedded-payroll/docs/system-access).
         *
         *     scope: `events:read`
         */
        get: operations["get-events"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/companies/{company_uuid}/recovery_cases": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get all recovery cases for a company
         * @description Fetch all recovery cases for a company.
         *
         *     scope: `recovery_cases:read`
         */
        get: operations["get-recovery-cases"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/recovery_cases/{recovery_case_uuid}/redebit": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Initiate a redebit for a recovery case
         * @description After resolving the underlying bank error, initiate a redebit for an open recovery case. This submission is asynchronous and a successful request responds with a 202 HTTP status.
         *
         *     It may take up to four business days for the ACH debit to process; in the meantime, the status of the recovery case will be in the `initiated_redebit` state. When funds are successfully redebited, the recovery case is transitioned to the `recovered` state.
         *
         *     If the company has exceeded maximum redebit attempts, or if the recovery case is not in a redebitable state, the response will be 422 Unprocessable Entity.
         *
         *     scope: `recovery_cases:write`
         */
        put: operations["redebit-recovery-case"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/companies/{company_uuid}/ach_transactions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get all ACH transactions for a company
         * @description Fetches all ACH transactions for a company.
         *
         *     scope: `ach_transactions:read`
         */
        get: operations["get-ach-transactions"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/wire_in_requests/{wire_in_request_uuid}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get a single Wire In Request
         * @description Fetch a Wire In Request.
         *
         *     scope: `payrolls:read`
         */
        get: operations["get-wire_in_requests-wire_in_request_uuid"];
        /**
         * Submit a wire in request
         * @description Submit a wire in request for a payment
         *
         *     scope: `payrolls:run`
         */
        put: operations["put-wire_in_requests-wire_in_request_uuid"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/companies/{company_uuid}/wire_in_requests": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get all Wire In Requests for a company
         * @description Fetches all Wire In Requests for a company.
         *
         *     scope: `payrolls:read`
         */
        get: operations["get-companies-company_uuid-wire_in_request_uuid"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        "Versionable-Required": {
            /** @description The current version of the object. See the [versioning guide](https://docs.gusto.com/embedded-payroll/docs/idempotency) for information on how to use this field. */
            version: string;
        };
        Versionable: {
            /** @description The current version of the object. See the [versioning guide](https://docs.gusto.com/embedded-payroll/docs/idempotency) for information on how to use this field. */
            version?: string;
        };
        /** @example {
         *       "uuid": "9557fe01-f8f8-4c14-a61c-ca6221a9f118",
         *       "employee_uuid": "da441196-43a9-4d23-ad5d-f37ce6bb99c0",
         *       "street_1": "333 Kiera Stravenue",
         *       "street_2": "Suite 391",
         *       "city": "San Francisco",
         *       "state": "CA",
         *       "zip": "94107",
         *       "country": "USA",
         *       "active": true,
         *       "effective_date": "2021-01-01",
         *       "courtesy_withholding": true
         *     } */
        "Employee-Address": components["schemas"]["Address"] & {
            /** @description The UUID of the employee address */
            uuid?: string;
            /** @description The UUID of the employee */
            employee_uuid?: string;
            /**
             * Format: date
             * @description The date the employee started living at the address.
             */
            effective_date?: string;
            /** @description Determines if home taxes should be withheld and paid for employee. */
            courtesy_withholding?: boolean;
        };
        /** @example {
         *       "uuid": "34925ef7-6234-440d-83b8-788a24d0d69a",
         *       "employee_uuid": "2363b9c0-6625-4425-9261-47627fd68783",
         *       "location_uuid": "aba6d0fd-7294-4997-b1a4-bc9268c45932",
         *       "effective_date": "2023-05-15",
         *       "active": true,
         *       "version": "6a22da647ed391f184a212e6e83a541d",
         *       "street_1": "977 Marks Viaduct",
         *       "street_2": null,
         *       "city": "Pink Hill",
         *       "state": "NC",
         *       "zip": "28572",
         *       "country": "USA"
         *     } */
        "Employee-Work-Address": {
            /** @description The unique identifier of this work address. */
            readonly uuid: string;
            /** @description The date the employee began working at this location. */
            effective_date?: string;
            /** @description Signifies if this address is the active work address for the current date */
            readonly active?: boolean;
            /** @description UUID reference to the company location for this work address. */
            location_uuid?: string;
            /** @description UUID reference to the employee for this work address. */
            employee_uuid?: string;
            /** @description The current version of the object. See the [versioning guide](https://docs.gusto.com/embedded-payroll/docs/idempotency) for information on how to use this field. */
            version?: string;
            readonly street_1?: string;
            readonly street_2?: string | null;
            readonly city?: string;
            readonly state?: string;
            readonly zip?: string;
            /** @default USA */
            readonly country: string;
        };
        "Contractor-Address": components["schemas"]["Address"] & {
            /** @description The UUID of the contractor */
            contractor_uuid?: number;
        };
        /** @example {
         *       "street_1": "412 Kiera Stravenue",
         *       "street_2": "Suite 391",
         *       "city": "San Francisco",
         *       "state": "CA",
         *       "zip": "94107",
         *       "country": "USA",
         *       "active": true
         *     } */
        Address: components["schemas"]["Versionable"] & {
            street_1?: string;
            street_2?: string | null;
            city?: string;
            state?: string;
            zip?: string;
            /** @default USA */
            country: string;
            /** @description The status of the location. Inactive locations have been deleted, but may still have historical data associated with them. */
            readonly active?: boolean;
        };
        Department: components["schemas"]["Versionable"] & {
            /** @description The UUID of the department */
            uuid?: string;
            /** @description The UUID of the company */
            company_uuid?: string;
            /** @description Name of the department */
            title?: string;
            /** @description Array of employees assigned to the department. */
            employees?: {
                uuid?: string;
            }[];
            /** @description Array of contractors assigned to the department. */
            contractors?: {
                uuid?: string;
            }[];
        };
        /**
         * Employee
         * @description The representation of an employee in Gusto.
         */
        Employee: {
            /** @description The UUID of the employee in Gusto. */
            readonly uuid: string;
            first_name: string;
            middle_initial?: string | null;
            last_name: string;
            /** @description The personal email address of the employee. This is provided to support syncing users between our system and yours. You may not use this email address for any other purpose (e.g. marketing). */
            email?: string | null;
            /** @description The UUID of the company the employee is employed by. */
            readonly company_uuid?: string;
            /** @description The UUID of the employee's manager. */
            readonly manager_uuid?: string;
            /** @description The current version of the employee. See the [versioning guide](https://docs.gusto.com/embedded-payroll/docs/idempotency) for information on how to use this field. */
            readonly version?: string;
            /** @description The employee's department in the company. */
            readonly department?: string | null;
            /** @description Whether the employee is terminated. */
            readonly terminated?: boolean;
            /** @description Whether the employee is a two percent shareholder of the company. This field only applies to companies with an S-Corp entity type. */
            two_percent_shareholder?: boolean;
            /** @description Whether the employee has completed onboarding. */
            readonly onboarded?: boolean;
            /**
             * @description The current onboarding status of the employee
             * @enum {string}
             */
            readonly onboarding_status?: "onboarding_completed" | "admin_onboarding_incomplete" | "self_onboarding_pending_invite" | "self_onboarding_invited" | "self_onboarding_invited_started" | "self_onboarding_invited_overdue" | "self_onboarding_completed_by_employee" | "self_onboarding_awaiting_admin_review";
            jobs?: components["schemas"]["Job"][];
            eligible_paid_time_off?: components["schemas"]["Paid-Time-Off"][];
            terminations?: components["schemas"]["Termination"][];
            garnishments?: components["schemas"]["Garnishment"][];
            /** @description Custom fields are only included for the employee if the include param has the custom_fields value set */
            custom_fields?: components["schemas"]["Employee-Custom-Field"][];
            readonly date_of_birth?: string | null;
            /** @description Indicates whether the employee has an SSN in Gusto. */
            has_ssn?: boolean;
            /** @description Deprecated. This field always returns an empty string. */
            ssn?: string;
            phone?: string;
            preferred_first_name?: string;
            /**
             * @description The employee's payment method
             * @default Check
             * @enum {string}
             */
            payment_method: "Direct Deposit" | "Check";
            /** @description The work email address of the employee. This is provided to support syncing users between our system and yours. You may not use this email address for any other purpose (e.g. marketing). */
            work_email?: string | null;
            /**
             * @description The current employment status of the employee. Full-time employees work 30+ hours per week. Part-time employees are split into two groups: those that work 20-29 hours a week, and those that work under 20 hours a week. Variable employees have hours that vary each week. Seasonal employees are hired for 6 months of the year or less.
             * @enum {string|null}
             */
            readonly current_employment_status?: "full_time" | "part_time_under_twenty_hours" | "part_time_twenty_plus_hours" | "variable" | "seasonal" | null;
        };
        /**
         * Employee-Onboarding-Status
         * @description The representation of an employee's onboarding status.
         */
        "Employee-Onboarding-Status": {
            /** @description Unique identifier for this employee. */
            uuid: string;
            /** @description One of the "onboarding_status" enum values. */
            onboarding_status?: string;
            /** @description List of steps required to onboard an employee. */
            onboarding_steps?: {
                /** @description User-friendly description of the onboarding step. */
                title?: string;
                /** @description String identifier for the onboarding step. */
                id?: string;
                /** @description When true, this step has been completed. */
                required?: boolean;
                /** @description When true, this step has been completed. */
                completed?: boolean;
                /** @description A list of onboarding steps required to begin this step. */
                requirements?: string[];
            }[];
        };
        /** @description The representation of a company's address in Gusto. */
        "Company-Address": {
            street_1?: string;
            street_2?: string | null;
            city?: string;
            state?: string;
            zip?: string;
            /** @default USA */
            country: string;
            /** @description The status of the location. Inactive locations have been deleted, but may still have historical data associated with them. */
            readonly active?: boolean;
        };
        /** @description The representation of an address in Gusto. */
        Location: {
            /** @description The UUID of the location object. */
            readonly uuid: string;
            /** @description The current version of the object. See the [versioning guide](https://docs.gusto.com/embedded-payroll/docs/idempotency) for information on how to use this field. */
            version?: string;
            /** @description The UUID for the company to which the location belongs. Only included if the location belongs to a company. */
            readonly company_uuid?: string;
            /** @description The phone number for the location. Required for company locations. Optional for employee locations. */
            phone_number?: string;
            street_1?: string;
            street_2?: string | null;
            city?: string;
            state?: string;
            zip?: string;
            /** @default USA */
            country: string;
            /** @description The status of the location. Inactive locations have been deleted, but may still have historical data associated with them. */
            readonly active?: boolean;
            /** @description Specifies if the location is the company's mailing address. Only included if the location belongs to a company. */
            mailing_address?: boolean | null;
            /** @description Specifies if the location is the company's filing address. Only included if the location belongs to a company. */
            filing_address?: boolean | null;
            /** @description Datetime for when location is created */
            created_at?: string;
            /** @description Datetime for when location is updated */
            updated_at?: string;
        };
        /** @description The representation of paid time off in Gusto. */
        "Paid-Time-Off": {
            /**
             * @description The name of the paid time off type.
             * @enum {string}
             */
            readonly name?: "Vacation Hours" | "Sick Hours" | "Holiday Hours";
            /** @description The name of the time off policy. */
            readonly policy_name?: string;
            /** @description The UUID of the time off policy. */
            readonly policy_uuid?: string;
            /**
             * @description The unit the PTO type is accrued in.
             * @example Hour
             */
            readonly accrual_unit?: string;
            /** @description The number of accrual units accrued per accrual period. */
            readonly accrual_rate?: string;
            /**
             * @description The accrual method of the time off policy
             * @example unlimited
             */
            readonly accrual_method?: string;
            /**
             * @description The frequency at which the PTO type is accrued.
             * @example Year
             */
            readonly accrual_period?: string;
            /** @description The number of accrual units accrued. */
            readonly accrual_balance?: string;
            /** @description The maximum number of accrual units allowed. A null value signifies no maximum. */
            readonly maximum_accrual_balance?: string | null;
            /** @description Whether the accrual balance is paid to the employee upon termination. */
            readonly paid_at_termination?: boolean;
        };
        /** @description Garnishments, or employee deductions, are fixed amounts or percentages deducted from an employee’s pay. They can be deducted a specific number of times or on a recurring basis. Garnishments can also have maximum deductions on a yearly or per-pay-period bases. Common uses for garnishments are court-ordered payments for child support or back taxes. Some companies provide loans to their employees that are repaid via garnishments. */
        Garnishment: {
            /** @description The UUID of the garnishment in Gusto. */
            readonly uuid: string;
            /** @description The current version of the object. See the [versioning guide](https://docs.gusto.com/embedded-payroll/docs/idempotency) for information on how to use this field. */
            version?: string;
            /** @description The UUID of the employee to which this garnishment belongs. */
            readonly employee_uuid?: string;
            /**
             * @description Whether or not this garnishment is currently active.
             * @default true
             */
            active: boolean;
            /**
             * Format: float
             * @description The amount of the garnishment. Either a percentage or a fixed dollar amount. Represented as a float, e.g. "8.00".
             */
            amount?: string;
            /** @description The description of the garnishment. */
            description?: string;
            /** @description Whether the garnishment is court ordered. */
            court_ordered?: boolean;
            /**
             * @description The number of times to apply the garnishment. Ignored if recurring is true.
             * @default null
             */
            times: number | null;
            /**
             * @description Whether the garnishment should recur indefinitely.
             * @default false
             */
            recurring: boolean;
            /**
             * Format: float
             * @description The maximum deduction per annum. A null value indicates no maximum. Represented as a float, e.g. "200.00".
             * @default null
             */
            annual_maximum: string | null;
            /**
             * Format: float
             * @description The maximum deduction per pay period. A null value indicates no maximum. Represented as a float, e.g. "16.00".
             * @default null
             */
            pay_period_maximum: string | null;
            /**
             * @description Whether the amount should be treated as a percentage to be deducted per pay period.
             * @default false
             */
            deduct_as_percentage: boolean;
        };
        /** @description The representation of a termination in Gusto. */
        Termination: {
            /** @description The UUID of the termination object. */
            readonly uuid: string;
            /** @description The current version of the object. See the [versioning guide](https://docs.gusto.com/embedded-payroll/docs/idempotency) for information on how to use this field. */
            version?: string;
            /** @description The UUID of the employee to which this termination is attached. */
            readonly employee_uuid?: number;
            /** @description Whether the employee's termination has gone into effect. */
            readonly active?: boolean;
            /** @description Whether the employee's termination is cancelable. Cancelable is true if `run_termination_payroll` is false and `effective_date` is in the future. */
            readonly cancelable?: boolean;
            /** @description The employee's last day of work. */
            effective_date?: string;
            /** @description If true, the employee should receive their final wages via an off-cycle payroll. If false, they should receive their final wages on their current pay schedule. */
            run_termination_payroll?: boolean;
        };
        "Rehire-Body": {
            /** @description The day when the employee returns to work. */
            effective_date: string;
            /** @description The boolean flag indicating whether Gusto will file a new hire report for the employee. */
            file_new_hire_report: boolean;
            /** @description The uuid of the employee's work location. */
            work_location_uuid: string;
            /**
             * @description The employee's employment status. Supplying an invalid option will set the employment_status to *not_set*.
             * @enum {string}
             */
            employment_status?: "part_time" | "full_time" | "part_time_eligible" | "variable" | "seasonal" | "not_set";
            /** @description Whether the employee is a two percent shareholder of the company. This field only applies to companies with an S-Corp entity type. */
            two_percent_shareholder?: boolean;
        };
        "Pay-Schedule-Assignment-Body": {
            /**
             * @description The pay schedule assignment type.
             * @enum {string}
             */
            type: "single" | "hourly_salaried" | "by_employee" | "by_department";
            /** @description Pay schedule for hourly employees. */
            hourly_pay_schedule_uuid?: string;
            /** @description Pay schedule for salaried employees. */
            salaried_pay_schedule_uuid?: string;
            /** @description Default pay schedule for employees. */
            default_pay_schedule_uuid?: string;
            /** @description List of employees and their pay schedules. */
            employees?: {
                /** @description Employee UUID */
                employee_uuid?: string;
                /** @description Pay schedule UUID */
                pay_schedule_uuid?: string;
            }[];
            /** @description List of departments and their pay schedules. */
            departments?: {
                /** @description Department UUID */
                department_uuid?: string;
                /** @description Pay schedule UUID */
                pay_schedule_uuid?: string;
            }[];
        };
        /**
         * @description The FLSA status for this compensation. Salaried ('Exempt') employees are paid a fixed salary every pay period. Salaried with overtime ('Salaried Nonexempt') employees are paid a fixed salary every pay period, and receive overtime pay when applicable. Hourly ('Nonexempt') employees are paid for the hours they work, and receive overtime pay when applicable. Commissioned employees ('Commission Only Exempt') earn wages based only on commission. Commissioned with overtime ('Commission Only Nonexempt') earn wages based on commission, and receive overtime pay when applicable. Owners ('Owner') are employees that own at least twenty percent of the company.
         * @enum {string}
         */
        "Flsa-Status-Type": "Exempt" | "Salaried Nonexempt" | "Nonexempt" | "Owner" | "Commission Only Exempt" | "Commission Only Nonexempt";
        /** @description The representation of compensation in Gusto. */
        Compensation: {
            /** @description The UUID of the compensation in Gusto. */
            readonly uuid: string;
            /** @description The current version of the object. See the [versioning guide](https://docs.gusto.com/embedded-payroll/docs/idempotency) for information on how to use this field. */
            version?: string;
            /** @description The UUID of the job to which the compensation belongs. */
            readonly job_uuid?: string;
            /** @description The dollar amount paid per payment unit. */
            rate?: string;
            /**
             * @description The unit accompanying the compensation rate. If the employee is an owner, rate should be 'Paycheck'.
             * @enum {string}
             */
            payment_unit?: "Hour" | "Week" | "Month" | "Year" | "Paycheck";
            flsa_status?: components["schemas"]["Flsa-Status-Type"];
            /** @description The effective date for this compensation. For the first compensation, this defaults to the job's hire date. */
            effective_date?: string;
            /** @description Indicates if the compensation could be adjusted to minimum wage during payroll calculation. */
            readonly adjust_for_minimum_wage?: boolean;
        };
        /** Form */
        Form: {
            /** @description The UUID of the form */
            readonly uuid: string;
            /** @description The type identifier of the form */
            readonly name?: string;
            /** @description The title of the form */
            readonly title?: string;
            /** @description The description of the form */
            readonly description?: string;
            /** @description If the form is in a draft state. E.g. End of year tax forms may be provided in a draft state prior to being finalized. */
            readonly draft?: boolean;
            /** @description The year of this form. For some forms, e.g. tax forms, this is the year which the form represents. A W2 for January - December 2022 would be delivered in January 2023 and have a year value of 2022. This value is nullable and will not be present on all forms. */
            readonly year?: number | null;
            /** @description The quarter of this form. For some forms, e.g. tax forms, this is the calendar quarter which this form represents. An Employer's Quarterly Federal Tax Return (Form 941) for April, May, June 2022 would have a quarter value of 2 (and a year value of 2022). This value is nullable and will not be present on all forms. */
            readonly quarter?: number | null;
            /** @description A boolean flag that indicates whether the form needs signing or not. Note that this value will change after the form is signed. */
            readonly requires_signing?: boolean;
        };
        /** Form */
        Form_1099: {
            /** @description The UUID of the form */
            readonly uuid: string;
            /** @description The type identifier of the form */
            readonly name?: string;
            /** @description The title of the form */
            readonly title?: string;
            /** @description The description of the form */
            readonly description?: string;
            /** @description If the form is in a draft state. E.g. End of year tax forms may be provided in a draft state prior to being finalized. */
            readonly draft?: boolean;
            /** @description The year of this form. For some forms, e.g. tax forms, this is the year which the form represents. A 1099 for January - December 2022 would be delivered in January 2023 and have a year value of 2022. This value is nullable and will not be present on all forms. */
            readonly year?: number | null;
            /** @description The quarter of this form. This value is currently always null since it is not present on any contractor forms. */
            readonly quarter?: number | null;
            /** @description A boolean flag that indicates whether the form needs signing or not. Note that this value will change after the form is signed. */
            readonly requires_signing?: boolean;
            /** @description The contractor UUID */
            readonly contractor_uuid?: string;
        };
        /** Form Pdf */
        "Form-Pdf": {
            /** @description the UUID of the form */
            readonly uuid: string;
            /** @description the URL of the form */
            document_url?: string;
        };
        /** Industry */
        Industry: {
            /** @description Company uuid */
            readonly company_uuid?: string;
            /** @description North American Industry Classification System (NAICS) is used to classify businesses with a six digit number based on the primary type of work the business performs. */
            readonly naics_code?: string;
            /** @description A list of Standard Industrial Classification (SIC) codes, which are four digit number that categorize the industries that companies belong to based on their business activities. */
            readonly sic_codes?: string[];
            /** @description Industry title */
            readonly title?: string;
        };
        /**
         * Job
         * @description The representation of a job in Gusto.
         */
        Job: {
            /** @description The UUID of the job. */
            readonly uuid: string;
            /** @description The current version of the object. See the [versioning guide](https://docs.gusto.com/embedded-payroll/docs/idempotency) for information on how to use this field. */
            version?: string;
            /** @description The UUID of the employee to which the job belongs. */
            readonly employee_uuid?: string;
            /** @description The date when the employee was hired or rehired for the job. */
            hire_date?: string;
            /**
             * @description The title for the job.
             * @default null
             */
            title: string | null;
            /** @description Whether this is the employee's primary job. The value will be set to true unless an existing job exists for the employee. */
            readonly primary?: boolean;
            /** @description The current compensation rate of the job. */
            readonly rate?: string;
            /** @description The payment unit of the current compensation for the job. */
            readonly payment_unit?: string;
            /** @description The UUID of the current compensation of the job. */
            readonly current_compensation_uuid?: string;
            /** @description Whether the employee owns at least 2% of the company. */
            two_percent_shareholder?: boolean;
            /** @description Whether this job is eligible for workers' compensation coverage in the state of Washington (WA). */
            state_wc_covered?: boolean;
            /** @description The risk class code for workers' compensation in Washington state. Please visit [Washington state's Risk Class page](https://www.lni.wa.gov/insurance/rates-risk-classes/risk-classes-for-workers-compensation/risk-class-lookup#/) to learn more. */
            state_wc_class_code?: string;
            readonly compensations?: components["schemas"]["Compensation"][];
        };
        /** @description The representation of an external payroll. */
        "External-Payroll": {
            /** @description The UUID of the external payroll. */
            readonly uuid: string;
            /** @description The UUID of the company. */
            readonly company_uuid?: string;
            /** @description External payroll's check date. */
            readonly check_date?: string;
            /** @description External payroll's pay period start date. */
            readonly payment_period_start_date?: string;
            /** @description External payroll's pay period end date. */
            readonly payment_period_end_date?: string;
            /**
             * @description The status of the external payroll. The status will be `unprocessed` when the external payroll is created and transition to `processed` once tax liabilities are entered and finalized.  Once in the `processed` status all actions that can edit an external payroll will be disabled.
             * @enum {string}
             */
            readonly status?: "unprocessed" | "processed";
            /** @description External payroll items for employees */
            readonly external_payroll_items?: {
                employee_uuid?: string;
                earnings?: {
                    /** Format: float */
                    amount?: string;
                    /** Format: float */
                    hours?: string;
                    earning_type?: string;
                    earning_id?: number;
                }[];
                benefits?: {
                    benefit_id?: number;
                    /** Format: float */
                    company_contribution_amount?: string;
                    /** Format: float */
                    employee_deduction_amount?: string;
                }[];
                taxes?: {
                    tax_id?: number;
                    /** Format: float */
                    amount?: string;
                }[];
            }[];
            /** @description Applicable earnings based on company provisioning. */
            readonly applicable_earnings?: {
                earning_type?: string;
                earning_id?: number;
                name?: string;
                input_type?: string;
                category?: string;
            }[];
            /** @description Applicable benefits based on company provisioning. */
            readonly applicable_benefits?: {
                id?: number;
                description?: string;
                active?: boolean;
            }[];
            /** @description Applicable taxes based on company provisioning. */
            readonly applicable_taxes?: {
                id?: number;
                name?: string;
                /** @description Some taxes may have an amount withheld from the employee and an amount withheld from the employer, e.g. Social Security. A `true` value indicates this is the employer's amount. */
                employer_tax?: boolean;
                /** @description Some taxes may have different rates or reporting requirements depending on if the employee is a resident or non-resident of the tax jurisdiction. */
                resident_tax?: boolean;
            }[];
            /** @description Stores metadata of the external payroll. */
            readonly metadata?: {
                /** @description Determines if the external payroll can be deleted. */
                readonly deletable?: boolean;
            };
        };
        /** @description The representation of webhook subscription. */
        "Webhook-Subscription": {
            /** @description The UUID of the webhook subscription. */
            readonly uuid: string;
            /** @description The webhook subscriber URL. Updates will be POSTed to this URL. */
            readonly url?: string;
            /**
             * @description The status of the webhook subscription.
             * @enum {string}
             */
            readonly status?: "pending" | "verified" | "removed";
            /** @description Receive updates for these types. */
            subscription_types?: ("BankAccount" | "Company" | "CompanyBenefit" | "Contractor" | "ContractorPayment" | "Employee" | "EmployeeBenefit" | "EmployeeJobCompensation" | "ExternalPayroll" | "Form" | "Location" | "Notification" | "Payroll" | "PaySchedule" | "Signatory")[];
        };
        /** @description The representation of an external payroll with minimal information. */
        "External-Payroll-Basic": {
            /** @description The UUID of the external payroll. */
            readonly uuid: string;
            /** @description The UUID of the company. */
            readonly company_uuid?: string;
            /** @description External payroll's check date. */
            readonly check_date?: string;
            /** @description External payroll's pay period start date. */
            readonly payment_period_start_date?: string;
            /** @description External payroll's pay period end date. */
            readonly payment_period_end_date?: string;
            /**
             * @description The status of the external payroll. The status will be `unprocessed` when the external payroll is created and transition to `processed` once tax liabilities are entered and finalized.  Once in the `processed` status all actions that can edit an external payroll will be disabled.
             * @enum {string}
             */
            readonly status?: "unprocessed" | "processed";
        };
        /** @description The representation of an external payroll with minimal information. */
        "External-Payroll-Tax-Suggestions": {
            /** @description The UUID of the employee. */
            readonly employee_uuid?: string;
            /** @description Possible tax liabilities selections. */
            readonly tax_suggestions?: {
                /** @description The ID of the tax. */
                readonly tax_id?: number;
                /** @description Calculated tax amount. */
                readonly amount?: string;
            };
        };
        /** @description The representation of tax liabilities selections. */
        "Tax-Liabilities-Selections": {
            /** @description The ID of the tax. */
            readonly tax_id?: number;
            /** @description The name of the tax. */
            readonly tax_name?: string;
            /** @description The UUID of last unpaid external payroll. */
            readonly last_unpaid_external_payroll_uuid?: string | null;
            /** @description Possible tax liabilities selections. */
            readonly possible_liabilities?: {
                /** @description Liability amount. */
                readonly liability_amount?: string;
                /** @description The external payroll check date. */
                readonly payroll_check_date?: string;
                /** @description The UUID of the external payroll. */
                readonly external_payroll_uuid?: string;
            };
        };
        /**
         * Admin
         * @description The representation of an admin user in Gusto.
         */
        Admin: {
            /** @description The unique id of the admin. */
            uuid: string;
            /** @description The email of the admin for Gusto's system. If the email matches an existing user, this will create an admin account for them. */
            email?: string;
            /** @description The first name of the admin. */
            first_name?: string;
            /** @description The last name of the admin. */
            last_name?: string;
        };
        /**
         * Company
         * @description The representation of a company in Gusto.
         */
        Company: {
            /** @description The Federal Employer Identification Number of the company. */
            readonly ein?: string;
            /**
             * @description The tax payer type of the company.
             * @enum {string}
             */
            readonly entity_type?: "C-Corporation" | "S-Corporation" | "Sole proprietor" | "LLC" | "LLP" | "Limited partnership" | "Co-ownership" | "Association" | "Trusteeship" | "General partnership" | "Joint venture" | "Non-Profit";
            /**
             * @description The Gusto product tier of the company (not applicable to Embedded partner managed companies).
             * @enum {string|null}
             */
            readonly tier?: "simple" | "plus" | "premium" | "core" | "complete" | "concierge" | "contractor_only" | "basic" | null;
            /** @description Whether or not the company is suspended in Gusto. Suspended companies may not run payroll. */
            is_suspended?: boolean;
            /**
             * @description The status of the company in Gusto. "Approved" companies are approved to run payroll from a risk and compliance perspective. However, an approved company may still need to resolve other [payroll blockers](https://docs.gusto.com/embedded-payroll/docs/payroll-blockers) to be able to run payroll. "Not Approved" companies may not yet run payroll with Gusto and may need to complete onboarding or contact support. "Suspended" companies may not run payroll with Gusto. In order to unsuspend their account, the company must contact support.
             * @enum {string}
             */
            readonly company_status?: "Approved" | "Not Approved" | "Suspended";
            /** @description A unique identifier of the company in Gusto. */
            readonly uuid: string;
            /** @description The name of the company. */
            readonly name?: string;
            /** @description The slug of the name of the company. */
            readonly slug?: string;
            /** @description The trade name of the company. */
            readonly trade_name?: string;
            /** @description Whether the company is fully managed by a partner via the API */
            readonly is_partner_managed?: boolean;
            /**
             * @description The pay schedule assignment type.
             * @enum {string}
             */
            readonly pay_schedule_type?: "single" | "hourly_salaried" | "by_employee" | "by_department";
            /** @description Company's first invoiceable event date */
            readonly join_date?: string;
            /**
             * @description Company's default funding type
             * @enum {string}
             */
            funding_type?: "ach" | "reverse_wire" | "wire_in" | "brex";
            /** @description The locations of the company. */
            readonly locations?: components["schemas"]["Company-Address"][];
            /** @description The available company-wide compensation rates for the company. */
            readonly compensations?: {
                /** @description The available hourly compensation rates for the company. */
                readonly hourly?: {
                    /**
                     * @description The name of the hourly compensation rate.
                     * @example Overtime
                     */
                    readonly name?: string;
                    /**
                     * @description The amount multiplied by the base rate of a job to calculate compensation.
                     * @example 1.5
                     */
                    readonly multiple?: number;
                }[];
                /** @description The available fixed compensation rates for the company. */
                readonly fixed?: {
                    /**
                     * @description The name of the fixed compensation.
                     * @example Bonus
                     */
                    name?: string;
                }[];
                /** @description The available types of paid time off for the company. */
                readonly paid_time_off?: {
                    /**
                     * @description The name of the paid time off type.
                     * @example Vacation Hours
                     */
                    readonly name?: string;
                }[];
            };
            /** @description The primary signatory of the company. */
            readonly primary_signatory?: {
                readonly first_name?: string;
                readonly middle_initial?: string;
                readonly last_name?: string;
                readonly phone?: string;
                readonly email?: string;
                readonly home_address?: {
                    readonly street_1?: string;
                    readonly street_2?: string | null;
                    readonly city?: string;
                    readonly state?: string;
                    readonly zip?: string;
                    readonly country?: string;
                };
            };
            /** @description The primary payroll admin of the company. */
            primary_payroll_admin?: {
                readonly first_name?: string;
                readonly last_name?: string;
                readonly phone?: string;
                readonly email?: string;
            };
        };
        /** @description The representation of a company's onboarding status */
        "Company-Onboarding-Status": {
            /** @description the UUID of the company */
            uuid: string;
            /** @description a boolean flag for the company's onboarding status */
            onboarding_completed?: boolean;
            /** @description a list of company onboarding steps */
            onboarding_steps?: {
                /** @description The display name of the onboarding step */
                title?: string;
                /** @description The string identifier for each onboarding step */
                id?: string;
                /** @description The boolean flag indicating whether the step is required or optional */
                required?: boolean;
                /** @description The boolean flag indicating whether the step is completed or not. */
                completed?: boolean;
                /** @description The boolean flag indicating whether the step can be skipped or not. */
                skippable?: boolean;
                /** @description A list of onboarding step that are required to be completed in order to proceed with the current onboarding step. */
                requirements?: string[];
            }[];
        };
        /** Payment-Configs */
        "Payment-Configs": {
            /** @description Company uuid */
            readonly company_uuid?: string;
            /** @description Partner uuid */
            readonly partner_uuid?: string;
            /** @description Payment limit for 1-day or 2-day payroll */
            readonly fast_payment_limit?: string;
            /** @description Payment speed for 1-day, 2-day, 4-day */
            readonly payment_speed?: string;
        };
        "Contractor-Body": {
            /**
             * @description The contractor type.
             * @default Individual
             * @enum {string}
             */
            type: "Individual" | "Business";
            /**
             * @description The contractor’s wage type.
             *
             * @enum {string}
             */
            wage_type?: "Fixed" | "Hourly";
            /**
             * @description The day when the contractor will start working for the company.
             *
             * @example 2020-01-11
             */
            start_date?: string;
            /**
             * @description The contractor’s hourly rate. This attribute is required if the wage_type is `Hourly`.
             * @example 40.0
             */
            hourly_rate?: string;
            /**
             * @description Whether the contractor or the payroll admin will complete onboarding in Gusto.
             *     Self-onboarding is recommended so that contractors receive Gusto accounts.
             *     If self_onboarding is true, then email is required.
             * @default false
             */
            self_onboarding: boolean;
            /** @description The contractor’s email address. */
            email?: string;
            /** @description The contractor’s first name.
             *     This attribute is required for `Individual` contractors and will be ignored for `Business` contractors. */
            first_name?: string;
            /** @description The contractor’s last name.
             *     This attribute is required for `Individual` contractors and will be ignored for `Business` contractors. */
            last_name?: string;
            /** @description The contractor’s middle initial.
             *     This attribute is optional for `Individual` contractors and will be ignored for `Business` contractors. */
            middle_initial?: string;
            /**
             * @description The boolean flag indicating whether Gusto will file a new hire report for the contractor.
             *     This attribute is optional for `Individual` contractors and will be ignored for `Business` contractors.
             * @default false
             */
            file_new_hire_report: boolean;
            /** @description State where the contractor will be conducting the majority of their work for the company.
             *     This value is used when generating the new hire report.
             *     This attribute is required for `Individual` contractors if `file_new_hire_report` is true and will be ignored for `Business` contractors. */
            work_state?: string | null;
            /** @description This attribute is optional for `Individual` contractors and will be ignored for `Business` contractors.
             *     Social security number is needed to file the annual 1099 tax form. */
            ssn?: string;
            /** @description The name of the contractor business. This attribute is required for `Business` contractors and will be ignored for `Individual` contractors. */
            business_name?: string;
            /** @description The employer identification number of the contractor business.
             *     This attribute is optional for `Business` contractors and will be ignored for `Individual` contractors. */
            ein?: string;
            /** @description The status of the contractor. If the contractor's start date is in the future, updating this field to true means we are setting the start date to today. */
            is_active?: boolean;
        };
        /** @description The representation of a contractor (individual or business) in Gusto. */
        Contractor: {
            /** @description The UUID of the contractor in Gusto. */
            readonly uuid: string;
            /** @description The UUID of the company the contractor is employed by. */
            readonly company_uuid?: string;
            /**
             * @description The contractor's wage type, either "Fixed" or "Hourly".
             * @enum {string}
             */
            wage_type?: "Fixed" | "Hourly";
            /**
             * @description The status of the contractor with the company.
             * @default true
             */
            readonly is_active: boolean;
            /** @description The current version of the object. See the [versioning guide](https://docs.gusto.com/embedded-payroll/docs/idempotency) for information on how to use this field. */
            version?: string;
            /**
             * @description The contractor's type, either "Individual" or "Business".
             * @enum {string}
             */
            type?: "Individual" | "Business";
            /** @description The contractor’s first name. This attribute is required for “Individual” contractors and will be ignored for “Business” contractors. */
            first_name?: string | null;
            /** @description The contractor’s last name. This attribute is required for “Individual” contractors and will be ignored for “Business” contractors. */
            last_name?: string | null;
            /** @description The contractor’s middle initial. This attribute is optional for “Individual” contractors and will be ignored for “Business” contractors. */
            middle_initial?: string | null;
            /** @description The name of the contractor business. This attribute is required for “Business” contractors and will be ignored for “Individual” contractors. */
            business_name?: string | null;
            /** @description The Federal Employer Identification Number of the contractor business. This attribute is optional for “Business” contractors and will be ignored for “Individual” contractors. */
            ein?: string | null;
            /** @description Whether company's Employer Identification Number (EIN) is present */
            has_ein?: boolean | null;
            /** @description The contractor’s email address. This attribute is optional for “Individual” contractors and will be ignored for “Business” contractors.  */
            email?: string | null;
            /** @description The contractor's start date. */
            readonly start_date?: string;
            /** @description The contractor’s home address. */
            readonly address?: {
                readonly street_1?: string;
                readonly street_2?: string | null;
                readonly city?: string;
                readonly state?: string;
                readonly zip?: string;
                readonly country?: string;
            };
            /**
             * @description The contractor’s hourly rate. This attribute is required if the wage_type is “Hourly”.
             * @example 50.0
             */
            hourly_rate?: string;
            /**
             * @description The boolean flag indicating whether Gusto will file a new hire report for the contractor
             * @default false
             */
            file_new_hire_report: boolean;
            /** @description State where the contractor will be conducting the majority of their work for the company.
             *     This value is used when generating the new hire report. */
            work_state?: string | null;
            /** @description The updated onboarding status for the contractor */
            onboarded?: boolean;
            /**
             * @description One of the "onboarding_status" enum values.
             * @enum {string}
             */
            onboarding_status?: "onboarding_completed" | "admin_onboarding_review" | "admin_onboarding_incomplete";
        };
        /**
         * Contractor-Onboarding-Status
         * @description The representation of an contractor's onboarding status.
         */
        "Contractor-Onboarding-Status": {
            /** @description Unique identifier for this contractor. */
            uuid: string;
            /**
             * @description One of the "onboarding_status" enum values.
             * @enum {string}
             */
            onboarding_status?: "onboarding_completed" | "admin_onboarding_review" | "admin_onboarding_incomplete";
            /** @description List of steps required to onboard a contractor. */
            onboarding_steps?: {
                /** @description User-friendly description of the onboarding step. */
                title?: string;
                /** @description String identifier for the onboarding step. */
                id?: string;
                /** @description When true, this step is required. */
                required?: boolean;
                /** @description When true, this step has been completed. */
                completed?: boolean;
                /** @description A list of onboarding steps required to begin this step. */
                requirements?: string[];
            }[];
        };
        /**
         * Contractor Payment
         * @description The representation of a single contractor payment.
         */
        "Contractor-Payment": {
            /** @description The unique identifier of the contractor payment in Gusto. */
            readonly uuid: string;
            /** @description The UUID of the contractor. */
            readonly contractor_uuid?: string;
            /** @description The bonus amount in the payment. */
            readonly bonus?: string;
            /** @description The payment date. */
            readonly date?: string;
            /** @description The number of hours worked for the payment. */
            readonly hours?: string;
            /**
             * @description The payment method.
             * @enum {string}
             */
            readonly payment_method?: "Direct Deposit" | "Check" | "Historical Payment" | "Correction Payment";
            /** @description The reimbursement amount in the payment. */
            readonly reimbursement?: string;
            /**
             * @description Contractor payment status
             * @enum {string}
             */
            status?: "Funded" | "Unfunded";
            /** @description The rate per hour worked for the payment. */
            readonly hourly_rate?: string;
            /** @description Determine if the contractor payment can be cancelled. */
            readonly may_cancel?: boolean;
            /** @description The fixed wage of the payment, regardless of hours worked. */
            readonly wage?: string;
            /**
             * @description The wage type for the payment.
             * @enum {string}
             */
            readonly wage_type?: "Hourly" | "Fixed";
            /** @description (hours * hourly_rate) + wage + bonus */
            readonly wage_total?: string;
        };
        /** @description The full contractor payment group, including associated contractor payments. */
        "Contractor-Payment-Group": {
            /** @description The unique identifier of the contractor payment group. */
            readonly uuid?: string;
            /** @description The UUID of the company. */
            readonly company_uuid?: string;
            /** @description The check date of the contractor payment group. */
            readonly check_date?: string;
            /** @description The debit date of the contractor payment group. */
            readonly debit_date?: string;
            /**
             * @description The status of the contractor payment group.  Will be `Funded` if all payments that should be funded (i.e. have `Direct Deposit` for payment method) are funded.  A group can have status `Funded` while having associated payments that have status `Unfunded`, i.e. payment with `Check` payment method.
             * @enum {string}
             */
            readonly status?: "Unfunded" | "Funded";
            /** @description Token used to make contractor payment group creation idempotent.  Will error if attempting to create a group with a duplicate token. */
            readonly creation_token?: string;
            readonly totals?: {
                /** @description The total debit amount for the group of contractor payments. Sum of wage & reimbursement amount. */
                readonly debit_amount?: string;
                /** @description The total wage amount for the group of contractor payments. */
                readonly wage_amount?: string;
                /** @description The total reimbursement amount for the group of contractor payments. */
                readonly reimbursement_amount?: string;
            };
            contractor_payments?: components["schemas"]["Contractor-Payment-For-Group"][];
        };
        /** @description The summary of a contractor payment group. */
        "Contractor-Payment-Group-Minimal": {
            /** @description The unique identifier of the contractor payment group. */
            readonly uuid?: string;
            /** @description The UUID of the company. */
            readonly company_uuid?: string;
            /** @description The check date of the contractor payment group. */
            readonly check_date?: string;
            /** @description The debit date of the contractor payment group. */
            readonly debit_date?: string;
            /**
             * @description The status of the contractor payment group.  Will be `Funded` if all payments that should be funded (i.e. have `Direct Deposit` for payment method) are funded.  A group can have status `Funded` while having associated payments that have status `Unfunded`, i.e. payment with `Check` payment method.
             * @enum {string}
             */
            readonly status?: "Unfunded" | "Funded";
            /** @description Token used to make contractor payment group creation idempotent.  Will error if attempting to create a group with a duplicate token. */
            readonly creation_token?: string;
            readonly totals?: {
                /** @description The total debit amount for the group of contractor payments. Sum of wage & reimbursement amount. */
                readonly debit_amount?: string;
                /** @description The total wage amount for the group of contractor payments. */
                readonly wage_amount?: string;
                /** @description The total reimbursement amount for the group of contractor payments. */
                readonly reimbursement_amount?: string;
            };
        };
        /** @description The representation of a single contractor payment. */
        "Contractor-Payment-For-Group": {
            /** @description The unique identifier of the contractor payment in Gusto. */
            readonly uuid?: string;
            /** @description The UUID of the contractor. */
            readonly contractor_uuid?: string;
            /** @description The bonus amount in the payment. */
            readonly bonus?: string;
            /** @description The number of hours worked for the payment. */
            readonly hours?: string;
            /**
             * @description The payment method.
             * @enum {string}
             */
            readonly payment_method?: "Direct Deposit" | "Check" | "Historical Payment" | "Correction Payment";
            /** @description The reimbursement amount in the payment. */
            readonly reimbursement?: string;
            /**
             * @description The status of the contractor payment.  Will transition to `Funded` during payments processing if the payment should be funded, i.e. has `Direct Deposit` for payment method. Contractors payments with `Check` payment method will remain `Unfunded`.
             * @enum {string}
             */
            status?: "Funded" | "Unfunded";
            /** @description The rate per hour worked for the payment. */
            readonly hourly_rate?: string;
            /** @description Determine if the contractor payment can be cancelled. */
            readonly may_cancel?: boolean;
            /** @description The fixed wage of the payment, regardless of hours worked. */
            readonly wage?: string;
            /**
             * @description The wage type for the payment.
             * @enum {string}
             */
            readonly wage_type?: "Hourly" | "Fixed";
            /** @description (hours * hourly_rate) + wage + bonus */
            readonly wage_total?: string;
        };
        /** @description The representation of the summary of contractor payments for a given company in a given time period. */
        "Contractor-Payment-Summary": {
            /** @description The wage and reimbursement totals for all contractor payments within a given time period. */
            readonly total?: {
                /** @description The total reimbursements for contractor payments within a given time period. */
                readonly reimbursements?: string;
                /** @description The total wages for contractor payments within a given time period. */
                readonly wages?: string;
            };
            /** @description The individual contractor payments, within a given time period, grouped by contractor. */
            readonly contractor_payments?: {
                /** @description The UUID of the contractor. */
                readonly contractor_uuid?: number;
                /** @description The total reimbursements for the contractor within a given time period. */
                readonly reimbursement_total?: string;
                /** @description The total wages for the contractor within a given time period. */
                readonly wage_total?: string;
                /** @description The contractor’s payments within a given time period.
                 *      */
                readonly payments?: components["schemas"]["Contractor-Payment"][];
            }[];
        };
        /** @description The representation of the summary of contractor payments for a given company in a given time period. */
        "Contractor-Payment-Summary-By-Dates": {
            /** @description The wage and reimbursement totals for all contractor payments within a given time period. */
            readonly total?: {
                /** @description The total reimbursements for contractor payments within a given time period. */
                readonly reimbursements?: string;
                /** @description The total wages for contractor payments within a given time period. */
                readonly wages?: string;
            };
            /** @description The individual contractor payments, within a given time period, grouped by check date. */
            readonly contractor_payments?: {
                /** @description The UUID of the contractor. */
                readonly contractor_uuid?: string;
                /** @description The payment check date. */
                readonly check_date?: string;
                /** @description The total reimbursements for the contractor within a given time period. */
                readonly reimbursement_total?: string;
                /** @description The total wages for the contractor within a given time period. */
                readonly wage_total?: string;
                /** @description The contractor’s payments within a given time period.
                 *      */
                readonly payments?: components["schemas"]["Contractor-Payment"][];
            }[];
        };
        /** Contractor-Payment-Method */
        "Contractor-Payment-Method": {
            /** @description The current version of the object. See the [versioning guide](https://docs.gusto.com/embedded-payroll/docs/idempotency) for information on how to use this field. */
            version?: string;
            /**
             * @description The payment method type. If type is Check, then split_by and splits do not need to be populated. If type is Direct Deposit, split_by and splits are required.
             * @enum {string}
             */
            type?: "Direct Deposit" | "Check";
            /**
             * @description Describes how the payment will be split. If split_by is Percentage, then the split amounts must add up to exactly 100. If split_by is Amount, then the last split amount must be nil to capture the remainder.
             * @enum {string|null}
             */
            split_by?: "Amount" | "Percentage" | null;
            splits?: components["schemas"]["Payment-Method-Bank-Account"][] | null;
        };
        /** @description Representation of a bank account item */
        "Payment-Method-Bank-Account": {
            /** @description The bank account ID */
            uuid: string;
            /** @description The bank account name */
            name?: string;
            /** @description Masked bank account number */
            hidden_account_number?: string;
            /** @description The order of priority for each payment split, with priority 1 being the first bank account paid. Priority must be unique and sequential. */
            priority?: number;
            /** @description The cents amount allocated for each payment split */
            split_amount?: number | null;
        };
        /**
         * Time-Off-Request
         * @description The representation of a time off request.
         */
        "Time-Off-Request": {
            /** @description The ID of the time off request. */
            readonly id?: number;
            /**
             * @description The status of the time off request.
             * @enum {string}
             */
            readonly status?: "pending" | "approved" | "denied";
            /** @description A note about the time off request, from the employee to the employer. */
            readonly employee_note?: string;
            /** @description A note about the time off request, from the employer to the employee. */
            readonly employer_note?: string;
            /**
             * @description The type of time off request.
             * @enum {string}
             */
            readonly request_type?: "vacation" | "sick";
            /** @description An object that represents the days in the time off request. The keys of the object are the dates, formatted as a YYYY-MM-DD string. The values of the object are the number of hours requested off for each day, formatted as a string representation of a numeric decimal to the thousands place. */
            readonly days?: Record<string, never>;
            readonly employee?: {
                /** @description The ID of the employee the time off request is for. */
                readonly id?: string;
                /** @description The full name of the employee the time off request is for. */
                readonly full_name?: string;
            };
            readonly initiator?: {
                /** @description The ID of the employee who initiated the time off request. */
                readonly id?: string;
                /** @description The full name of the employee who initiated the time off request. */
                readonly full_name?: string;
            } | null;
            /** @description This value will be null if the request has not been approved. */
            readonly approver?: {
                /** @description The ID of the employee who approved the time off request. */
                readonly id?: string;
                /** @description The full name of the employee who approved the time off request. */
                readonly full_name?: string;
            } | null;
        };
        /** @description Unprocessable Entity
         *
         *     This may happen when the body of your request contains errors such as `invalid_attribute_value`, or the request fails due to an `invalid_operation`. See the [Errors Categories](https://docs.gusto.com/embedded-payroll/docs/error-categories) guide for more details.
         *      */
        "Unprocessable-Entity-Error-Object": {
            errors?: {
                /** @description Specifies where the error occurs. Typically this key identifies the attribute/parameter related to the error. */
                error_key?: string;
                /** @description Specifies the type of error. The category provides error groupings and can be used to build custom error handling in your integration. */
                category?: string;
                /** @description Provides details about the error - generally this message can be surfaced to an end user. */
                message?: string;
                /** @description Contains relevant data to identify the resource in question when applicable. For example, to identify an entity `entity_type` and `entity_uuid` will be provided. */
                metadata?: Record<string, never>;
            }[];
        };
        /** @description Payroll Blockers Error
         *
         *     For detailed information, see the [Payroll Blockers guide](https://docs.gusto.com/embedded-payroll/docs/payroll-blockers) */
        "Payroll-Blockers-Error": {
            errors?: {
                /** @description The string "base" */
                error_key?: string;
                /** @description The string "payroll_blocker" */
                category?: string;
                /** @description Human readable description of the payroll blocker */
                message?: string;
                metadata?: {
                    /** @description A categorization of the payroll blocker, e.g. "geocode_error" */
                    key?: string;
                };
            }[];
        };
        Authentication: {
            /** @description A new access token that can be used for subsequent authenticated requests */
            access_token?: string;
            /**
             * @description The literal string 'bearer'
             * @default bearer
             */
            token_type: string;
            /**
             * @description The TTL of this token. After this amount of time, you must hit the refresh token endpoint to continue making authenticated requests.
             * @default 7200
             */
            expires_in: number;
            /** @description A token that must be passed to the refresh token endpoint to get a new authenticated token. */
            refresh_token?: string;
            /** @description Datetime for when the new access token is created. */
            created_at?: string;
            /** @description All of the scopes for which the access token provides access. */
            scope?: string;
        };
        /**
         * Pay Schedule
         * @description The representation of a pay schedule.
         */
        "Pay-Schedule": {
            /** @description The unique identifier of the pay schedule in Gusto. */
            readonly uuid: string;
            /**
             * @description The frequency that employees on this pay schedule are paid with Gusto.
             * @enum {string}
             */
            readonly frequency?: "Every week" | "Every other week" | "Twice per month" | "Monthly" | "Quarterly" | "Annually";
            /** @description The first date that employees on this pay schedule are paid with Gusto. */
            readonly anchor_pay_date?: string;
            /** @description The last date of the first pay period. This can be the same date as the anchor pay date. */
            readonly anchor_end_of_pay_period?: string;
            /** @description An integer between 1 and 31 indicating the first day of the month that employees are paid. This field is only relevant for pay schedules with the “Twice per month” and “Monthly” frequencies. It will be null for pay schedules with other frequencies. */
            readonly day_1?: number | null;
            /** @description An integer between 1 and 31 indicating the second day of the month that employees are paid. This field is the second pay date for pay schedules with the "Twice per month" frequency. For semi-monthly pay schedules, this field should be set to 31. For months shorter than 31 days, we will set the second pay date to the last day of the month. It will be null for pay schedules with other frequencies. */
            readonly day_2?: number | null;
            /** @description This field will be hourly when the pay schedule is for hourly employees, salaried when the pay schedule is for salaried employees, the department name if pay schedule is by department, and null when the pay schedule is for all employees. */
            readonly name?: string | null;
            /** @description A custom name for a pay schedule, defaults to the pay frequency description. */
            readonly custom_name?: string;
            /** @description With Autopilot® enabled, payroll will run automatically one day before your payroll deadlines. */
            auto_pilot?: boolean;
            /** @description Whether this pay schedule is associated with any employees. A pay schedule is inactive when it's unassigned. */
            readonly active?: boolean;
        };
        /** @description The company bank account */
        "Company-Bank-Account": {
            /** @description UUID of the bank account */
            uuid: string;
            /** @description UUID of the company */
            company_uuid?: string;
            /**
             * @description Bank account type
             * @enum {string}
             */
            account_type?: "Checking" | "Savings";
            /** @description The bank account's routing number */
            routing_number?: string;
            /** @description Masked bank account number */
            hidden_account_number?: string;
            /**
             * @description The verification status of the bank account.
             *
             *     'awaiting_deposits' means the bank account is just created and money is being transferred.
             *     'ready_for_verification' means the micro-deposits are completed and the verification process can begin by using the verify endpoint.
             *     'verified' means the bank account is verified.
             * @enum {string}
             */
            verification_status?: "awaiting_deposits" | "ready_for_verification" | "verified";
            /**
             * @description The verification type of the bank account.
             *
             *     'bank_deposits' means the bank account is connected by entering routing and accounting numbers and verifying through micro-deposits.
             *     'plaid' means the bank account is connected through Plaid.
             * @enum {string}
             */
            verification_type?: "bank_deposits" | "plaid" | "plaid_external";
            /**
             * @description The Plaid connection status of the bank account. Only applies when verification type is Plaid.
             * @enum {string}
             */
            plaid_status?: "connected" | "disconnected";
            /** @description The last fetch balance for the bank account. Please be aware that this amount does not reflect the most up-to-date balance and only applies when the verification type is Plaid. */
            last_cached_balance?: string;
            /** @description The balance fetch date associated with the last_cached_balance. Only applies when verification type is Plaid. */
            balance_fetched_date?: string;
            /** @description Name of bank account */
            name?: string;
        };
        "Benefit-Type-Requirements": {
            employee_deduction?: {
                required?: boolean;
                editable?: boolean;
                default_value?: {
                    value?: string;
                    type?: string;
                };
                choices?: string[];
            };
            contribution?: {
                required?: boolean;
                editable?: boolean;
                default_value?: {
                    value?: string;
                    type?: string;
                };
                choices?: string[];
            };
            deduct_as_percentage?: {
                required?: boolean;
                editable?: boolean;
                default_value?: {
                    value?: string;
                    type?: string;
                };
                choices?: string[];
            };
            catch_up?: {
                required?: boolean;
                editable?: boolean;
                default_value?: {
                    value?: string;
                    type?: string;
                };
                choices?: string[];
            };
            limit_option?: {
                required?: boolean;
                editable?: boolean;
                default_value?: {
                    value?: string;
                    type?: string;
                };
                choices?: string[];
            };
            company_contribution_annual_maximum?: {
                required?: boolean;
                editable?: boolean;
                default_value?: {
                    value?: string;
                    type?: string;
                };
                choices?: string[];
            };
            coverage_salary_multiplier?: {
                required?: boolean;
                editable?: boolean;
                default_value?: {
                    value?: string;
                    type?: string;
                };
                choices?: string[];
            };
            coverage_amount?: {
                required?: boolean;
                editable?: boolean;
                default_value?: {
                    value?: string;
                    type?: string;
                };
                choices?: string[];
            };
        };
        "Benefit-Summary": {
            /** @description The start date of benefit summary. */
            start_date?: string;
            /** @description The end date of benefit summary. */
            end_date?: string;
            /** @description Description of the benefit. */
            description?: string;
            /** @description The aggregate of employee deduction for all employees given the period of time and benefit type. */
            company_benefit_deduction?: string;
            /** @description The aggregate of company contribution for all employees given the period of time and benefit type. */
            company_benefit_contribution?: string;
            employees?: {
                /** @description The UUID of the employee */
                uuid?: string;
                /** @description The aggregate of employee deduction for all employees given the period of time and benefit type. */
                company_benefit_deduction?: string;
                /** @description The aggregate of company contribution for all employees given the period of time and benefit type. */
                company_benefit_contribution?: string;
                /** @description Sum of employee benefit deduction given the period of time for this specific employee. */
                benefit_deduction?: string;
                /** @description Sum of company contribution given the period of time for this specific employee. */
                benefit_contribution?: string;
                /** @description Gross pay of this pay check. */
                gross_pay?: string;
                payroll_benefits?: {
                    payroll_uuid?: string;
                    /** @description Whether it is regular or bonus payroll */
                    payroll_type?: string;
                    check_date?: string;
                    gross_pay?: string;
                    company_benefit_deduction?: string;
                    company_benefit_contribution?: string;
                    pay_period?: {
                        start_date?: string;
                        end_date?: string;
                    };
                };
            };
        };
        "Supported-Benefit": {
            /** @description The benefit type in Gusto. */
            readonly benefit_type?: number;
            /** @description The name of the benefit. */
            readonly name?: string;
            /** @description The description of the benefit. */
            readonly description?: string;
            /** @description Whether the benefit is deducted before tax calculations, thus reducing one’s taxable income */
            readonly pretax?: boolean;
            /** @description Whether the benefit is deducted after tax calculations. */
            readonly posttax?: boolean;
            /** @description Whether the benefit is considered imputed income. */
            readonly imputed?: boolean;
            /** @description Whether the benefit is healthcare related. */
            readonly healthcare?: boolean;
            /** @description Whether the benefit is associated with retirement planning. */
            readonly retirement?: boolean;
            /** @description Whether the benefit has a government mandated yearly limit. */
            readonly yearly_limit?: boolean;
            /** @description Category where the benefit belongs to. */
            readonly category?: string;
        };
        /** @description The representation of a company benefit. */
        "Company-Benefit-With-Employee-Benefits": {
            /** @description The current version of the object. See the [versioning guide](https://docs.gusto.com/embedded-payroll/docs/idempotency) for information on how to use this field. */
            version?: string;
            /** @description The UUID of the company benefit. */
            readonly uuid: string;
            /** @description The type of the benefit to which the company benefit belongs (same as benefit_id). */
            readonly benefit_type?: number;
            /**
             * @description Whether this benefit is active for employee participation. Company benefits may only be deactivated if no employees are actively participating.
             * @default true
             */
            active: boolean;
            /** @description The description of the company benefit.For example, a company may offer multiple benefits with an ID of 1 (for Medical Insurance). The description would show something more specific like “Kaiser Permanente” or “Blue Cross/ Blue Shield”. */
            description?: string;
            /** @description Whether this company benefit can be deleted. Deletable will be set to true if the benefit has not been used in payroll, has no employee benefits associated, and the benefit is not owned by Gusto or a Partner */
            deletable?: boolean;
            /** @description Whether employee deductions and company contributions can be set as percentages of payroll for an individual employee. This is determined by the type of benefit and is not configurable by the company. */
            readonly supports_percentage_amounts?: boolean;
            /** @description Whether the employer is subject to pay employer taxes when an employee is on leave. Only applicable to third party sick pay benefits. */
            responsible_for_employer_taxes?: boolean;
            /** @description Whether the employer is subject to file W-2 forms for an employee on leave. Only applicable to third party sick pay benefits. */
            responsible_for_employee_w2?: boolean;
            employee_benefits?: {
                /** @description The UUID of the employee to which the benefit belongs. */
                employee_uuid?: string;
                /** @description The UUID of the company benefit. */
                company_benefit_uuid?: string;
                /**
                 * @description Whether the employee benefit is active.
                 * @default true
                 */
                active: boolean;
                /**
                 * @description Whether the employee deduction amount should be treated as a percentage to be deducted from each payroll.
                 * @default false
                 */
                deduct_as_percentage: boolean;
                /**
                 * @description The amount to be deducted, per pay period, from the employee's pay.
                 * @default 0.00
                 */
                employee_deduction: string;
                /** @description The value of the company contribution */
                company_contribution?: string;
                uuid?: string;
                /** @description An object representing the type and value of the company contribution. */
                contribution?: {
                    /** @description The company contribution scheme.
                     *
                     *     "amount": The company contributes a fixed amount per payroll. If elective is true, the contribution is matching, dollar-for-dollar.
                     *
                     *     "percentage": The company contributes a percentage of the payroll amount per payroll period. If elective is true, the contribution is matching, dollar-for-dollar.
                     *
                     *     "tiered": The company contribution varies according to the size of the employee deduction. */
                    type?: string;
                    /** @description For the `amount` and `percentage` contribution types, the value of the corresponding amount or percentage.
                     *
                     *     For the `tiered` contribution type, an array of tiers. */
                    value?: string | {
                        tiers?: {
                            /** @description The percentage of employee deduction within this tier the company contribution will match. */
                            rate?: string;
                            /** @description The percentage threshold at which this tier ends (inclusive).
                             *
                             *     For example, a value of "5" means the company contribution will match employee deductions from the previous tier's threshold up to and including 5% of payroll.
                             *
                             *     If this is the first tier, a value of "5" means the company contribution will match employee deductions from 0% up to and including 5% of payroll. */
                            threshold?: string;
                            /** @description The step up difference between this tier's threshold and the previous tier's threshold. In the first tier, this is equivalent to threshold. */
                            threshold_delta?: string;
                        }[];
                    };
                };
            }[];
        };
        /** @description The representation of a company benefit. */
        "Company-Benefit": {
            /** @description The current version of the object. See the [versioning guide](https://docs.gusto.com/embedded-payroll/docs/idempotency) for information on how to use this field. */
            version?: string;
            /** @description The UUID of the company benefit. */
            readonly uuid: string;
            /** @description The type of the benefit to which the company benefit belongs. */
            readonly benefit_type?: number;
            /**
             * @description Whether this benefit is active for employee participation. Company benefits may only be deactivated if no employees are actively participating.
             * @default true
             */
            active: boolean;
            /** @description The description of the company benefit.For example, a company may offer multiple benefits with an ID of 1 (for Medical Insurance). The description would show something more specific like “Kaiser Permanente” or “Blue Cross/ Blue Shield”. */
            description?: string;
            /** @description Whether this company benefit can be deleted. Deletable will be set to true if the benefit has not been used in payroll, has no employee benefits associated, and the benefit is not owned by Gusto or a Partner */
            deletable?: boolean;
            /** @description Whether employee deductions and company contributions can be set as percentages of payroll for an individual employee. This is determined by the type of benefit and is not configurable by the company. */
            readonly supports_percentage_amounts?: boolean;
            /** @description Whether the employer is subject to pay employer taxes when an employee is on leave. Only applicable to third party sick pay benefits. */
            responsible_for_employer_taxes?: boolean;
            /** @description Whether the employer is subject to file W-2 forms for an employee on leave. Only applicable to third party sick pay benefits. */
            responsible_for_employee_w2?: boolean;
        };
        "Earning-Type": {
            /** @description The name of the earning type. */
            name?: string;
            /** @description The ID of the earning type. */
            readonly uuid: string;
        };
        /** @description The representation of an employee benefit. */
        "Employee-Benefit": {
            /** @description The current version of the object. See the [versioning guide](https://docs.gusto.com/embedded-payroll/docs/idempotency) for information on how to use this field. */
            version?: string;
            /** @description The UUID of the employee to which the benefit belongs. */
            readonly employee_uuid?: string;
            /** @description The UUID of the company benefit. */
            readonly company_benefit_uuid?: string;
            /**
             * @description Whether the employee benefit is active.
             * @default true
             */
            active: boolean;
            /** @description The UUID of the employee benefit. */
            readonly uuid: string;
            /**
             * @description The amount to be deducted, per pay period, from the employee's pay.
             * @default 0.00
             */
            employee_deduction: string;
            /**
             * @description Whether the employee deduction amount should be treated as a percentage to be deducted from each payroll.
             * @default false
             */
            deduct_as_percentage: boolean;
            /** @description The maximum employee deduction amount per year. A null value signifies no limit. */
            employee_deduction_annual_maximum?: string | null;
            /** @description An object representing the type and value of the company contribution. */
            contribution?: {
                /** @description The company contribution scheme.
                 *
                 *     "amount": The company contributes a fixed amount per payroll. If elective is true, the contribution is matching, dollar-for-dollar.
                 *
                 *     "percentage": The company contributes a percentage of the payroll amount per payroll period. If elective is true, the contribution is matching, dollar-for-dollar.
                 *
                 *     "tiered": The company contribution varies according to the size of the employee deduction. */
                type?: string;
                /** @description For the `amount` and `percentage` contribution types, the value of the corresponding amount or percentage.
                 *
                 *     For the `tiered` contribution type, an array of tiers. */
                value?: string | {
                    tiers?: {
                        /** @description The percentage of employee deduction within this tier the company contribution will match. */
                        rate?: string;
                        /** @description The percentage threshold at which this tier ends (inclusive).
                         *
                         *     For example, a value of "5" means the company contribution will match employee deductions from the previous tier's threshold up to and including 5% of payroll.
                         *
                         *     If this is the first tier, a value of "5" means the company contribution will match employee deductions from 0% up to and including 5% of payroll. */
                        threshold?: string;
                        /** @description The step up difference between this tier's threshold and the previous tier's threshold. In the first tier, this is equivalent to threshold. */
                        threshold_delta?: string;
                    }[];
                };
            };
            /**
             * @description Whether the company contribution is elective (aka matching). For "tiered" contribution types, this is always true.
             * @default false
             */
            elective: boolean;
            /** @description The maximum company contribution amount per year. A null value signifies no limit. */
            company_contribution_annual_maximum?: string | null;
            /** @description Some benefits require additional information to determine their limit. For example, for an HSA benefit, the limit option should be either "Family" or "Individual". For a Dependent Care FSA benefit, the limit option should be either "Joint Filing or Single" or "Married and Filing Separately". */
            limit_option?: string | null;
            /**
             * @description Whether the employee should use a benefit’s "catch up" rate. Only Roth 401k and 401k benefits use this value for employees over 50.
             * @default false
             */
            catch_up: boolean;
            /** @description Identifier for a 401(k) loan assigned by the 401(k) provider */
            retirement_loan_identifier?: string;
            /** @description The amount that the employee is insured for. Note: company contribution cannot be present if coverage amount is set. */
            coverage_amount?: string | null;
            /**
             * @description Whether the employee deduction reduces taxable income or not. Only valid for Group Term Life benefits. Note: when the value is not "unset", coverage amount and coverage salary multiplier are ignored.
             * @default unset
             * @enum {string|null}
             */
            deduction_reduces_taxable_income: "unset" | "reduces_taxable_income" | "does_not_reduce_taxable_income";
            /**
             * @description The coverage amount as a multiple of the employee’s salary. Only applicable for Group Term Life benefits. Note: cannot be set if coverage amount is also set.
             * @default 0.00
             */
            coverage_salary_multiplier: string;
            /**
             * @deprecated
             * @description The amount to be paid, per pay period, by the company. This field will not appear for tiered contribution types.
             * @default 0.00
             */
            company_contribution: string;
            /**
             * @deprecated
             * @description Whether the company_contribution value should be treated as a percentage to be added to each payroll. This field will not appear for tiered contribution types.
             * @default false
             */
            contribute_as_percentage: boolean;
        };
        /** @description The representation of an employee pay stub information. */
        "Employee-Pay-Stub": {
            /** @description The UUID of the employee pay stub. */
            readonly uuid: string;
            /** @description The check date of the pay stub. */
            readonly check_date?: string;
            /** @description The gross pay amount for the pay stub. */
            readonly gross_pay?: string;
            /** @description The net pay amount for the pay stub. */
            readonly net_pay?: string;
            /** @description A unique identifier of the payroll to which the pay stub belongs. */
            readonly payroll_uuid?: string;
            /** @description The check amount for the pay stub. */
            readonly check_amount?: string;
        };
        /** @description The representation of a pay period. */
        "Pay-Period": {
            /** @description The start date, inclusive, of the pay period. */
            readonly start_date?: string;
            /** @description The end date, inclusive, of the pay period. */
            end_date?: string;
            /** @description A unique identifier of the pay schedule to which the pay period belongs. */
            readonly pay_schedule_uuid?: string;
            /** @description Information about the payroll for the pay period. */
            readonly payroll?: {
                /** @description The UUID of the payroll for this pay period. */
                readonly payroll_uuid?: string;
                /** @description The date on which employees will be paid for the payroll if the payroll is submitted on time. */
                readonly check_date?: string;
                /** @description Whether or not the payroll has been successfully processed. Note that processed payrolls cannot be updated. Additionally, a payroll is not guaranteed to be processed just because the payroll deadline has passed. Late payrolls are not uncommon. Conversely, users may choose to run payroll before the payroll deadline. */
                readonly processed?: boolean;
                /**
                 * Format: date-time
                 * @description The date by which payroll should be run for employees to be paid on time. Payroll data, such as time and attendance data, should be submitted on or before this date.
                 */
                readonly payroll_deadline?: string;
                /**
                 * @description Whether it is regular pay period or transition pay period.
                 * @enum {string}
                 */
                readonly payroll_type?: "regular" | "transition";
            };
        };
        /**
         * Format: date-time
         * @description Datetime for when the resource was created.
         */
        "Created-At-Type": string;
        /**
         * @description The off-cycle reason. Only included for off-cycle payrolls.
         * @enum {string|null}
         */
        "Off-Cycle-Reason-Type": "Benefit reversal" | "Bonus" | "Correction" | "Dismissed employee" | "Hired employee" | "Wage correction" | "Tax reconciliation" | "Reversal" | "Disability insurance distribution" | "Transition from old pay schedule" | null;
        "Payroll-Employee-Compensations-Type": {
            /** @description The UUID of the employee. */
            readonly employee_uuid?: string;
            /** @description This employee will be excluded from payroll calculation and will not be paid for the payroll. Cancelling a payroll would reset all employees' excluded back to false. */
            readonly excluded?: boolean;
            /** @description The current version of this employee compensation. This field is only available for prepared payrolls. See the [versioning guide](https://docs.gusto.com/embedded-payroll/docs/idempotency) for information on how to use this field. */
            version?: string;
            /** @description The employee's gross pay, equal to regular wages + cash tips + payroll tips + any other additional earnings, excluding imputed income. This value is only available for processed payrolls. */
            readonly gross_pay?: number | null;
            /** @description The employee's net pay, equal to gross_pay - employee taxes - employee deductions or garnishments - cash tips. This value is only available for processed payrolls. */
            readonly net_pay?: number | null;
            /** @description The employee's check amount, equal to net_pay + reimbursements. This value is only available for processed payrolls. */
            readonly check_amount?: number | null;
            /**
             * @description The employee's compensation payment method.
             * @enum {string|null}
             */
            payment_method?: "Check" | "Direct Deposit" | null;
            /** @description Custom text that will be printed as a personal note to the employee on a paystub. */
            readonly memo?: string | null;
            /** @description An array of fixed compensations for the employee. Fixed compensations include tips, bonuses, and one time reimbursements. If this payroll has been processed, only fixed compensations with a value greater than 0.00 are returned. For an unprocessed payroll, all active fixed compensations are returned. */
            fixed_compensations?: {
                /** @description The name of the compensation. This also serves as the unique, immutable identifier for this compensation. */
                name?: string;
                /** @description The amount of the compensation for the pay period. */
                amount?: string;
                /** @description The UUID of the job for the compensation. */
                readonly job_uuid?: string;
            }[];
            /** @description An array of hourly compensations for the employee. Hourly compensations include regular, overtime, and double overtime hours. If this payroll has been processed, only hourly compensations with a value greater than 0.00 are returned. For an unprocessed payroll, all active hourly compensations are returned. */
            hourly_compensations?: {
                /** @description The name of the compensation. This also serves as the unique, immutable identifier for this compensation. */
                name?: string;
                /** @description The number of hours to be compensated for this pay period. */
                hours?: string;
                /** @description The amount of the compensation. This field is only available after the payroll is calculated and cannot be used for updating hourly compensations. */
                amount?: string;
                /** @description The UUID of the job for the compensation. */
                readonly job_uuid?: string;
                /** @description The amount multiplied by the base rate to calculate total compensation per hour worked. */
                readonly compensation_multiplier?: number;
            }[];
            /** @description An array of all paid time off the employee is eligible for this pay period. */
            paid_time_off?: {
                /** @description The name of the PTO. This also serves as the unique, immutable identifier for the PTO. */
                name?: string;
                /** @description The hours of this PTO taken during the pay period. */
                hours?: string;
                /** @description The outstanding hours paid upon termination. This field is only applicable for termination payrolls. */
                final_payout_unused_hours_input?: string;
            }[];
            /** @description An array of employee benefits for the pay period. Benefits are only included for processed payroll when the include parameter is present. */
            readonly benefits?: {
                readonly name?: string;
                readonly employee_deduction?: number;
                readonly company_contribution?: number;
                imputed?: boolean;
            }[];
            /** @description An array of employee deductions for the pay period. Deductions are only included for processed payroll when the include parameter is present. */
            readonly deductions?: {
                readonly name?: string;
                readonly amount?: number;
            }[];
            /** @description An array of employer and employee taxes for the pay period. Only included for processed or calculated payrolls when `taxes` is present in the `include` parameter. */
            readonly taxes?: {
                name: string;
                employer: boolean;
                amount: number;
            }[];
        }[];
        /** @description The subtotals for the payroll. */
        "Payroll-Totals-Type": {
            /** @description The total company debit for the payroll. */
            readonly company_debit?: string;
            /** @description The total company net pay for the payroll. */
            net_pay_debit?: string;
            /** @description The total tax debit for the payroll. */
            readonly tax_debit?: string;
            /** @description The total reimbursement debit for the payroll. */
            readonly reimbursement_debit?: string;
            /** @description The total child support debit for the payroll. */
            readonly child_support_debit?: string;
            /** @description The total reimbursements for the payroll. */
            readonly reimbursements?: string;
            /** @description The net pay amount for the payroll. */
            readonly net_pay?: string;
            /** @description The gross pay amount for the payroll. */
            readonly gross_pay?: string;
            /** @description The total employee bonuses amount for the payroll. */
            readonly employee_bonuses?: string;
            /** @description The total employee commissions amount for the payroll. */
            readonly employee_commissions?: string;
            /** @description The total employee cash tips amount for the payroll. */
            readonly employee_cash_tips?: string;
            /** @description The total employee paycheck tips amount for the payroll. */
            readonly employee_paycheck_tips?: string;
            /** @description The total additional earnings amount for the payroll. */
            readonly additional_earnings?: string;
            /** @description The total owner's draw for the payroll. */
            readonly owners_draw?: string;
            /** @description The total check amount for the payroll. */
            readonly check_amount?: string;
            /** @description The total amount of employer paid taxes for the payroll. */
            readonly employer_taxes?: string;
            /** @description The total amount of employee paid taxes for the payroll. */
            readonly employee_taxes?: string;
            /** @description The total amount of company contributed benefits for the payroll. */
            readonly benefits?: string;
            /** @description The total amount of employee deducted benefits for the payroll. */
            readonly employee_benefits_deductions?: string;
            /** @description The total amount of payroll taxes deferred for the payroll, such as allowed by the CARES act. */
            readonly deferred_payroll_taxes?: string;
            /** @description The total amount of deductions for the payroll. */
            other_deductions?: string;
        };
        /** @description An array of taxes applicable to this payroll in addition to taxes included in `employee_compensations`. Only included for processed or calculated payrolls when `taxes` is present in the `include` parameter. */
        "Payroll-Company-Taxes-Type": {
            /** @description The tax name */
            name?: string;
            /** @description Whether this tax is an employer or employee tax */
            employer?: boolean;
            /** @description The amount of this tax for the payroll */
            amount?: string;
        }[];
        /** @description Only applicable when a payroll is moved to four day processing instead of fast ach. */
        "Payroll-Payment-Speed-Changed-Type": {
            /** @description Original check date when fast ach applies. */
            readonly original_check_date?: string;
            /** @description Current check date. */
            readonly current_check_date?: string;
            /** @description Original debit date when fast ach applies. */
            readonly original_debit_date?: number;
            /** @description Current debit date. */
            readonly current_debit_date?: string;
            /** @description The reason why the payroll is moved to four day. */
            readonly reason?: string;
        };
        /** @description Information about the payroll's status and expected dates */
        "Payroll-Payroll-Status-Meta-Type": {
            /** @description true if the payroll may be cancelled */
            readonly cancellable?: boolean;
            /** @description The date an employee will be paid if the payroll is submitted now */
            readonly expected_check_date?: string;
            /** @description The normal check date for the associated pay period */
            readonly initial_check_date?: string;
            /** @description The time the employer's account will be debited if the payroll is submitted now */
            readonly expected_debit_time?: string;
            /** @description expected_check_date > initial_check_date */
            readonly payroll_late?: boolean;
            /** @description Payroll must be submitted at or before this time to avoid late payroll */
            readonly initial_debit_cutoff_time?: string;
        };
        "Payroll-Pay-Period-Type": {
            /** @description The start date, inclusive, of the pay period. */
            readonly start_date?: string;
            /** @description The start date, inclusive, of the pay period. */
            readonly end_date?: string;
            /** @description The UUID of the pay schedule for the payroll. */
            readonly pay_schedule_uuid?: string | null;
        };
        /**
         * @description The payment schedule tax rate the payroll is based on. Only included for off-cycle payrolls.
         * @enum {string}
         */
        "Payroll-Withholding-Pay-Period-Type": "Every week" | "Every other week" | "Twice per month" | "Monthly" | "Quarterly" | "Semiannually" | "Annually";
        /**
         * Format: date-time
         * @description A timestamp that is the deadline for the payroll to be run in order for employees to be paid on time.  If payroll has not been run by the deadline, a prepare request will update both the check date and deadline to reflect the soonest employees can be paid and the deadline by which the payroll must be run in order for said check date to be met.
         */
        "Payroll-Deadline-Type": string;
        /** @description The date on which employees will be paid for the payroll. */
        "Payroll-Check-Date-Type": string;
        /** @description Whether or not the payroll has been successfully processed. Note that processed payrolls cannot be updated. Additionally, a payroll is not guaranteed to be processed just because the payroll deadline has passed. Late payrolls are not uncommon. Conversely, users may choose to run payroll before the payroll deadline. */
        "Payroll-Processed-Type": boolean;
        /** @description The date at which the payroll was processed. Null if the payroll isn't processed yet. */
        "Payroll-Processed-Date-Type": string;
        /** @description A timestamp of the last valid payroll calculation. Null is there isn't a valid calculation. */
        "Payroll-Calculated-At-Type": string;
        /** @description The UUID of the payroll. */
        "Payroll-Payroll-Uuid-Type": string;
        /** @description The UUID of the company for the payroll. */
        "Payroll-Company-Uuid-Type": string;
        /** @description Indicates whether the payroll is an off-cycle payroll */
        "Payroll-Off-Cycle-Type": boolean;
        /** @description Indicates whether the payroll is an external payroll */
        "Payroll-External-Type": boolean;
        /** @description Indicates whether the payroll is the final payroll for a terminated employee. Only included for off-cycle payrolls. */
        "Payroll-Final-Termination-Payroll-Type": boolean;
        /** @description Block regular deductions and contributions for this payroll.  Only included for off-cycle payrolls. */
        "Payroll-Skip-Regular-Deductions-Type": boolean;
        /** @description Enable taxes to be withheld at the IRS's required rate of 22% for federal income taxes. State income taxes will be taxed at the state's supplemental tax rate. Otherwise, we'll sum the entirety of the employee's wages and withhold taxes on the entire amount at the rate for regular wages. Only included for off-cycle payrolls. */
        "Payroll-Fixed-Withholding-Rate-Type": boolean;
        "Payroll-Fixed-Compensation-Types-Type": {
            /** @description The name of an available type of fixed compensation. */
            readonly name?: string;
        }[];
        "Payroll-Submission-Blockers-Type": {
            /** @description The type of blocker that's blocking the payment submission. */
            readonly blocker_type?: string;
            /** @description The name of the submission blocker. */
            readonly blocker_name?: string;
            /** @description The available options to unblock a submission blocker. */
            readonly unblock_options?: {
                /** @description The type of unblock option for the submission blocker. */
                readonly unblock_type?: string;
                /** @description The payment check date associated with the unblock option. */
                readonly check_date?: string;
                /** @description Additional data associated with the unblock option. */
                readonly metadata?: Record<string, never>;
            }[];
            /** @description The unblock option that's been selected to resolve the submission blocker. */
            selected_option?: string | null;
            /**
             * @description The status of the submission blocker.
             * @enum {string}
             */
            status?: "unresolved" | "resolved";
        }[];
        "Payroll-Credit-Blockers-Type": {
            /** @description The type of blocker that's blocking the payment from being credited. */
            readonly blocker_type?: string;
            /** @description The name of the credit blocker. */
            readonly blocker_name?: string;
            /** @description The available options to unblock a credit blocker. */
            readonly unblock_options?: {
                /** @description The type of unblock option for the credit blocker. */
                readonly unblock_type?: string;
                /** @description The payment check date associated with the unblock option. */
                readonly check_date?: string;
                /** @description Additional data associated with the unblock option. */
                readonly metadata?: Record<string, never>;
            }[];
            /** @description The unblock option that's been selected to resolve the credit blocker. */
            selected_option?: string | null;
            /**
             * @description The status of the credit blocker
             * @enum {string}
             */
            status?: "unresolved" | "pending_review" | "resolved" | "failed";
        }[];
        Payroll: {
            payroll_deadline?: components["schemas"]["Payroll-Deadline-Type"];
            check_date?: components["schemas"]["Payroll-Check-Date-Type"];
            processed?: components["schemas"]["Payroll-Processed-Type"];
            processed_date?: components["schemas"]["Payroll-Processed-Date-Type"];
            calculated_at?: components["schemas"]["Payroll-Calculated-At-Type"];
            payroll_uuid?: components["schemas"]["Payroll-Payroll-Uuid-Type"];
            company_uuid?: components["schemas"]["Payroll-Company-Uuid-Type"];
            off_cycle?: components["schemas"]["Payroll-Off-Cycle-Type"];
            off_cycle_reason?: components["schemas"]["Off-Cycle-Reason-Type"];
            external?: components["schemas"]["Payroll-External-Type"];
            final_termination_payroll?: components["schemas"]["Payroll-Final-Termination-Payroll-Type"];
            withholding_pay_period?: components["schemas"]["Payroll-Withholding-Pay-Period-Type"];
            skip_regular_deductions?: components["schemas"]["Payroll-Skip-Regular-Deductions-Type"];
            fixed_withholding_rate?: components["schemas"]["Payroll-Fixed-Withholding-Rate-Type"];
            pay_period?: components["schemas"]["Payroll-Pay-Period-Type"];
            payroll_status_meta?: components["schemas"]["Payroll-Payroll-Status-Meta-Type"];
            totals?: components["schemas"]["Payroll-Totals-Type"];
            employee_compensations?: components["schemas"]["Payroll-Employee-Compensations-Type"];
            company_taxes?: components["schemas"]["Payroll-Company-Taxes-Type"];
            payment_speed_changed?: components["schemas"]["Payroll-Payment-Speed-Changed-Type"];
            created_at?: components["schemas"]["Created-At-Type"];
            submission_blockers?: components["schemas"]["Payroll-Submission-Blockers-Type"];
            credit_blockers?: components["schemas"]["Payroll-Credit-Blockers-Type"];
        };
        "Payroll-Prepared": {
            payroll_deadline?: components["schemas"]["Payroll-Deadline-Type"];
            check_date?: components["schemas"]["Payroll-Check-Date-Type"];
            processed?: components["schemas"]["Payroll-Processed-Type"];
            processed_date?: components["schemas"]["Payroll-Processed-Date-Type"];
            calculated_at?: components["schemas"]["Payroll-Calculated-At-Type"];
            payroll_uuid?: components["schemas"]["Payroll-Payroll-Uuid-Type"];
            company_uuid?: components["schemas"]["Payroll-Company-Uuid-Type"];
            off_cycle?: components["schemas"]["Payroll-Off-Cycle-Type"];
            off_cycle_reason?: components["schemas"]["Off-Cycle-Reason-Type"];
            external?: components["schemas"]["Payroll-External-Type"];
            final_termination_payroll?: components["schemas"]["Payroll-Final-Termination-Payroll-Type"];
            withholding_pay_period?: components["schemas"]["Payroll-Withholding-Pay-Period-Type"];
            skip_regular_deductions?: components["schemas"]["Payroll-Skip-Regular-Deductions-Type"];
            fixed_withholding_rate?: components["schemas"]["Payroll-Fixed-Withholding-Rate-Type"];
            pay_period?: components["schemas"]["Payroll-Pay-Period-Type"];
            payroll_status_meta?: components["schemas"]["Payroll-Payroll-Status-Meta-Type"];
            employee_compensations?: components["schemas"]["Payroll-Employee-Compensations-Type"];
            payment_speed_changed?: components["schemas"]["Payroll-Payment-Speed-Changed-Type"];
            created_at?: components["schemas"]["Created-At-Type"];
            fixed_compensation_types?: components["schemas"]["Payroll-Fixed-Compensation-Types-Type"];
        };
        "Payroll-Minimal": {
            payroll_deadline?: components["schemas"]["Payroll-Deadline-Type"];
            check_date?: components["schemas"]["Payroll-Check-Date-Type"];
            processed: components["schemas"]["Payroll-Processed-Type"];
            processed_date?: components["schemas"]["Payroll-Processed-Date-Type"];
            calculated_at?: components["schemas"]["Payroll-Calculated-At-Type"];
            payroll_uuid: components["schemas"]["Payroll-Payroll-Uuid-Type"];
            company_uuid: components["schemas"]["Payroll-Company-Uuid-Type"];
            off_cycle?: components["schemas"]["Payroll-Off-Cycle-Type"];
            off_cycle_reason?: components["schemas"]["Off-Cycle-Reason-Type"];
            external?: components["schemas"]["Payroll-External-Type"];
            final_termination_payroll?: components["schemas"]["Payroll-Final-Termination-Payroll-Type"];
            withholding_pay_period?: components["schemas"]["Payroll-Withholding-Pay-Period-Type"];
            skip_regular_deductions?: components["schemas"]["Payroll-Skip-Regular-Deductions-Type"];
            fixed_withholding_rate?: components["schemas"]["Payroll-Fixed-Withholding-Rate-Type"];
            pay_period?: components["schemas"]["Payroll-Pay-Period-Type"];
            payroll_status_meta?: components["schemas"]["Payroll-Payroll-Status-Meta-Type"];
            totals?: components["schemas"]["Payroll-Totals-Type"];
            payment_speed_changed?: components["schemas"]["Payroll-Payment-Speed-Changed-Type"];
            created_at?: components["schemas"]["Created-At-Type"];
            submission_blockers?: components["schemas"]["Payroll-Submission-Blockers-Type"];
            credit_blockers?: components["schemas"]["Payroll-Credit-Blockers-Type"];
        };
        "Payroll-Blocker": {
            /** @description The unique identifier of the reason */
            key?: string;
            /** @description User-friendly message describing the payroll blocker. */
            message?: string;
        };
        "Payroll-Check": {
            /** @description A unique identifier of the payroll. */
            payroll_uuid?: string;
            /** @description The format the checks will be printed. */
            printing_format?: string;
            /** @description The starting check number for the checks being printed. */
            starting_check_number?: string;
            /** @description A unique identifier of the Generated Document request */
            request_uuid?: string;
            /** @description Current status of the Generated Document */
            status?: string;
        };
        "Generated-Document": {
            /** @description A unique identifier of the Generated Document request */
            request_uuid?: string;
            /** @description Current status of the Generated Document */
            status?: string;
            /** @description The array of urls to access the documents. */
            document_urls?: string[];
        };
        Report: {
            /** @description A unique identifier of the report request */
            request_uuid?: string;
            /** @description Current status of the report, possible values are 'succeeded', 'pending', or 'failed' */
            status?: string;
            /** @description The array of urls to access the report */
            report_urls?: string[];
        };
        "Create-Report": {
            /** @description A unique identifier of the report request */
            request_uuid?: string;
            /** @description Company UUID */
            company_uuid?: string;
            /** @description Title of the report */
            custom_name?: string;
            /** @description File type */
            file_type?: string;
        };
        "Report-Template": {
            /** @description List of columns recommended */
            columns?: string[];
            /** @description List of groupings recommended */
            groupings?: string[];
            /** @description Company UUID */
            company_uuid?: string;
            /** @description Type of report template */
            report_type?: string;
        };
        "Payroll-Receipt": {
            /** @description A unique identifier of the payroll receipt. */
            payroll_uuid?: string;
            /** @description A unique identifier of the company for the payroll. */
            company_uuid?: string;
            /** @description The name of the company by whom the payroll was paid */
            name_of_sender?: string;
            /** @description Always the fixed string "Payroll Recipients" */
            name_of_recipient?: string;
            /** @description Always the fixed string "Payroll recipients include the employees listed below plus the tax agencies for the taxes listed below." */
            recipient_notice?: string;
            /** @description The debit or funding date for the payroll */
            debit_date?: string;
            /** @description Always the fixed string "ZenPayroll, Inc., dba Gusto is a licensed money transmitter. For more about Gusto’s licenses and your state-specific rights to request information, submit complaints, dispute errors, or cancel transactions, visit our license page." */
            license?: string;
            /** @description URL for the license information for the licensed payroll processor. Always the fixed string "https://gusto.com/about/licenses" */
            license_uri?: string;
            right_to_refund?: string;
            liability_of_licensee?: string;
            /** @description The subtotals for the payroll. */
            totals?: {
                /** @description The total company debit for the payroll. */
                company_debit?: string;
                /** @description The total company net pay for the payroll. */
                net_pay_debit?: string;
                /** @description The total child support debit for the payroll. */
                child_support_debit?: string;
                /** @description The total reimbursements for the payroll. */
                reimbursement_debit?: string;
                /** @description The total tax debit for the payroll. */
                tax_debit?: string;
            };
            /** @description An array of totaled employer and employee taxes for the pay period. */
            taxes?: {
                /** @description The amount paid for this tax. */
                name?: string;
                /** @description The total amount paid by both employer and employee for this tax. */
                amount?: string;
            }[];
            /** @description An array of employee compensations and withholdings for this payroll */
            employee_compensations?: {
                /** @description The UUID of the employee. */
                employee_uuid?: string;
                /** @description The first name of the employee. */
                employee_first_name?: string;
                /** @description The last name of the employee. */
                employee_last_name?: string;
                /** @description The employee's compensation payment method.\n\n`Check` `Direct Deposit` */
                payment_method?: string;
                /** @description The employee's net pay. Net pay paid by check is available for reference but is not included in the `["totals"]["net_pay_debit"]` amount. */
                net_pay?: string;
                /** @description The total of employer and employee taxes for the pay period. */
                total_tax?: string;
                /** @description The total garnishments for the pay period. */
                total_garnishments?: string;
                /** @description The total child support garnishment for the pay period. */
                child_support_garnishment?: string;
                /** @description The total reimbursement for the pay period. */
                total_reimbursement?: string;
            }[];
            /** @description The licensed payroll processor */
            licensee?: {
                /** @description Always the fixed string "Gusto, Zenpayroll Inc." */
                name?: string;
                /** @description Always the fixed string "525 20th St" */
                address?: string;
                /** @description Always the fixed string "San Francisco" */
                city?: string;
                /** @description Always the fixed string "CA" */
                state?: string;
                /** @description Always the fixed string "94107" */
                postal_code?: string;
                /** @description Always the fixed string "4157778888" */
                phone_number?: string;
            };
        };
        "Payroll-Reversal": {
            /** @description The UUID for the payroll run being reversed. */
            reversed_payroll_uuid?: string;
            /** @description The UUID of the payroll where the reversal was applied. */
            reversal_payroll_uuid?: string;
            /** @description A reason provided by the admin who created the reversal. */
            reason?: string;
            /** @description Timestamp of when the reversal was approved. */
            approved_at?: string | null;
            /** @description Category chosen by the admin who requested the reversal. */
            category?: string;
            /** @description Array of affected employee UUIDs. */
            reversed_employee_uuids?: string[];
        };
        "Gross-Up-Pay": {
            /** @description Gross up earnings. */
            gross_up?: string;
        };
        "Contractor-Payment-Receipt": {
            /** @description A unique identifier of the contractor payment receipt. */
            contractor_payment_uuid?: string;
            /** @description A unique identifier of the company making the contractor payment. */
            company_uuid?: string;
            /** @description The name of the company making the contractor payment. */
            name_of_sender?: string;
            /** @description The individual or company name of the contractor receiving payment. */
            name_of_recipient?: string;
            /**
             * Format: date
             * @description The debit date for the contractor payment.
             * @example 2022-05-30
             */
            debit_date?: string;
            /** @description Always the fixed string "ZenPayroll, Inc., dba Gusto is a licensed money transmitter. For more about Gusto’s licenses and your state-specific rights to request information, submit complaints, dispute errors, or cancel transactions, visit our license page." */
            license?: string;
            /** @description URL for the license information for the licensed payroll processor. Always the fixed string "https://gusto.com/about/licenses" */
            license_uri?: string;
            /** @description URL for information related to right to refund. Always the fixed string "https://gusto.com/about/licenses" */
            right_to_refund?: string;
            /** @description URL for information related to right to liability of licensee. Always the fixed string "https://gusto.com/about/licenses" */
            liability_of_licensee?: string;
            /** @description The subtotals for the contractor payment. */
            totals?: {
                /** @description The total company debit for the contractor payment. */
                company_debit?: string;
            };
            /** @description An array of contractor payments for this contractor payment. */
            contractor_payments?: {
                /** @description The UUID of the contractor. */
                contractor_uuid?: string;
                /** @description The first name of the contractor. Applies when `contractor_type` is `Individual`. */
                contractor_first_name?: string;
                /** @description The last name of the contractor.  Applies when `contractor_type` is `Individual`. */
                contractor_last_name?: string;
                /** @description The business name of the employee. Applies when `contractor_type` is `Business`. */
                contractor_business_name?: string;
                /** @description The type of contractor.
                 *
                 *     `Individual` `Business` */
                contractor_type?: string;
                /** @description The payment method.
                 *
                 *     `Direct Deposit` `Check` `Historical Payment` `Correction Payment` */
                payment_method?: string;
                /** @description The fixed wage of the payment, regardless of hours worked. */
                wage?: string;
                /** @description The bonus amount in the payment. */
                bonus?: string;
                /** @description The reimbursement amount in the payment. */
                reimbursement?: string;
            }[];
            /** @description The licensed payroll processor */
            licensee?: {
                /** @description Always the fixed string "Gusto, Zenpayroll Inc." */
                name?: string;
                /** @description Always the fixed string "525 20th St" */
                address?: string;
                /** @description Always the fixed string "San Francisco" */
                city?: string;
                /** @description Always the fixed string "CA" */
                state?: string;
                /** @description Always the fixed string "94107" */
                postal_code?: string;
                /** @description Always the fixed string "4157778888" */
                phone_number?: string;
            };
        };
        /**
         * @description Input type for the custom field.
         * @enum {string}
         */
        "Custom-Field-Type": "text" | "currency" | "number" | "date" | "radio";
        /** @description A custom field of an employee */
        "Employee-Custom-Field": {
            id: string;
            /** @description This is the id of the response object from when you get the company custom fields */
            company_custom_field_id: string;
            name: string;
            type: components["schemas"]["Custom-Field-Type"];
            description?: string;
            value: string;
            /** @description An array of options for fields of type radio. Otherwise, null. */
            selection_options?: string[] | null;
        };
        /** @description A custom field on a company */
        "Company-Custom-Field": {
            /** @description UUID of the company custom field */
            uuid: string;
            /** @description Name of the company custom field */
            name: string;
            type: components["schemas"]["Custom-Field-Type"];
            /** @description Description of the company custom field */
            description?: string;
            /** @description An array of options for fields of type radio. Otherwise, null. */
            selection_options?: string[] | null;
        };
        Rehire: {
            /** @description The current version of the object. See the [versioning guide](https://docs.gusto.com/embedded-payroll/docs/versioning#object-layer) for information on how to use this field. */
            version?: string;
            /** @description The day when the employee returns to work. */
            effective_date?: string;
            /** @description The boolean flag indicating whether Gusto will file a new hire report for the employee. */
            file_new_hire_report?: boolean;
            /** @description The uuid of the employee's work location. */
            work_location_uuid?: string;
            /**
             * @description The employee's employment status. Supplying an invalid option will set the employment_status to *not_set*.
             * @enum {string}
             */
            employment_status?: "part_time" | "full_time" | "part_time_eligible" | "variable" | "seasonal" | "not_set";
            /** @description Whether the employee is a two percent shareholder of the company. This field only applies to companies with an S-Corp entity type. */
            two_percent_shareholder?: boolean;
            /** @description The UUID of the employee. */
            readonly employee_uuid?: string;
            /** @description Whether the employee's rehire has gone into effect. */
            readonly active?: boolean;
        };
        /**
         * Signatory
         * @description The representation of a company's signatory
         */
        Signatory: {
            uuid: string;
            first_name?: string | null;
            last_name?: string | null;
            title?: string | null;
            phone?: string | null;
            email?: string;
            birthday?: string | null;
            /** @description Whether or not the signatory is also the payroll admin of the company. */
            is_admin?: boolean;
            /** @description Indicates whether the signatory has an SSN in Gusto. */
            has_ssn?: boolean;
            /** @description The current version of the signatory. See the [versioning guide](https://docs.gusto.com/embedded-payroll/docs/idempotency) for information on how to use this field. */
            version?: string;
            /**
             * @description |   |   |
             *     |---|---|
             *     |__Status__| __Description__ |
             *     | Pass | Signatory can sign all forms |
             *     | Fail | Signatory cannot sign forms |
             *     | Skipped | Signatory cannot sign Form 8655 until the form is manually uploaded as wet-signed |
             *     | null | Identity verification process has not been completed |
             * @enum {string|null}
             */
            identity_verification_status?: "Pass" | "Fail" | "Skipped" | null;
            home_address?: {
                street_1?: string;
                street_2?: string;
                city?: string;
                state?: string;
                zip?: string;
                /** @default USA */
                country: string;
            } | null;
        };
        /**
         * Flow
         * @description The representation of a flow in Gusto white-label UI.
         */
        Flow: {
            url?: string;
            expires_at?: string;
        };
        /** @description The representation of an unprocessed termination pay period. */
        "Unprocessed-Termination-Pay-Period": {
            /** @description The start date of the pay period. */
            readonly start_date?: string;
            /** @description The end date of the pay period. */
            end_date?: string;
            /** @description The check date of the pay period. */
            readonly check_date?: string;
            /** @description The debit date of the pay period. */
            debit_date?: string;
            /** @description The full name of the employee. */
            employee_name?: string;
            /** @description A unique identifier of the employee. */
            employee_uuid?: string;
            /** @description A unique identifier of the pay schedule to which the pay period belongs. */
            pay_schedule_uuid?: string;
        };
        /** @description The representation of a pay schedule assignment. */
        "Pay-Schedule-Assignment": {
            /**
             * @description The pay schedule assignment type.
             * @enum {string}
             */
            readonly type?: "single" | "hourly_salaried" | "by_employee" | "by_department";
            /** @description Pay schedule for hourly employees. */
            readonly hourly_pay_schedule_uuid?: string | null;
            /** @description Pay schedule for salaried employees. */
            readonly salaried_pay_schedule_uuid?: string | null;
            /** @description Default pay schedule for employees. */
            readonly default_pay_schedule_uuid?: string | null;
            /** @description List of employees and their pay schedules. */
            readonly employees?: components["schemas"]["Pay-Schedule-Assignment-Employee"][] | null;
            /** @description List of departments and their pay schedules. */
            readonly departments?: components["schemas"]["Pay-Schedule-Assignment-Department"][] | null;
        };
        "Pay-Schedule-Assignment-Employee": {
            /** @description The UUID of the employee. */
            employee_uuid?: string;
            /** @description The employee's pay schedule UUID. */
            pay_schedule_uuid?: string;
        };
        "Pay-Schedule-Assignment-Department": {
            /** @description The UUID of the department. */
            department_uuid?: string;
            /** @description The department's pay schedule UUID. */
            pay_schedule_uuid?: string;
        };
        /** @description The representation of a pay schedule assignment preview. */
        "Pay-Schedule-Assignment-Preview": {
            /**
             * @description The pay schedule assignment type.
             * @enum {string}
             */
            readonly type?: "single" | "hourly_salaried" | "by_employee" | "by_department";
            /** @description A list of pay schedule changes including pay period and transition pay period. */
            employee_changes?: components["schemas"]["Pay-Schedule-Assignment-Employee-Change"][];
        };
        "Pay-Schedule-Assignment-Employee-Change": {
            /** @description The UUID of the employee. */
            readonly employee_uuid?: string;
            /** @description The employee's first name. */
            readonly first_name?: string;
            /** @description The employee's last name. */
            readonly last_name?: string;
            /** @description New pay schedule frequency and name. */
            readonly pay_frequency?: string;
            first_pay_period?: components["schemas"]["Pay-Schedule-Assignment-Pay-Period"];
            transition_pay_period?: components["schemas"]["Pay-Schedule-Assignment-Transition-Pay-Period"];
        };
        /** @description Pay schedule assignment first pay period information. */
        "Pay-Schedule-Assignment-Pay-Period": {
            /** @description The pay schedule UUID. */
            pay_schedule_uuid?: string;
            /** @description Pay period start date. */
            start_date?: string;
            /** @description Pay period end date. */
            end_date?: string;
            /** @description Pay period check date. */
            check_date?: string;
        };
        /** @description Pay schedule assignment transition pay period information. */
        "Pay-Schedule-Assignment-Transition-Pay-Period": {
            /** @description Pay period start date. */
            start_date?: string;
            /** @description Pay period end date. */
            end_date?: string;
        };
        /** @description The representation of an unprocessed termination pay period. */
        "Accruing-Time-Off-Hour": {
            /** @description A unique identifier of the time off policy. */
            time_off_policy_uuid?: string;
            /** @description Hours accrued during this pay period. */
            hours?: string;
        };
        /** Employee-Federal-Tax */
        "Employee-Federal-Tax": {
            /** @description The current version of the object. See the [versioning guide](https://docs.gusto.com/embedded-payroll/docs/idempotency) for information on how to use this field. */
            version?: string;
            /** @description It determines which tax return form an individual will use and is an important factor in computing taxable income. One of:
             *     - Single
             *     - Married
             *     - Head of Household
             *     - Exempt from withholding
             *     - Married, but withhold as Single (does not apply to rev_2020_w4 form) */
            filing_status?: string;
            /** @description An employee can request an additional amount to be withheld from each paycheck. */
            extra_withholding?: string;
            /** @description If there are only two jobs (i.e., you and your spouse each have a job, or you have two), you can set it to true. */
            two_jobs?: boolean;
            /** @description A dependent is a person other than the taxpayer or spouse who entitles the taxpayer to claim a dependency exemption. */
            dependents_amount?: string;
            /** @description Other income amount. */
            other_income?: string;
            deductions?: string;
            /**
             * @description The version of w4 form.
             * @enum {string}
             */
            w4_data_type?: "pre_2020_w4" | "rev_2020_w4";
            /** @description *does not apply to rev_2020_w4 form*
             *
             *     An exemption from paying a certain amount of income tax. */
            federal_withholding_allowance?: number;
            /** @description *does not apply to rev_2020_w4 form* */
            additional_withholding?: boolean;
        };
        /** Employee-State-Tax */
        "Employee-State-Tax": {
            /** @description The employee's uuid */
            employee_uuid: string;
            /** @description Two letter US state abbreviation */
            state: string;
            file_new_hire_report?: boolean;
            is_work_state?: boolean;
            questions: components["schemas"]["Employee-State-Tax-Question"][];
        };
        /** Employee-State-Tax-Question */
        "Employee-State-Tax-Question": {
            /** @description A short title for the question */
            label: string;
            /** @description An explaination of the question - this may contain inline html formatted links. */
            description: string;
            /** @description A unique identifier of the question (for the given state) - used for updating the answer. */
            key: string;
            input_question_format: components["schemas"]["Employee-State-Tax-Input-Question-Format"];
            answers: components["schemas"]["Employee-State-Tax-Answer"][];
        };
        /** Employee-State-Tax-Answer */
        "Employee-State-Tax-Answer": {
            /** @description The answer to the corresponding question - this may be a string, number, boolean, or null. */
            value?: string;
            /** @description The effective date of the answer - currently always “2010-01-01”. */
            valid_from?: string;
            /** @description The effective end date of the answer - currently always null. */
            valid_up_to?: unknown;
        };
        /** Employee-State-Tax-Input-Question-Format */
        "Employee-State-Tax-Input-Question-Format": {
            /** @description Describes the type of question - Text, Number, Select, Currency, Date */
            type: string;
            /** @description For "Select" type questions, the allowed values and display labels. */
            options?: {
                /** @description An allowed value to answer the question */
                value?: string;
                /** @description A display label that corresponds to the answer value */
                label: string;
            }[];
        };
        /** Federal-Tax-Details */
        "Federal-Tax-Details": {
            /** @description The current version of the object. See the [versioning guide](https://docs.gusto.com/embedded-payroll/docs/idempotency) for information on how to use this field. */
            version?: string;
            /** @description What type of tax entity the company is. One of:
             *     - C-Corporation
             *     - S-Corporation
             *     - Sole proprietor
             *     - LLC
             *     - LLP
             *     - Limited partnership
             *     - Co-ownership
             *     - Association
             *     - Trusteeship
             *     - General partnership
             *     - Joint venture
             *     - Non-Profit */
            tax_payer_type?: string;
            /** @description Whether the company is taxed as an S-Corporation. Tax payer types that may be taxed as an S-Corporation include:
             *     - S-Corporation
             *     - C-Corporation
             *     - LLC */
            taxable_as_scorp?: boolean;
            /** @description The form used by the company for federal tax filing. One of:
             *     - 941 (Quarterly federal tax return form)
             *     - 944 (Annual federal tax return form) */
            filing_form?: string;
            /** @description Whether company's Employer Identification Number (EIN) is present */
            has_ein?: boolean;
            /** @description Whether the EIN was able to be verified as a valid EIN with the IRS.  */
            ein_verified?: boolean;
            /** @description The legal name of the company */
            legal_name?: string;
        };
        /** Employee-Bank-Account */
        "Employee-Bank-Account": {
            /** @description UUID of the bank account */
            uuid: string;
            /** @description UUID of the employee */
            employee_uuid?: string;
            /**
             * @description Bank account type
             * @enum {string}
             */
            account_type?: "Checking" | "Savings";
            /** @description Name for the bank account */
            name?: string;
            /** @description The bank account's routing number */
            routing_number?: string;
            /** @description Masked bank account number */
            hidden_account_number?: string;
        };
        /** Contractor-Bank-Account */
        "Contractor-Bank-Account": {
            /** @description UUID of the bank account */
            uuid: string;
            /** @description UUID of the employee */
            contractor_uuid?: string;
            /**
             * @description Bank account type
             * @enum {string}
             */
            account_type?: "Checking" | "Savings";
            /** @description Name for the bank account */
            name?: string;
            /** @description The bank account's routing number */
            routing_number?: string;
            /** @description Masked bank account number */
            hidden_account_number?: string;
        };
        /** Employee-Payment-Method */
        "Employee-Payment-Method": {
            /** @description The current version of the object. See the [versioning guide](https://docs.gusto.com/embedded-payroll/docs/idempotency) for information on how to use this field. */
            version?: string;
            /**
             * @description The payment method type. If type is Check, then split_by and splits do not need to be populated. If type is Direct Deposit, split_by and splits are required.
             * @enum {string}
             */
            type?: "Direct Deposit" | "Check";
            /**
             * @description Describes how the payment will be split. If split_by is Percentage, then the split amounts must add up to exactly 100. If split_by is Amount, then the last split amount must be nil to capture the remainder.
             * @enum {string|null}
             */
            split_by?: "Amount" | "Percentage" | null;
            splits?: components["schemas"]["Payment-Method-Bank-Account"][] | null;
        };
        "Tax-Requirement": {
            key?: components["schemas"]["Tax-Requirement-Key"];
            /** @description An array of references to other requirements within the requirement set. This requirement is only applicable if all referenced requirements have values matching the corresponding `value`. The primary use-case is dynamically hiding and showing requirements as values change. E.g. Show Requirement-B when Requirement-A has been answered with `false`. To be explicit, an empty array means the requirement is applicable. */
            applicable_if?: {
                key?: components["schemas"]["Tax-Requirement-Key"];
                /** @description The required value of the requirement identified by `key` */
                value?: boolean | string | number;
            }[];
            /** @description A customer facing description of the requirement */
            label?: string;
            /** @description A more detailed customer facing description of the requirement */
            description?: string;
            /** @description The "answer" */
            value?: string;
            metadata?: components["schemas"]["Tax-Requirement-Metadata"];
        };
        "Tax-Requirement-Metadata": {
            /**
             * @description Describes the type of requirement - each type may have additional metadata properties to describe possible values, formats, etc.
             *
             *     - `text`: free-text input, no additional requirements
             *     - `currency`: a value representing a dollar amount, e.g. `374.55` representing `$374.55`
             *     - `radio`: choose one of options provided, see `options`
             *     - `select`: choose one of options provided, see `options`
             *     - `percent`: A decimal value representing a percentage, e.g. `0.034` representing `3.4%`
             *     - `account_number`: An account number for a tax agency, more information provided by `mask` and `prefix`
             *     - `tax_rate`: A decimal value representing a tax rate, e.g. `0.034` representing a tax rate of `3.4%`, see `validation` for additional validation guidance
             *     - `workers_compensation_rate`: A decimal value representing a percentage, see `risk_class_code`, `risk_class_description`, and `rate_type`
             *
             * @enum {string}
             */
            readonly type: "text" | "currency" | "radio" | "select" | "percent" | "account_number" | "tax_rate" | "workers_compensation_rate";
            /** @description [for `select` or `radio`] An array of objects describing the possible values. */
            options?: {
                /** @description A customer facing label for the answer */
                label: string;
                /** @description The actual value to be submitted */
                value: string;
                /** @description A less verbose label that may sometimes be available */
                short_label?: string;
            }[];
            /** @description [for `workers_compensation_rate`] The industry risk class code for the rate being requested */
            risk_class_code?: string;
            /** @description [for `workers_compensation_rate`] A description of the industry risk class for the rate being requested */
            risk_class_description?: string;
            /**
             * @description [for `workers_compensation_rate`] The type of rate being collected. Either:
             *      - `percent`: A percentage formatted as a decimal, e.g. `0.01` for 1%
             *      - `currency_per_hour`: A dollar amount per hour, e.g. `3.24` for $3.24/hr
             *
             * @enum {string}
             */
            rate_type?: "percent" | "currency_per_hour";
            /** @description [for `account_number`] A pattern describing the format of the account number
             *
             *     The mask is a sequence of characters representing the requirements of the actual account number. Each character in the mask represents a single character in the account number as follows:
             *     - `#`: a digit (`\d`)
             *     - `@`: a upper or lower case letter (`[a-zA-Z]`)
             *     - `^`: an uppercase letter (`[A-Z]`)
             *     - `%`: a digit or uppercase letter (`[0-9A-Z]`)
             *     - any other character represents the literal character
             *
             *     Examples:
             *     - mask: `WHT-######` represents `WHT-` followed by 5 digits, e.g. `WHT-33421`
             *     - mask: `%####-^^` supports values of `75544-AB` and `Z7654-HK`
             *      */
            mask?: string;
            /** @description [for `account_number`] A value that precedes the value to be collected - useful for display, but should not be submitted as part of the value. E.g. some tax agencies use an account number that is a company's federal ein plus two digits. In that case the mask would be `##` and the prefix `XXXXX1234`. */
            prefix?: string;
            /** @description [for `tax_rate`] Describes the validation required for the tax rate */
            validation?: {
                /**
                 * @description Describes the type of tax_rate validation rule
                 * @enum {string}
                 */
                type: "one_of" | "min_max";
                /** @description [for `min_max`] The inclusive lower bound of the tax rate */
                min?: string;
                /** @description [for `min_max`] The inclusive upper bound of the tax rate */
                max?: string;
                /** @description [for `one_of`] The possible, unformatted tax rates for selection.
                 *     - e.g. ["0.0", "0.001"] representing 0% and 0.1%
                 *      */
                rates?: string[];
            };
        };
        "Tax-Requirement-Set": {
            state?: components["schemas"]["State"];
            key?: components["schemas"]["Tax-Requirement-Set-Key"];
            /** @description Customer facing label for the requirement set, e.g. "Registrations" */
            label?: string;
            effective_from?: components["schemas"]["Tax-Requirement-Effective-From"];
            requirements?: components["schemas"]["Tax-Requirement"][];
        };
        /** Tax-Requirements-State */
        "Tax-Requirements-State": {
            company_uuid?: string;
            state?: components["schemas"]["State"];
            requirement_sets?: components["schemas"]["Tax-Requirement-Set"][];
        };
        /**
         * Tax-Requirement-Set-Key
         * @description An identifier for a set of requirements. A list of requirement sets can contain multiple sets with the same `key` and different `effective_from` values.
         */
        "Tax-Requirement-Set-Key": string;
        /**
         * Tax-Requirement-Key
         * @description An identifier for an individual requirement. Uniqueness is guaranteed within a requirement set.
         */
        "Tax-Requirement-Key": string;
        /**
         * Tax-Requirement-Effective-From
         * @description An ISO 8601 formatted date representing the date values became effective. Some requirement sets are effective dated, while others are not. Multiple requirement sets for the same state/key can/will exist with unique effective dates. If a requirement set is has an `effective_from` value, all requirement sets with the same key will also have an `effective_from` value.
         */
        "Tax-Requirement-Effective-From": string | null;
        /**
         * State
         * @description One of the two-letter state abbreviations for the fifty United States and the District of Columbia (DC)
         */
        State: string;
        /** @description Representation of a Time Off Policy */
        "Time-Off-Policy": {
            /** @description Unique identifier of a time off policy */
            uuid: string;
            /** @description Unique identifier for the company owning the time off policy */
            company_uuid: string;
            /** @description Name of the time off policy */
            name: string;
            /**
             * @description Type of the time off policy
             * @enum {string}
             */
            policy_type: "vacation" | "sick";
            /** @description Policy time off accrual method */
            accrual_method: string;
            /**
             * Format: float
             * @description The rate at which the time off hours will accrue for an employee on the policy. Represented as a float, e.g. "40.0".
             */
            accrual_rate?: string;
            /**
             * Format: float
             * @description The number of hours an employee has to work or be paid for to accrue the number of hours set in the accrual rate. Only used for hourly policies (per_hour_paid, per_hour_paid_no_overtime, per_hour_work, per_hour_worked_no_overtime). Represented as a float, e.g. "40.0".
             */
            accrual_rate_unit?: string;
            /** @description Boolean representing if an employees accrued time off hours will be paid out on termination */
            paid_out_on_termination?: boolean;
            /** @description Number of days before an employee on the policy will begin accruing time off hours */
            accrual_waiting_period_days?: number;
            /**
             * Format: float
             * @description The max number of hours and employee can carryover from one year to the next
             */
            carryover_limit_hours?: string;
            /**
             * Format: float
             * @description The max number of hours and employee can accrue in a year
             */
            max_accrual_hours_per_year?: string;
            /**
             * Format: float
             * @description The max number of hours an employee can accrue
             */
            max_hours?: string;
            /** @description boolean representing if a policy has completed configuration */
            complete?: boolean;
            /** @description The current version of the object. See the [versioning guide](https://docs.gusto.com/embedded-payroll/docs/versioning#object-layer) for information on how to use this field. */
            version?: string;
            /** @description boolean representing if a policy is active or not */
            is_active: boolean;
            /** @description List of employee UUIDs under a time off policy */
            employees: {
                uuid?: string;
            }[];
        };
        /** @description Representation of a Time Off Activity */
        "Time-Off-Activity": {
            /** @description unique identifier of a time off policy */
            policy_uuid?: string;
            /**
             * @description Type of the time off activity
             * @enum {string}
             */
            time_off_type?: "vacation" | "sick";
            /** @description The name of the time off policy for this activity */
            policy_name?: string;
            /** @description The type of the time off event/activity */
            event_type?: string;
            /** @description A description for the time off event/activity */
            event_description?: string;
            /** @description The datetime of the time off activity */
            effective_time?: string;
            /**
             * Format: float
             * @description The time off balance at the time of the activity
             */
            balance?: string;
            /**
             * Format: float
             * @description The amount the time off balance changed as a result of the activity
             */
            balance_change?: string;
        };
        /** @description Representation of a Holiday Pay Policy */
        "Holiday-Pay-Policy": {
            /** @description The current version of the object. See the [versioning guide](https://docs.gusto.com/embedded-payroll/docs/versioning#object-layer) for information on how to use this field. */
            version: string;
            /** @description A unique identifier for the company owning the holiday pay policy */
            company_uuid: string;
            /** @description List of the eleven supported federal holidays and their details */
            federal_holidays: {
                new_years_day?: {
                    selected?: boolean;
                    name?: string;
                    date?: string;
                };
                mlk_day?: {
                    selected?: boolean;
                    name?: string;
                    date?: string;
                };
                presidents_day?: {
                    selected?: boolean;
                    name?: string;
                    date?: string;
                };
                memorial_day?: {
                    selected?: boolean;
                    name?: string;
                    date?: string;
                };
                juneteenth?: {
                    selected?: boolean;
                    name?: string;
                    date?: string;
                };
                independence_day?: {
                    selected?: boolean;
                    name?: string;
                    date?: string;
                };
                labor_day?: {
                    selected?: boolean;
                    name?: string;
                    date?: string;
                };
                columbus_day?: {
                    selected?: boolean;
                    name?: string;
                    date?: string;
                };
                veterans_day?: {
                    selected?: boolean;
                    name?: string;
                    date?: string;
                };
                thanksgiving?: {
                    selected?: boolean;
                    name?: string;
                    date?: string;
                };
            }[];
            /** @description List of employee uuids under a time off policy */
            employees: {
                uuid?: string;
            }[];
        };
        /** @description Representation of a company's paid holidays as descibed by their Holiday Pay Policy */
        "Paid-Holidays": {
            schema?: {
                /** @description the holiday's identifier */
                holiday_key?: string;
                /** @description the holiday's official name */
                holiday_name?: string;
                /** @description the holiday's start date (YYYY-MM-DD) */
                start_date?: string;
                /** @description the holiday's end date (YYYY-MM-DD) */
                end_date?: string;
            };
        };
        /** @description Representation of a Minimum Wage */
        "Minimum-Wage": {
            /** @description unique identifier of a minimum wage */
            uuid: string;
            /**
             * Format: float
             * @description The wage rate for a minimum wage record. Represented as a float, e.g. "15.0".
             */
            wage: string;
            /** @description The type of wage the minimum wage applies to, e.g. "Regular", "Regular-Industry-Specific". */
            wage_type: string;
            /**
             * Format: date
             * @description The date the minimum wage rule is effective on.
             */
            effective_date: string;
            /** @description The governing authority that created the minimum wage, e.g. "City", "State", or "Federal". */
            authority: string;
            /** @description Description of parties the minimum wage applies to. */
            notes?: string;
        };
        /** @description Representation of a notification */
        Notification: {
            /** @description Unique identifier of a notification. */
            uuid: string;
            /** @description Unique identifier of the company to which the notification belongs. */
            company_uuid?: string;
            /** @description The title of the notification. This highlights the actionable component of the notification. */
            title?: string;
            /** @description The message of the notification. This provides additional context for the user and recommends a specific action to resolve the notification. */
            message?: string;
            /** @description The notification's category. */
            category?: string;
            /** @description Indicates whether a notification requires action or not. If false, the notification provides critical information only. */
            actionable?: boolean;
            /** @description Timestamp of when the notification was published. */
            published_at?: string;
            /** @description Timestamp of when the notification is due. If the notification has no due date, this field will be null. */
            due_at?: string;
            /** @description An array of entities relevant to the notification */
            resources?: {
                /** @description The type of entity being described, could be “Contractor”, “Employee”, “BankAccount”, “Payroll”, “ContractorPayment”, “RecoveryCase”, or “Signatory” */
                entity_type: string;
                /** @description Unique identifier of the entity */
                entity_uuid: string;
                /** @description Optional. The type of a resource that is related to the one described by entity_type and entity_uuid. For instance, if the entity_type is “BankAccount”, the reference_type could be the “Employee” or “Contractor” to whom the bank account belongs. */
                reference_type?: string;
                /** @description Optional. Unique identifier of the reference. */
                reference_uuid?: string;
            }[];
        };
        /** @description Representation of an Event */
        Event: {
            /** @description Unique identifier for the event. */
            uuid: string;
            /** @description Description of the event (e.g., payroll.submitted, or company.form.signed). */
            event_type?: string;
            /**
             * @description Name of the parent resource of the described entity.
             * @enum {string}
             */
            resource_type?: "Company";
            /** @description Unique identifier for the parent resource. */
            resource_uuid?: string;
            /** @description Name of the entity that the event corresponds to. */
            entity_type?: string;
            /** @description Unique identifier for the entity. */
            entity_uuid?: string;
            /** @description Time at which this event was created. Measured in seconds since the Unix epoch. */
            timestamp?: number;
        };
        /** @description Representation of a partners invoice data */
        "Invoice-Data": {
            /** @description The list of companies that are active within the invoice period */
            active_companies?: {
                /** @description unique identifier for the company associated with the invoice data */
                company_uuid?: string;
                /** @description The number of active employees the company was or will be invoiced for that invoice period. Active employees are calculated as the count of onboarded employees hired before the end of the invoice period and not terminated before the start of the invoice period. */
                active_employees?: number;
                /** @description The number of active contractors the company was or will be invoiced for that invoice period. Active contractors are calculated as any contractor with an active contractor payment during the invoice period. */
                active_contractors?: number;
                /** @description The first invoice period for the company. This will either be the invoice period of the first invoice-able event (first payroll or contractor payment) or the date they migrated to embedded, whichever is later. */
                initial_invoice_period?: string;
            }[];
        };
        /** @description Representation of a recovery case */
        "Recovery-Case": {
            /** @description Unique identifier of an recovery case */
            uuid: string;
            /** @description Unique identifier of the company to which the recovery case belongs */
            company_uuid?: string;
            /**
             * @description Status of the recovery case
             * @enum {string}
             */
            status?: "open" | "redebit_initiated" | "recovered" | "lost";
            /** @description The latest bank error code for the recovery case. See [this article](https://engineering.gusto.com/how-ach-works-a-developer-perspective-part-2/) for a complete list of ACH return codes. */
            latest_error_code?: string;
            /** @description Date when funds were originally debited from the company's bank account */
            original_debit_date?: string;
            /** @description Check date for the associated payroll or contractor payments */
            check_date?: string;
            /** @description The uuid of the associated payroll for which the recovery case was created. If the recovery case was created for a contractor payment, this field will be null. */
            payroll_uuid?: string;
            /** @description The uuids of the associated contractor payments for which the recovery case was created. If the recovery case was created for a payroll, this field will be null. */
            contractor_payment_uuids?: string[];
            /** @description Amount outstanding for the recovery case */
            amount_outstanding?: string;
            /** @description Total amount to be debited from the payroll or contractor payments */
            event_total_amount?: string;
        };
        /** @description Representation of an ACH transaction */
        "Ach-Transaction": {
            /** @description Unique identifier of an ACH transaction */
            uuid: string;
            /** @description Unique identifier of the company to which the ACH transaction belongs */
            company_uuid?: string;
            /**
             * @description The type of payment event associated with the ACH transaction
             * @enum {string}
             */
            payment_event_type?: "Payroll" | "ContractorPayment";
            /** @description Unique identifier for the payment event associated with the ACH transaction */
            payment_event_uuid?: string;
            /**
             * @description The type of recipient associated with the ACH transaction
             * @enum {string}
             */
            recipient_type?: "Employee" | "Contractor";
            /** @description Unique identifier for the recipient associated with the ACH transaction */
            recipient_uuid?: string;
            /** @description The error code associated with the ACH transaction, if any. If there is no error on the ACH transaction, this field will be nil. See [this article](https://engineering.gusto.com/how-ach-works-a-developer-perspective-part-2/) for a complete list of ACH return codes. */
            error_code?: string;
            /** @description The type of transaction associated with the ACH transaction */
            transaction_type?: string;
            /**
             * @description The status of the ACH transaction
             * @enum {string}
             */
            payment_status?: "unsubmitted" | "submitted" | "successful" | "failed";
            /**
             * @description The direction of the payment
             * @enum {string}
             */
            payment_direction?: "credit" | "debit";
            /** @description The date of the payment event check associated with the ACH transaction */
            payment_event_check_date?: string;
            /** @description The date of the payment associated with the ACH transaction */
            payment_date?: string;
            /** @description The amount of money moved by the ACH transaction. This amount is always non-negative. */
            amount?: string;
            /** @description The description of the ACH transaction. Can be used to identify the ACH transaction on the recipient's bank statement. */
            description?: string;
        };
        /** @description Representation of a wire in request */
        "Wire-In-Request": {
            /** @description Unique identifier of a wire in request */
            uuid?: string;
            /**
             * @description Status of the wire in
             * @enum {string}
             */
            status?: "awaiting_funds" | "pending_review" | "approved" | "rfi" | "canceled";
            /** @description Name of bank receiving the wire in */
            origination_bank?: string;
            /** @description Address of bank receiving the wire in */
            origination_bank_address?: string;
            /** @description Name of the recipient of the wire In */
            recipient_name?: string;
            /** @description Address of the recipient of the wire in */
            recipient_address?: string;
            /** @description Recipient bank account number */
            recipient_account_number?: string;
            /** @description Recipient bank routing number */
            recipient_routing_number?: string;
            /** @description Notes for the wire in request */
            additional_notes?: string;
            /** @description Name of the bank initiating the wire in */
            bank_name?: string;
            /** @description Date the wire in was sent */
            date_sent?: string;
            /** @description Include in note with bank to track payment */
            unique_tracking_code?: string;
            /** @description Type of payment for the wire in */
            payment_type?: string;
            /**
             * @description Unique identifier of the payment
             * @enum {string}
             */
            payment_uuid?: "payroll";
            /** @description Amount sent through wire in */
            amount_sent?: string;
            /** @description Requested amount for the payment */
            requested_amount?: string;
            /** @description Deadline to submit the wire in */
            wire_in_deadline?: string;
        };
    };
    responses: {
        /** @description Unprocessable Entity
         *
         *     This may happen when the body of your request contains errors such as `invalid_attribute_value`, or the request fails due to an `invalid_operation`. See the [Errors Categories](https://docs.gusto.com/embedded-payroll/docs/error-categories) guide for more details.
         *      */
        "Unprocessable-Entity-Error-Object": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Unprocessable-Entity-Error-Object"];
            };
        };
        /** @description Not Found
         *
         *     The requested resource does not exist. Make sure the provided ID/UUID is valid.
         *      */
        "Not-Found-Error-Object": {
            headers: {
                [name: string]: unknown;
            };
            content?: never;
        };
        /** @description Not Found
         *
         *     * The requested resource does not exist. Make sure the provided ID/UUID is valid.
         *     * The employee's employment is not in the right state. */
        "Employment-Not-Found-Error-Object": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Unprocessable-Entity-Error-Object"];
            };
        };
        /** @description Payroll Blockers Error */
        "Payroll-Blockers-Error": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Payroll-Blockers-Error"];
            };
        };
        /** @description Example response */
        "Authentication-Object": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Authentication"];
            };
        };
        /** @description Holiday Pay Policy Object Example */
        "Holiday-Pay-Policy-Object": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Holiday-Pay-Policy"];
            };
        };
        /** @description Paid Holidays Object Example */
        "Paid-Holidays-Object": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Paid-Holidays"];
            };
        };
        /** @description Department Object Example */
        "Department-Object": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Department"];
            };
        };
        /** @description List of departments */
        "Department-List": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Department"][];
            };
        };
        /** @description Example response */
        "Employee-Object": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Employee"];
            };
        };
        /** @description Example response */
        "Employee-List": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Employee"][];
            };
        };
        /** @description Example response */
        "Employee-Address-Object": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Employee-Address"];
            };
        };
        /** @description List of employee addresses */
        "Employee-Address-List": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Employee-Address"][];
            };
        };
        /** @description List of employee work addresses */
        "Employee-Work-Address-List": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Employee-Work-Address"][];
            };
        };
        /** @description Example response */
        "Company-Onboarding-Status-Object": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Company-Onboarding-Status"];
            };
        };
        /** @description Example response */
        "Webhook-Subscription-Object": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Webhook-Subscription"];
            };
        };
        /** @description Example response */
        "Webhook-Subscriptions-List": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Webhook-Subscription"][];
            };
        };
        /** @description Example response */
        "Company-Object": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Company"];
            };
        };
        /** @description Example response */
        "Signatory-Object": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Signatory"];
            };
        };
        /** @description Example response */
        "Contractor-Address-Object": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Contractor-Address"];
            };
        };
        /** @description Example response */
        "Employment-History-List": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": {
                    /** @description The employee's start day of work for an employment. */
                    hire_date?: string;
                    /** @description The employee's last day of work for an employment. */
                    termination_date?: string;
                    /** @description The boolean flag indicating whether Gusto will file a new hire report for the employee. */
                    file_new_hire_report?: boolean;
                    /** @description Whether the employee is a two percent shareholder of the company. This field only applies to companies with an S-Corp entity type. */
                    two_percent_shareholder?: boolean;
                    /**
                     * @description The employee's employment status. Supplying an invalid option will set the employment_status to *not_set*.
                     * @enum {string}
                     */
                    employment_status?: "part_time" | "full_time" | "part_time_eligible" | "variable" | "seasonal" | "not_set";
                }[];
            };
        };
        /** @description Example response */
        "Rehire-Object": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Rehire"];
            };
        };
        /** @description Example response */
        "Unprocessed-Termination-Pay-Period-List": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Unprocessed-Termination-Pay-Period"][];
            };
        };
        /** @description Example response */
        "Accruing-Time-Off-Hour-Object": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Accruing-Time-Off-Hour"][];
            };
        };
        /** @description Example response */
        "Pay-Schedule-Assignment-Object": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Pay-Schedule-Assignment"];
            };
        };
        /** @description Example response */
        "Pay-Schedule-Assignment-Preview-Object": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Pay-Schedule-Assignment-Preview"];
            };
        };
        /** @description Benefit summary response */
        "Benefit-Summary-Object": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Benefit-Summary"];
            };
        };
        /** @description Example response */
        "Company-Benefit-With-Employee-Benefits-Object": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Company-Benefit-With-Employee-Benefits"];
            };
        };
        /** @description Example response */
        "Employee-Pay-Stubs-List": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Employee-Pay-Stub"][];
            };
        };
        /** @description Example response */
        "Signatory-List": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Signatory"][];
            };
        };
        /** @description Example response */
        "External-Payroll-Object": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["External-Payroll"];
            };
        };
        /** @description Example response */
        "External-Payroll-List": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["External-Payroll-Basic"][];
            };
        };
        /** @description Example response */
        "External-Payroll-Tax-Suggestions-List": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["External-Payroll-Tax-Suggestions"][];
            };
        };
        /** @description Example response */
        "Tax-Liabilities-List": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Tax-Liabilities-Selections"][];
            };
        };
        /** @description Example response */
        "Flow-Object": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Flow"];
            };
        };
        /** @description Example response */
        "Form-Object": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Form"];
            };
        };
        /** @description Example response */
        "Form-Object-Pdf": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Form-Pdf"];
            };
        };
        /** @description Example response */
        "Form-List": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Form"][];
            };
        };
        /** @description Example response */
        "Industry-Object": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Industry"];
            };
        };
        /** @description Example response */
        "Job-Object": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Job"];
            };
        };
        /** @description Example response */
        "Job-List": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Job"][];
            };
        };
        /** @description Example response */
        "Employee-Federal-Tax-Object": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Employee-Federal-Tax"];
            };
        };
        /** @description Example response */
        "Location-Object": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Location"];
            };
        };
        /** @description Example response */
        "Location-List": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Location"][];
            };
        };
        /** @description Example response */
        "Contractor-List": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Contractor"][];
            };
        };
        /** @description Example response */
        "Contractor-Object": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Contractor"];
            };
        };
        /** @description Example response. */
        "Contractor-Onboarding-Status-Object": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Contractor-Onboarding-Status"];
            };
        };
        /** @description Example response */
        "Contractor-Payment-Object": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Contractor-Payment"];
            };
        };
        /** @description List of Contractor Payment Groups */
        "Contractor-Payment-Group-List": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Contractor-Payment-Group-Minimal"][];
            };
        };
        /** @description Full contractor payment group object */
        "Contractor-Payment-Group-Object": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Contractor-Payment-Group"];
            };
        };
        /** @description Full contractor payment group object with null uuid */
        "Contractor-Payment-Group-Null-Uuid-Object": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Contractor-Payment-Group"];
            };
        };
        /** @description Example response */
        "Contractor-Payment-Method-Object": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Contractor-Payment-Method"];
            };
        };
        /** @description Example response */
        "Compensation-Object": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Compensation"];
            };
        };
        /** @description Example response */
        "Compensation-List": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Compensation"][];
            };
        };
        /** @description Example response */
        "Garnishment-Object": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Garnishment"];
            };
        };
        /** @description Example response */
        "Garnishment-List": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Garnishment"][];
            };
        };
        /** @description Example Response */
        "Termination-Object": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Termination"];
            };
        };
        /** @description Example response */
        "Termination-List": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Termination"][];
            };
        };
        /** @description Example response */
        "Time-Off-Request-Object": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Time-Off-Request"];
            };
        };
        /** @description Example response */
        "Time-Off-Request-List": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Time-Off-Request"][];
            };
        };
        /** @description Example response */
        "Pay-Period-List": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Pay-Period"][];
            };
        };
        /** @description Example response */
        "Pay-Schedule-Object": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Pay-Schedule"];
            };
        };
        /** @description Example response */
        "Pay-Schedule-List": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Pay-Schedule"][];
            };
        };
        /** @description Benefit type requirements response */
        "Benefit-Type-Requirements-Object": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Benefit-Type-Requirements"];
            };
        };
        /** @description Supported benefit response */
        "Supported-Benefit-Object": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Supported-Benefit"];
            };
        };
        /** @description Example response */
        "Supported-Benefit-List": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Supported-Benefit"][];
            };
        };
        /** @description Example response */
        "Admin-Object": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Admin"];
            };
        };
        /** @description Example response */
        "Admin-List": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Admin"][];
            };
        };
        /** @description Example response */
        "Company-Benefit-Object": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Company-Benefit"];
            };
        };
        /** @description Example response */
        "Company-Benefit-List": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Company-Benefit"][];
            };
        };
        /** @description Example response */
        "Company-Custom-Field-List": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": {
                    custom_fields?: components["schemas"]["Company-Custom-Field"][];
                };
            };
        };
        /** @description Example response */
        "Earning-Type-List": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": {
                    /** @description The default earning types for the company. */
                    default?: components["schemas"]["Earning-Type"][];
                    /** @description The custom earning types for the company. */
                    custom?: components["schemas"]["Earning-Type"][];
                };
            };
        };
        /** @description Example response */
        "Earning-Type-Object": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Earning-Type"];
            };
        };
        /** @description Example response */
        "Employee-Benefit-Object": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Employee-Benefit"];
            };
        };
        /** @description Example response */
        "Employee-Benefit-List": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Employee-Benefit"][];
            };
        };
        /** @description A prepared payroll */
        "Payroll-Update-Object": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Payroll-Prepared"];
            };
        };
        /** @description Example response */
        "Payroll-Show-Object": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Payroll"];
            };
        };
        /** @description Example response */
        "Payroll-List": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Payroll-Minimal"][];
            };
        };
        /** @description Example response */
        "Payment-Configs-Object": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Payment-Configs"];
            };
        };
        /** @description Example response */
        "Company-Bank-Account-Object": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Company-Bank-Account"];
            };
        };
        /** @description Example response */
        "Company-Bank-Account-List": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Company-Bank-Account"][];
            };
        };
        /** @description Example response */
        "Employee-Bank-Account-Object": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Employee-Bank-Account"];
            };
        };
        /** @description Example response */
        "Employee-Bank-Account-List": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Employee-Bank-Account"][];
            };
        };
        /** @description Example response */
        "Employee-Payment-Method-Object": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Employee-Payment-Method"];
            };
        };
        /** @description Example response */
        "Federal-Tax-Details-Object": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Federal-Tax-Details"];
            };
        };
        /** @description Example response */
        "Employee-State-Taxes-List": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Employee-State-Tax"][];
            };
        };
        /** @description Example response. */
        "Employee-Onboarding-Status-Object": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Employee-Onboarding-Status"];
            };
        };
        /** @description Example response */
        "Payroll-Blocker-List": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Payroll-Blocker"][];
            };
        };
        /** @description Example response */
        "Generated-Document": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Generated-Document"];
            };
        };
        /** @description Example response */
        Report: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Report"];
            };
        };
        /** @description Example response */
        "Create-Report": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Create-Report"];
            };
        };
        /** @description Example response */
        "Report-Template": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Report-Template"];
            };
        };
        /** @description Example response */
        Notification: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Notification"];
            };
        };
        /** @description Example response */
        "Event-List": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Event"][];
            };
        };
        /** @description Example response */
        "Payroll-Check": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Payroll-Check"];
            };
        };
        /** @description Example response */
        "Payroll-Receipt": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Payroll-Receipt"];
            };
        };
        /** @description Example response */
        "Payroll-Reversal-List": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Payroll-Reversal"];
            };
        };
        /** @description Example response */
        "Gross-Up-Pay": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Gross-Up-Pay"];
            };
        };
        /** @description Example response */
        "Contractor-Payment-Receipt": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Contractor-Payment-Receipt"];
            };
        };
        /** @description Example response */
        "Contractor-Bank-Account-Object": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Contractor-Bank-Account"];
            };
        };
        /** @description Example response */
        "Contractor-Bank-Account-List": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Contractor-Bank-Account"][];
            };
        };
        /** @description Example response */
        "Time-Off-Policy-Object": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Time-Off-Policy"];
            };
        };
        /** @description Example response */
        "Time-Off-Policy-List": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Time-Off-Policy"][];
            };
        };
        /** @description Example response */
        "Time-Off-Activity-Object": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Time-Off-Activity"];
            };
        };
        /** @description Example response */
        "Minimum-Wage-Object": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Minimum-Wage"];
            };
        };
        /** @description Example response */
        "Invoice-Data-Object": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Invoice-Data"];
            };
        };
        /** @description Example response */
        "Minimum-Wage-List": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Minimum-Wage"][];
            };
        };
        /** @description Example response */
        "Recovery-Case-List": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Recovery-Case"][];
            };
        };
        /** @description Example response */
        "Ach-Transaction-List": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Ach-Transaction"][];
            };
        };
        /** @description Example response */
        "Wire-In-Request-Object": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Wire-In-Request"];
            };
        };
        /** @description Example response */
        "Wire-In-Request-List": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Wire-In-Request"][];
            };
        };
    };
    parameters: {
        /** @description A string to search for in the object's names */
        search_term: string;
        /** @description The page that is requested. When unspecified, will load all objects unless endpoint forces pagination. */
        pageParam: number;
        /** @description The page that is requested. When unspecified, will load the first page. */
        page: number;
        /** @description Number of objects per page. For majority of endpoints will default to 25 */
        perParam: number;
        start_date: string;
        /** @description If left empty, defaults to today's date. */
        end_date: string;
        /** @description The UUID of the bank account */
        bank_account_uuid: string;
        /** @description The benefit type in Gusto. */
        benefit_id: string;
        /** @description The UUID of the compensation */
        compensation_id: string;
        /** @description The UUID of the company benefit */
        company_benefit_id: string;
        /** @description The UUID of the company */
        company_id: string;
        /** @description The UUID of the company */
        company_uuid: string;
        /** @description The UUID of the contractor */
        contractor_id: string;
        /** @description The UUID of the contractor */
        contractor_uuid: string;
        /** @description The UUID of the contractor payment */
        contractor_payment_id: string;
        /** @description The UUID of the contractor payment */
        contractor_payment_uuid: string;
        /** @description The UUID of the contractor payment group */
        contractor_payment_group_uuid: string;
        /** @description The UUID of the department */
        department_uuid: string;
        /** @description The UUID of the earning type */
        earning_type_uuid: string;
        effective_date: string;
        /** @description The UUID of the employee benefit. */
        employee_benefit_id: string;
        /** @description The UUID of the employee */
        employee_id: string;
        /** @description The UUID of the employee */
        employee_uuid: string;
        /** @description A string indicating whether to sort resulting events in ascending (asc) or descending (desc) chronological order. Events are sorted by their `timestamp`. Defaults to asc if left empty. */
        sort_order: "asc" | "desc";
        /** @description A string containing the exact event name (e.g. `employee.created`), or use a wildcard match to filter for a group of events (e.g. `employee.*`, `*.created`, `notification.*.created` etc.) */
        event_type: string;
        /** @description The UUID of the external payroll */
        external_payroll_id: string;
        /** @description The UUID of the form */
        form_id: string;
        /** @description The UUID of the garnishment */
        garnishment_id: string;
        /** @description The UUID of the home address */
        home_address_uuid: string;
        /** @description The UUID of the work address */
        work_address_uuid: string;
        /** @description The UUID of the job */
        job_id: string;
        /** @description Limits the number of objects returned in a single response, between 1 and 100. The default is 25 */
        limit: string;
        /** @description The UUID of the location */
        location_id: string;
        /** @description The UUID of the location */
        location_uuid: string;
        /** @description The UUID of the payroll */
        payroll_id: string;
        /** @description The UUID of the payroll */
        payroll_uuid: string;
        /** @description The UUID of the pay schedule */
        pay_schedule_id: string;
        /** @description regular and/or transition. Multiple options are comma separated. The default is regular pay periods if nothing is passed in. */
        payroll_types: string;
        /** @description the type of document being generated */
        document_type: string;
        /** @description The report type */
        report_type: string;
        /** @description The UUID of the report request */
        report_uuid: string;
        /** @description The UUID of the Generated Document Request */
        request_uuid: string;
        /** @description The UUID of the signatory */
        signatory_uuid: string;
        /** @description A cursor for pagination. Returns all events occuring after the specified UUID (exclusive). Events are sorted according to the provided sort_order param. */
        starting_after_uuid: string;
        /** @description The UUID of the company. If not specified, will return all events for all companies. */
        resource_uuid: string;
        /** @description The time off type name you want to query data for. ex: 'sick' or 'vacation' */
        time_off_type: string;
        /** @description The UUID of the company time off policy */
        time_off_policy_uuid: string;
        /** @description The webhook subscription UUID. */
        webhook_subscription_uuid: string;
        /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
        VersionHeader: "2024-04-01";
        /** @description The UUID of the notification */
        notification_uuid: string;
        /** @description The month we are calculating the invoice for. Must be in YYYY-MM format */
        invoice_period: string;
        /** @description The UUID of the recovery case */
        recovery_case_uuid: string;
        /** @description The UUID of the contractor payment */
        contractor_payment_uuid_query: string;
        /** @description The UUID of the payroll */
        payroll_uuid_query: string;
        /** @description Used to filter the ACH transactions to only include those with a specific transaction type, such as "Credit employee pay". */
        transaction_type: string;
        /** @description Used to filter the ACH transactions to only include those with a specific payment direction, either "credit" or "debit". */
        payment_direction: string;
        /** @description The UUID of the Wire In Request */
        wire_in_request_uuid: string;
    };
    requestBodies: {
        "post-employee-ytd-benefit-amounts-from-different-company": {
            content: {
                "application/json": {
                    /** @description The benefit type supported by Gusto. */
                    benefit_type?: number;
                    /** @description The tax year for which this amount applies. */
                    tax_year: number;
                    /**
                     * @description The year-to-date employee deduction made outside the current company.
                     * @default 0.00
                     */
                    ytd_employee_deduction_amount: string;
                    /**
                     * @description The year-to-date company contribution made outside the current company.
                     * @default 0.00
                     */
                    ytd_company_contribution_amount: string;
                };
            };
        };
    };
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    "get-v1-token-info": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Example response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @description Space delimited string of accessible scopes. */
                        scope: string;
                        /** @description Information about the token resource. */
                        resource: {
                            /** @description Type of object */
                            type: string;
                            /** @description UUID of object */
                            uuid: string;
                        };
                        /** @description Information about the token owner */
                        resource_owner: {
                            /** @enum {string} */
                            type: "CompanyAdmin" | "Employee" | "Contractor";
                            /** @description UUID of resource owner */
                            uuid: string;
                        } | null;
                    };
                };
            };
        };
    };
    "refresh-access-token": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description Your client id */
                    client_id: string;
                    /** @description Your client secret */
                    client_secret: string;
                    /** @description The redirect URI you set up via the Developer Portal */
                    redirect_uri?: string;
                    /** @description The `refresh_token` being exchanged for an access token code */
                    refresh_token: string;
                    /** @description this should be the literal string 'refresh_token' */
                    grant_type: string;
                };
            };
        };
        responses: {
            200: components["responses"]["Authentication-Object"];
        };
    };
    "post-v1-partner-managed-companies": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description Information for the user who will be the primary payroll administrator for the new company. */
                    user: {
                        /** @description The first name of the user who will be the primary payroll admin. */
                        first_name: string;
                        /** @description The last name of the user who will be the primary payroll admin. */
                        last_name: string;
                        /** @description The email of the user who will be the primary payroll admin. */
                        email: string;
                        /** @description The phone number of the user who will be the primary payroll admin. */
                        phone?: string;
                    };
                    company: {
                        /** @description The legal name of the company. */
                        name: string;
                        /** @description The name of the company. */
                        trade_name?: string;
                        /** @description The employer identification number (EIN) of the company. */
                        ein?: string;
                    };
                };
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @description Access token that can be used for OAuth access to the account. Access tokens expire 2 hours after they are issued. */
                        readonly access_token?: string;
                        /** @description Refresh token that can be exchanged for a new access token. */
                        readonly refresh_token?: string;
                        /** @description Gusto’s UUID for the company */
                        readonly company_uuid?: string;
                        /** @description Time of access_token expiration in seconds */
                        readonly expires_in?: number;
                    };
                };
            };
            /** @description Authorization information is missing or invalid. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "get-v1-companies": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_id: components["parameters"]["company_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Company-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "put-v1-partner-managed-companies-company-uuid-migrate": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_uuid: components["parameters"]["company_uuid"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description Email of the company signatory who is authorized to accept our [Terms of Service](https://flows.gusto.com/terms) and migration decision. You can retrieve the signatory email from the `GET /v/1/companies/{company_id}/signatories` endpoint. */
                    email: string;
                    /** @description The IP address of the signatory who viewed and accepted the Terms of Service. */
                    ip_address: string;
                    /** @description The signatory's user ID on your platform. */
                    external_user_id: string;
                };
            };
        };
        responses: {
            /** @description Example response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @description The company UUID */
                        company_uuid?: string;
                        /** @description The migration status */
                        migration_status?: string;
                    };
                };
            };
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "post-partner-managed-companies-company_uuid-accept_terms_of_service": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_uuid: components["parameters"]["company_uuid"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description The user's email address on Gusto. You can retrieve the user's email via company's `/admins`, `/employees`, `/signatories`, and `/contractors` endpoints. */
                    email: string;
                    /** @description The IP address of the user who viewed and accepted the Terms of Service. */
                    ip_address: string;
                    /** @description The user ID on your platform. */
                    external_user_id: string;
                };
            };
        };
        responses: {
            /** @description Example response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @description Whether the latest terms have been accepted by the user. */
                        latest_terms_accepted?: boolean;
                    };
                };
            };
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "post-partner-managed-companies-company_uuid-retrieve_terms_of_service": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_uuid: components["parameters"]["company_uuid"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description The user's email address on Gusto. You can retrieve the user's email via company's `/admins`, `/employees`, `/signatories`, and `/contractors` endpoints. */
                    email: string;
                };
            };
        };
        responses: {
            /** @description Example response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @description Whether the latest terms have been accepted by the user. */
                        latest_terms_accepted?: boolean;
                    };
                };
            };
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "get-invoices-invoice-period": {
        parameters: {
            query?: {
                /** @description The page that is requested. When unspecified, will load all objects unless endpoint forces pagination. */
                page?: components["parameters"]["pageParam"];
                /** @description Number of objects per page. For majority of endpoints will default to 25 */
                per?: components["parameters"]["perParam"];
                /** @description Filter companies returned in the active_companies response, will return an error if company not active during provided invoice period. i.e. `?company_uuids=781922d8-e780-4b6b-bf74-ee303166d022,bbbca930-7322-491c-ba7f-98707a52a9c5` */
                company_uuids?: string;
            };
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The month we are calculating the invoice for. Must be in YYYY-MM format */
                invoice_period: components["parameters"]["invoice_period"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Invoice-Data-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "get-v1-companies-company_id-federal_tax_details": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_id: components["parameters"]["company_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Federal-Tax-Details-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "put-v1-companies-company_id-federal_tax_details": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_id: components["parameters"]["company_id"];
            };
            cookie?: never;
        };
        /** @description Attributes related to federal tax details that can be updated via this endpoint include: */
        requestBody?: {
            content: {
                "application/json": {
                    /** @description The legal name of the company */
                    legal_name?: string;
                    /** @description The EIN of of the company */
                    ein?: string;
                    /**
                     * @description What type of tax entity the company is
                     * @enum {string}
                     */
                    tax_payer_type?: "C-Corporation" | "S-Corporation" | "Sole proprietor" | "LLC" | "LLP" | "Limited partnership" | "Co-ownership" | "Association" | "Trusteeship" | "General partnership" | "Joint venture" | "Non-Profit";
                    /** @description The form used by the company for federal tax filing. One of:
                     *     - 941 (Quarterly federal tax return)
                     *     - 944 (Annual federal tax return) */
                    filing_form?: string;
                    /** @description Whether this company should be taxed as an S-Corporation */
                    taxable_as_scorp?: boolean;
                    /** @description The current version of the object. See the [versioning guide](https://docs.gusto.com/embedded-payroll/docs/versioning#object-layer) for information on how to use this field. */
                    version: string;
                };
            };
        };
        responses: {
            200: components["responses"]["Federal-Tax-Details-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "get-v1-company-industry": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_id: components["parameters"]["company_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Industry-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "put-v1-company-industry": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_id: components["parameters"]["company_id"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description Industry title */
                    title: string;
                    /** @description North American Industry Classification System (NAICS) is used to classify businesses with a six digit number based on the primary type of work the business performs */
                    naics_code: string;
                    /** @description A list of Standard Industrial Classification (SIC) codes, which are four digit number that categorize the industries that companies belong to based on their business activities. If sic_codes is not passed in, we will perform an internal lookup with naics_code. */
                    sic_codes?: string[];
                };
            };
        };
        responses: {
            200: components["responses"]["Industry-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "get-v1-companies-company_id-admins": {
        parameters: {
            query?: {
                /** @description The page that is requested. When unspecified, will load all objects unless endpoint forces pagination. */
                page?: components["parameters"]["pageParam"];
                /** @description Number of objects per page. For majority of endpoints will default to 25 */
                per?: components["parameters"]["perParam"];
            };
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_id: components["parameters"]["company_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Admin-List"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "post-v1-companies-company_id-admins": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_id: components["parameters"]["company_id"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description The first name of the admin. */
                    first_name: string;
                    /** @description The last name of the admin. */
                    last_name: string;
                    /** @description The email of the admin for Gusto's system. If the email matches an existing user, this will create an admin account for them. */
                    email: string;
                };
            };
        };
        responses: {
            200: components["responses"]["Admin-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "get-v1-companies-company_uuid-signatories": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_uuid: components["parameters"]["company_uuid"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Signatory-List"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "post-v1-company-signatories": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_uuid: components["parameters"]["company_uuid"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    ssn: string;
                    first_name: string;
                    middle_initial?: string;
                    last_name: string;
                    email: string;
                    title: string;
                    phone: string;
                    birthday: string;
                    /** @description The signatory's home address */
                    home_address: {
                        street_1: string;
                        street_2?: string;
                        city: string;
                        state: string;
                        zip: string;
                    };
                };
            };
        };
        responses: {
            201: components["responses"]["Signatory-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "post-v1-companies-company_uuid-signatories-invite": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_uuid: components["parameters"]["company_uuid"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    first_name?: string;
                    last_name?: string;
                    title?: string;
                    email: string;
                };
            };
        };
        responses: {
            201: components["responses"]["Signatory-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "put-v1-companies-company_uuid-signatories-signatory_uuid": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_uuid: components["parameters"]["company_uuid"];
                /** @description The UUID of the signatory */
                signatory_uuid: components["parameters"]["signatory_uuid"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description The current version of the object. See the versioning guide for information on how to use this field. */
                    version?: string;
                    first_name?: string;
                    middle_initial?: string;
                    last_name?: string;
                    title?: string;
                    phone?: string;
                    birthday?: string;
                    ssn?: string;
                    home_address?: {
                        street_1?: string;
                        street_2?: string;
                        city?: string;
                        state?: string;
                        zip?: string;
                    };
                };
            };
        };
        responses: {
            200: components["responses"]["Signatory-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "delete-v1-companies-company_uuid-signatories-signatory_uuid": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_uuid: components["parameters"]["company_uuid"];
                /** @description The UUID of the signatory */
                signatory_uuid: components["parameters"]["signatory_uuid"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "get-v1-company-onboarding-status": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_uuid: components["parameters"]["company_uuid"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Company-Onboarding-Status-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "get-v1-company-finish-onboarding": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_uuid: components["parameters"]["company_uuid"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Company-Onboarding-Status-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "get-v1-companies-company_id-custom_fields": {
        parameters: {
            query?: {
                /** @description The page that is requested. When unspecified, will load all objects unless endpoint forces pagination. */
                page?: components["parameters"]["pageParam"];
                /** @description Number of objects per page. For majority of endpoints will default to 25 */
                per?: components["parameters"]["perParam"];
            };
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_id: components["parameters"]["company_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Company-Custom-Field-List"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "post-v1-company-flows": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_uuid: components["parameters"]["company_uuid"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description flow type */
                    flow_type: string;
                    /** @description UUID of the target entity applicable to the flow. This field is optional for company flows, please refer to the flow_types table above for more details. */
                    entity_uuid?: string;
                    /**
                     * @description the type of target entity applicable to the flow. This field is optional for company flows, please refer to the flow_types table above for more details.
                     * @enum {string}
                     */
                    entity_type?: "Company" | "Employee";
                };
            };
        };
        responses: {
            201: components["responses"]["Flow-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "get-v1-companies-company_id-locations": {
        parameters: {
            query?: {
                /** @description The page that is requested. When unspecified, will load all objects unless endpoint forces pagination. */
                page?: components["parameters"]["pageParam"];
                /** @description Number of objects per page. For majority of endpoints will default to 25 */
                per?: components["parameters"]["perParam"];
            };
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_id: components["parameters"]["company_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Location-List"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "post-v1-companies-company_id-locations": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_id: components["parameters"]["company_id"];
            };
            cookie?: never;
        };
        /** @description Create a company location. */
        requestBody?: {
            content: {
                "application/json": {
                    phone_number: string;
                    street_1: string;
                    street_2?: string | null;
                    city: string;
                    state: string;
                    zip: string;
                    /** @default USA */
                    country?: string;
                    /** @description Specify if this location is the company's mailing address. */
                    mailing_address?: boolean;
                    /** @description Specify if this location is the company's filing address. */
                    filing_address?: boolean;
                };
            };
        };
        responses: {
            201: components["responses"]["Location-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "get-v1-locations-location_id": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the location */
                location_id: components["parameters"]["location_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Location-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "put-v1-locations-location_id": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the location */
                location_id: components["parameters"]["location_id"];
            };
            cookie?: never;
        };
        /** @description Update a location */
        requestBody?: {
            content: {
                "application/json": components["schemas"]["Versionable-Required"] & {
                    phone_number?: string;
                    street_1?: string;
                    street_2?: string | null;
                    city?: string;
                    state?: string;
                    zip?: string;
                    country?: string;
                    /** @description For a company location, specify if this location is the company's mailing address. A company has a single mailing address, so this designation will override any previous selection. */
                    mailing_address?: boolean;
                    /** @description For a company location, specify if this location is the company's filing address. A company has a single filing address, so this designation will override any previous selection. */
                    filing_address?: boolean;
                };
            };
        };
        responses: {
            200: components["responses"]["Location-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "get-v1-locations-location_uuid-minimum_wages": {
        parameters: {
            query?: {
                effective_date?: components["parameters"]["effective_date"];
            };
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the location */
                location_uuid: components["parameters"]["location_uuid"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Minimum-Wage-List"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "get-v1-companies-company_id-bank-accounts": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_id: components["parameters"]["company_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Company-Bank-Account-List"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "post-v1-companies-company_id-bank-accounts": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_id: components["parameters"]["company_id"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description The bank routing number */
                    routing_number?: string;
                    /** @description The bank account number */
                    account_number?: string;
                    /**
                     * @description The bank account type
                     * @enum {string}
                     */
                    account_type?: "Checking" | "Savings";
                };
            };
        };
        responses: {
            201: components["responses"]["Company-Bank-Account-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "put-v1-companies-company_id-bank-accounts-verify": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the bank account */
                bank_account_uuid: components["parameters"]["bank_account_uuid"];
                /** @description The UUID of the company */
                company_id: components["parameters"]["company_id"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description The dollar amount of the first micro-deposit */
                    deposit_1?: number;
                    /** @description The dollar amount of the second micro-deposit */
                    deposit_2?: number;
                };
            };
        };
        responses: {
            200: components["responses"]["Company-Bank-Account-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "get-v1-company-external-payrolls": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_uuid: components["parameters"]["company_uuid"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["External-Payroll-List"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "post-v1-external-payroll": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_uuid: components["parameters"]["company_uuid"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description External payroll's check date. */
                    check_date: string;
                    /** @description External payroll's pay period start date. */
                    payment_period_start_date: string;
                    /** @description External payroll's pay period end date. */
                    payment_period_end_date: string;
                };
            };
        };
        responses: {
            200: components["responses"]["External-Payroll-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "get-v1-external-payroll": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_uuid: components["parameters"]["company_uuid"];
                /** @description The UUID of the external payroll */
                external_payroll_id: components["parameters"]["external_payroll_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["External-Payroll-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "put-v1-external-payroll": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_uuid: components["parameters"]["company_uuid"];
                /** @description The UUID of the external payroll */
                external_payroll_id: components["parameters"]["external_payroll_id"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description Patch update external payroll items when set to true, otherwise it will overwrite the previous changes. */
                    replace_fields?: boolean;
                    external_payroll_items?: {
                        /** @description The UUID of the employee. */
                        employee_uuid?: string;
                        earnings?: {
                            /** @description The hour of the compensation for the pay period. */
                            hours?: string;
                            /** @description The amount of the earning. */
                            amount?: string;
                            /** @description The ID of the earning. */
                            earning_id?: number;
                            /**
                             * @description The earning type for the compensation.
                             * @enum {string}
                             */
                            earning_type?: "CompanyPayType" | "CompanyEarningType";
                        }[];
                        benefits?: {
                            /** @description Company contribution amount towards the benefit */
                            company_contribution_amount?: string;
                            /** @description Employee deduction amount towards the benefit */
                            employee_deduction_amount?: string;
                            /** @description The ID of the benefit. */
                            benefit_id?: number;
                        }[];
                        /** @description An array of taxes for the employee. Depends on your company selections, taxes include federal income tax, social security, medicare, and more. */
                        taxes?: {
                            /** @description The amount of the tax. */
                            amount?: string;
                            /** @description The ID of the tax. */
                            tax_id?: number;
                        }[];
                    }[];
                };
            };
        };
        responses: {
            200: components["responses"]["External-Payroll-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "delete-v1-external-payroll": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_uuid: components["parameters"]["company_uuid"];
                /** @description The UUID of the external payroll */
                external_payroll_id: components["parameters"]["external_payroll_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "get-v1-external-payroll-calculate-taxes": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_uuid: components["parameters"]["company_uuid"];
                /** @description The UUID of the external payroll */
                external_payroll_id: components["parameters"]["external_payroll_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["External-Payroll-Tax-Suggestions-List"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "get-v1-tax-liabilities": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_uuid: components["parameters"]["company_uuid"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Tax-Liabilities-List"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "put-v1-tax-liabilities": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_uuid: components["parameters"]["company_uuid"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    liability_selections?: {
                        /** @description The ID of the tax. */
                        tax_id?: number;
                        /** @description The UUID of the last unpaid external payroll uuid. It should be null when the full amount of tax liability has been paid. */
                        last_unpaid_external_payroll_uuid?: string | null;
                        /** @description A selection of unpaid liability amount. */
                        unpaid_liability_amount?: number;
                    }[];
                };
            };
        };
        responses: {
            200: components["responses"]["Tax-Liabilities-List"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "put-v1-tax-liabilities-finish": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_uuid: components["parameters"]["company_uuid"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Accepted */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "get-v1-company-payment-configs": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_uuid: components["parameters"]["company_uuid"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Payment-Configs-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "put-v1-company-payment-configs": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_uuid: components["parameters"]["company_uuid"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description Fast payment limit. This limit is an aggregate of all fast payrolls amount. */
                    fast_payment_limit: string;
                    /**
                     * @description Gusto Embedded supports three payment speeds (1-day, 2-day, and 4-day). For next-day payments, funds are deposited in your team's bank account by the end of the next business day. Most people will see the funds arrive the next afternoon, but payments may arrive as late as the end of the business day.
                     * @enum {string}
                     */
                    payment_speed: "1-day" | "2-day" | "4-day";
                };
            };
        };
        responses: {
            200: components["responses"]["Payment-Configs-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "get-v1-companies-company_id-pay_schedules": {
        parameters: {
            query?: {
                /** @description The page that is requested. When unspecified, will load all objects unless endpoint forces pagination. */
                page?: components["parameters"]["pageParam"];
                /** @description Number of objects per page. For majority of endpoints will default to 25 */
                per?: components["parameters"]["perParam"];
            };
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_id: components["parameters"]["company_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Pay-Schedule-List"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "post-v1-companies-company_id-pay_schedules": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_id: components["parameters"]["company_id"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /**
                     * @description The frequency that employees on this pay schedule are paid with Gusto.
                     * @enum {string}
                     */
                    frequency: "Every week" | "Every other week" | "Twice per month" | "Monthly";
                    /**
                     * @description The first date that employees on this pay schedule are paid with Gusto.
                     * @example 2020-05-15
                     */
                    anchor_pay_date: string;
                    /**
                     * @description The last date of the first pay period. This can be the same date as the anchor pay date.
                     * @example 2020-05-08
                     */
                    anchor_end_of_pay_period: string;
                    /** @description An integer between 1 and 31 indicating the first day of the month that employees are paid. This field is only relevant for pay schedules with the “Twice per month” and “Monthly” frequencies. It will be null for pay schedules with other frequencies. */
                    day_1?: number | null;
                    /** @description An integer between 1 and 31 indicating the second day of the month that employees are paid. This field is the second pay date for pay schedules with the "Twice per month" frequency. For semi-monthly pay schedules, set this field to 31. For months shorter than 31 days, we will set the second pay date to the last day of the month. It will be null for pay schedules with other frequencies. */
                    day_2?: number | null;
                    /** @description A custom pay schedule name, defaults to the pay frequency description. */
                    custom_name?: string;
                };
            };
        };
        responses: {
            200: components["responses"]["Pay-Schedule-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "get-v1-companies-company_id-pay_schedules-preview": {
        parameters: {
            query?: {
                /** @description The frequency that employees on this pay schedule are paid with Gusto. */
                frequency?: "Every week" | "Every other week" | "Twice per month" | "Monthly";
                /** @description The first date that employees on this pay schedule are paid with Gusto. */
                anchor_pay_date?: string;
                /** @description The last date of the first pay period. This can be the same date as the anchor pay date. */
                anchor_end_of_pay_period?: string;
                /** @description An integer between 1 and 31 indicating the first day of the month that employees are paid. This field is only relevant for pay schedules with the “Twice per month” and “Monthly” frequencies. It will be null for pay schedules with other frequencies. */
                day_1?: number;
                /** @description An integer between 1 and 31 indicating the second day of the month that employees are paid. This field is the second pay date for pay schedules with the "Twice per month" frequency. For semi-monthly pay schedules, set this field to 31. For months shorter than 31 days, we will set the second pay date to the last day of the month. It will be null for pay schedules with other frequencies. */
                day_2?: number;
            };
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_id: components["parameters"]["company_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @description A list of pay periods for the previewed pay schedule */
                        pay_periods?: {
                            /** @description The payment date, "Check date", for the pay period */
                            check_date?: string;
                            /** @description The deadline to run payroll for direct deposit on the check date */
                            run_payroll_by?: string;
                            /** @description The first day of the pay period */
                            start_date?: string;
                            /** @description The last day of the pay period. */
                            end_date?: string;
                        }[];
                        /** @description A list of dates for bank closures */
                        holidays?: string[];
                    };
                };
            };
        };
    };
    "get-v1-companies-company_id-pay_schedules-pay_schedule_id": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_id: components["parameters"]["company_id"];
                /** @description The UUID of the pay schedule */
                pay_schedule_id: components["parameters"]["pay_schedule_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Pay-Schedule-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "put-v1-companies-company_id-pay_schedules-pay_schedule_id": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_id: components["parameters"]["company_id"];
                /** @description The UUID of the pay schedule */
                pay_schedule_id: components["parameters"]["pay_schedule_id"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description The current version of the object. See the [versioning guide](https://docs.gusto.com/embedded-payroll/docs/versioning#object-layer) for information on how to use this field. */
                    version: string;
                    /**
                     * @description The frequency that employees on this pay schedule are paid with Gusto.
                     * @enum {string}
                     */
                    frequency?: "Every week" | "Every other week" | "Twice per month" | "Monthly";
                    /**
                     * @description The first date that employees on this pay schedule are paid with Gusto.
                     * @example 2020-05-15
                     */
                    anchor_pay_date?: string;
                    /**
                     * @description The last date of the first pay period. This can be the same date as the anchor pay date.
                     * @example 2020-05-08
                     */
                    anchor_end_of_pay_period?: string;
                    /** @description An integer between 1 and 31 indicating the first day of the month that employees are paid. This field is only relevant for pay schedules with the “Twice per month” and “Monthly” frequencies. It will be null for pay schedules with other frequencies. */
                    day_1?: number | null;
                    /** @description An integer between 1 and 31 indicating the second day of the month that employees are paid. This field is the second pay date for pay schedules with the "Twice per month" frequency. For semi-monthly pay schedules, set this field to 31. For months shorter than 31 days, we will set the second pay date to the last day of the month. It will be null for pay schedules with other frequencies. */
                    day_2?: number | null;
                    /** @description A custom pay schedule name. */
                    custom_name?: string;
                    /** @description With Autopilot® enabled, payroll will run automatically one day before your payroll deadlines. */
                    auto_pilot?: boolean;
                };
            };
        };
        responses: {
            200: components["responses"]["Pay-Schedule-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "get-v1-companies-company_id-pay_periods": {
        parameters: {
            query?: {
                start_date?: components["parameters"]["start_date"];
                /** @description If left empty, defaults to today's date. */
                end_date?: components["parameters"]["end_date"];
                /** @description regular and/or transition. Multiple options are comma separated. The default is regular pay periods if nothing is passed in. */
                payroll_types?: components["parameters"]["payroll_types"];
            };
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_id: components["parameters"]["company_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Pay-Period-List"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "get-v1-companies-company_id-unprocessed_termination_pay_periods": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_id: components["parameters"]["company_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Unprocessed-Termination-Pay-Period-List"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "get-v1-companies-company_id-pay_schedules-assignments": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_id: components["parameters"]["company_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Pay-Schedule-Assignment-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "post-v1-companies-company_id-pay_schedules-assignment_preview": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_id: components["parameters"]["company_id"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["Pay-Schedule-Assignment-Body"];
            };
        };
        responses: {
            200: components["responses"]["Pay-Schedule-Assignment-Preview-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "post-v1-companies-company_id-pay_schedules-assign": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_id: components["parameters"]["company_id"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["Pay-Schedule-Assignment-Body"];
            };
        };
        responses: {
            /** @description No Content */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "get-v1-companies-company_id-employees": {
        parameters: {
            query?: {
                /** @description Filters employees by the provided boolean */
                terminated?: boolean;
                /** @description Include the requested attribute(s) in each employee response, multiple options are comma separated. Available options:
                 *     - all_compensations: Include all effective dated compensations for each job instead of only the current compensation
                 *     - custom_fields: Include employees' custom fields */
                include?: "all_compensations" | "custom_fields";
                /** @description The page that is requested. When unspecified, will load all objects unless endpoint forces pagination. */
                page?: components["parameters"]["pageParam"];
                /** @description Number of objects per page. For majority of endpoints will default to 25 */
                per?: components["parameters"]["perParam"];
                /** @description A string to search for in the object's names */
                search_term?: components["parameters"]["search_term"];
            };
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_id: components["parameters"]["company_id"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": Record<string, never>;
            };
        };
        responses: {
            200: components["responses"]["Employee-List"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "post-v1-employees": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_id: components["parameters"]["company_id"];
            };
            cookie?: never;
        };
        /** @description Create an employee. */
        requestBody?: {
            content: {
                "application/json": {
                    first_name: string;
                    middle_initial?: string;
                    last_name: string;
                    date_of_birth?: string;
                    /** @description The employee's personal email address. */
                    email?: string;
                    ssn?: string;
                    /** @description If true, employee is expected to self-onboard. If false, payroll admin is expected to enter in the employee's onboarding information */
                    self_onboarding?: boolean;
                };
            };
        };
        responses: {
            201: components["responses"]["Employee-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "get-companies-departments": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_uuid: components["parameters"]["company_uuid"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Department-List"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "post-departments": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_uuid: components["parameters"]["company_uuid"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    title?: string;
                };
            };
        };
        responses: {
            201: components["responses"]["Department-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "get-department": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the department */
                department_uuid: components["parameters"]["department_uuid"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Department-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "put-departments": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the department */
                department_uuid: components["parameters"]["department_uuid"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description The current version of the object. See the [versioning guide](https://docs.gusto.com/embedded-payroll/docs/versioning#object-layer) for information on how to use this field. */
                    version: string;
                    title?: string;
                };
            };
        };
        responses: {
            200: components["responses"]["Department-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "delete-department": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the department */
                department_uuid: components["parameters"]["department_uuid"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "put-add-people-to-department": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the department */
                department_uuid: components["parameters"]["department_uuid"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description The current version of the object. See the [versioning guide](https://docs.gusto.com/embedded-payroll/docs/versioning#object-layer) for information on how to use this field. */
                    version?: string;
                    /** @description Array of employees to add to the department */
                    employees?: {
                        uuid?: string;
                    }[];
                    /** @description Array of contractors to add to the department */
                    contractors?: {
                        uuid?: string;
                    }[];
                };
            };
        };
        responses: {
            200: components["responses"]["Department-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "put-remove-people-from-department": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the department */
                department_uuid: components["parameters"]["department_uuid"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description The current version of the object. See the [versioning guide](https://docs.gusto.com/embedded-payroll/docs/versioning#object-layer) for information on how to use this field. */
                    version?: string;
                    /** @description Array of employees to remove from a department */
                    employees?: {
                        uuid?: string;
                    }[];
                    /** @description Array of contractors to remove from a department */
                    contractors?: {
                        uuid?: string;
                    }[];
                };
            };
        };
        responses: {
            200: components["responses"]["Department-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "get-v1-employees": {
        parameters: {
            query?: {
                /** @description Include the requested attribute(s) in each employee response, multiple options are comma separated. Available options:
                 *     - all_compensations: Include all effective dated compensations for each job instead of only the current compensation
                 *     - custom_fields: Include employees' custom fields */
                include?: "all_compensations" | "custom_fields";
            };
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the employee */
                employee_id: components["parameters"]["employee_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Employee-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "put-v1-employees": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the employee */
                employee_id: components["parameters"]["employee_id"];
            };
            cookie?: never;
        };
        /** @description Update an employee. */
        requestBody?: {
            content: {
                "application/json": {
                    /** @description The current version of the object. See the [versioning guide](https://docs.gusto.com/embedded-payroll/docs/versioning#object-layer) for information on how to use this field. */
                    version: string;
                    first_name?: string;
                    middle_initial?: string;
                    last_name?: string;
                    date_of_birth?: string;
                    /** @description The employee's personal email address. */
                    email?: string;
                    ssn?: string;
                    /** @description Whether the employee is a two percent shareholder of the company. This field only applies to companies with an S-Corp entity type. */
                    two_percent_shareholder?: boolean;
                };
            };
        };
        responses: {
            200: components["responses"]["Employee-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "delete-v1-employee": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the employee */
                employee_id: components["parameters"]["employee_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "get-v1-employees-employee_id-terminations": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the employee */
                employee_id: components["parameters"]["employee_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Termination-List"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "post-v1-employees-employee_id-terminations": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the employee */
                employee_id: components["parameters"]["employee_id"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description The employee's last day of work. */
                    effective_date: string;
                    /** @description If true, the employee should receive their final wages via an off-cycle payroll. If false, they should receive their final wages on their current pay schedule. */
                    run_termination_payroll?: boolean;
                };
            };
        };
        responses: {
            201: components["responses"]["Termination-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "delete-v1-employees-employee_id-terminations": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the employee */
                employee_id: components["parameters"]["employee_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            404: components["responses"]["Employment-Not-Found-Error-Object"];
        };
    };
    "put-v1-terminations-employee_id": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the employee */
                employee_id: components["parameters"]["employee_id"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["Versionable-Required"] & {
                    /** @description The employee's last day of work. */
                    effective_date: string;
                    /** @description If true, the employee should receive their final wages via an off-cycle payroll. If false, they should receive their final wages on their current pay schedule. */
                    run_termination_payroll?: boolean;
                };
            };
        };
        responses: {
            200: components["responses"]["Termination-Object"];
            404: components["responses"]["Employment-Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "get-v1-employees-employee_id-rehire": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the employee */
                employee_id: components["parameters"]["employee_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Rehire-Object"];
            404: components["responses"]["Employment-Not-Found-Error-Object"];
        };
    };
    "put-v1-employees-employee_id-rehire": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the employee */
                employee_id: components["parameters"]["employee_id"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["Versionable-Required"] & components["schemas"]["Rehire-Body"];
            };
        };
        responses: {
            200: components["responses"]["Rehire-Object"];
            404: components["responses"]["Employment-Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "post-v1-employees-employee_id-rehire": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the employee */
                employee_id: components["parameters"]["employee_id"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["Rehire-Body"];
            };
        };
        responses: {
            201: components["responses"]["Rehire-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "delete-v1-employees-employee_id-rehire": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the employee */
                employee_id: components["parameters"]["employee_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            404: components["responses"]["Employment-Not-Found-Error-Object"];
        };
    };
    "get-v1-employees-employee_id-employment_history": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the employee */
                employee_id: components["parameters"]["employee_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Employment-History-List"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "get-v1-employees-employee_id-home_addresses": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the employee */
                employee_id: components["parameters"]["employee_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Employee-Address-List"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "post-v1-employees-employee_id-home_addresses": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the employee */
                employee_id: components["parameters"]["employee_id"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    street_1?: string;
                    street_2?: string | null;
                    city?: string;
                    state?: string;
                    zip?: string;
                    /** Format: date */
                    effective_date?: string;
                    courtesy_withholding?: boolean;
                };
            };
        };
        responses: {
            200: components["responses"]["Employee-Address-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "get-v1-home_addresses-home_address_uuid": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the home address */
                home_address_uuid: components["parameters"]["home_address_uuid"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Employee-Address-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "put-v1-home_addresses-home_address_uuid": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the home address */
                home_address_uuid: components["parameters"]["home_address_uuid"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description The current version of the object. See the [versioning guide](https://docs.gusto.com/embedded-payroll/docs/versioning#object-layer) for information on how to use this field. */
                    version: string;
                    street_1?: string;
                    street_2?: string | null;
                    city?: string;
                    state?: string;
                    zip?: string;
                    /** Format: date */
                    effective_date?: string;
                    courtesy_withholding?: boolean;
                };
            };
        };
        responses: {
            200: components["responses"]["Employee-Address-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "delete-v1-home_addresses-home_address_uuid": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the home address */
                home_address_uuid: components["parameters"]["home_address_uuid"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "get-v1-employees-employee_id-work_addresses": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the employee */
                employee_id: components["parameters"]["employee_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Employee-Work-Address-List"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "post-v1-employees-employee_id-work_addresses": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the employee */
                employee_id: components["parameters"]["employee_id"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description Reference to a company location */
                    location_uuid?: string;
                    /**
                     * Format: date
                     * @description Date the employee began working at the company location
                     */
                    effective_date?: string;
                };
            };
        };
        responses: {
            /** @description Example response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Employee-Work-Address"];
                };
            };
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "get-v1-work_addresses-work_address_uuid": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the work address */
                work_address_uuid: components["parameters"]["work_address_uuid"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Example response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Employee-Work-Address"];
                };
            };
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "put-v1-work_addresses-work_address_uuid": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the work address */
                work_address_uuid: components["parameters"]["work_address_uuid"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description Reference to a company location */
                    location_uuid?: string;
                    /** Format: date */
                    effective_date?: string;
                    /** @description The current version of the object. See the [versioning guide](https://docs.gusto.com/embedded-payroll/docs/versioning#object-layer) for information on how to use this field. */
                    version?: string;
                };
            };
        };
        responses: {
            /** @description Example response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Employee-Work-Address"];
                };
            };
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "delete-v1-work_addresses-work_address_uuid": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the work address */
                work_address_uuid: components["parameters"]["work_address_uuid"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "get-v1-employees-employee_id-custom_fields": {
        parameters: {
            query?: {
                /** @description The page that is requested. When unspecified, will load all objects unless endpoint forces pagination. */
                page?: components["parameters"]["pageParam"];
                /** @description Number of objects per page. For majority of endpoints will default to 25 */
                per?: components["parameters"]["perParam"];
            };
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the employee */
                employee_id: components["parameters"]["employee_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        custom_fields?: components["schemas"]["Employee-Custom-Field"][];
                    };
                };
            };
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "get-v1-employees-employee_id-onboarding_status": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the employee */
                employee_id: components["parameters"]["employee_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Employee-Onboarding-Status-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "put-v1-employees-employee_id-onboarding_status": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the employee */
                employee_id: components["parameters"]["employee_id"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description The updated onboarding status for the employee */
                    onboarding_status: string;
                };
            };
        };
        responses: {
            200: components["responses"]["Employee-Onboarding-Status-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "put-v1-employee-finish-onboarding": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the employee */
                employee_id: components["parameters"]["employee_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Employee-Object"];
        };
    };
    "get-v1-employees-employee_id-federal_taxes": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the employee */
                employee_uuid: components["parameters"]["employee_uuid"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Employee-Federal-Tax-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "put-v1-employees-employee_id-federal_taxes": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the employee */
                employee_uuid: components["parameters"]["employee_uuid"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description The current version of the object. See the [versioning guide](https://docs.gusto.com/embedded-payroll/docs/versioning#object-layer) for information on how to use this field. */
                    version: string;
                    filing_status?: string;
                    extra_withholding?: string | null;
                    two_jobs?: boolean;
                    dependents_amount?: string;
                    other_income?: string;
                    deductions?: string;
                    w4_data_type?: string;
                };
            };
        };
        responses: {
            200: components["responses"]["Employee-Federal-Tax-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "get-v1-employees-employee_id-state_taxes": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the employee */
                employee_uuid: components["parameters"]["employee_uuid"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Employee-State-Taxes-List"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "put-v1-employees-employee_id-state_taxes": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the employee */
                employee_uuid: components["parameters"]["employee_uuid"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    states: {
                        state: string;
                        questions?: {
                            key: string;
                            answers?: {
                                value: string;
                                valid_from: string;
                                valid_up_to?: unknown;
                            }[];
                        }[];
                    }[];
                };
            };
        };
        responses: {
            200: components["responses"]["Employee-State-Taxes-List"];
            404: components["responses"]["Not-Found-Error-Object"];
            /** @description Unprocessable Entity */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        state: string;
                        questions: {
                            key: string;
                            answers?: {
                                valid_from: string;
                                valid_up_to?: unknown;
                                errors?: string[];
                            }[];
                        }[];
                    }[];
                };
            };
        };
    };
    "get-v1-employees-employee_id-bank_accounts": {
        parameters: {
            query?: {
                /** @description The page that is requested. When unspecified, will load all objects unless endpoint forces pagination. */
                page?: components["parameters"]["pageParam"];
                /** @description Number of objects per page. For majority of endpoints will default to 25 */
                per?: components["parameters"]["perParam"];
            };
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the employee */
                employee_id: components["parameters"]["employee_id"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": Record<string, never>;
            };
        };
        responses: {
            200: components["responses"]["Employee-Bank-Account-List"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "post-v1-employees-employee_id-bank_accounts": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the employee */
                employee_id: components["parameters"]["employee_id"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    name: string;
                    routing_number: string;
                    account_number: string;
                    /** @enum {string} */
                    account_type: "Checking" | "Savings";
                };
            };
        };
        responses: {
            201: components["responses"]["Employee-Bank-Account-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "put-v1-employees-employee_id-bank_accounts": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the employee */
                employee_id: components["parameters"]["employee_id"];
                /** @description The UUID of the bank account */
                bank_account_uuid: components["parameters"]["bank_account_uuid"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    name: string;
                    routing_number: string;
                    account_number: string;
                    /** @enum {string} */
                    account_type: "Checking" | "Savings";
                };
            };
        };
        responses: {
            200: components["responses"]["Employee-Bank-Account-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "delete-v1-employees-employee_id-bank_accounts-bank_account_id": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the employee */
                employee_id: components["parameters"]["employee_id"];
                /** @description The UUID of the bank account */
                bank_account_uuid: components["parameters"]["bank_account_uuid"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "get-v1-employees-employee_id-payment_method": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the employee */
                employee_id: components["parameters"]["employee_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Employee-Payment-Method-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "put-v1-employees-employee_id-payment_method": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the employee */
                employee_id: components["parameters"]["employee_id"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description The current version of the object. See the [versioning guide](https://docs.gusto.com/embedded-payroll/docs/versioning#object-layer) for information on how to use this field. */
                    version: string;
                    /**
                     * @description The payment method type. If type is Check, then split_by and splits do not need to be populated. If type is Direct Deposit, split_by and splits are required.
                     * @enum {string}
                     */
                    type: "Direct Deposit" | "Check";
                    /**
                     * @description Describes how the payment will be split. If split_by is Percentage, then the split amounts must add up to exactly 100. If split_by is Amount, then the last split amount must be nil to capture the remainder.
                     * @enum {string}
                     */
                    split_by?: "Amount" | "Percentage";
                    splits?: {
                        /** @description The bank account ID
                         *      */
                        uuid?: string;
                        /** @description The bank account name */
                        name?: string;
                        /** @description The order of priority for each payment split, with priority 1 being the first bank account paid. Priority must be unique and sequential. */
                        priority?: number;
                        /** @description The cents amount allocated for each payment split */
                        split_amount?: number | null;
                    }[];
                };
            };
        };
        responses: {
            200: components["responses"]["Employee-Payment-Method-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "get-v1-employees-employee_id-jobs": {
        parameters: {
            query?: {
                /** @description The page that is requested. When unspecified, will load all objects unless endpoint forces pagination. */
                page?: components["parameters"]["pageParam"];
                /** @description Number of objects per page. For majority of endpoints will default to 25 */
                per?: components["parameters"]["perParam"];
                /** @description Available options:
                 *     - all_compensations: Include all effective dated compensations for each job instead of only the current compensation */
                include?: "all_compensations";
            };
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the employee */
                employee_id: components["parameters"]["employee_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Job-List"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "post-v1-jobs-job_id": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the employee */
                employee_id: components["parameters"]["employee_id"];
            };
            cookie?: never;
        };
        /** @description Create a job. */
        requestBody?: {
            content: {
                "application/json": {
                    /** @description The job title */
                    title: string;
                    /** @description The date when the employee was hired or rehired for the job. */
                    hire_date: string;
                    /** @description Whether the employee owns at least 2% of the company. */
                    two_percent_shareholder?: boolean;
                    /** @description Whether this job is eligible for workers' compensation coverage in the state of Washington (WA). */
                    state_wc_covered?: boolean;
                    /** @description The risk class code for workers' compensation in Washington state. Please visit [Washington state's Risk Class page](https://www.lni.wa.gov/insurance/rates-risk-classes/risk-classes-for-workers-compensation/risk-class-lookup#/) to learn more. */
                    state_wc_class_code?: string;
                };
            };
        };
        responses: {
            201: components["responses"]["Job-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "get-version-employees-time_off_activities": {
        parameters: {
            query: {
                /** @description The time off type name you want to query data for. ex: 'sick' or 'vacation' */
                time_off_type: components["parameters"]["time_off_type"];
            };
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the employee */
                employee_uuid: components["parameters"]["employee_uuid"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Time-Off-Activity-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "get-v1-jobs-job_id": {
        parameters: {
            query?: {
                /** @description Available options:
                 *     - all_compensations: Include all effective dated compensations for the job instead of only the current compensation */
                include?: "all_compensations";
            };
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the job */
                job_id: components["parameters"]["job_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Job-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "put-v1-jobs-job_id": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the job */
                job_id: components["parameters"]["job_id"];
            };
            cookie?: never;
        };
        /** @description Update a job. */
        requestBody?: {
            content: {
                "application/json": {
                    /** @description The current version of the object. See the [versioning guide](https://docs.gusto.com/embedded-payroll/docs/versioning#object-layer) for information on how to use this field. */
                    version: string;
                    /** @description The job title */
                    title?: string;
                    /** @description The date when the employee was hired or rehired for the job. */
                    hire_date?: string;
                    /** @description Whether the employee owns at least 2% of the company. */
                    two_percent_shareholder?: boolean;
                    /** @description Whether this job is eligible for workers' compensation coverage in the state of Washington (WA). */
                    state_wc_covered?: boolean;
                    /** @description The risk class code for workers' compensation in Washington state. Please visit [Washington state's Risk Class page](https://www.lni.wa.gov/insurance/rates-risk-classes/risk-classes-for-workers-compensation/risk-class-lookup#/) to learn more. */
                    state_wc_class_code?: string;
                };
            };
        };
        responses: {
            200: components["responses"]["Job-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "delete-v1-jobs-job_id": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the job */
                job_id: components["parameters"]["job_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "get-v1-jobs-job_id-compensations": {
        parameters: {
            query?: {
                /** @description The page that is requested. When unspecified, will load all objects unless endpoint forces pagination. */
                page?: components["parameters"]["pageParam"];
                /** @description Number of objects per page. For majority of endpoints will default to 25 */
                per?: components["parameters"]["perParam"];
                /** @description Available options:
                 *     - all_compensations: Include all effective dated compensations for each job instead of only the current compensation */
                include?: "all_compensations";
            };
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the job */
                job_id: components["parameters"]["job_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Compensation-List"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "post-v1-compensations-compensation_id": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the job */
                job_id: components["parameters"]["job_id"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description The dollar amount paid per payment unit. */
                    rate?: string;
                    /**
                     * @description The unit accompanying the compensation rate. If the employee is an owner, rate should be 'Paycheck'.
                     * @enum {string}
                     */
                    payment_unit: "Hour" | "Week" | "Month" | "Year" | "Paycheck";
                    /** @description The date when the compensation takes effect. */
                    effective_date?: string;
                    flsa_status: components["schemas"]["Flsa-Status-Type"];
                    /** @description Determines whether the compensation should be adjusted for minimum wage. Only applies to Nonexempt employees. */
                    adjust_for_minimum_wage?: boolean;
                    minimum_wages?: {
                        /** @description The UUID of the minimum wage record. Required if adjust_for_minimum_wage set to true */
                        uuid?: string;
                    }[];
                };
            };
        };
        responses: {
            201: components["responses"]["Compensation-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "get-v1-compensations-compensation_id": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the compensation */
                compensation_id: components["parameters"]["compensation_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Compensation-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "put-v1-compensations-compensation_id": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the compensation */
                compensation_id: components["parameters"]["compensation_id"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description The current version of the object. See the [versioning guide](https://docs.gusto.com/embedded-payroll/docs/versioning#object-layer) for information on how to use this field. */
                    version: string;
                    /** @description The dollar amount paid per payment unit. */
                    rate?: string;
                    /**
                     * @description The unit accompanying the compensation rate. If the employee is an owner, rate should be 'Paycheck'.
                     * @enum {string}
                     */
                    payment_unit?: "Hour" | "Week" | "Month" | "Year" | "Paycheck";
                    flsa_status?: components["schemas"]["Flsa-Status-Type"];
                    /** @description Determines whether the compensation should be adjusted for minimum wage. Only applies to Nonexempt employees. */
                    adjust_for_minimum_wage?: boolean;
                    minimum_wages?: {
                        /** @description The UUID of the minimum wage record. Required if adjust_for_minimum_wage set to true */
                        uuid?: string;
                    }[];
                };
            };
        };
        responses: {
            200: components["responses"]["Compensation-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "delete-v1-compensations-compensation_id": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the compensation */
                compensation_id: components["parameters"]["compensation_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "get-v1-companies-company_id-earning_types": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_id: components["parameters"]["company_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Earning-Type-List"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "post-v1-companies-company_id-earning_types": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_id: components["parameters"]["company_id"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description The name of the custom earning type. */
                    name: string;
                };
            };
        };
        responses: {
            201: components["responses"]["Earning-Type-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "put-v1-companies-company_id-earning_types-earning_type_uuid": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_id: components["parameters"]["company_id"];
                /** @description The UUID of the earning type */
                earning_type_uuid: components["parameters"]["earning_type_uuid"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description The name of the custom earning type. */
                    name?: string;
                };
            };
        };
        responses: {
            200: components["responses"]["Earning-Type-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "delete-v1-companies-company_id-earning_types-earning_type_uuid": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_id: components["parameters"]["company_id"];
                /** @description The UUID of the earning type */
                earning_type_uuid: components["parameters"]["earning_type_uuid"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "get-v1-companies-company_id-contractors": {
        parameters: {
            query?: {
                /** @description The page that is requested. When unspecified, will load all objects unless endpoint forces pagination. */
                page?: components["parameters"]["pageParam"];
                /** @description Number of objects per page. For majority of endpoints will default to 25 */
                per?: components["parameters"]["perParam"];
                /** @description A string to search for in the object's names */
                search_term?: components["parameters"]["search_term"];
            };
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_id: components["parameters"]["company_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Contractor-List"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "post-v1-companies-company_id-contractors": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_id: components["parameters"]["company_id"];
            };
            cookie?: never;
        };
        /** @description Create an individual or business contractor. */
        requestBody?: {
            content: {
                "application/json": components["schemas"]["Contractor-Body"] & unknown;
            };
        };
        responses: {
            201: components["responses"]["Contractor-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "get-v1-contractors-contractor_id": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the contractor */
                contractor_id: components["parameters"]["contractor_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Contractor-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "put-v1-contractors-contractor_id": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the contractor */
                contractor_id: components["parameters"]["contractor_id"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["Versionable-Required"] & components["schemas"]["Contractor-Body"];
            };
        };
        responses: {
            200: components["responses"]["Contractor-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "delete-v1-contractors-contractor_id": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the contractor */
                contractor_id: components["parameters"]["contractor_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "get-v1-contractors-contractor_uuid-bank_accounts": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the contractor */
                contractor_uuid: components["parameters"]["contractor_uuid"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Contractor-Bank-Account-List"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "post-v1-contractors-contractor_uuid-bank_accounts": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the contractor */
                contractor_uuid: components["parameters"]["contractor_uuid"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    name: string;
                    routing_number: string;
                    account_number: string;
                    /** @enum {string} */
                    account_type: "Checking" | "Savings";
                };
            };
        };
        responses: {
            201: components["responses"]["Contractor-Bank-Account-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "get-v1-webhook-subscriptions": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Webhook-Subscriptions-List"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "post-v1-webhook-subscription": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    url: string;
                    subscription_types: ("BankAccount" | "Company" | "CompanyBenefit" | "Contractor" | "ContractorPayment" | "Employee" | "EmployeeBenefit" | "EmployeeJobCompensation" | "ExternalPayroll" | "Form" | "Location" | "Notification" | "Payroll" | "PaySchedule" | "Signatory")[];
                };
            };
        };
        responses: {
            201: components["responses"]["Webhook-Subscription-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "get-v1-webhook-subscription-uuid": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The webhook subscription UUID. */
                webhook_subscription_uuid: components["parameters"]["webhook_subscription_uuid"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Webhook-Subscription-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "put-v1-webhook-subscription-uuid": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The webhook subscription UUID. */
                webhook_subscription_uuid: components["parameters"]["webhook_subscription_uuid"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    subscription_types: ("BankAccount" | "Company" | "CompanyBenefit" | "Contractor" | "ContractorPayment" | "Employee" | "EmployeeBenefit" | "EmployeeJobCompensation" | "ExternalPayroll" | "Form" | "Location" | "Notification" | "Payroll" | "PaySchedule" | "Signatory")[];
                };
            };
        };
        responses: {
            200: components["responses"]["Webhook-Subscription-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "delete-v1-webhook-subscription-uuid": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The webhook subscription UUID. */
                webhook_subscription_uuid: components["parameters"]["webhook_subscription_uuid"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The resource was deleted successfully. */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "put-v1-verify-webhook-subscription-uuid": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The webhook subscription UUID. */
                webhook_subscription_uuid: components["parameters"]["webhook_subscription_uuid"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description The token POSTed to the Subscription URL. */
                    verification_token: string;
                };
            };
        };
        responses: {
            200: components["responses"]["Webhook-Subscription-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "get-v1-webhook-subscription-verification-token-uuid": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The webhook subscription UUID. */
                webhook_subscription_uuid: components["parameters"]["webhook_subscription_uuid"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content. The `verification_token` is POSTed to the Subscription URL. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "get-v1-contractor-forms": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the contractor */
                contractor_uuid: components["parameters"]["contractor_uuid"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Example response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Form_1099"][];
                };
            };
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "get-v1-contractor-form": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the contractor */
                contractor_uuid: components["parameters"]["contractor_uuid"];
                /** @description The UUID of the form */
                form_id: components["parameters"]["form_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Example response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Form_1099"];
                };
            };
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "get-v1-contractor-form-pdf": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the contractor */
                contractor_uuid: components["parameters"]["contractor_uuid"];
                /** @description The UUID of the form */
                form_id: components["parameters"]["form_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Form-Object-Pdf"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "post-v1-sandbox-generate_1099": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description The contractor UUID. */
                    contractor_id: string;
                    /** @description Must be equal to or more recent than 2015. If not specified, defaults to the previous year.
                     *      */
                    year?: number;
                };
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Form_1099"];
                };
            };
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "post-v1-sandbox-generate_w2": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description The employee UUID. */
                    employee_id: string;
                    /** @description Must be equal to or more recent than 2015. If not specified, defaults to the previous year.
                     *      */
                    year?: number;
                };
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @description The UUID of the employee */
                        readonly employee_uuid?: string;
                    } & components["schemas"]["Form"];
                };
            };
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "get-v1-contractors-contractor_uuid-payment_method": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the contractor */
                contractor_uuid: components["parameters"]["contractor_uuid"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Contractor-Payment-Method-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "put-v1-contractors-contractor_id-payment_method": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the contractor */
                contractor_uuid: components["parameters"]["contractor_uuid"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["Versionable-Required"] & {
                    /**
                     * @description The payment method type. If type is Direct Deposit, the contractor is required to have a bank account.
                     *     see [Bank account endpoint](./post-v1-contractors-contractor_uuid-bank_accounts)
                     * @enum {string}
                     */
                    type: "Direct Deposit" | "Check";
                };
            };
        };
        responses: {
            200: components["responses"]["Contractor-Payment-Method-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "get-v1-contractors-contractor_uuid-onboarding_status": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the contractor */
                contractor_uuid: components["parameters"]["contractor_uuid"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Contractor-Onboarding-Status-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "put-v1-contractors-contractor_uuid-onboarding_status": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the contractor */
                contractor_uuid: components["parameters"]["contractor_uuid"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /**
                     * @description The updated onboarding status for the contractor
                     * @default onboarding_completed
                     * @enum {string}
                     */
                    onboarding_status: "onboarding_completed";
                };
            };
        };
        responses: {
            200: components["responses"]["Contractor-Onboarding-Status-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "get-v1-contractors-contractor_uuid-address": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the contractor */
                contractor_uuid: components["parameters"]["contractor_uuid"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Contractor-Address-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "put-v1-contractors-contractor_uuid-address": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the contractor */
                contractor_uuid: components["parameters"]["contractor_uuid"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["Versionable-Required"] & {
                    street_1?: string;
                    street_2?: string;
                    city?: string;
                    state?: string;
                    zip?: string;
                };
            };
        };
        responses: {
            200: components["responses"]["Contractor-Address-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "get-v1-companies-company_id-payrolls": {
        parameters: {
            query?: {
                /** @description Whether to include processed and/or unprocessed payrolls in the response, defaults to processed, for multiple attributes comma separate the values, i.e. `?processing_statuses=processed,unprocessed` */
                processing_statuses?: ("unprocessed" | "processed")[];
                /** @description Whether to include regular and/or off_cycle payrolls in the response, defaults to regular, for multiple attributes comma separate the values, i.e. `?payroll_types=regular,off_cycle` */
                payroll_types?: ("regular" | "off_cycle" | "external")[];
                /** @description Include the requested attribute in the response. The risk_blockers option will include submission_blockers and credit_blockers if applicable. In v2023-04-01 totals are no longer included by default. For multiple attributes comma separate the values, i.e. `?include=totals,payroll_status_meta` */
                include?: ("totals" | "payroll_status_meta" | "risk_blockers")[];
                /** @description Return payrolls whose pay period is after the start date */
                start_date?: string;
                /** @description Return payrolls whose pay period is before the end date. If left empty, defaults to today's date. */
                end_date?: string;
            };
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_id: components["parameters"]["company_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Payroll-List"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "post-v1-companies-company_id-payrolls": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_id: components["parameters"]["company_id"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description Whether it is an off cycle payroll. */
                    off_cycle: boolean;
                    /**
                     * @description An off cycle payroll reason. Select one from the following list.
                     * @enum {string}
                     */
                    off_cycle_reason: "Bonus" | "Correction" | "Dismissed employee" | "Transition from old pay schedule";
                    /** @description Pay period start date. */
                    start_date: string;
                    /** @description Pay period end date. If left empty, defaults to today's date. */
                    end_date: string;
                    /** @description A pay schedule is required for Transition from old pay schedule payroll to identify the matching transition pay period. */
                    pay_schedule_uuid?: string;
                    /** @description A list of employee uuids to include on the payroll. */
                    employee_uuids?: string[];
                    /** @description Payment date. */
                    check_date?: string;
                    /**
                     * @description The payment schedule tax rate the payroll is based on
                     * @enum {string}
                     */
                    withholding_pay_period?: "Every week" | "Every other week" | "Twice per month" | "Monthly" | "Quarterly" | "Semiannually" | "Annually";
                    /** @description Block regular deductions and contributions for this payroll. */
                    skip_regular_deductions?: boolean;
                    /** @description Enable taxes to be withheld at the IRS's required rate of 22% for federal income taxes. State income taxes will be taxed at the state's supplemental tax rate. Otherwise, we'll sum the entirety of the employee's wages and withhold taxes on the entire amount at the rate for regular wages. */
                    fixed_withholding_rate?: boolean;
                };
            };
        };
        responses: {
            200: components["responses"]["Payroll-Update-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "get-v1-companies-company_id-payroll_reversals": {
        parameters: {
            query?: {
                /** @description The page that is requested. When unspecified, will load all objects unless endpoint forces pagination. */
                page?: components["parameters"]["pageParam"];
                /** @description Number of objects per page. For majority of endpoints will default to 25 */
                per?: components["parameters"]["perParam"];
            };
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_id: components["parameters"]["company_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Payroll-Reversal-List"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "get-v1-companies-company_id-payrolls-payroll_id": {
        parameters: {
            query?: {
                /** @description Include the requested attribute in the response, for multiple attributes comma separate the values, i.e. `?include=benefits,deductions,taxes` */
                include?: "benefits" | "deductions" | "taxes" | "payroll_status_meta";
            };
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_id: components["parameters"]["company_id"];
                /** @description The UUID of the payroll */
                payroll_id: components["parameters"]["payroll_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Payroll-Show-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "put-v1-companies-company_id-payrolls": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_id: components["parameters"]["company_id"];
                /** @description The UUID of the payroll */
                payroll_id: components["parameters"]["payroll_id"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    employee_compensations: {
                        /** @description The UUID of the employee. */
                        employee_uuid?: string;
                        /** @description The current version of this employee compensation from the prepared payroll. See the [versioning guide](https://docs.gusto.com/embedded-payroll/docs/idempotency) for information on how to use this field. */
                        version?: string;
                        /** @description This employee will be excluded from payroll calculation and will not be paid for the payroll. */
                        excluded?: boolean;
                        /**
                         * @description The employee's compensation payment method. Invalid values will be ignored.
                         * @enum {string}
                         */
                        payment_method?: "Direct Deposit" | "Check";
                        /** @description Custom text that will be printed as a personal note to the employee on a paystub. */
                        memo?: string;
                        fixed_compensations?: {
                            /** @description The name of the compensation. This also serves as the unique, immutable identifier for this compensation. */
                            name?: string;
                            /** @description The amount of the compensation for the pay period. */
                            amount?: string;
                            /** @description The UUID of the job for the compensation. */
                            job_uuid?: number;
                        }[];
                        hourly_compensations?: {
                            /** @description The name of the compensation. This also serves as the unique, immutable identifier for this compensation. */
                            name?: string;
                            /** @description The number of hours to be compensated for this pay period. */
                            hours?: string;
                            /** @description The UUIDs of the job for the compensation. */
                            job_uuid?: number;
                        }[];
                        /** @description An array of all paid time off the employee is eligible for this pay period. Each paid time off object can be the name or the specific policy_uuid. */
                        paid_time_off?: {
                            /** @description The name of the PTO. This also serves as the unique, immutable identifier for the PTO. Must pass in name or policy_uuid but not both. */
                            name?: string;
                            /** @description The hours of this PTO taken during the pay period. */
                            hours?: string;
                            /** @description The uuid of the PTO policy. Must pass in name or policy_uuid but not both. */
                            policy_uuid?: string;
                            /** @description The outstanding hours paid upon termination. This field is only applicable for termination payrolls. */
                            final_payout_unused_hours_input?: string;
                        }[];
                    }[];
                };
            };
        };
        responses: {
            200: components["responses"]["Payroll-Update-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "delete-v1-companies-company_id-payrolls": {
        parameters: {
            query?: {
                /** @description When true, request an asynchronous delete of the payroll. */
                async?: boolean;
            };
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_id: components["parameters"]["company_id"];
                /** @description The UUID of the payroll */
                payroll_id: components["parameters"]["payroll_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Accepted */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            404: components["responses"]["Not-Found-Error-Object"];
            /** @description Unprocessable Entity */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    "put-v1-companies-company_id-payrolls-payroll_id-prepare": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_id: components["parameters"]["company_id"];
                /** @description The UUID of the payroll */
                payroll_id: components["parameters"]["payroll_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Payroll-Update-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "get-v1-payment-receipts-payrolls-payroll_uuid": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the payroll */
                payroll_uuid: components["parameters"]["payroll_uuid"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Payroll-Receipt"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "post-v1-payrolls-payroll_id-calculate_accruing_time_off_hours": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the payroll */
                payroll_id: components["parameters"]["payroll_id"];
                /** @description The UUID of the employee */
                employee_id: components["parameters"]["employee_id"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description regular hours worked in this pay period */
                    regular_hours_worked?: number;
                    /** @description overtime hours worked in this pay period */
                    overtime_hours_worked?: number;
                    /** @description double overtime hours worked in this pay period */
                    double_overtime_hours_worked?: number;
                    /** @description paid time off hours used in this pay period */
                    pto_hours_used?: number;
                    /** @description sick hours used in this pay period */
                    sick_hours_used?: number;
                };
            };
        };
        responses: {
            200: components["responses"]["Accruing-Time-Off-Hour-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "get-v1-companies-payroll-blockers-company_uuid": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_uuid: components["parameters"]["company_uuid"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Payroll-Blocker-List"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "post-companies-payroll-skip-company_uuid": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_uuid: components["parameters"]["company_uuid"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /**
                     * @description Payroll type
                     * @enum {string}
                     */
                    payroll_type: "Regular" | "Hired employee" | "Dismissed employee" | "Transition from old pay schedule";
                    /** @description Pay period start date */
                    start_date?: string;
                    /** @description Pay period end date. If left empty, defaults to today's date. */
                    end_date?: string;
                    /** @description The UUID of the pay schedule */
                    pay_schedule_uuid?: string;
                    /** @description An array of employees. This field is only applicable to new hire payroll and termination payroll */
                    employee_uuids?: string[];
                };
            };
        };
        responses: {
            /** @description Accepted */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            404: components["responses"]["Not-Found-Error-Object"];
            /** @description Unprocessable Entity */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Unprocessable-Entity-Error-Object"] | components["schemas"]["Payroll-Blockers-Error"];
                };
            };
        };
    };
    "post-payrolls-gross-up-payroll_uuid": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the payroll */
                payroll_uuid: components["parameters"]["payroll_uuid"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description Employee UUID */
                    employee_uuid: string;
                    /** @description Employee net earnings */
                    net_pay: string;
                };
            };
        };
        responses: {
            200: components["responses"]["Gross-Up-Pay"];
            404: components["responses"]["Not-Found-Error-Object"];
            /** @description Unprocessable Entity */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Unprocessable-Entity-Error-Object"] | components["schemas"]["Payroll-Blockers-Error"];
                };
            };
        };
    };
    "get-v1-contractor_payments-contractor_payment_uuid-receipt": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the contractor payment */
                contractor_payment_uuid: components["parameters"]["contractor_payment_uuid"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Contractor-Payment-Receipt"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "get-v1-contractor_payments-contractor_payment_uuid-fund": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the contractor payment */
                contractor_payment_uuid: components["parameters"]["contractor_payment_uuid"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Contractor-Payment-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "put-v1-companies-company_id-payrolls-payroll_id-calculate": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_id: components["parameters"]["company_id"];
                /** @description The UUID of the payroll */
                payroll_id: components["parameters"]["payroll_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Accepted */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            404: components["responses"]["Not-Found-Error-Object"];
            /** @description Unprocessable Entity */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Unprocessable-Entity-Error-Object"] | components["schemas"]["Payroll-Blockers-Error"];
                };
            };
        };
    };
    "put-v1-companies-company_id-payrolls-payroll_id-submit": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_id: components["parameters"]["company_id"];
                /** @description The UUID of the payroll */
                payroll_id: components["parameters"]["payroll_id"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description An array of submission_blockers, each with a selected unblock option. */
                    submission_blockers?: {
                        /** @description The type of submission_blocker that is blocking the payment. */
                        blocker_type?: string;
                        /** @description The selected option to unblock the payment's submission_blocker. */
                        selected_option?: string;
                    }[];
                };
            };
        };
        responses: {
            /** @description Accepted */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            404: components["responses"]["Not-Found-Error-Object"];
            /** @description Unprocessable Entity */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Unprocessable-Entity-Error-Object"] | components["schemas"]["Payroll-Blockers-Error"];
                };
            };
        };
    };
    "put-api-v1-companies-company_id-payrolls-payroll_id-cancel": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_id: components["parameters"]["company_id"];
                /** @description The UUID of the payroll */
                payroll_id: components["parameters"]["payroll_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Payroll-Show-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "get-v1-companies-company_id-contractor_payments": {
        parameters: {
            query: {
                /** @description The time period for which to retrieve contractor payments */
                start_date: string;
                /** @description The time period for which to retrieve contractor payments. If left empty, defaults to today's date. */
                end_date: string;
                /** @description The UUID of the contractor. When specified, will load all payments for that contractor. */
                contractor_uuid?: string;
                /** @description Display contractor payments results group by check date if set to true. */
                group_by_date?: boolean;
                /** @description The page that is requested. When unspecified, will load all objects unless endpoint forces pagination. */
                page?: components["parameters"]["pageParam"];
                /** @description Number of objects per page. For majority of endpoints will default to 25 */
                per?: components["parameters"]["perParam"];
            };
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_id: components["parameters"]["company_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description A JSON object containing contractor payments information */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Contractor-Payment-Summary"] | components["schemas"]["Contractor-Payment-Summary-By-Dates"];
                };
            };
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "post-v1-companies-company_id-contractor_payments": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_id: components["parameters"]["company_id"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description The contractor receiving the payment */
                    contractor_uuid: string;
                    /**
                     * Format: date
                     * @description The contractor receiving the payment
                     * @example 2020-01-01
                     */
                    date: string;
                    /**
                     * @default Direct Deposit
                     * @enum {string}
                     */
                    payment_method?: "Direct Deposit" | "Check" | "Historical Payment";
                    /**
                     * @description If the contractor is on a fixed wage, this is the fixed wage payment for the contractor, regardless of hours worked
                     * @example 5000
                     */
                    wage?: number;
                    /**
                     * @description If the contractor is on an hourly wage, this is the number of hours that the contractor worked for the payment
                     * @example 40
                     */
                    hours?: number;
                    /**
                     * @description If the contractor is on an hourly wage, this is the bonus the contractor earned
                     * @example 500
                     */
                    bonus?: number;
                    /**
                     * @description Reimbursed wages for the contractor
                     * @example 20
                     */
                    reimbursement?: number;
                };
            };
        };
        responses: {
            200: components["responses"]["Contractor-Payment-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "get-v1-companies-company_id-contractor_payment-contractor-payment": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_id: components["parameters"]["company_id"];
                /** @description The UUID of the contractor payment */
                contractor_payment_id: components["parameters"]["contractor_payment_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Contractor-Payment-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "delete-v1-companies-company_id-contractor_payment-contractor-payment": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_id: components["parameters"]["company_id"];
                /** @description The UUID of the contractor payment */
                contractor_payment_id: components["parameters"]["contractor_payment_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "get-v1-companies-company_id-contractor_payment_groups": {
        parameters: {
            query?: {
                /** @description The time period for which to retrieve contractor payment groups. Defaults to 6 months ago. */
                start_date?: string;
                /** @description The time period for which to retrieve contractor payment groups. Defaults to today's date. */
                end_date?: string;
                /** @description The page that is requested. When unspecified, will load all objects unless endpoint forces pagination. */
                page?: components["parameters"]["pageParam"];
                /** @description Number of objects per page. For majority of endpoints will default to 25 */
                per?: components["parameters"]["perParam"];
            };
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_id: components["parameters"]["company_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Contractor-Payment-Group-List"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "post-v1-companies-company_id-contractor_payment_groups": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_id: components["parameters"]["company_id"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /**
                     * Format: date
                     * @description The payment check date
                     * @example 2020-01-01
                     */
                    check_date: string;
                    /**
                     * @description Optional token used to make contractor payment group creation idempotent.  If provided, string must be unique for each group you intend to create.
                     * @example 1d532d13-8f61-4a57-ad3c-b5fac1c6e05e
                     */
                    creation_token?: string;
                    contractor_payments: {
                        /** @description The contractor receiving the payment */
                        contractor_uuid?: string;
                        /**
                         * @default Direct Deposit
                         * @enum {string}
                         */
                        payment_method?: "Direct Deposit" | "Check" | "Historical Payment";
                        /**
                         * @description If the contractor is on a fixed wage, this is the fixed wage payment for the contractor, regardless of hours worked
                         * @example 5000
                         */
                        wage?: number;
                        /**
                         * @description If the contractor is on an hourly wage, this is the number of hours that the contractor worked for the payment
                         * @example 40
                         */
                        hours?: number;
                        /**
                         * @description If the contractor is on an hourly wage, this is the bonus the contractor earned
                         * @example 500
                         */
                        bonus?: number;
                        /**
                         * @description Reimbursed wages for the contractor
                         * @example 20
                         */
                        reimbursement?: number;
                    }[];
                };
            };
        };
        responses: {
            200: components["responses"]["Contractor-Payment-Group-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "post-v1-companies-company_id-contractor_payment_groups-preview": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_id: components["parameters"]["company_id"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /**
                     * Format: date
                     * @description The payment check date
                     * @example 2020-01-01
                     */
                    check_date: string;
                    /**
                     * @description Optional token used to make contractor payment group creation idempotent.  If provided, string must be unique for each group you intend to create.
                     * @example 1d532d13-8f61-4a57-ad3c-b5fac1c6e05e
                     */
                    creation_token?: string;
                    contractor_payments: {
                        /** @description The contractor receiving the payment */
                        contractor_uuid?: string;
                        /**
                         * @default Direct Deposit
                         * @enum {string}
                         */
                        payment_method?: "Direct Deposit" | "Check" | "Historical Payment";
                        /**
                         * @description If the contractor is on a fixed wage, this is the fixed wage payment for the contractor, regardless of hours worked
                         * @example 5000
                         */
                        wage?: number;
                        /**
                         * @description If the contractor is on an hourly wage, this is the number of hours that the contractor worked for the payment
                         * @example 40
                         */
                        hours?: number;
                        /**
                         * @description If the contractor is on an hourly wage, this is the bonus the contractor earned
                         * @example 500
                         */
                        bonus?: number;
                        /**
                         * @description Reimbursed wages for the contractor
                         * @example 20
                         */
                        reimbursement?: number;
                    }[];
                };
            };
        };
        responses: {
            200: components["responses"]["Contractor-Payment-Group-Null-Uuid-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "get-v1-contractor_payment_groups-contractor_payment_group_id": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the contractor payment group */
                contractor_payment_group_uuid: components["parameters"]["contractor_payment_group_uuid"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Contractor-Payment-Group-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "delete-v1-contractor_payment_groups-contractor_payment_group_id": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the contractor payment group */
                contractor_payment_group_uuid: components["parameters"]["contractor_payment_group_uuid"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "put-v1-contractor_payment_groups-contractor_payment_group_id-fund": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the contractor payment group */
                contractor_payment_group_uuid: components["parameters"]["contractor_payment_group_uuid"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Contractor-Payment-Group-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "get-v1-company-forms": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_id: components["parameters"]["company_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Form-List"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "get-v1-company-form": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the form */
                form_id: components["parameters"]["form_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Form-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "get-v1-company-form-pdf": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the form */
                form_id: components["parameters"]["form_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Form-Object-Pdf"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "put-v1-company-form-sign": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the form */
                form_id: components["parameters"]["form_id"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description The signature */
                    signature_text: string;
                    /** @description whether you agree to sign electronically */
                    agree: boolean;
                    /** @description The IP address of the signatory who signed the form. */
                    signed_by_ip_address: string;
                };
            };
        };
        responses: {
            200: components["responses"]["Form-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "get-v1-employee-forms": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the employee */
                employee_id: components["parameters"]["employee_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Form-List"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "get-v1-employee-form": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the employee */
                employee_id: components["parameters"]["employee_id"];
                /** @description The UUID of the form */
                form_id: components["parameters"]["form_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Form-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "get-v1-employee-form-pdf": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the employee */
                employee_id: components["parameters"]["employee_id"];
                /** @description The UUID of the form */
                form_id: components["parameters"]["form_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Form-Object-Pdf"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "put-v1-employee-form-sign": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the employee */
                employee_id: components["parameters"]["employee_id"];
                /** @description The UUID of the form */
                form_id: components["parameters"]["form_id"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description The signature */
                    signature_text: string;
                    /** @description whether you agree to sign electronically */
                    agree: boolean;
                    /** @description The IP address of the signatory who signed the form. */
                    signed_by_ip_address: string;
                };
            };
        };
        responses: {
            200: components["responses"]["Form-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "get-v1-payrolls-payroll_uuid-employees-employee_uuid-pay_stub": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the payroll */
                payroll_id: components["parameters"]["payroll_id"];
                /** @description The UUID of the employee */
                employee_id: components["parameters"]["employee_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "get-v1-employees-employee_uuid-pay_stubs": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the employee */
                employee_id: components["parameters"]["employee_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Employee-Pay-Stubs-List"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "get-v1-generated_documents-document_type-request_uuid": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description the type of document being generated */
                document_type: components["parameters"]["document_type"];
                /** @description The UUID of the Generated Document Request */
                request_uuid: components["parameters"]["request_uuid"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Generated-Document"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "post-v1-payrolls-payroll_uuid-generated_documents-printable_payroll_checks": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the payroll */
                payroll_id: components["parameters"]["payroll_id"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description The type of check stock being printed. Check this [link](https://support.gusto.com/article/999877761000000/Pay-your-team-by-check) for more info on check types */
                    printing_format: string;
                    /** @description The starting check number for the checks being generated */
                    starting_check_number?: number;
                };
            };
        };
        responses: {
            200: components["responses"]["Payroll-Check"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "post-companies-company_uuid-reports": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_uuid: components["parameters"]["company_uuid"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description Columns to include in the report */
                    columns: ("bank_account_account_number" | "bank_account_routing_number" | "bank_account_type" | "bank_account" | "bonus" | "cash_tips" | "check_amount" | "check_date" | "commission" | "date_of_birth" | "double_overtime_earnings" | "double_overtime_hours" | "double_overtime_rate" | "employee_additional_taxes" | "employee_compensation_time_period" | "employee_compensation" | "employee_deductions" | "employee_department" | "employee_email" | "employee_federal_income_tax" | "employee_first_name" | "employee_last_name" | "employee_middle_initial" | "employee_medicare_additional_tax" | "employee_medicare_tax" | "employee_phone_number" | "employee_social_security_tax" | "employee_taxes" | "employee_work_email" | "employer_additional_taxes" | "employer_contributions" | "employer_cost" | "employer_futa_tax" | "employer_medicare_tax" | "employer_social_security_tax" | "employer_suta_tax" | "employer_taxes" | "employment_type" | "employment" | "end_date" | "garnishments" | "gross_earnings" | "holiday_earnings" | "holiday_hours" | "home_address_city" | "home_address_state" | "home_address_street" | "home_address_zip" | "home_address" | "job_title" | "net_pay" | "one_time_reimbursements" | "overtime_earnings" | "overtime_hours" | "overtime_rate" | "paid_time_off_earnings" | "paid_time_off_hours" | "paid_time_off_rate" | "pay_period_end" | "pay_period_start" | "paycheck_tips" | "payment_method" | "payroll_type" | "preferred_first_name" | "recurring_reimbursements" | "regular_earnings" | "regular_hours" | "regular_rate" | "reimbursements" | "risk_class_code" | "sick_rate" | "sick_time_off_earnings" | "sick_time_off_hours" | "start_date" | "total_time_off_earnings" | "total_time_off_hours" | "work_address_city" | "work_address_street" | "work_address_zip")[];
                    /** @description How to group the report */
                    groupings: ("payroll" | "employee" | "work_address")[];
                    /** @description The title of the report */
                    custom_name?: string;
                    /**
                     * @description The type of file to generate
                     * @enum {string}
                     */
                    file_type: "csv" | "json";
                    /**
                     * @description Whether to include subtotals and grand totals in the report
                     * @default false
                     */
                    with_totals?: boolean;
                    /**
                     * Format: date
                     * @description Start date of data to filter by
                     * @example 2024-01-01
                     */
                    start_date?: string;
                    /**
                     * Format: date
                     * @description End date of data to filter by
                     * @example 2024-04-01
                     */
                    end_date?: string;
                    /**
                     * Format: date
                     * @description Dismissed start date of employees to filter by
                     * @example 2024-01-01
                     */
                    dismissed_start_date?: string;
                    /**
                     * Format: date
                     * @description Dismissed end date of employees to filter by
                     * @example 2024-04-01
                     */
                    dismissed_end_date?: string;
                    /**
                     * @description Payment method to filter by
                     * @enum {string}
                     */
                    payment_method?: "check" | "direct_deposit";
                    /**
                     * @description Employee employment type to filter by
                     * @enum {string}
                     */
                    employment_type?: "exempt" | "salaried_nonexempt" | "nonexempt" | "commission_only_exempt" | "commission_only_nonexempt";
                    /**
                     * @description Employee employment status to filter by
                     * @enum {string}
                     */
                    employment_status?: "active_full_time" | "active_part_time" | "active_part_time_eligible" | "active_variable" | "active_seasonal" | "active" | "dismissed";
                    /** @description Employees to filter by */
                    employee_uuids?: string[];
                    /** @description Departments to filter by */
                    department_uuids?: string[];
                    /** @description Work addresses to filter by */
                    work_address_uuids?: string[];
                };
            };
        };
        responses: {
            200: components["responses"]["Create-Report"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "get-reports-report_uuid": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the report request */
                report_uuid: components["parameters"]["report_uuid"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Report"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "get-companies-company_uuid-report-templates-report_type": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_uuid: components["parameters"]["company_uuid"];
                /** @description The report type */
                report_type: components["parameters"]["report_type"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Report-Template"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "get-v1-companies-company_id-company_benefits": {
        parameters: {
            query?: {
                /** @description Whether to return employee enrollment count */
                enrollment_count?: boolean;
            };
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_id: components["parameters"]["company_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Company-Benefit-List"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "post-v1-companies-company_id-company_benefits": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_id: components["parameters"]["company_id"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description The ID of the benefit to which the company benefit belongs. */
                    benefit_type?: number;
                    /**
                     * @description Whether this benefit is active for employee participation.
                     * @default true
                     */
                    active?: boolean;
                    /** @description The description of the company benefit.For example, a company may offer multiple benefits with an ID of 1 (for Medical Insurance). The description would show something more specific like “Kaiser Permanente” or “Blue Cross/ Blue Shield”. */
                    description: string;
                    /** @description Whether the employer is subject to pay employer taxes when an employee is on leave. Only applicable to third party sick pay benefits. */
                    responsible_for_employer_taxes?: boolean;
                    /** @description Whether the employer is subject to file W-2 forms for an employee on leave. Only applicable to third party sick pay benefits. */
                    responsible_for_employee_w2?: boolean;
                };
            };
        };
        responses: {
            201: components["responses"]["Company-Benefit-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "get-v1-company_benefits-company_benefit_id": {
        parameters: {
            query?: {
                /** @description Whether to return employee benefits associated with the benefit */
                with_employee_benefits?: boolean;
            };
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company benefit */
                company_benefit_id: components["parameters"]["company_benefit_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Company-Benefit-With-Employee-Benefits-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "put-v1-company_benefits-company_benefit_id": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company benefit */
                company_benefit_id: components["parameters"]["company_benefit_id"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description The current version of the object. See the [versioning guide](https://docs.gusto.com/embedded-payroll/docs/versioning#object-layer) for information on how to use this field. */
                    version: string;
                    /** @description Whether this benefit is active for employee participation. Company benefits may only be deactivated if no employees are actively participating. */
                    active?: boolean;
                    /** @description The description of the company benefit.For example, a company may offer multiple benefits with an ID of 1 (for Medical Insurance). The description would show something more specific like “Kaiser Permanente” or “Blue Cross/ Blue Shield”. */
                    description?: string;
                };
            };
        };
        responses: {
            200: components["responses"]["Company-Benefit-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "delete-v1-company_benefits-company_benefit_id": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company benefit */
                company_benefit_id: components["parameters"]["company_benefit_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            404: components["responses"]["Not-Found-Error-Object"];
            /** @description Unprocessable Entity */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        errors?: {
                            base?: {
                                type?: string;
                                message?: string;
                                full_message?: string;
                            }[];
                        };
                    };
                };
            };
        };
    };
    "get-v1-benefits": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Supported-Benefit-List"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "get-v1-benefits-benefit_id": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The benefit type in Gusto. */
                benefit_id: components["parameters"]["benefit_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Supported-Benefit-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "get-v1-benefits-company_benefit_id-summary": {
        parameters: {
            query?: {
                /** @description The start date for which to retrieve company benefit summary */
                start_date?: string;
                /** @description The end date for which to retrieve company benefit summary. If left empty, defaults to today's date. */
                end_date?: string;
                /** @description Display employee payroll item summary */
                detailed?: boolean;
            };
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company benefit */
                company_benefit_id: components["parameters"]["company_benefit_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Benefit-Summary-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "get-v1-benefits-benefits_id-requirements": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The benefit type in Gusto. */
                benefit_id: components["parameters"]["benefit_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Benefit-Type-Requirements-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "get-v1-employees-employee_id-employee_benefits": {
        parameters: {
            query?: {
                /** @description The page that is requested. When unspecified, will load all objects unless endpoint forces pagination. */
                page?: components["parameters"]["pageParam"];
                /** @description Number of objects per page. For majority of endpoints will default to 25 */
                per?: components["parameters"]["perParam"];
            };
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the employee */
                employee_id: components["parameters"]["employee_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Employee-Benefit-List"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "post-v1-employees-employee_id-employee_benefits": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the employee */
                employee_id: components["parameters"]["employee_id"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description The UUID of the company benefit. */
                    company_benefit_uuid: string;
                    /**
                     * @description Whether the employee benefit is active.
                     * @default true
                     */
                    active?: boolean;
                    /**
                     * @description The amount to be deducted, per pay period, from the employee's pay.
                     * @default 0.00
                     */
                    employee_deduction?: string;
                    /**
                     * @description Whether the employee deduction amount should be treated as a percentage to be deducted from each payroll.
                     * @default false
                     */
                    deduct_as_percentage?: boolean;
                    /** @description The maximum employee deduction amount per year. A null value signifies no limit. */
                    employee_deduction_annual_maximum?: string | null;
                    /** @description An object representing the company contribution type and value. */
                    contribution?: {
                        /**
                         * @description The company contribution scheme.
                         *
                         *     `amount`: The company contributes a fixed amount per payroll. If elective is true, the contribution is matching, dollar-for-dollar.
                         *
                         *     `percentage`: The company contributes a percentage of the payroll amount per payroll period. If elective is true, the contribution is matching, dollar-for-dollar.
                         *
                         *     `tiered`: The size of the company contribution corresponds to the size of the employee deduction relative to a tiered matching scheme.
                         * @enum {string}
                         */
                        type?: "tiered" | "percentage" | "amount";
                        /** @description For the `amount` and `percentage` contribution types, the value of the corresponding amount or percentage.
                         *
                         *     For the `tiered` contribution type, an array of tiers. */
                        value?: string | {
                            /** @description The percentage of employee deduction within this tier the company contribution will match. */
                            rate?: string;
                            /** @description The percentage threshold at which this tier ends (inclusive).
                             *
                             *     For example, a value of "5" means the company contribution will match employee deductions from the previous tier's threshold up to and including 5% of payroll.
                             *
                             *     If this is the first tier, a value of "5" means the company contribution will match employee deductions from 0% up to and including 5% of payroll. */
                            threshold?: string;
                        }[];
                    };
                    /**
                     * @description Whether the company contribution is elective (aka "matching"). For `tiered`, `elective_amount`, and `elective_percentage` contribution types this is ignored and assumed to be `true`.
                     * @default false
                     */
                    elective?: boolean;
                    /** @description The maximum company contribution amount per year. A null value signifies no limit. */
                    company_contribution_annual_maximum?: string | null;
                    /** @description Some benefits require additional information to determine their limit. For example, for an HSA benefit, the limit option should be either "Family" or "Individual". For a Dependent Care FSA benefit, the limit option should be either "Joint Filing or Single" or "Married and Filing Separately". */
                    limit_option?: string | null;
                    /**
                     * @description Whether the employee should use a benefit’s "catch up" rate. Only Roth 401k and 401k benefits use this value for employees over 50.
                     * @default false
                     */
                    catch_up?: boolean;
                    /** @description The amount that the employee is insured for. Note: company contribution cannot be present if coverage amount is set. */
                    coverage_amount?: string | null;
                    /**
                     * @description The coverage amount as a multiple of the employee’s salary. Only applicable for Group Term Life benefits. Note: cannot be set if coverage amount is also set.
                     * @default 0.00
                     */
                    coverage_salary_multiplier?: string;
                    /**
                     * @description Whether the employee deduction reduces taxable income or not. Only valid for Group Term Life benefits. Note: when the value is not "unset", coverage amount and coverage salary multiplier are ignored.
                     * @enum {string|null}
                     */
                    deduction_reduces_taxable_income?: "unset" | "reduces_taxable_income" | "does_not_reduce_taxable_income" | null;
                    /**
                     * @deprecated
                     * @description The amount to be paid, per pay period, by the company.
                     * @default 0.00
                     */
                    company_contribution?: string;
                    /**
                     * @deprecated
                     * @description Whether the company contribution amount should be treated as a percentage to be deducted from each payroll.
                     * @default false
                     */
                    contribute_as_percentage?: boolean;
                };
            };
        };
        responses: {
            201: components["responses"]["Employee-Benefit-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "get-v1-employee_benefits-employee_benefit_id": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the employee benefit. */
                employee_benefit_id: components["parameters"]["employee_benefit_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Employee-Benefit-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "put-v1-employee_benefits-employee_benefit_id": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the employee benefit. */
                employee_benefit_id: components["parameters"]["employee_benefit_id"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description The current version of the object. See the [versioning guide](https://docs.gusto.com/embedded-payroll/docs/versioning#object-layer) for information on how to use this field. */
                    version: string;
                    /** @description Whether the employee benefit is active. */
                    active?: boolean;
                    /**
                     * @description The amount to be deducted, per pay period, from the employee's pay.
                     * @default 0.00
                     */
                    employee_deduction?: string;
                    /** @description Whether the employee deduction amount should be treated as a percentage to be deducted from each payroll. */
                    deduct_as_percentage?: boolean;
                    /** @description The maximum employee deduction amount per year. A null value signifies no limit. */
                    employee_deduction_annual_maximum?: string | null;
                    /** @description An object representing the type and value of the company contribution. */
                    contribution?: {
                        /**
                         * @description The company contribution scheme.
                         *
                         *     `amount`: The company contributes a fixed amount per payroll. If elective is true, the contribution is matching, dollar-for-dollar.
                         *
                         *     `percentage`: The company contributes a percentage of the payroll amount per payroll period. If elective is true, the contribution is matching, dollar-for-dollar.
                         *
                         *     `tiered`: The size of the company contribution corresponds to the size of the employee deduction relative to a tiered matching scheme.
                         * @enum {string}
                         */
                        type?: "amount" | "percentage" | "tiered";
                        /** @description For the `amount` and `percentage` contribution types, the value of the corresponding amount or percentage.
                         *
                         *     For the `tiered` contribution type, an array of tiers. */
                        value?: string | {
                            /** @description The percentage of employee deduction within this tier the company contribution will match. */
                            rate?: string;
                            /** @description The percentage threshold at which this tier ends (inclusive).
                             *
                             *     For example, a value of "5" means the company contribution will match employee deductions from the previous tier's threshold up to and including 5% of payroll.
                             *
                             *     If this is the first tier, a value of "5" means the company contribution will match employee deductions from 0% up to and including 5% of payroll. */
                            threshold?: string;
                        }[];
                    };
                    /**
                     * @description Whether the company contribution is elective (aka "matching"). For `tiered`, `elective_amount`, and `elective_percentage` contribution types this is ignored and assumed to be `true`.
                     * @default false
                     */
                    elective?: boolean;
                    /** @description The maximum company contribution amount per year. A null value signifies no limit. */
                    company_contribution_annual_maximum?: string | null;
                    /** @description Some benefits require additional information to determine their limit. For example, for an HSA benefit, the limit option should be either "Family" or "Individual". For a Dependent Care FSA benefit, the limit option should be either "Joint Filing or Single" or "Married and Filing Separately". */
                    limit_option?: string | null;
                    /**
                     * @description Whether the employee should use a benefit’s "catch up" rate. Only Roth 401k and 401k benefits use this value for employees over 50.
                     * @default false
                     */
                    catch_up?: boolean;
                    /** @description The amount that the employee is insured for. Note: company contribution cannot be present if coverage amount is set. */
                    coverage_amount?: string | null;
                    /**
                     * @description Whether the employee deduction reduces taxable income or not. Only valid for Group Term Life benefits. Note: when the value is not "unset", coverage amount and coverage salary multiplier are ignored.
                     * @default unset
                     * @enum {string|null}
                     */
                    deduction_reduces_taxable_income?: "unset" | "reduces_taxable_income" | "does_not_reduce_taxable_income";
                    /**
                     * @description The coverage amount as a multiple of the employee’s salary. Only applicable for Group Term Life benefits. Note: cannot be set if coverage amount is also set.
                     * @default 0.00
                     */
                    coverage_salary_multiplier?: string;
                    /**
                     * @deprecated
                     * @description The amount to be paid, per pay period, by the company.
                     * @default 0.00
                     */
                    company_contribution?: string;
                    /**
                     * @deprecated
                     * @description Whether the company contribution amount should be treated as a percentage to be deducted from each payroll.
                     * @default false
                     */
                    contribute_as_percentage?: boolean;
                };
            };
        };
        responses: {
            200: components["responses"]["Employee-Benefit-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "delete-v1-employee_benefits-employee_benefit_id": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the employee benefit. */
                employee_benefit_id: components["parameters"]["employee_benefit_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "post-employee-ytd-benefit-amounts-from-different-company": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the employee */
                employee_id: components["parameters"]["employee_id"];
            };
            cookie?: never;
        };
        requestBody?: components["requestBodies"]["post-employee-ytd-benefit-amounts-from-different-company"];
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "get-v1-employees-employee_id-garnishments": {
        parameters: {
            query?: {
                /** @description The page that is requested. When unspecified, will load all objects unless endpoint forces pagination. */
                page?: components["parameters"]["pageParam"];
                /** @description Number of objects per page. For majority of endpoints will default to 25 */
                per?: components["parameters"]["perParam"];
            };
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the employee */
                employee_id: components["parameters"]["employee_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Garnishment-List"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "post-v1-employees-employee_id-garnishments": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the employee */
                employee_id: components["parameters"]["employee_id"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /**
                     * @description Whether or not this garnishment is currently active.
                     * @default true
                     */
                    active?: boolean;
                    /**
                     * Format: float
                     * @description The amount of the garnishment. Either a percentage or a fixed dollar amount. Represented as a float, e.g. "8.00".
                     */
                    amount: string;
                    /** @description The description of the garnishment. */
                    description: string;
                    /** @description Whether the garnishment is court ordered. */
                    court_ordered: boolean;
                    /**
                     * @description The number of times to apply the garnishment. Ignored if recurring is true.
                     * @default null
                     */
                    times?: number | null;
                    /**
                     * @description Whether the garnishment should recur indefinitely.
                     * @default false
                     */
                    recurring?: boolean;
                    /**
                     * Format: float
                     * @description The maximum deduction per annum. A null value indicates no maximum. Represented as a float, e.g. "200.00".
                     * @default null
                     */
                    annual_maximum?: string | null;
                    /**
                     * Format: float
                     * @description The maximum deduction per pay period. A null value indicates no maximum. Represented as a float, e.g. "16.00".
                     * @default null
                     */
                    pay_period_maximum?: string | null;
                    /**
                     * @description Whether the amount should be treated as a percentage to be deducted per pay period.
                     * @default false
                     */
                    deduct_as_percentage?: boolean;
                };
            };
        };
        responses: {
            201: components["responses"]["Garnishment-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "get-v1-garnishments-garnishment_id": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the garnishment */
                garnishment_id: components["parameters"]["garnishment_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Garnishment-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "put-v1-garnishments-garnishment_id": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the garnishment */
                garnishment_id: components["parameters"]["garnishment_id"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /**
                     * @description Whether or not this garnishment is currently active.
                     * @default true
                     */
                    active?: boolean;
                    /**
                     * Format: float
                     * @description The amount of the garnishment. Either a percentage or a fixed dollar amount. Represented as a float, e.g. "8.00".
                     */
                    amount?: string;
                    /** @description The description of the garnishment. */
                    description?: string;
                    /** @description Whether the garnishment is court ordered. */
                    court_ordered?: boolean;
                    /**
                     * @description The number of times to apply the garnishment. Ignored if recurring is true.
                     * @default null
                     */
                    times?: number | null;
                    /**
                     * @description Whether the garnishment should recur indefinitely.
                     * @default false
                     */
                    recurring?: boolean;
                    /**
                     * Format: float
                     * @description The maximum deduction per annum. A null value indicates no maximum. Represented as a float, e.g. "200.00".
                     * @default null
                     */
                    annual_maximum?: string | null;
                    /**
                     * Format: float
                     * @description The maximum deduction per pay period. A null value indicates no maximum. Represented as a float, e.g. "16.00".
                     * @default null
                     */
                    pay_period_maximum?: string | null;
                    /**
                     * @description Whether the amount should be treated as a percentage to be deducted per pay period.
                     * @default false
                     */
                    deduct_as_percentage?: boolean;
                    /** @description The current version of the object. See the [versioning guide](https://docs.gusto.com/embedded-payroll/docs/versioning#object-layer) for information on how to use this field. */
                    version: string;
                };
            };
        };
        responses: {
            200: components["responses"]["Garnishment-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "post-v1-plaid-processor_token": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /**
                     * @description The owner type of the bank account
                     * @enum {string}
                     */
                    owner_type: "Company";
                    /** @description The owner uuid of the bank account */
                    owner_id: string;
                    /** @description The Plaid processor token */
                    processor_token: string;
                };
            };
        };
        responses: {
            /** @description A JSON object containing bank information */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Company-Bank-Account"];
                };
            };
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "get-v1-companies-company_uuid-tax_requirements-state": {
        parameters: {
            query?: {
                /** @description When true, return "new" requirement sets with valid `effective_from` dates that are available to save new effective dated values. */
                scheduling?: boolean;
            };
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_uuid: components["parameters"]["company_uuid"];
                /** @description 2-letter US state abbreviation */
                state: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Tax-Requirements-State"];
                };
            };
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "put-v1-companies-company_uuid-tax_requirements-state": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_uuid: components["parameters"]["company_uuid"];
                /** @description 2-letter US state abbreviation */
                state: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    requirement_sets?: {
                        key?: components["schemas"]["Tax-Requirement-Set-Key"];
                        effective_from?: components["schemas"]["Tax-Requirement-Effective-From"];
                        state?: components["schemas"]["State"];
                        requirements?: {
                            key?: components["schemas"]["Tax-Requirement-Key"];
                            value?: string | null;
                        }[];
                    }[];
                };
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "get-v1-companies-company_uuid-tax_requirements": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_uuid: components["parameters"]["company_uuid"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        state?: components["schemas"]["State"];
                        /** @description If all requirements for the state have been satisfied such that the company can complete
                         *     onboarding, the company is `setup_complete` in the state. A company must be `setup_complete` in
                         *     all relevant states to complete the `state_setup` company onboarding step. */
                        setup_complete?: boolean;
                    }[];
                };
            };
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "get-companies-company_uuid-contractor_payments-preview": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_uuid: components["parameters"]["company_uuid"];
            };
            cookie?: never;
        };
        /** @description a list of contractor payments. */
        requestBody?: {
            content: {
                "application/json": {
                    contractor_payments: {
                        bonus?: number;
                        contractor_uuid?: string;
                        date?: string;
                        hourly_rate?: number;
                        hours?: number;
                        payment_method?: string;
                        reimbursement?: number;
                        wage?: number;
                    }[];
                };
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @description The calculated debit date. If the payment method is Direct Deposit, the debit date will account for the company's ACH speed. If the payment method is Check, the debit date will be the same as the check date. */
                        expected_debit_date?: string;
                    };
                };
            };
            404: components["responses"]["Not-Found-Error-Object"];
            /** @description Unprocessable Entity (WebDAV) */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        errors?: {
                            base?: {
                                type?: string;
                                message?: string;
                                full_message?: string;
                            }[];
                            check_date?: {
                                type?: string;
                                message?: string;
                                full_message?: string;
                            }[];
                        };
                    };
                };
            };
        };
    };
    "get-time_off_policies-time_off_policy_uuid": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company time off policy */
                time_off_policy_uuid: components["parameters"]["time_off_policy_uuid"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Time-Off-Policy-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "put-time_off_policies-time_off_policy_uuid": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company time off policy */
                time_off_policy_uuid: components["parameters"]["time_off_policy_uuid"];
            };
            cookie?: never;
        };
        /** @description Can update any attributes of the time off policy except policy_type, is_active, complete & employees */
        requestBody?: {
            content: {
                "application/json": {
                    /** @description Name of the time off policy */
                    name?: string;
                    /**
                     * @description Accrual method of the time off policy
                     * @enum {string}
                     */
                    accrual_method?: "unlimited" | "per_pay_period" | "per_calendar_year" | "per_anniversary_year" | "per_hour_worked" | "per_hour_worked_no_overtime" | "per_hour_paid" | "per_hour_paid_no_overtime";
                    /**
                     * Format: float
                     * @description The rate at which the time off hours will accrue for an employee on the policy. Represented as a float, e.g. "40.0".
                     */
                    accrual_rate?: string;
                    /**
                     * Format: float
                     * @description The number of hours an employee has to work or be paid for to accrue the number of hours set in the accrual rate. Only used for hourly policies (per_hour_paid, per_hour_paid_no_overtime, per_hour_work, per_hour_worked_no_overtime). Represented as a float, e.g. "40.0".
                     */
                    accrual_rate_unit?: string;
                    /** @description Boolean representing if an employees accrued time off hours will be paid out on termination */
                    paid_out_on_termination?: boolean;
                    /** @description Number of days before an employee on the policy will begin accruing time off hours. If accrual_method is per_anniversary_year, per_calendar_year, or unlimited, then accrual_waiting_period_days should be 0. */
                    accrual_waiting_period_days?: number;
                    /**
                     * Format: float
                     * @description The max number of hours and employee can carryover from one year to the next. If accrual_method is unlimited, then carryover_limit_hours must be blank.
                     */
                    carryover_limit_hours?: string;
                    /**
                     * Format: float
                     * @description The max number of hours and employee can accrue in a year. If accrual_method is unlimited, then max_accrual_hours_per_year must be blank.
                     */
                    max_accrual_hours_per_year?: string;
                    /**
                     * Format: float
                     * @description The max number of hours an employee can accrue. If accrual_method is unlimited, then max_hours must be blank.
                     */
                    max_hours?: string;
                };
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Time-Off-Policy"];
                };
            };
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "get-companies-company_uuid-time_off_policies": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_uuid: components["parameters"]["company_uuid"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Time-Off-Policy-List"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "post-companies-company_uuid-time_off_policies": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_uuid: components["parameters"]["company_uuid"];
            };
            cookie?: never;
        };
        /** @description Requires a policy name, a policy_type, and an accrual_method */
        requestBody?: {
            content: {
                "application/json": {
                    /** @description Name of the time off policy */
                    name: string;
                    /** @description Type of the time off policy. Currently only "vacation" and "sick" are supported */
                    policy_type: string;
                    /**
                     * @description Accrual method of the time off policy
                     * @enum {string}
                     */
                    accrual_method: "unlimited" | "per_pay_period" | "per_calendar_year" | "per_anniversary_year" | "per_hour_worked" | "per_hour_worked_no_overtime" | "per_hour_paid" | "per_hour_paid_no_overtime";
                    /**
                     * Format: float
                     * @description The rate at which the time off hours will accrue for an employee on the policy. Represented as a float, e.g. "40.0".
                     */
                    accrual_rate?: string;
                    /**
                     * Format: float
                     * @description The number of hours an employee has to work or be paid for to accrue the number of hours set in the accrual rate. Only used for hourly policies (per_hour_paid, per_hour_paid_no_overtime, per_hour_work, per_hour_worked_no_overtime). Represented as a float, e.g. "40.0".
                     */
                    accrual_rate_unit?: string;
                    /** @description Boolean representing if an employees accrued time off hours will be paid out on termination */
                    paid_out_on_termination?: boolean;
                    /** @description Number of days before an employee on the policy will begin accruing time off hours. If accrual_method is per_anniversary_year, per_calendar_year, or unlimited, then accrual_waiting_period_days should be 0. */
                    accrual_waiting_period_days?: number;
                    /**
                     * Format: float
                     * @description The max number of hours and employee can carryover from one year to the next. If accrual_method is unlimited, then carryover_limit_hours must be blank.
                     */
                    carryover_limit_hours?: string;
                    /**
                     * Format: float
                     * @description The max number of hours and employee can accrue in a year. If accrual_method is unlimited, then max_accrual_hours_per_year must be blank.
                     */
                    max_accrual_hours_per_year?: string;
                    /**
                     * Format: float
                     * @description The max number of hours an employee can accrue. If accrual_method is unlimited, then max_hours must be blank.
                     */
                    max_hours?: string;
                };
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Time-Off-Policy"];
                };
            };
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "put-version-time_off_policies-time_off_policy_uuid-add_employees": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company time off policy */
                time_off_policy_uuid: components["parameters"]["time_off_policy_uuid"];
            };
            cookie?: never;
        };
        /** @description A list of employee objects containing the employee uuid */
        requestBody?: {
            content: {
                "application/json": {
                    employees?: {
                        uuid?: string;
                        /** Format: float */
                        balance?: string;
                    }[];
                };
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Time-Off-Policy"];
                };
            };
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "put-v1-time_off_policies-time_off_policy_uuid-remove_employees": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company time off policy */
                time_off_policy_uuid: components["parameters"]["time_off_policy_uuid"];
            };
            cookie?: never;
        };
        /** @description A list of employee objects containing the employee uuid */
        requestBody?: {
            content: {
                "application/json": {
                    employees?: {
                        uuid?: string;
                    }[];
                };
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Time-Off-Policy"];
                };
            };
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "get-companies-company_uuid-holiday_pay_policy": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_uuid: components["parameters"]["company_uuid"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Holiday-Pay-Policy-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "put-companies-company_uuid-holiday_pay_policy": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_uuid: components["parameters"]["company_uuid"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description The current version of the object. See the [versioning guide](https://docs.gusto.com/embedded-payroll/docs/idempotency) for information on how to use this field. */
                    version: string;
                    /** @description An object containing federal holiday objects, each containing a boolean selected property. */
                    federal_holidays?: {
                        new_years_day?: {
                            selected?: boolean;
                        };
                        mlk_day?: {
                            selected?: boolean;
                        };
                        presidents_day?: {
                            selected?: boolean;
                        };
                        memorial_day?: {
                            selected?: boolean;
                        };
                        juneteenth?: {
                            selected?: boolean;
                        };
                        independence_day?: {
                            selected?: boolean;
                        };
                        labor_day?: {
                            selected?: boolean;
                        };
                        columbus_day?: {
                            selected?: boolean;
                        };
                        veterans_day?: {
                            selected?: boolean;
                        };
                        thanksgiving?: {
                            selected?: boolean;
                        };
                        christmas_day?: {
                            selected?: boolean;
                        };
                    };
                };
            };
        };
        responses: {
            200: components["responses"]["Holiday-Pay-Policy-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "post-companies-company_uuid-holiday_pay_policy": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_uuid: components["parameters"]["company_uuid"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description An object containing federal holiday objects, each containing a boolean selected property. */
                    federal_holidays?: {
                        new_years_day?: {
                            selected?: boolean;
                        };
                        mlk_day?: {
                            selected?: boolean;
                        };
                        presidents_day?: {
                            selected?: boolean;
                        };
                        memorial_day?: {
                            selected?: boolean;
                        };
                        juneteenth?: {
                            selected?: boolean;
                        };
                        independence_day?: {
                            selected?: boolean;
                        };
                        labor_day?: {
                            selected?: boolean;
                        };
                        columbus_day?: {
                            selected?: boolean;
                        };
                        veterans_day?: {
                            selected?: boolean;
                        };
                        thanksgiving?: {
                            selected?: boolean;
                        };
                        christmas_day?: {
                            selected?: boolean;
                        };
                    };
                };
            };
        };
        responses: {
            200: components["responses"]["Holiday-Pay-Policy-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "delete-companies-company_uuid-holiday_pay_policy": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_uuid: components["parameters"]["company_uuid"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "put-companies-company_uuid-holiday_pay_policy-add": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_uuid: components["parameters"]["company_uuid"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description The current version of the object. See the [versioning guide](https://docs.gusto.com/embedded-payroll/docs/idempotency) for information on how to use this field. */
                    version: string;
                    /** @description An array of employee objects, each containing an employee_uuid. */
                    employees?: {
                        uuid?: string;
                    }[];
                };
            };
        };
        responses: {
            200: components["responses"]["Holiday-Pay-Policy-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "put-companies-company_uuid-holiday_pay_policy-remove": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_uuid: components["parameters"]["company_uuid"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description The current version of the object. See the [versioning guide](https://docs.gusto.com/embedded-payroll/docs/idempotency) for information on how to use this field. */
                    version: string;
                    /** @description An array of employee objects, each containing an employee_uuid. */
                    employees?: {
                        uuid?: string;
                    }[];
                };
            };
        };
        responses: {
            200: components["responses"]["Holiday-Pay-Policy-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "get-companies-company_uuid-paid_holidays": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_uuid: components["parameters"]["company_uuid"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description If a year is passed, paid holidays for that year will be returned. Otherwise, paid holidays for the next three years will be returned. */
                    year?: string;
                };
            };
        };
        responses: {
            200: components["responses"]["Paid-Holidays-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "put-version-time_off_policies-time_off_policy_uuid-balance": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company time off policy */
                time_off_policy_uuid: components["parameters"]["time_off_policy_uuid"];
            };
            cookie?: never;
        };
        /** @description A list of employee objects containing the employee uuid and time off hours balance */
        requestBody?: {
            content: {
                "application/json": {
                    employees?: {
                        uuid?: string;
                        /** Format: float */
                        balance?: string;
                    }[];
                };
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Time-Off-Policy"];
                };
            };
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "put-v1-time_off_policies-time_off_policy_uuid-deactivate": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company time off policy */
                time_off_policy_uuid: components["parameters"]["time_off_policy_uuid"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Time-Off-Policy"];
                };
            };
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "get-notifications-notification_uuid": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the notification */
                notification_uuid: components["parameters"]["notification_uuid"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Notification"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "get-events": {
        parameters: {
            query?: {
                /** @description A cursor for pagination. Returns all events occuring after the specified UUID (exclusive). Events are sorted according to the provided sort_order param. */
                starting_after_uuid?: components["parameters"]["starting_after_uuid"];
                /** @description The UUID of the company. If not specified, will return all events for all companies. */
                resource_uuid?: components["parameters"]["resource_uuid"];
                /** @description Limits the number of objects returned in a single response, between 1 and 100. The default is 25 */
                limit?: components["parameters"]["limit"];
                /** @description A string containing the exact event name (e.g. `employee.created`), or use a wildcard match to filter for a group of events (e.g. `employee.*`, `*.created`, `notification.*.created` etc.) */
                event_type?: components["parameters"]["event_type"];
                /** @description A string indicating whether to sort resulting events in ascending (asc) or descending (desc) chronological order. Events are sorted by their `timestamp`. Defaults to asc if left empty. */
                sort_order?: components["parameters"]["sort_order"];
            };
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Event-List"];
        };
    };
    "get-recovery-cases": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_uuid: components["parameters"]["company_uuid"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Recovery-Case-List"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "redebit-recovery-case": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the recovery case */
                recovery_case_uuid: components["parameters"]["recovery_case_uuid"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Accepted */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "get-ach-transactions": {
        parameters: {
            query?: {
                /** @description The UUID of the contractor payment */
                contractor_payment_uuid?: components["parameters"]["contractor_payment_uuid_query"];
                /** @description The UUID of the payroll */
                payroll_uuid?: components["parameters"]["payroll_uuid_query"];
                /** @description Used to filter the ACH transactions to only include those with a specific transaction type, such as "Credit employee pay". */
                transaction_type?: components["parameters"]["transaction_type"];
                /** @description Used to filter the ACH transactions to only include those with a specific payment direction, either "credit" or "debit". */
                payment_direction?: components["parameters"]["payment_direction"];
            };
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_uuid: components["parameters"]["company_uuid"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Ach-Transaction-List"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "get-wire_in_requests-wire_in_request_uuid": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the Wire In Request */
                wire_in_request_uuid: components["parameters"]["wire_in_request_uuid"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Wire-In-Request-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
        };
    };
    "put-wire_in_requests-wire_in_request_uuid": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the Wire In Request */
                wire_in_request_uuid: components["parameters"]["wire_in_request_uuid"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description The date the wire was sent */
                    date_sent: string;
                    /** @description Name of the bank sending the wire */
                    bank_name: string;
                    /** @description Amount of money sent */
                    amount_sent: string;
                    /** @description Additional notes */
                    additional_notes?: string;
                };
            };
        };
        responses: {
            200: components["responses"]["Wire-In-Request-Object"];
            404: components["responses"]["Not-Found-Error-Object"];
            422: components["responses"]["Unprocessable-Entity-Error-Object"];
        };
    };
    "get-companies-company_uuid-wire_in_request_uuid": {
        parameters: {
            query?: never;
            header?: {
                /** @description Determines the date-based API version associated with your API call. If none is provided, your application's [minimum API version](https://docs.gusto.com/embedded-payroll/docs/api-versioning#minimum-api-version) is used. */
                "X-Gusto-API-Version"?: components["parameters"]["VersionHeader"];
            };
            path: {
                /** @description The UUID of the company */
                company_uuid: components["parameters"]["company_uuid"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["Wire-In-Request-List"];
        };
    };
}
