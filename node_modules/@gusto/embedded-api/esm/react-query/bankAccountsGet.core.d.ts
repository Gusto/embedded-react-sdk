import { QueryClient, QueryFunctionContext, QueryKey } from "@tanstack/react-query";
import { GustoEmbeddedCore } from "../core.js";
import { RequestOptions } from "../lib/sdks.js";
import { GetV1CompaniesCompanyIdBankAccountsHeaderXGustoAPIVersion, GetV1CompaniesCompanyIdBankAccountsRequest, GetV1CompaniesCompanyIdBankAccountsResponse } from "../models/operations/getv1companiescompanyidbankaccounts.js";
export type BankAccountsGetQueryData = GetV1CompaniesCompanyIdBankAccountsResponse;
export declare function prefetchBankAccountsGet(queryClient: QueryClient, client$: GustoEmbeddedCore, request: GetV1CompaniesCompanyIdBankAccountsRequest, options?: RequestOptions): Promise<void>;
export declare function buildBankAccountsGetQuery(client$: GustoEmbeddedCore, request: GetV1CompaniesCompanyIdBankAccountsRequest, options?: RequestOptions): {
    queryKey: QueryKey;
    queryFn: (context: QueryFunctionContext) => Promise<BankAccountsGetQueryData>;
};
export declare function queryKeyBankAccountsGet(companyId: string, parameters: {
    xGustoAPIVersion?: GetV1CompaniesCompanyIdBankAccountsHeaderXGustoAPIVersion | undefined;
}): QueryKey;
//# sourceMappingURL=bankAccountsGet.core.d.ts.map