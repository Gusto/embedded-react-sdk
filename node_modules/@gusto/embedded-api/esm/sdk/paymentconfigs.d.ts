import { ClientSDK, RequestOptions } from "../lib/sdks.js";
import { GetV1CompanyPaymentConfigsRequest, GetV1CompanyPaymentConfigsResponse } from "../models/operations/getv1companypaymentconfigs.js";
import { PutV1CompanyPaymentConfigsRequest, PutV1CompanyPaymentConfigsResponse } from "../models/operations/putv1companypaymentconfigs.js";
export declare class PaymentConfigs extends ClientSDK {
    /**
     * Get a company's payment configs
     *
     * @remarks
     * Get payment speed configurations for the company: payment speed (1-day, 2-day, or 4-day ACH), fast payment limit, partner-owned disbursement setting, and earned fast ACH blockers when applicable. 1-day is only available to partners that opt in.
     *
     * ### Related guides
     * - [Payroll Processing Speeds](doc:2-day-vs-4-day)
     *
     * scope: `company_payment_configs:read`
     */
    get(request: GetV1CompanyPaymentConfigsRequest, options?: RequestOptions): Promise<GetV1CompanyPaymentConfigsResponse>;
    /**
     * Update a company's payment configs
     *
     * @remarks
     * Update payment speed, fast payment limit, and/or partner-owned disbursement for a company.
     *
     * At least one of `payment_speed`, `fast_payment_limit`, or `partner_owned_disbursement` is required.
     * 1-day payment speed is only applicable to partners that opt in. 1-day is not allowed when AutoPilot is enabled.
     *
     * ### Related guides
     * - [Payroll Processing Speeds](doc:2-day-vs-4-day)
     *
     * scope: `company_payment_configs:write`
     */
    update(request: PutV1CompanyPaymentConfigsRequest, options?: RequestOptions): Promise<PutV1CompanyPaymentConfigsResponse>;
}
//# sourceMappingURL=paymentconfigs.d.ts.map