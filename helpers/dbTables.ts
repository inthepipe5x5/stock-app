import supabase from "../lib/supabase";
/** Helper function for dynamically retrieving the list of tables from the database
 *
 * @param {array} tables - List of tables to retrieve. Defaults to defaultTables.
 * @returns {array} List of tables from the database
 */
// const getTableNames = async (tables = defaultTables) => {
//   // Convert tables to a string list to be used in query
//   const tableGuardrails = tables.map((table) => `'${table}'`).join(", ");
//   const queryStatement = `SELECT table_name 
//                             FROM information_schema.tables 
//                             WHERE table_schema='public' AND table_name IN (${tableGuardrails})`;

//   try {
//     const res = await db.query(queryStatement);
//     const tableNames = res.rows.map((row) => row.table_name);
//     return tableNames;
//   } catch (err) {
//     console.error(err);
//     throw err; // Re-throw the error to propagate it
//   }
// };
const getTableNames = async () => {
  try {
    const { data, error } = await supabase.rpc('get_public_schema_info');

    if (error) {
      console.error('Error fetching public schema info:', { error }, { data });
      return;
    }
    console.log('Data fetched successfully:', { data });
    interface ColumnInfo {
      data_type: string;
      is_primary_key: boolean;
    }

    interface TableInfo {
      columns: Record<string, ColumnInfo>;
      primary_key: string;
    }

    interface ParsedData {
      [table_name: string]: TableInfo;
    }

    interface SupabaseDataItem {
      table_name: string;
      column_name: string;
      data_type: string;
      is_primary_key: boolean;
    }

    const parsedData: ParsedData = data.reduce((accum: ParsedData, item: SupabaseDataItem): ParsedData => {
      const { table_name, column_name, data_type, is_primary_key } = item;
      // Check if the table already exists in the accumulator
      if (!accum[table_name]) {
        accum[table_name] = {
          columns: {},
          primary_key: "",
        };
      }
      // Check if the column already exists
      accum[table_name].columns[column_name] = {
        data_type,
        is_primary_key,
      };
      // If it's a primary key, set it
      if (is_primary_key) {
        accum[table_name].primary_key = column_name;
      }
      // return the accumulator
      // console.log("accum", accum);
      return accum;
    }, {});
    console.log("Parsed Data", parsedData);
    return parsedData;
  } catch (error) {
    console.error("Error retrieving table names:", error);
    throw error; // Re-throw the error to propagate it
  }
}



export default getTableNames;
