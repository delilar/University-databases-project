import { FormControl, InputLabel, Select, MenuItem, Box, Typography } from '@mui/material';

const QuerySelector = ({ queries, selectedQuery, onSelectQuery }) => (
  <Box sx={{ mb: 3 }}>
    <Typography variant="h6" gutterBottom>Database Queries</Typography>
    
    {/* Запросы без параметров */}
    <FormControl fullWidth sx={{ mb: 2 }}>
      <InputLabel>Select Query</InputLabel>
      <Select
        value={selectedQuery?.name || ''}
        onChange={(e) => onSelectQuery({ name: e.target.value, type: 'select' })}
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        {queries.select?.map((query) => (
          <MenuItem key={query} value={query}>
            {query}
          </MenuItem>
        ))}
      </Select>
    </FormControl>

    {/* Запросы с параметрами */}
    <FormControl fullWidth sx={{ mb: 2 }}>
      <InputLabel>Parameterized Queries</InputLabel>
      <Select
        value={selectedQuery?.name || ''}
        onChange={(e) => onSelectQuery({ name: e.target.value, type: 'parameterized' })}
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        {queries.parameterized?.map((query) => (
          <MenuItem key={query} value={query}>
            {query}
          </MenuItem>
        ))}
      </Select>
    </FormControl>

    {/* Action-запросы */}
    <FormControl fullWidth>
      <InputLabel>Action Queries</InputLabel>
      <Select
        value={selectedQuery?.name || ''}
        onChange={(e) => onSelectQuery({ name: e.target.value, type: 'action' })}
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        {queries.action?.map((query) => (
          <MenuItem key={query} value={query}>
            {query}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  </Box>
);

export default QuerySelector