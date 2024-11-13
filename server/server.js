import express from 'express'
import cors from 'cors'
import odbc from 'odbc'


const app = express();
app.use(cors())
app.use(express.json())


const connectionString = 'DSN=MS Access Database;DBQ=./DB.accdb';


// Функция для безопасного форматирования значения SQL
const formatSqlValue = (value, columnType = null) => {
  if (value === null || value === undefined) {
    return 'NULL';
  }
  
  // Если это число или поле имеет числовой тип
  if (typeof value === 'number' || columnType === 'NUMBER' || columnType === 'INTEGER' || columnType === 'COUNTER') {
    return value;
  }
  
  if (typeof value === 'boolean' || columnType === 'BOOLEAN') {
    return value ? 'TRUE' : 'FALSE';
  }
  
  // Проверяем, является ли строка датой в формате YYYY-MM-DD
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return `#${value}#`;
  }
  
  // Для всех остальных случаев - экранируем строку
  return `'${value.toString().replace(/'/g, "''")}'`;
};


// Функция для форматирования имен столбцов
const formatColumnName = (column) => {
  return `[${column}]`;
};


app.get('/tables', async (req, res) => {
    try {
        const connection = await odbc.connect(connectionString);
        const tables = await connection.tables(null, null, null, null);
        await connection.close()

        res.json(tables.filter(table => table.TABLE_TYPE === 'TABLE').map(table => table.TABLE_NAME));
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
})

app.get('/table/:name', async (req, res) => {
    try {
      const connection = await odbc.connect(connectionString);
      const result = await connection.query(`SELECT * FROM ${req.params.name}`);
      await connection.close();
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});


app.get('/table/:name/schema', async (req, res) => {
  try {
    const connection = await odbc.connect(connectionString);
    const result = await connection.columns(null, null, req.params.name, null);
    await connection.close();

    // Преобразуем информацию о столбцах в удобный формат
    const columnTypes = {};
    result.forEach(column => {
      columnTypes[column.COLUMN_NAME] = {
        type: column.TYPE_NAME,
        nullable: column.NULLABLE === 1,
        length: column.COLUMN_SIZE
      };
    });

    res.json(columnTypes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.post('/table/:name', async (req, res) => {
  console.log('=== POST Request Details ===');
  console.log('Table:', req.params.name);
  console.log('Body:', req.body);
  
  try {
    const connection = await odbc.connect(connectionString);
    
    // Получаем схему таблицы для проверки
    const schema = await connection.columns(null, null, req.params.name, null);
    console.log('Table schema:', schema);

    const columns = Object.keys(req.body);
    const values = Object.values(req.body).map(value => formatSqlValue(value));
    
    // Форматируем имена столбцов, оборачивая их в квадратные скобки
    const formattedColumns = columns.map(formatColumnName);
    
    const query = `INSERT INTO [${req.params.name}] (${formattedColumns.join(', ')}) VALUES (${values.join(', ')})`;
    console.log('Executing SQL Query:', query);

    try {
      await connection.query(query);
      console.log('Query executed successfully');
    } catch (queryError) {
      console.error('SQL Error:', queryError);
      throw new Error(`Database error: ${queryError.message}`);
    }

    await connection.close();
    res.json({ message: 'Record added successfully' });
  } catch (error) {
    console.error('=== Error Details ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({ 
      error: error.message,
      details: error.stack,
      query: query // добавляем SQL запрос в ответ для отладки
    });
  }
});


// В server.js изменяем PUT route
app.put('/table/:name/:idField/:idValue', async (req, res) => {
  console.log('=== PUT Request Details ===');
  console.log('Table:', req.params.name);
  console.log('ID Field:', req.params.idField);
  console.log('ID Value:', req.params.idValue);
  console.log('Body:', req.body);
  
  try {
    const connection = await odbc.connect(connectionString);
    
    // Получаем информацию о столбцах
    const columns = await connection.columns(null, null, req.params.name, null);
    const columnTypes = {};
    columns.forEach(col => {
      columnTypes[col.COLUMN_NAME] = col.TYPE_NAME;
    });
    
    // Формируем SET часть запроса с учетом типов данных
    const updates = Object.entries(req.body)
      .map(([key, value]) => `${formatColumnName(key)}=${formatSqlValue(value, columnTypes[key])}`)
      .join(', ');
    
    // ID всегда должен быть числом
    const idValue = isNaN(req.params.idValue) ? req.params.idValue : Number(req.params.idValue);
    
    const query = `UPDATE [${req.params.name}] SET ${updates} WHERE ${formatColumnName(req.params.idField)}=${formatSqlValue(idValue, 'NUMBER')}`;
    console.log('Executing SQL Query:', query);

    await connection.query(query);
    await connection.close();
    
    res.json({ message: 'Record updated successfully' });
  } catch (error) {
    console.error('=== Error Details ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({ 
      error: error.message,
      details: error.stack
    });
  }
});

// В server.js изменяем DELETE route
app.delete('/table/:name/:idField/:idValue', async (req, res) => {
  console.log('=== DELETE Request Details ===');
  console.log('Table:', req.params.name);
  console.log('ID Field:', req.params.idField);
  console.log('ID Value:', req.params.idValue);
  
  try {
    const connection = await odbc.connect(connectionString);
    
    const query = `DELETE FROM [${req.params.name}] WHERE ${formatColumnName(req.params.idField)}=${formatSqlValue(req.params.idValue, 'NUMBER')}`;
    console.log('Executing SQL Query:', query);

    await connection.query(query);
    await connection.close();
    
    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    console.error('=== Error Details ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({ 
      error: error.message,
      details: error.stack
    });
  }
});




app.get('/queries', async (req, res) => {
  try {
    const connection = await odbc.connect(connectionString);
    const queries = await connection.query(
      "SELECT Name, Attribute FROM [Копия MSysObjects] WHERE Type=5"
    );
    await connection.close();

    console.log(queries)
    
    // Разделяем запросы по типам на основе атрибута
    const categorizedQueries = {
      select: queries.filter(q => !q.Attribute || q.Attribute === 0).map(q => q.Name),
      parameterized: queries.filter(q => q.Attribute === 1).map(q => q.Name),
      action: queries.filter(q => q.Attribute === 2).map(q => q.Name)
    };
    
    res.json(categorizedQueries);
  } catch (error) {
    console.error('Error fetching queries:', error);
    res.status(500).json({ error: error.message });
  }
});

// Выполнение запроса без параметров
app.get('/query/:name', async (req, res) => {
  console.log('=== SELECT Query Execution ===');
  console.log('Query name:', req.params.name);
  
  try {
    const connection = await odbc.connect(connectionString);
    const result = await connection.query(`EXEC [${req.params.name}]`);
    await connection.close();
    console.log('Query executed successfully');
    res.json(result);
  } catch (error) {
    console.error('Query execution error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Выполнение запроса с параметрами
app.post('/query/:name', async (req, res) => {
  console.log('=== Parameterized Query Execution ===');
  console.log('Query name:', req.params.name);
  console.log('Parameters:', req.body.parameters);
  
  try {
    const connection = await odbc.connect(connectionString);
    const { parameters } = req.body;
    
    // Форматируем параметры
    const formattedParams = parameters.map(param => formatSqlValue(param));
    const query = `EXEC [${req.params.name}] ${formattedParams.join(', ')}`;
    
    console.log('Executing query:', query);
    const result = await connection.query(query);
    await connection.close();
    
    console.log('Query executed successfully');
    res.json(result);
  } catch (error) {
    console.error('Query execution error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Выполнение запроса на добавление
// Выполнение запроса на добавление
app.post('/query/action/:name', async (req, res) => {
  console.log('=== Action Query Execution ===');
  console.log('Query name:', req.params.name);
  
  try {
    const connection = await odbc.connect(connectionString);
    const query = `EXEC [${req.params.name}]`;
    
    console.log('Executing query:', query);
    await connection.query(query);
    await connection.close();
    
    console.log('Action query executed successfully');
    res.json({ message: 'Action query executed successfully' });
  } catch (error) {
    console.error('Action query execution error:', error);
    res.status(500).json({ error: error.message });
  }
});



const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));