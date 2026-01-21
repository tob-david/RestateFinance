import { streamFromOracle } from "./oracleStreamReader";

export function streamSoaData(asAtDate: Date, accountName: string) {
  return streamFromOracle({
    procedureName: "PACKAGE_RPT_FI_SOA.get_rpt_fi_soa_new",
    binds: {
      p_office: "ALL",
      p_class: "ALL",
      p_dc_account_code: "ALL",
      p_dc_account_name: accountName,
      p_as_at_date: asAtDate,
      p_userid: "adm",
    },
  });
}
