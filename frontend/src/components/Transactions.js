import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  CircularProgress, 
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { 
  Search as SearchIcon,
  CallMade as OutgoingIcon,
  CallReceived as IncomingIcon
} from '@mui/icons-material';
import axios from 'axios';

function Transactions({ selectedAccount }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderBy, setOrderBy] = useState('TransactionDate');
  const [order, setOrder] = useState('desc');
  const [filterAction, setFilterAction] = useState('');

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!selectedAccount) return;
      
      setLoading(true);
      try {
        const response = await axios.get(`/api/transactions/${selectedAccount.id}/`);
        setTransactions(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('Failed to load transactions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [selectedAccount]);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (event) => {
    setFilterAction(event.target.value);
  };

  if (!selectedAccount) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5">
          Please select an account to view transactions
        </Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  // Get unique action types for filter
  const actionTypes = [...new Set(transactions.map(t => t.Action))];

  // Filter transactions based on search term and action filter
  const filteredTransactions = transactions.filter(transaction => 
    (transaction.Comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
     transaction.Action.toLowerCase().includes(searchTerm.toLowerCase()) ||
     (transaction.ContractCode && transaction.ContractCode.toLowerCase().includes(searchTerm.toLowerCase()))) &&
    (filterAction === '' || transaction.Action === filterAction)
  );

  // Sort transactions
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    let aValue, bValue;
    
    if (orderBy === 'TransactionDate') {
      aValue = new Date(a.TransactionDate);
      bValue = new Date(b.TransactionDate);
    } else if (orderBy === 'DebitCredit') {
      aValue = a.DebitCredit;
      bValue = b.DebitCredit;
    } else if (orderBy === 'Action') {
      aValue = a.Action;
      bValue = b.Action;
    } else if (orderBy === 'Comment') {
      aValue = a.Comment;
      bValue = b.Comment;
    }
    
    return order === 'asc' ? (aValue < bValue ? -1 : 1) : (aValue > bValue ? -1 : 1);
  });

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="transactions-container">
      <Typography variant="h4" gutterBottom>
        Transactions: {selectedAccount.name}
      </Typography>
      
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="action-filter-label">Filter by Action</InputLabel>
            <Select
              labelId="action-filter-label"
              id="action-filter"
              value={filterAction}
              label="Filter by Action"
              onChange={handleFilterChange}
            >
              <MenuItem value="">
                <em>All Actions</em>
              </MenuItem>
              {actionTypes.map((action) => (
                <MenuItem key={action} value={action}>
                  {action}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
      </Card>
      
      {sortedTransactions.length === 0 ? (
        <Typography variant="body1">
          No transactions found for this account.
        </Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'TransactionDate'}
                    direction={orderBy === 'TransactionDate' ? order : 'asc'}
                    onClick={() => handleRequestSort('TransactionDate')}
                  >
                    Date
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'Action'}
                    direction={orderBy === 'Action' ? order : 'asc'}
                    onClick={() => handleRequestSort('Action')}
                  >
                    Action
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'Comment'}
                    direction={orderBy === 'Comment' ? order : 'asc'}
                    onClick={() => handleRequestSort('Comment')}
                  >
                    Description
                  </TableSortLabel>
                </TableCell>
                <TableCell>Contract Code</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'DebitCredit'}
                    direction={orderBy === 'DebitCredit' ? order : 'asc'}
                    onClick={() => handleRequestSort('DebitCredit')}
                  >
                    Amount
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedTransactions.map((transaction) => (
                <TableRow key={transaction.TransactionId}>
                  <TableCell>{formatDate(transaction.TransactionDate)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={transaction.Action}
                      color="primary"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{transaction.Comment}</TableCell>
                  <TableCell>{transaction.ContractCode || '-'}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {transaction.DebitCredit > 0 ? (
                        <IncomingIcon sx={{ color: 'success.main', mr: 1 }} />
                      ) : (
                        <OutgoingIcon sx={{ color: 'error.main', mr: 1 }} />
                      )}
                      <Typography
                        color={transaction.DebitCredit > 0 ? 'success.main' : 'error.main'}
                      >
                        {selectedAccount.trading_currency_id} {Math.abs(transaction.DebitCredit).toFixed(2)}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
}

export default Transactions;