import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';


export default function DataTable({data, onDelete, onEdit, onAdd}) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {data[0] && Object.keys(data[0]).map((key) => (
              <TableCell key={key}>{key}</TableCell>
            ))}
            {data[0] && <TableCell>Действия</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {Object.values(row).map((value, valueIndex) => (
                <TableCell key={valueIndex}>{value}</TableCell>
              ))}
              <TableCell sx={{display: 'flex', flexDirection: 'column'}}>
                <Button onClick={() => onEdit(row)}>Изменить</Button>
                <Button onClick={() => onDelete(rowIndex)}>Удалить</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button onClick={onAdd}>Добавить запись</Button>
    </TableContainer>
  )
}
