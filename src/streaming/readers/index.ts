import { streamFromOracle } from "./oracleStreamReader";

/*
            p.Add("p_office", officeCode, OracleMappingType.Varchar2, ParameterDirection.Input, 100);
            p.Add("p_class", classOfBusinesses, OracleMappingType.Varchar2, ParameterDirection.Input, 100);
            p.Add("p_dc_account_code", accountCode, OracleMappingType.Varchar2, ParameterDirection.Input, 100);
            p.Add("p_dc_account_name", accountCode, OracleMappingType.Varchar2, ParameterDirection.Input, 100);
            p.Add("p_as_at_date", toDate, OracleMappingType.Date, ParameterDirection.Input);
            p.Add("p_userid", userCode, OracleMappingType.Varchar2, ParameterDirection.Input, size: 200);
            p.Add("p_cursor", null, OracleMappingType.RefCursor, ParameterDirection.Output);
            p.Add("p_status", "", OracleMappingType.Varchar2, ParameterDirection.Output, size: 200);
            p.Add("p_error_message", "", OracleMappingType.Varchar2, ParameterDirection.Output, size: 200);
  */

export function streamSoaData(asAtDate: Date) {
  return streamFromOracle({
    procedureName: "PACKAGE_RPT_FI_SOA.get_rpt_fi_soa_new",
    binds: {
      p_office: "ALL",
      p_class: "ALL",
      p_dc_account_code: "ALL",
      p_dc_account_name: null,
      p_as_at_date: asAtDate,
      p_userid: "adm",
    },
  });
}
