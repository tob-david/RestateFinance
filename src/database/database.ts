import oracledb from "oracledb";

export const oracleClient = oracledb.initOracleClient({
  libDir: "C:/Program Files/instantclient_23_0",
});

let isPoolInitialized = false;

export async function initializePool() {
  if (isPoolInitialized) {
    return;
  }

  try {
    await oracledb.createPool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING,
    });

    isPoolInitialized = true;
    console.log("Oracle DB Pool Initialized");
  } catch (error: any) {
    console.error("Oracle DB Pool Error:", error.message);
    throw error;
  }
}
