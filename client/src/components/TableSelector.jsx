import {FormControl, InputLabel, Select, MenuItem} from '@mui/material'

export default function TableSelector({tables, selectedTable, onSelectTable}) {
  return (
    <FormControl fullWidth>
        <InputLabel>Выбор таблицы</InputLabel>
        <Select value={selectedTable} onChange={(event) => onSelectTable(event.target.value)}>
          {tables.map(table => (
            <MenuItem key={table} value={table}>
              {table}
            </MenuItem>
          ))}
        </Select>
    </FormControl>
  )
}
