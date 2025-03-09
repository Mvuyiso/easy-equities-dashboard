import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Divider,
  CircularProgress,
  Button,
  Tabs,
  Tab,
  useTheme,
  Paper,
  Avatar,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  alpha
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  BarChart as BarChartIcon,
  Refresh as RefreshIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { Pie, Doughnut, Line, Bar } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip as ChartTooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  BarElement 
} from 'chart.js';

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

function PortfolioOverview({ selectedAccount }) {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [portfolioData, setPortfolioData] = useState(null);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [allHoldings, setAllHoldings] = useState([]);
  const [assetAllocation, setAssetAllocation] = useState({
    labels: [],
    data: []
  });
  const [sectorAllocation, setSectorAllocation] = useState({
    labels: [],
    data: []
  });
  const [performanceData, setPerformanceData] = useState({
    labels: [],
    datasets: []
  });
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    setMounted(true);
    
    const fetchPortfolioData = async () => {
      if (!selectedAccount) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        // Fetch all necessary data
        const [holdingsResponse, valuationsResponse, profitLossResponse] = await Promise.all([
          axios.get(`/api/holdings/${selectedAccount.id}/`),
          axios.get(`/api/dashboard/${selectedAccount.id}/`),
          axios.get(`/api/profit-loss/${selectedAccount.id}/`)
        ]);
        
        // Only process data if component is still mounted
        if (mounted) {
          // Process holdings data
          const holdingsData = holdingsResponse.data;
          
          // Calculate totals
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
          
          setAllHoldings(processedHoldings);
          
          // Create asset allocation data (mock data - replace with actual categorization)
          const assetTypes = {
            'ETF': ['ETF', 'GLODIV', 'STXNDQ', 'STXWDM'],
            'Stock': ['ABSP', 'NPN', 'SLM', 'AGL'],
            'REIT': ['GRT', 'RDF', 'VKE'],
            'Bond': ['R186', 'R2030', 'R2048'],
            'Cash': []
          };
          
          const assetData = {};
          let otherValue = 0;
          
          processedHoldings.forEach(holding => {
            let assetType = 'Other';
            
            // Determine asset type based on contract code
            for (const [type, codes] of Object.entries(assetTypes)) {
              if (holding.contract_code && codes.some(code => holding.contract_code.includes(code))) {
                assetType = type;
                break;
              }
            }
            
            if (assetType === 'Other') {
              otherValue += holding.currentValueNumber;
            } else {
              assetData[assetType] = (assetData[assetType] || 0) + holding.currentValueNumber;
            }
          });
          
          if (otherValue > 0) {
            assetData['Other'] = otherValue;
          }
          
          setAssetAllocation({
            labels: Object.keys(assetData),
            data: Object.values(assetData)
          });
          
          // Create sector allocation data (mock data - replace with actual categorization)
          const sectorTypes = {
            'Technology': ['NPN', 'STXNDQ'],
            'Financial': ['ABSP', 'SLM'],
            'Resources': ['AGL', 'BHP'],
            'Property': ['GRT', 'RDF', 'VKE'],
            'Industrial': ['CFR', 'BTI'],
            'Consumer': ['WHL', 'SPP']
          };
          
          const sectorData = {};
          otherValue = 0;
          
          processedHoldings.forEach(holding => {
            let sectorType = 'Other';
            
            // Determine sector type based on contract code
            for (const [type, codes] of Object.entries(sectorTypes)) {
              if (holding.contract_code && codes.some(code => holding.contract_code.includes(code))) {
                sectorType = type;
                break;
              }
            }
            
            if (sectorType === 'Other') {
              otherValue += holding.currentValueNumber;
            } else {
              sectorData[sectorType] = (sectorData[sectorType] || 0) + holding.currentValueNumber;
            }
          });
          
          if (otherValue > 0) {
            sectorData['Other'] = otherValue;
          }
          
          setSectorAllocation({
            labels: Object.keys(sectorData),
            data: Object.values(sectorData)
          });
          
          // Create performance data (mock data - replace with actual historical data)
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const currentMonth = new Date().getMonth();
          
          const lastSixMonths = [];
          for (let i = 5; i >= 0; i--) {
            const monthIndex = (currentMonth - i + 12) % 12;
            lastSixMonths.push(months[monthIndex]);
          }
          
          // Mock performance data - replace with actual data
          const portfolioValues = [
            totalCurrentValue * 0.85,
            totalCurrentValue * 0.88,
            totalCurrentValue * 0.92,
            totalCurrentValue * 0.95,
            totalCurrentValue * 0.98,
            totalCurrentValue
          ];
          
          const benchmarkValues = [
            totalCurrentValue * 0.83,
            totalCurrentValue * 0.85,
            totalCurrentValue * 0.89,
            totalCurrentValue * 0.91,
            totalCurrentValue * 0.94,
            totalCurrentValue * 0.97
          ];
          
          setPerformanceData({
            labels: lastSixMonths,
            datasets: [
              {
                label: 'Portfolio',
                data: portfolioValues,
                borderColor: theme.palette.primary.main,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                fill: true,
                tension: 0.4
              },
              {
                label: 'Benchmark (JSE All Share)',
                data: benchmarkValues,
                borderColor: theme.palette.secondary.main,
                backgroundColor: 'transparent',
                borderDash: [5, 5],
                fill: false,
                tension: 0.4
              }
            ]
          });
          
          // Combine all data
          setPortfolioData({
            holdings: processedHoldings,
            valuations: valuationsResponse.data,
            profitLoss: profitLossResponse.data,
            totalCurrentValue,
            totalPurchaseValue,
            totalProfitLoss: totalCurrentValue - totalPurchaseValue,
            totalProfitLossPercentage: totalPurchaseValue !== 0 ? ((totalCurrentValue - totalPurchaseValue) / totalPurchaseValue) * 100 : 0
          });
          
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching portfolio data:', err);
        if (mounted) {
          setError('Failed to load portfolio data. Please try again later.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchPortfolioData();
    
    return () => {
      setMounted(false);
    };
  }, [selectedAccount, theme.palette.primary.main, theme.palette.secondary.main, mounted]);

  const handleRefresh = async () => {
    if (!selectedAccount || !mounted) return;
    
    setRefreshing(true);
    try {
      // Implement refresh logic similar to fetchPortfolioData
      // This is a simplified version
      const [holdingsResponse, valuationsResponse, profitLossResponse] = await Promise.all([
        axios.get(`/api/holdings/${selectedAccount.id}/`),
        axios.get(`/api/dashboard/${selectedAccount.id}/`),
        axios.get(`/api/profit-loss/${selectedAccount.id}/`)
      ]);
      
      if (mounted) {
        // Process data as in the useEffect
        // ... (simplified for brevity)
        
        setError(null);
      }
    } catch (err) {
      console.error('Error refreshing portfolio data:', err);
      if (mounted) {
        setError('Failed to refresh portfolio data. Please try again later.');
      }
    } finally {
      if (mounted) {
        setRefreshing(false);
      }
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (!selectedAccount) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Please select an account to view portfolio overview
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

  if (!portfolioData) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">
          No portfolio data available for this account
        </Typography>
      </Box>
    );
  }

  const currency = allHoldings.length > 0 ? allHoldings[0].purchase_value[0] : 'R';

  // Options for pie charts
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
            return `${label}: ${currency}${value.toLocaleString()} (${percentage}%)`;
          }
        }
      }
    },
    maintainAspectRatio: false,
    cutout: '60%'
  };

  // Options for line chart
  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${currency}${context.raw.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: function(value) {
            return `${currency}${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
          }
        }
      }
    }
  };

  // Prepare data for asset allocation chart
  const assetAllocationData = {
    labels: assetAllocation.labels,
    datasets: [
      {
        data: assetAllocation.data,
        backgroundColor: [
          theme.palette.primary.main,
          theme.palette.secondary.main,
          theme.palette.success.main,
          theme.palette.warning.main,
          theme.palette.error.main,
          '#9c27b0', // Purple
          '#795548', // Brown
        ],
        borderColor: 'white',
        borderWidth: 2,
      },
    ],
  };

  // Prepare data for sector allocation chart
  const sectorAllocationData = {
    labels: sectorAllocation.labels,
    datasets: [
      {
        data: sectorAllocation.data,
        backgroundColor: [
          '#2196f3', // Blue
          '#ff9800', // Orange
          '#4caf50', // Green
          '#f44336', // Red
          '#9c27b0', // Purple
          '#795548', // Brown
          '#607d8b', // Blue Grey
        ],
        borderColor: 'white',
        borderWidth: 2,
      },
    ],
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Portfolio Overview
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
                    Total Portfolio Value
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                    {currency}{portfolioData.totalCurrentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: theme.palette.primary.light, width: 40, height: 40 }}>
                  <PieChartIcon />
                </Avatar>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {allHoldings.length} different holdings
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
                    Total Profit/Loss
                  </Typography>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 600, 
                      mb: 1,
                      color: portfolioData.totalProfitLoss >= 0 ? theme.palette.success.main : theme.palette.error.main 
                    }}
                  >
                    {portfolioData.totalProfitLoss >= 0 ? '+' : ''}{currency}{portfolioData.totalProfitLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                </Box>
                <Avatar 
                  sx={{ 
                    bgcolor: portfolioData.totalProfitLoss >= 0 ? theme.palette.success.light : theme.palette.error.light, 
                    width: 40, 
                    height: 40 
                  }}
                >
                  {portfolioData.totalProfitLoss >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                </Avatar>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {portfolioData.totalProfitLoss >= 0 ? (
                  <ArrowUpwardIcon fontSize="small" sx={{ color: theme.palette.success.main, mr: 0.5 }} />
                ) : (
                  <ArrowDownwardIcon fontSize="small" sx={{ color: theme.palette.error.main, mr: 0.5 }} />
                )}
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: portfolioData.totalProfitLoss >= 0 ? theme.palette.success.main : theme.palette.error.main,
                    fontWeight: 500
                  }}
                >
                  {portfolioData.totalProfitLossPercentage.toFixed(2)}%
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
                    Best Performing
                  </Typography>
                  {allHoldings.length > 0 ? (
                    <>
                      <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                        {allHoldings.sort((a, b) => b.profitLossPercentage - a.profitLossPercentage)[0].name}
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
                        {allHoldings.sort((a, b) => b.profitLossPercentage - a.profitLossPercentage)[0].profitLossPercentage.toFixed(2)}%
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

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Worst Performing
                  </Typography>
                  {allHoldings.length > 0 ? (
                    <>
                      <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                        {allHoldings.sort((a, b) => a.profitLossPercentage - b.profitLossPercentage)[0].name}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: theme.palette.error.main,
                          fontWeight: 500,
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <ArrowDownwardIcon fontSize="small" sx={{ mr: 0.5 }} />
                        {allHoldings.sort((a, b) => a.profitLossPercentage - b.profitLossPercentage)[0].profitLossPercentage.toFixed(2)}%
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="body1">No holdings data</Typography>
                  )}
                </Box>
                <Avatar sx={{ bgcolor: theme.palette.error.light, width: 40, height: 40 }}>
                  <TrendingDownIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs for different views */}
      <Paper sx={{ mb: 4 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="fullWidth"
          textColor="primary"
          indicatorColor="primary"
          aria-label="portfolio tabs"
        >
          <Tab icon={<PieChartIcon />} label="Allocation" />
          <Tab icon={<TimelineIcon />} label="Performance" />
          <Tab icon={<BarChartIcon />} label="Top Holdings" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardHeader 
                title="Asset Allocation" 
                titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                action={
                  <Tooltip title="Asset allocation shows how your portfolio is distributed across different asset classes">
                    <IconButton>
                      <InfoIcon />
                    </IconButton>
                  </Tooltip>
                }
              />
              <Divider />
              <CardContent>
                <Box sx={{ height: 300, position: 'relative' }}>
                  {assetAllocation.data.length > 0 ? (
                    <Doughnut data={assetAllocationData} options={pieOptions} />
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <Typography variant="body1" color="text.secondary">
                        No asset allocation data available
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardHeader 
                title="Sector Allocation" 
                titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                action={
                  <Tooltip title="Sector allocation shows how your portfolio is distributed across different market sectors">
                    <IconButton>
                      <InfoIcon />
                    </IconButton>
                  </Tooltip>
                }
              />
              <Divider />
              <CardContent>
                <Box sx={{ height: 300, position: 'relative' }}>
                  {sectorAllocation.data.length > 0 ? (
                    <Doughnut data={sectorAllocationData} options={pieOptions} />
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <Typography variant="body1" color="text.secondary">
                        No sector allocation data available
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tabValue === 1 && (
        <Card>
          <CardHeader 
            title="Portfolio Performance" 
            titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
            action={
              <Tooltip title="Performance compared to benchmark over time">
                <IconButton>
                  <InfoIcon />
                </IconButton>
              </Tooltip>
            }
          />
          <Divider />
          <CardContent>
            <Box sx={{ height: 400, position: 'relative' }}>
              <Line data={performanceData} options={lineOptions} />
            </Box>
          </CardContent>
        </Card>
      )}

      {tabValue === 2 && (
        <Card>
          <CardHeader 
            title="Top Holdings by Value" 
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
            {allHoldings.length > 0 ? (
              <List>
                {allHoldings
                  .sort((a, b) => b.currentValueNumber - a.currentValueNumber)
                  .slice(0, 5)
                  .map((holding, index) => (
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
                            {currency}{holding.currentValueNumber.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: holding.profitLoss >= 0 ? theme.palette.success.main : theme.palette.error.main,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'flex-end'
                            }}
                          >
                            {holding.profitLoss >= 0 ? (
                              <ArrowUpwardIcon fontSize="small" sx={{ mr: 0.5 }} />
                            ) : (
                              <ArrowDownwardIcon fontSize="small" sx={{ mr: 0.5 }} />
                            )}
                            {holding.profitLossPercentage.toFixed(2)}%
                          </Typography>
                        </Box>
                      </ListItem>
                      {index < Math.min(allHoldings.length, 5) - 1 && (
                        <Divider variant="inset" component="li" />
                      )}
                    </React.Fragment>
                  ))}
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
      )}
    </Box>
  );
}

export default PortfolioOverview; 