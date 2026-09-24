import { ClientSDK, RequestOptions } from "../lib/sdks.js";
import { GetAchTransactionsRequest, GetAchTransactionsResponse } from "../models/operations/getachtransactions.js";
export declare class AchTransactions extends ClientSDK {
    /**
     * Get all ACH transactions for a company
     *
     * @remarks
     * Fetches all ACH transactions for a company.
     *
     * scope: `ach_transactions:read`
     */
    getAll(request: GetAchTransactionsRequest, options?: RequestOptions): Promise<GetAchTransactionsResponse>;
}
//# sourceMappingURL=achtransactions.d.ts.map