import oracledb from "oracledb";
import { initializePool } from "./database";

export async function executeQuery(
  sql: string,
  binds: any = {},
  options: any = {}
) {
  await initializePool();
  const connection = await oracledb.getConnection("default");
  const result = await connection.execute(sql, binds, {
    outFormat: oracledb.OUT_FORMAT_OBJECT,
    ...options,
  });
  await connection.close();
  return result;
}

/**
 * Call Oracle stored procedure with RefCursor output
 * Used for procedures like PACKAGE_RPT_FI_SOA.get_rpt_fi_soa_new
 */
export async function callProcedure(
  procedureName: string,
  binds: any = {}
): Promise<any[]> {
  await initializePool();
  const connection = await oracledb.getConnection("default");

  console.log(`[StoredProcedure] Calling ${procedureName}`);
  console.log(`[StoredProcedure] Parameters:`, JSON.stringify(binds, null, 2));

  try {
    // Add cursor output parameter
    const bindParams = {
      ...binds,
      p_cursor: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT },
      p_status: { type: oracledb.STRING, dir: oracledb.BIND_OUT, maxSize: 200 },
      p_error_message: {
        type: oracledb.STRING,
        dir: oracledb.BIND_OUT,
        maxSize: 200,
      },
    };

    const result = await connection.execute(
      `BEGIN ${procedureName}(:p_office, :p_class, :p_dc_account_code, :p_dc_account_name, :p_as_at_date, :p_userid, :p_cursor, :p_status, :p_error_message); END;`,
      bindParams
    );

    const outBinds = result.outBinds as any;
    console.log(`[StoredProcedure] Status: ${outBinds.p_status}`);
    console.log(`[StoredProcedure] Error Message: ${outBinds.p_error_message}`);

    // Fetch all rows from cursor
    const cursor = outBinds.p_cursor;
    const rows: any[] = [];

    if (cursor) {
      let row;
      while ((row = await cursor.getRow())) {
        rows.push(row);
      }
      await cursor.close();
    }

    console.log(`[StoredProcedure] Returned ${rows.length} rows`);
    if (rows.length > 0) {
      console.log(
        `[StoredProcedure] First row sample:`,
        JSON.stringify(rows[0], null, 2)
      );
    }

    return rows;
  } catch (error: any) {
    console.error(`[StoredProcedure] Error: ${error.message}`);
    throw error;
  } finally {
    await connection.close();
  }
}
