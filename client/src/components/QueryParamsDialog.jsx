import { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box
  } from '@mui/material';
  
  const QueryParamsDialog = ({ open, onClose, onExecute, queryName, paramCount = 1 }) => {
    const [params, setParams] = useState(Array(paramCount).fill(''));
  
    const handleChange = (index, value) => {
      const newParams = [...params];
      newParams[index] = value;
      setParams(newParams);
    };
  
    const handleSubmit = () => {
      onExecute(params.filter(p => p !== ''));
      setParams(Array(paramCount).fill(''));
    };
  
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Parameters for Query: {queryName}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {Array(paramCount).fill(0).map((_, index) => (
              <TextField
                key={index}
                label={`Parameter ${index + 1}`}
                value={params[index]}
                onChange={(e) => handleChange(index, e.target.value)}
                fullWidth
                margin="normal"
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Execute Query
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  export default QueryParamsDialog;