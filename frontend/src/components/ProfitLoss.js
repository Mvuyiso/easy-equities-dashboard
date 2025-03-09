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
  Card,
  CardContent,
  Grid,
  Divider
} from '@mui/material';
import { 
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

function ProfitLoss({ selectedAccount }) {
  const [profitLossData, setProfitLossData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderBy, setOrderBy] = useState('profit_loss_percentage');
  const [order, setOrder] = useState('desc');

  useEffect(() => {
    const fetchProfitLossData = async () => {
      if (!selectedAccount) return;
      
      setLoading(true);
      try {
        const response = await axios.get(`/api/profit-loss/${selectedAccount.id}/`);
        setProfitLossData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching profit/loss data:', err);
        setError('Failed to load profit/loss data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfitLossData();
  }, [selectedAccount]);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  if (!selectedAccount) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5">
          Please select an account to view profit/loss information
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

  // Sort holdings by profit/loss
  const sortedHoldings = [...profitLossData.holdings].sort((a, b) => {
    let aValue, bValue;
    
    if (orderBy === 'name') {
      aValue = a.name;
      bValue = b.name;
    } else if (orderBy === 'purchase_value') {
      aValue = a.purchase_value;
      bValue = b.purchase_value;
    } else if (orderBy === 'current_value') {
      aValue = a.current_value;
      bValue = b.current_value;
    } else if (orderBy === 'profit_loss') {
      aValue = a.profit_loss;
      bValue = b.profit_loss;
    } else if (orderBy === 'profit_loss_percentage') {
      aValue = a.profit_loss_percentage;
      bValue = b.profit_loss_percentage;
    }
    
    return order === 'asc' ? (aValue < bValue ? -1 : 1) : (aValue > bValue ? -1 : 1);
  });

  // Prepare data for bar chart
  const chartData = {
    labels: sortedHoldings.map(h => h.name),
    datasets: [
      {
        label: 'Profit/Loss %',
        data: sortedHoldings.map(h => h.profit_loss_percentage),
        backgroundColor: sortedHoldings.map(h => 
          h.profit_loss_percentage >= 0 ? 'rgba(75, 192, 192, 0.6)' : 'rgba(255, 99, 132, 0.6)'
        ),
        borderColor: sortedHoldings.map(h => 
          h.profit_loss_percentage >= 0 ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)'
        ),
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Profit/Loss %'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Holdings'
        }
      }
    }
  };

  return (
    <div className="profit-loss-container">
      <Typography variant="h4" gutterBottom>
        Profit/Loss Analysis: {selectedAccount.name}
      </Typography>
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card className="card">
            <CardContent>
              <Typography variant="h6" component="div" sx={{ mb: 1 }}>
                Total Investment
              </Typography>
              <Typography variant="h4" component="div">
                {profitLossData.currency}{profitLossData.total_investment.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card className="card">
            <CardContent>
              <Typography variant="h6" component="div" sx={{ mb: 1 }}>
                Total Current Value
              </Typography>
              <Typography variant="h4" component="div">
                {profitLossData.currency}{profitLossData.total_current_value.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card className="card">
            <CardContent>
              <Typography variant="h6" component="div" sx={{ mb: 1 }}>
                {profitLossData.total_profit_loss >= 0 ? (
                  <TrendingUpIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'success.main' }} />
                ) : (
                  <TrendingDownIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'error.main' }} />
                )}
                Total Profit/Loss
              </Typography>
              <Typography 
                variant="h4" 
                component="div"
                color={profitLossData.total_profit_loss >= 0 ? 'success.main' : 'error.main'}
              >
                {profitLossData.total_profit_loss >= 0 ? '+' : ''}{profitLossData.currency}{profitLossData.total_profit_loss.toFixed(2)}
              </Typography>
              <Typography 
                variant="body1"
                color={profitLossData.total_profit_loss_percentage < 0 ? 'error.main' : 'success.main'}
              >
                {profitLossData.total_profit_loss_percentage >= 0 ? '+' : ''}{profitLossData.total_profit_loss_percentage.toFixed(2)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Chart */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Profit/Loss by Holding
          </Typography>
          <Box sx={{ height: 400 }}>
            <Bar data={chartData} options={chartOptions} />
          </Box>
        </CardContent>
      </Card>
      
      {/* Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Detailed Profit/Loss
          </Typography>
          <TableContainer component={Paper}>
            <Table>
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
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'purchase_value'}
                      direction={orderBy === 'purchase_value' ? order : 'asc'}
                      onClick={() => handleRequestSort('purchase_value')}
                    >
                      Purchase Value
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'current_value'}
                      direction={orderBy === 'current_value' ? order : 'asc'}
                      onClick={() => handleRequestSort('current_value')}
                    >
                      Current Value
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'profit_loss'}
                      direction={orderBy === 'profit_loss' ? order : 'asc'}
                      onClick={() => handleRequestSort('profit_loss')}
                    >
                      Profit/Loss
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'profit_loss_percentage'}
                      direction={orderBy === 'profit_loss_percentage' ? order : 'asc'}
                      onClick={() => handleRequestSort('profit_loss_percentage')}
                    >
                      Profit/Loss %
                    </TableSortLabel>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedHoldings.map((holding, index) => (
                  <TableRow key={index}>
                    <TableCell>{holding.name}</TableCell>
                    <TableCell>{profitLossData.currency}{holding.purchase_value.toFixed(2)}</TableCell>
                    <TableCell>{profitLossData.currency}{holding.current_value.toFixed(2)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {holding.profit_loss >= 0 ? (
                          <TrendingUpIcon sx={{ color: 'success.main', mr: 1 }} />
                        ) : (
                          <TrendingDownIcon sx={{ color: 'error.main', mr: 1 }} />
                        )}
                        <Typography
                          color={holding.profit_loss >= 0 ? 'success.main' : 'error.main'}
                        >
                          {holding.profit_loss >= 0 ? '+' : ''}{profitLossData.currency}{holding.profit_loss.toFixed(2)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography
                        color={holding.profit_loss_percentage >= 0 ? 'success.main' : 'error.main'}
                      >
                        {holding.profit_loss_percentage >= 0 ? '+' : ''}{holding.profit_loss_percentage.toFixed(2)}%
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProfitLoss;