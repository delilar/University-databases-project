import { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, Box, Divider } from '@mui/material';
import TableSelector from './components/TableSelector';
import DataTable from './components/DataTable';
import AddDialog from './components/AddDialog';
import EditDialog from './components/EditDialog';
import QuerySelector from './components/QuerySelector';
import QueryParamsDialog from './components/QueryParamsDialog';

const App = () => {
  // Существующее состояние
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [data, setData] = useState([]);
  const [columnTypes, setColumnTypes] = useState({});
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  // Новое состояние для запросов
  const [queries, setQueries] = useState({ select: [], parameterized: [], action: [] });
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [isQueryParamsDialogOpen, setIsQueryParamsDialogOpen] = useState(false);

  useEffect(() => {
    fetchTables();
    fetchQueries();
  }, []);

  useEffect(() => {
    if (selectedTable) {
      fetchTableData(selectedTable);
      fetchColumnTypes(selectedTable);
    }
  }, [selectedTable]);

  // Существующие функции для работы с таблицами...
  const fetchTables = async () => {
    try {
      const response = await axios.get('http://localhost:3001/tables');
      setTables(response.data);
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  };

  const fetchColumnTypes = async (tableName) => {
    try {
      const response = await axios.get(`http://localhost:3001/table/${tableName}/schema`);
      setColumnTypes(response.data);
    } catch (error) {
      console.error('Error fetching column types:', error);
    }
  };

  const fetchTableData = async (tableName) => {
    try {
      const response = await axios.get(`http://localhost:3001/table/${tableName}`);
      const formattedData = response.data.map(row => {
        const newRow = { ...row };
        Object.keys(newRow).forEach(key => {
          if (columnTypes[key]?.type === 'DATETIME' && newRow[key]) {
            newRow[key] = newRow[key].split(' ')[0];
          }
        });
        return newRow;
      });
      setData(formattedData);
    } catch (error) {
      console.error('Error fetching table data:', error);
    }
  };

  // Существующие обработчики CRUD операций...
  const handleAddRecord = async (newRecord) => {
    try {
      const primaryKeyField = data[0] ? Object.keys(data[0])[0] : null;
      const recordWithoutPrimaryKey = { ...newRecord };
      if (primaryKeyField) {
        delete recordWithoutPrimaryKey[primaryKeyField];
      }
      
      const response = await axios.post(
        `http://localhost:3001/table/${selectedTable}`,
        recordWithoutPrimaryKey,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(response)
      
      fetchTableData(selectedTable);
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error adding record:', error);
      alert(`Error adding record: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleEditRecord = async (updatedRecord) => {
    try {
      const primaryKeyField = data[0] ? Object.keys(data[0])[0] : null;
      
      if (!primaryKeyField) {
        throw new Error('Unable to determine primary key field');
      }
      
      const recordWithoutPrimaryKey = { ...updatedRecord };
      const primaryKeyValue = recordWithoutPrimaryKey[primaryKeyField];
      delete recordWithoutPrimaryKey[primaryKeyField];
      
      await axios.put(
        `http://localhost:3001/table/${selectedTable}/${primaryKeyField}/${primaryKeyValue}`, 
        recordWithoutPrimaryKey
      );
      
      fetchTableData(selectedTable);
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating record:', error);
      alert(`Error updating record: ${error.message}`);
    }
  };

  const handleDeleteRecord = async (rowIndex) => {
    try {
      const primaryKeyField = data[0] ? Object.keys(data[0])[0] : null;
      
      if (!primaryKeyField) {
        throw new Error('Unable to determine primary key field');
      }
      
      const primaryKeyValue = data[rowIndex][primaryKeyField];
      
      await axios.delete(
        `http://localhost:3001/table/${selectedTable}/${primaryKeyField}/${primaryKeyValue}`
      );
      
      fetchTableData(selectedTable);
    } catch (error) {
      console.error('Error deleting record:', error);
      alert(`Error deleting record: ${error.message}`);
    }
  };

  // Новые функции для работы с запросами
  const fetchQueries = async () => {
    try {
      const response = await axios.get('http://localhost:3001/queries');
      setQueries(response.data);
    } catch (error) {
      console.error('Error fetching queries:', error);
    }
  };

  const handleQuerySelect = (query) => {
    setSelectedQuery(query);
    if (query.type === 'select') {
      executeQuery(query.name);
    } else if (query.type === 'parameterized') {
      setIsQueryParamsDialogOpen(true);
    } else if (query.type === 'action') {
      executeActionQuery(query.name);
    }
  };

  const executeQuery = async (queryName, parameters = null) => {
    try {
      let response;
      if (parameters) {
        response = await axios.post(`http://localhost:3001/query/${queryName}`, { parameters });
      } else {
        response = await axios.get(`http://localhost:3001/query/${queryName}`);
      }
      setData(response.data);
      setIsQueryParamsDialogOpen(false);
    } catch (error) {
      console.error('Error executing query:', error);
      alert(`Error executing query: ${error.message}`);
    }
  };

  const executeActionQuery = async (queryName) => {
    try {
      await axios.post(`http://localhost:3001/query/action/${queryName}`);
      alert('Action query executed successfully');
      // Обновляем данные таблицы, если она выбрана
      if (selectedTable) {
        fetchTableData(selectedTable);
      }
    } catch (error) {
      console.error('Error executing action query:', error);
      alert(`Error executing action query: ${error.message}`);
    }
  };

  const handleQueryExecute = (parameters) => {
    if (!selectedQuery) return;

    if (selectedQuery.type === 'parameterized') {
      executeQuery(selectedQuery.name, parameters);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Access Database Manager
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>Table Operations</Typography>
        <TableSelector
          tables={tables}
          selectedTable={selectedTable}
          onSelectTable={setSelectedTable}
        />
        {selectedTable && (
          <DataTable
            data={data}
            columnTypes={columnTypes}
            onDelete={handleDeleteRecord}
            onEdit={(record) => {
              setEditingRecord(record);
              setIsEditDialogOpen(true);
            }}
            onAdd={() => setIsAddDialogOpen(true)}
          />
        )}
      </Box>

      <Divider sx={{ my: 4 }} />

      <Box>
        <QuerySelector
          queries={queries}
          selectedQuery={selectedQuery}
          onSelectQuery={handleQuerySelect}
        />
        {data.length > 0 && (
          <DataTable
            data={data}
            columnTypes={columnTypes}
            readOnly
          />
        )}
      </Box>

      <AddDialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAdd={handleAddRecord}
        columns={data[0] ? Object.keys(data[0]).filter(key => key !== 'uuid') : []}
        columnTypes={columnTypes}
      />
      <EditDialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onEdit={handleEditRecord}
        record={editingRecord}
        columnTypes={columnTypes}
      />
      <QueryParamsDialog
        open={isQueryParamsDialogOpen}
        onClose={() => setIsQueryParamsDialogOpen(false)}
        onExecute={handleQueryExecute}
        queryName={selectedQuery?.name}
      />
    </Container>
  );
};

export default App;