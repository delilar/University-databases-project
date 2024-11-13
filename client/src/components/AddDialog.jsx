import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem } from '@mui/material';

export default function AddDialog({ open, onClose, onAdd, columns, columnTypes }) {
  const [newRecord, setNewRecord] = useState({});

  const handleChange = (field, value) => {
    // Получаем тип поля из columnTypes
    const fieldType = columnTypes[field]?.type;
    
    // Преобразуем значение в зависимости от типа поля
    let convertedValue = value;
    switch (fieldType) {
      case 'NUMBER':
      case 'INTEGER':
        // Проверяем, что значение не пустое
        convertedValue = value === '' ? null : Number(value);
        break;
      case 'BOOLEAN':
        convertedValue = value === 'true';
        break;

      case 'DATE':
      case 'TIME':
      case 'DATETIME':
        convertedValue = value ? value.split('T')[0] : null;
        break;
      // Для остальных типов оставляем значение как есть
      default:
        break;
    }
    
    setNewRecord({ ...newRecord, [field]: convertedValue });
  };

  const renderField = (column) => {
    const type = columnTypes[column]?.type;

    switch (type) {
      case 'DATE':
      case 'DATETIME':
        return (
          <TextField
            key={column}
            name={column}
            label={column}
            type="date"
            value={newRecord[column] || ''}
            onChange={(e) => handleChange(column, e.target.value)}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
        );

      case 'TIME':
        return (
          <TextField
            key={column}
            name={column}
            label={column}
            type="time"
            value={newRecord[column] || ''}
            onChange={(e) => handleChange(column, e.target.value)}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
        );

      case 'NUMBER':
      case 'INTEGER':
        return (
          <TextField
            key={column}
            name={column}
            label={column}
            type="number"
            value={newRecord[column] || ''}
            onChange={(e) => handleChange(column, e.target.value)}
            fullWidth
            margin="normal"
          />
        );

      case 'BOOLEAN':
        return (
          <TextField
            select
            key={column}
            name={column}
            label={column}
            value={newRecord[column] || ''}
            onChange={(e) => handleChange(column, e.target.value === 'true')}
            fullWidth
            margin="normal"
          >
            <MenuItem value="true">Да</MenuItem>
            <MenuItem value="false">Нет</MenuItem>
          </TextField>
        );

      case 'COUNTER':
        return;

      default:
        return (
          <TextField
            key={column}
            name={column}
            label={column}
            value={newRecord[column] || ''}
            onChange={(e) => handleChange(column, e.target.value)}
            fullWidth
            margin="normal"
          />
        );
    }
  };

  const handleSubmit = () => {
    onAdd(newRecord);
    setNewRecord({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Добавление записи</DialogTitle>
      <DialogContent>
        {columns.map((column) => renderField(column))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button onClick={handleSubmit}>Добавить</Button>
      </DialogActions>
    </Dialog>
  );
}