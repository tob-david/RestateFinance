import oracledb from "oracledb";
import { initializePool } from "../../database/database";
import { IOracleStreamOptions } from "../../utils/types";

export async function* streamFromOracle(
  options: IOracleStreamOptions,
): AsyncGenerator<any[], void, unknown> {
  await initializePool();
  const connection = await oracledb.getConnection();

  try {
    const result = await connection.execute(
      `BEGIN ${options.procedureName}(
        :p_office, :p_class, :p_dc_account_code, :p_dc_account_name,
        :p_as_at_date, :p_userid, :p_cursor, :p_status, :p_error_message
      ); END;`,
      {
        ...options.binds,
        p_cursor: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT },
        p_status: {
          type: oracledb.STRING,
          dir: oracledb.BIND_OUT,
          maxSize: 200,
        },
        p_error_message: {
          type: oracledb.STRING,
          dir: oracledb.BIND_OUT,
          maxSize: 200,
        },
      },
    );

    const outBinds = result.outBinds as any;

    if (outBinds.p_status !== "1") {
      throw new Error(`Procedure error: ${outBinds.p_error_message}`);
    }

    const cursor = outBinds.p_cursor;

    let row;

    while ((row = await cursor.getRow())) {
      yield row;
    }

    await cursor.close();
  } finally {
    await connection.close();
  }
}
