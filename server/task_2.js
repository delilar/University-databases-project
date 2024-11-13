import odbc from "odbc";

const connection = await odbc.connect('DSN=MS Access Database;DBQ=./DB.accdb');


//Задание 2
async function analyzeDatabaseStructure() {
  try {

    //Получаем список всех таблиц
    const tables = await connection.tables(null, null, null, null);
    console.log("Таблицы в базе данных:");
    tables.forEach(table => {
      console.log(`${table.TABLE_NAME} (Тип: ${table.TABLE_TYPE})`)
    });

    // Для каждой таблицы получаем информацию о столбцах
    for (const table of tables) {
      console.log('\n###########################')
      const columns = await connection.columns(null, null, table.TABLE_NAME, null)
      console.log(`\nСтолбцы таблицы ${table.TABLE_NAME}:`);

      columns.forEach(column => {
        console.log(`\n${column.COLUMN_NAME} (Код типа: ${column.DATA_TYPE}, Тип: ${column.TYPE_NAME}, Размер: ${column.COLUMN_SIZE})`)
      })
    }

  } catch (err) {
    console.error(err);
  }
}

analyzeDatabaseStructure();
