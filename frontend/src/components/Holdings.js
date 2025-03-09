import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Chip,
  Avatar,
  Grid,
  Divider,
  Tooltip,
  TableSortLabel,
  TablePagination,
  useTheme,
  alpha
} from '@mui/material';
import {
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Refresh as RefreshIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon,
  OpenInNew as OpenInNewIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

function Holdings({ selectedAccount }) {
  const theme = useTheme();
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderBy, setOrderBy] = useState('name');
  const [order, setOrder] = useState('asc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [refreshing, setRefreshing] = useState(false);
  const [totalValue, setTotalValue] = useState(0);
  const [totalProfitLoss, setTotalProfitLoss] = useState(0);
  const [totalProfitLossPercentage, setTotalProfitLossPercentage] = useState(0);
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    setMounted(true);
    
    const fetchHoldings = async () => {
      if (!selectedAccount) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const response = await axios.get(`/api/holdings/${selectedAccount.id}/`);
        
        if (mounted) {
          const holdingsData = response.data;
          
          let totalCurrentValue = 0;
          let totalPurchaseValue = 0;
          
          const processedHoldings = holdingsData.map(holding => {
            const currentValue = parseFloat(holding.current_value.replace(/[^\d.-]/g, ''));
            const purchaseValue = parseFloat(holding.purchase_value.replace(/[^\d.-]/g, ''));
            const profitLoss = currentValue - purchaseValue;
            const profitLossPercentage = purchaseValue !== 0 ? (profitLoss / purchaseValue) * 100 : 0;
            
            totalCurrentValue += currentValue;
            totalPurchaseValue += purchaseValue;
            
            return {
              ...holding,
              currentValueNumber: currentValue,
              purchaseValueNumber: purchaseValue,
              profitLoss,
              profitLossPercentage
            };
          });
          
          setTotalValue(totalCurrentValue);
          setTotalProfitLoss(totalCurrentValue - totalPurchaseValue);
          setTotalProfitLossPercentage(totalPurchaseValue !== 0 ? ((totalCurrentValue - totalPurchaseValue) / totalPurchaseValue) * 100 : 0);
          
          setHoldings(processedHoldings);
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching holdings:', err);
        if (mounted) {
          setError('Failed to load holdings data. Please try again later.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchHoldings();
    
    return () => {
      setMounted(false);
    };
  }, [selectedAccount, mounted]);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRefresh = async () => {
    if (!selectedAccount || !mounted) return;
    
    setRefreshing(true);
    try {
      const response = await axios.get(`/api/holdings/${selectedAccount.id}/`);
      
      if (mounted) {
        const holdingsData = response.data;
        
        let totalCurrentValue = 0;
        let totalPurchaseValue = 0;
        
        const processedHoldings = holdingsData.map(holding => {
          const currentValue = parseFloat(holding.current_value.replace(/[^\d.-]/g, ''));
          const purchaseValue = parseFloat(holding.purchase_value.replace(/[^\d.-]/g, ''));
          const profitLoss = currentValue - purchaseValue;
          const profitLossPercentage = purchaseValue !== 0 ? (profitLoss / purchaseValue) * 100 : 0;
          
          totalCurrentValue += currentValue;
          totalPurchaseValue += purchaseValue;
          
          return {
            ...holding,
            currentValueNumber: currentValue,
            purchaseValueNumber: purchaseValue,
            profitLoss,
            profitLossPercentage
          };
        });
        
        setTotalValue(totalCurrentValue);
        setTotalProfitLoss(totalCurrentValue - totalPurchaseValue);
        setTotalProfitLossPercentage(totalPurchaseValue !== 0 ? ((totalCurrentValue - totalPurchaseValue) / totalPurchaseValue) * 100 : 0);
        
        setHoldings(processedHoldings);
        setError(null);
      }
    } catch (err) {
      console.error('Error refreshing holdings:', err);
      if (mounted) {
        setError('Failed to refresh holdings data. Please try again later.');
      }
    } finally {
      if (mounted) {
        setRefreshing(false);
      }
    }
  };

  const filteredHoldings = holdings.filter(holding => 
    holding.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (holding.contract_code && holding.contract_code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sortedHoldings = filteredHoldings.sort((a, b) => {
    let aValue, bValue;
    
    switch (orderBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'currentValue':
        aValue = a.currentValueNumber;
        bValue = b.currentValueNumber;
        break;
      case 'purchaseValue':
        aValue = a.purchaseValueNumber;
        bValue = b.purchaseValueNumber;
        break;
      case 'profitLoss':
        aValue = a.profitLoss;
        bValue = b.profitLoss;
        break;
      case 'profitLossPercentage':
        aValue = a.profitLossPercentage;
        bValue = b.profitLossPercentage;
        break;
      default:
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
    }
    
    if (order === 'asc') {
      return aValue < bValue ? -1 : 1;
    } else {
      return aValue > bValue ? -1 : 1;
    }
  });

  const paginatedHoldings = sortedHoldings.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (!selectedAccount) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Please select an account to view holdings
        </Typography>
        <Button 
          component={Link} 
          to="/accounts" 
          variant="contained" 
          color="primary"
        >
          Go to Accounts
        </Button>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleRefresh}
          startIcon={<RefreshIcon />}
        >
          Try Again
        </Button>
      </Box>
    );
  }

  const currency = holdings.length > 0 ? holdings[0].purchase_value[0] : 'R';

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Holdings
        </Typography>
        <Button 
          variant="outlined" 
          color="primary" 
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Total Holdings Value
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                    {currency}{totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: theme.palette.primary.light, width: 40, height: 40 }}>
                  <TrendingUpIcon />
                </Avatar>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {holdings.length} different holdings
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Total Profit/Loss
                  </Typography>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 600, 
                      mb: 1,
                      color: totalProfitLoss >= 0 ? theme.palette.success.main : theme.palette.error.main 
                    }}
                  >
                    {totalProfitLoss >= 0 ? '+' : ''}{currency}{totalProfitLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                </Box>
                <Avatar 
                  sx={{ 
                    bgcolor: totalProfitLoss >= 0 ? theme.palette.success.light : theme.palette.error.light, 
                    width: 40, 
                    height: 40 
                  }}
                >
                  {totalProfitLoss >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                </Avatar>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {totalProfitLoss >= 0 ? (
                  <ArrowUpwardIcon fontSize="small" sx={{ color: theme.palette.success.main, mr: 0.5 }} />
                ) : (
                  <ArrowDownwardIcon fontSize="small" sx={{ color: theme.palette.error.main, mr: 0.5 }} />
                )}
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: totalProfitLoss >= 0 ? theme.palette.success.main : theme.palette.error.main,
                    fontWeight: 500
                  }}
                >
                  {totalProfitLossPercentage.toFixed(2)}%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Best Performing
                  </Typography>
                  {holdings.length > 0 ? (
                    <>
                      <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                        {holdings.sort((a, b) => b.profitLossPercentage - a.profitLossPercentage)[0].name}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: theme.palette.success.main,
                          fontWeight: 500,
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <ArrowUpwardIcon fontSize="small" sx={{ mr: 0.5 }} />
                        {holdings.sort((a, b) => b.profitLossPercentage - a.profitLossPercentage)[0].profitLossPercentage.toFixed(2)}%
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="body1">No holdings data</Typography>
                  )}
                </Box>
                <Avatar sx={{ bgcolor: theme.palette.success.light, width: 40, height: 40 }}>
                  <TrendingUpIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search holdings..."
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
              <Chip 
                label={`${filteredHoldings.length} holdings`} 
                color="primary" 
                variant="outlined" 
                sx={{ mr: 1 }}
              />
              <Tooltip title="Filter">
                <IconButton>
                  <FilterListIcon />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
          <Table sx={{ minWidth: 650 }} aria-label="holdings table">
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'name'}
                    direction={orderBy === 'name' ? order : 'asc'}
                    onClick={() => handleRequestSort('name')}
                  >
                    Name
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={orderBy === 'currentValue'}
                    direction={orderBy === 'currentValue' ? order : 'asc'}
                    onClick={() => handleRequestSort('currentValue')}
                  >
                    Current Value
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={orderBy === 'purchaseValue'}
                    direction={orderBy === 'purchaseValue' ? order : 'asc'}
                    onClick={() => handleRequestSort('purchaseValue')}
                  >
                    Purchase Value
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={orderBy === 'profitLoss'}
                    direction={orderBy === 'profitLoss' ? order : 'asc'}
                    onClick={() => handleRequestSort('profitLoss')}
                  >
                    Profit/Loss
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={orderBy === 'profitLossPercentage'}
                    direction={orderBy === 'profitLossPercentage' ? order : 'asc'}
                    onClick={() => handleRequestSort('profitLossPercentage')}
                  >
                    %
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedHoldings.length > 0 ? (
                paginatedHoldings.map((holding, index) => (
                  <TableRow
                    key={holding.contract_code || index}
                    sx={{ 
                      '&:last-child td, &:last-child th': { border: 0 },
                      '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.05) }
                    }}
                  >
                    <TableCell component="th" scope="row">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          src={holding.img} 
                          alt={holding.name}
                          variant="rounded"
                          sx={{ width: 32, height: 32, mr: 2 }}
                        >
                          {holding.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {holding.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {holding.contract_code}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      {currency}{holding.currentValueNumber.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell align="right">
                      {currency}{holding.purchaseValueNumber.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell align="right">
                      <Typography 
                        sx={{ 
                          color: holding.profitLoss >= 0 ? theme.palette.success.main : theme.palette.error.main,
                          fontWeight: 500
                        }}
                      >
                        {holding.profitLoss >= 0 ? '+' : ''}{currency}{holding.profitLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        {holding.profitLoss >= 0 ? (
                          <ArrowUpwardIcon fontSize="small" sx={{ color: theme.palette.success.main, mr: 0.5 }} />
                        ) : (
                          <ArrowDownwardIcon fontSize="small" sx={{ color: theme.palette.error.main, mr: 0.5 }} />
                        )}
                        <Typography 
                          sx={{ 
                            color: holding.profitLoss >= 0 ? theme.palette.success.main : theme.palette.error.main,
                            fontWeight: 500
                          }}
                        >
                          {holding.profitLossPercentage.toFixed(2)}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Details">
                        <IconButton 
                          size="small" 
                          component={Link} 
                          to={`/stock-charts?code=${holding.contract_code}`}
                        >
                          <OpenInNewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body1" sx={{ py: 3 }}>
                      {searchTerm ? 'No holdings match your search' : 'No holdings data available'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredHoldings.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>
    </Box>
  );
}

export default Holdings;