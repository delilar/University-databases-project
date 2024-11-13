import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem } from '@mui/material';

const EditDialog = ({ open, onClose, onEdit, record, columnTypes }) => {
  const [editedRecord, setEditedRecord] = useState({});

  useEffect(() => {
    if (record) {
      setEditedRecord(record);
    }
  }, [record]);

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
    
    setEditedRecord({ ...editedRecord, [field]: convertedValue });
  };

  const renderField = (key) => {
    if (key === 'uuid') return null;
    
    const type = columnTypes[key]?.type;

    switch (type) {
      case 'DATE':
      case 'DATETIME':
        return (
          <TextField
            key={key}
            name={key}
            label={key}
            type="date"
            value={editedRecord[key] || ''}
            onChange={(e) => handleChange(key, e.target.value)}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
        );

      case 'TIME':
        return (
          <TextField
            key={key}
            name={key}
            label={key}
            type="time"
            value={editedRecord[key] || ''}
            onChange={(e) => handleChange(key, e.target.value)}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
        );

      case 'NUMBER':
      case 'INTEGER':
        return (
          <TextField
            key={key}
            name={key}
            label={key}
            type="number"
            value={editedRecord[key] || ''}
            onChange={(e) => handleChange(key, e.target.value)}
            fullWidth
            margin="normal"
          />
        );

      case 'BOOLEAN':
        return (
          <TextField
            select
            key={key}
            name={key}
            label={key}
            value={editedRecord[key] || ''}
            onChange={(e) => handleChange(key, e.target.value === 'true')}
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
            key={key}
            name={key}
            label={key}
            value={editedRecord[key] || ''}
            onChange={(e) => handleChange(key, e.target.value)}
            fullWidth
            margin="normal"
          />
        );
    }
  };

  const handleSubmit = () => {
    onEdit(editedRecord);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Изменение записи</DialogTitle>
      <DialogContent>
        {record && Object.keys(record).map((key) => renderField(key))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button onClick={handleSubmit}>Сохранить</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditDialog;