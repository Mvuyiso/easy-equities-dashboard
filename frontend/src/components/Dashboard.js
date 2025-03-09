import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent, 
  CardHeader,
  CircularProgress,
  Box,
  Divider,
  Button,
  IconButton,
  Tooltip,
  useTheme,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  LinearProgress
} from '@mui/material';
import { 
  TrendingUp as TrendingUpIcon, 
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon,
  MoreVert as MoreVertIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Refresh as RefreshIcon,
  ShowChart as ShowChartIcon
} from '@mui/icons-material';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement } from 'chart.js';
import { Pie, Doughnut, Line, Bar } from 'react-chartjs-2';
import { Link } from 'react-router-dom';

ChartJS.register(
  ArcElement, 
  ChartTooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title,
  BarElement
);

function Dashboard({ selectedAccount }) {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    setMounted(true);
    
    const fetchDashboardData = async () => {
      if (!selectedAccount) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const response = await axios.get(`/api/dashboard/${selectedAccount.id}/`);
        if (mounted) {
          setDashboardData(response.data);
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        if (mounted) {
          setError('Failed to load dashboard data. Please try again later.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();
    
    return () => {
      setMounted(false);
    };
  }, [selectedAccount, mounted]);

  const handleRefresh = async () => {
    if (!selectedAccount || !mounted) return;
    
    setRefreshing(true);
    try {
      const response = await axios.get(`/api/dashboard/${selectedAccount.id}/`);
      if (mounted) {
        setDashboardData(response.data);
        setError(null);
      }
    } catch (err) {
      console.error('Error refreshing dashboard data:', err);
      if (mounted) {
        setError('Failed to refresh dashboard data. Please try again later.');
      }
    } finally {
      if (mounted) {
        setRefreshing(false);
      }
    }
  };

  if (!selectedAccount) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Please select an account to view the dashboard
        </Typography>
        <Button 
          component={Link} 
          to="/accounts" 
          variant="contained" 
          color="primary"
          startIcon={<AccountBalanceIcon />}
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

  if (!dashboardData) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">
          No data available for this account
        </Typography>
      </Box>
    );
  }

  // Extract data for charts and summaries
  const accountValue = dashboardData.TopSummary?.AccountValue || 0;
  const accountCurrency = dashboardData.TopSummary?.AccountCurrency || 'ZAR';
  const profitLossValue = dashboardData.TopSummary?.PeriodMovements?.[0]?.ValueMove || 'R0.00';
  const profitLossPercentage = dashboardData.TopSummary?.PeriodMovements?.[0]?.PercentageMove || '0.00%';
  
  // Determine if profit or loss
  const isProfitPositive = !profitLossValue.includes('-');
  
  // Extract holdings data for pie chart if available
  let holdingsData = [];
  let holdingsLabels = [];
  let holdingsColors = [];
  
  if (dashboardData.Holdings && dashboardData.Holdings.length > 0) {
    // Sort holdings by current value (descending)
    const sortedHoldings = [...dashboardData.Holdings].sort((a, b) => {
      const aValue = parseFloat(a.current_value.replace(/[^\d.-]/g, ''));
      const bValue = parseFloat(b.current_value.replace(/[^\d.-]/g, ''));
      return bValue - aValue;
    });
    
    // Take top 5 holdings and group the rest as "Others"
    const topHoldings = sortedHoldings.slice(0, 5);
    const otherHoldings = sortedHoldings.slice(5);
    
    // Calculate total value of other holdings
    let otherHoldingsValue = 0;
    if (otherHoldings.length > 0) {
      otherHoldingsValue = otherHoldings.reduce((sum, holding) => {
        return sum + parseFloat(holding.current_value.replace(/[^\d.-]/g, ''));
      }, 0);
    }
    
    // Prepare data for chart
    holdingsLabels = topHoldings.map(holding => holding.name);
    holdingsData = topHoldings.map(holding => parseFloat(holding.current_value.replace(/[^\d.-]/g, '')));
    
    // Add "Others" category if there are more than 5 holdings
    if (otherHoldings.length > 0) {
      holdingsLabels.push('Others');
      holdingsData.push(otherHoldingsValue);
    }
    
    // Generate colors
    holdingsColors = [
      theme.palette.primary.main,
      theme.palette.primary.light,
      theme.palette.secondary.main,
      theme.palette.secondary.light,
      theme.palette.success.main,
      '#9c27b0', // Purple
      '#ff9800', // Orange
      '#795548', // Brown
    ];
  }

  // Prepare data for pie chart
  const holdingsPieData = {
    labels: holdingsLabels,
    datasets: [
      {
        data: holdingsData,
        backgroundColor: holdingsColors,
        borderColor: 'white',
        borderWidth: 2,
      },
    ],
  };

  // Options for pie chart
  const pieOptions = {
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 15,
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${accountCurrency}${value.toLocaleString()} (${percentage}%)`;
          }
        }
      }
    },
    maintainAspectRatio: false,
    cutout: '60%'
  };

  // Mock data for performance chart (replace with actual data when available)
  const performanceData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Account Value',
        data: [
          accountValue * 0.85, 
          accountValue * 0.88, 
          accountValue * 0.92, 
          accountValue * 0.90, 
          accountValue * 0.95, 
          accountValue * 0.97, 
          accountValue * 0.99, 
          accountValue * 0.96, 
          accountValue * 0.98, 
          accountValue * 1.02, 
          accountValue * 0.99, 
          accountValue
        ],
        borderColor: theme.palette.primary.main,
        backgroundColor: 'rgba(46, 125, 50, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${accountCurrency}${context.raw.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: function(value) {
            return `${accountCurrency}${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
          }
        }
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Dashboard
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

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Account Value
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                    {accountCurrency}{accountValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: theme.palette.primary.light, width: 40, height: 40 }}>
                  <AccountBalanceIcon />
                </Avatar>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                {isProfitPositive ? (
                  <ArrowUpwardIcon fontSize="small" sx={{ color: theme.palette.success.main, mr: 0.5 }} />
                ) : (
                  <ArrowDownwardIcon fontSize="small" sx={{ color: theme.palette.error.main, mr: 0.5 }} />
                )}
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: isProfitPositive ? theme.palette.success.main : theme.palette.error.main,
                    fontWeight: 500
                  }}
                >
                  {profitLossValue} ({profitLossPercentage})
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Total Holdings
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                    {dashboardData.Holdings ? dashboardData.Holdings.length : 0}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: theme.palette.secondary.light, width: 40, height: 40 }}>
                  <ShowChartIcon />
                </Avatar>
              </Box>
              <Button 
                component={Link} 
                to="/holdings" 
                size="small" 
                sx={{ mt: 2 }}
              >
                View All Holdings
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Free Cash
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                    {accountCurrency}{(dashboardData.FreeCash || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#9c27b0', width: 40, height: 40 }}>
                  <AccountBalanceIcon />
                </Avatar>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={Math.min(100, ((dashboardData.FreeCash || 0) / accountValue) * 100)} 
                sx={{ mt: 2, mb: 1, height: 6, borderRadius: 3 }} 
              />
              <Typography variant="caption" color="text.secondary">
                {Math.round(((dashboardData.FreeCash || 0) / accountValue) * 100)}% of portfolio
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Profit/Loss
                  </Typography>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 600, 
                      mb: 1,
                      color: isProfitPositive ? theme.palette.success.main : theme.palette.error.main 
                    }}
                  >
                    {profitLossValue}
                  </Typography>
                </Box>
                <Avatar 
                  sx={{ 
                    bgcolor: isProfitPositive ? theme.palette.success.light : theme.palette.error.light, 
                    width: 40, 
                    height: 40 
                  }}
                >
                  {isProfitPositive ? <TrendingUpIcon /> : <TrendingDownIcon />}
                </Avatar>
              </Box>
              <Button 
                component={Link} 
                to="/profit-loss" 
                size="small" 
                sx={{ mt: 2 }}
              >
                View Detailed Analysis
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts and Holdings */}
      <Grid container spacing={3}>
        {/* Portfolio Allocation */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardHeader 
              title="Portfolio Allocation" 
              titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
              action={
                <IconButton component={Link} to="/holdings">
                  <MoreVertIcon />
                </IconButton>
              }
            />
            <Divider />
            <CardContent>
              <Box sx={{ height: 300, position: 'relative' }}>
                {holdingsData.length > 0 ? (
                  <Doughnut data={holdingsPieData} options={pieOptions} />
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Typography variant="body1" color="text.secondary">
                      No holdings data available
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardHeader 
              title="Performance Over Time" 
              titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
              action={
                <IconButton component={Link} to="/stock-charts">
                  <MoreVertIcon />
                </IconButton>
              }
            />
            <Divider />
            <CardContent>
              <Box sx={{ height: 300, position: 'relative' }}>
                <Line data={performanceData} options={lineOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Holdings */}
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              title="Top Holdings" 
              titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
              action={
                <Button 
                  component={Link} 
                  to="/holdings" 
                  size="small" 
                  variant="outlined"
                >
                  View All
                </Button>
              }
            />
            <Divider />
            <CardContent sx={{ p: 0 }}>
              {dashboardData.Holdings && dashboardData.Holdings.length > 0 ? (
                <List>
                  {dashboardData.Holdings.slice(0, 5).map((holding, index) => {
                    const currentValue = parseFloat(holding.current_value.replace(/[^\d.-]/g, ''));
                    const purchaseValue = parseFloat(holding.purchase_value.replace(/[^\d.-]/g, ''));
                    const profitLoss = currentValue - purchaseValue;
                    const profitLossPerc = purchaseValue !== 0 ? (profitLoss / purchaseValue) * 100 : 0;
                    const isPositive = profitLoss >= 0;
                    
                    return (
                      <React.Fragment key={holding.contract_code || index}>
                        <ListItem 
                          sx={{ 
                            py: 2,
                            '&:hover': {
                              backgroundColor: 'rgba(0, 0, 0, 0.02)'
                            }
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar 
                              src={holding.img} 
                              alt={holding.name}
                              variant="rounded"
                              sx={{ width: 40, height: 40 }}
                            >
                              {holding.name.charAt(0)}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary={
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {holding.name}
                              </Typography>
                            }
                            secondary={
                              <Typography variant="body2" color="text.secondary">
                                {holding.contract_code}
                              </Typography>
                            }
                          />
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {accountCurrency}{currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: isPositive ? theme.palette.success.main : theme.palette.error.main,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-end'
                              }}
                            >
                              {isPositive ? (
                                <ArrowUpwardIcon fontSize="small" sx={{ mr: 0.5 }} />
                              ) : (
                                <ArrowDownwardIcon fontSize="small" sx={{ mr: 0.5 }} />
                              )}
                              {profitLossPerc.toFixed(2)}%
                            </Typography>
                          </Box>
                        </ListItem>
                        {index < Math.min(dashboardData.Holdings.length, 5) - 1 && (
                          <Divider variant="inset" component="li" />
                        )}
                      </React.Fragment>
                    );
                  })}
                </List>
              ) : (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    No holdings data available
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;