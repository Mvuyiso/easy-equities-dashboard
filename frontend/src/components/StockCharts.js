import React, { useState, useEffect, useRef } from 'react';
import { 
  Typography, 
  CircularProgress, 
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Tabs,
  Tab,
  Autocomplete
} from '@mui/material';
import axios from 'axios';

function StockCharts() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [contractCode, setContractCode] = useState('');
  const [period, setPeriod] = useState('ONE_MONTH');
  const [tabValue, setTabValue] = useState(0);
  const [holdings, setHoldings] = useState([]);
  const [selectedHolding, setSelectedHolding] = useState(null);
  const tradingViewRef = useRef(null);
  const chartContainerRef = useRef(null);

  useEffect(() => {
    // Fetch all holdings across accounts for autocomplete
    const fetchHoldings = async () => {
      try {
        const response = await axios.get('/api/all-holdings/');
        setHoldings(response.data);
      } catch (err) {
        console.error('Error fetching holdings:', err);
      }
    };

    fetchHoldings();
  }, []);

  useEffect(() => {
    // Create TradingView widget when tab changes to TradingView
    if (tabValue === 1 && selectedHolding) {
      createTradingViewWidget(selectedHolding.contract_code);
    }
  }, [tabValue, selectedHolding]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handlePeriodChange = (event) => {
    setPeriod(event.target.value);
  };

  const handleHoldingChange = (event, newValue) => {
    setSelectedHolding(newValue);
    if (newValue) {
      setContractCode(newValue.contract_code);
    } else {
      setContractCode('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!contractCode) return;
    
    setLoading(true);
    try {
      await fetchHistoricalPrices();
      setError(null);
    } catch (err) {
      console.error('Error fetching historical prices:', err);
      setError('Failed to load historical prices. Please check the contract code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoricalPrices = async () => {
    const response = await axios.get(`/api/historical-prices/${contractCode}/${period}/`);
    renderChart(response.data);
  };

  const renderChart = (data) => {
    const ctx = document.getElementById('historical-chart').getContext('2d');
    
    // Clear previous chart if it exists
    if (window.historicalChart) {
      window.historicalChart.destroy();
    }
    
    // Create new chart
    window.historicalChart = new window.Chart(ctx, {
      type: 'line',
      data: {
        labels: data.chartData.Labels,
        datasets: [{
          label: contractCode,
          data: data.chartData.Dataset,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
          pointRadius: 1,
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: false,
            title: {
              display: true,
              text: `Price (${data.chartData.TradingCurrencySymbol})`
            }
          },
          x: {
            title: {
              display: true,
              text: 'Date'
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: ${data.chartData.TradingCurrencySymbol}${context.raw}`;
              }
            }
          }
        }
      }
    });
  };

  const createTradingViewWidget = (symbol) => {
    // Clear previous widget if it exists
    if (tradingViewRef.current) {
      tradingViewRef.current.innerHTML = '';
    }

    // Create new widget
    if (window.TradingView && tradingViewRef.current) {
      new window.TradingView.widget({
        width: '100%',
        height: 500,
        symbol: symbol,
        interval: 'D',
        timezone: 'Etc/UTC',
        theme: 'light',
        style: '1',
        locale: 'en',
        toolbar_bg: '#f1f3f6',
        enable_publishing: false,
        allow_symbol_change: true,
        container_id: tradingViewRef.current.id
      });
    }
  };

  const periods = [
    { value: 'ONE_MONTH', label: 'One Month' },
    { value: 'THREE_MONTHS', label: 'Three Months' },
    { value: 'SIX_MONTHS', label: 'Six Months' },
    { value: 'ONE_YEAR', label: 'One Year' },
    { value: 'MAX', label: 'Max' }
  ];

  return (
    <div className="stock-charts-container">
      <Typography variant="h4" gutterBottom>
        Stock Charts
      </Typography>
      
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={5}>
                <Autocomplete
                  id="holding-select"
                  options={holdings}
                  getOptionLabel={(option) => `${option.name} (${option.contract_code})`}
                  value={selectedHolding}
                  onChange={handleHoldingChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Holding"
                      variant="outlined"
                      fullWidth
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  label="Contract Code"
                  variant="outlined"
                  fullWidth
                  value={contractCode}
                  onChange={(e) => setContractCode(e.target.value)}
                  placeholder="e.g. EQU.ZA.SYGJP"
                  required
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel id="period-select-label">Period</InputLabel>
                  <Select
                    labelId="period-select-label"
                    id="period-select"
                    value={period}
                    label="Period"
                    onChange={handlePeriodChange}
                  >
                    {periods.map((period) => (
                      <MenuItem key={period.value} value={period.value}>
                        {period.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={loading || !contractCode}
                >
                  {loading ? <CircularProgress size={24} /> : 'Load Chart'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
      
      {error && (
        <Box sx={{ p: 2, mb: 2, bgcolor: 'error.light', borderRadius: 1 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}
      
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="Historical Prices" />
          <Tab label="TradingView Chart" />
        </Tabs>
        
        <Box sx={{ p: 2 }}>
          {tabValue === 0 ? (
            <Box sx={{ height: 500 }} ref={chartContainerRef}>
              <canvas id="historical-chart"></canvas>
            </Box>
          ) : (
            <Box sx={{ height: 500 }} id="tradingview-widget" ref={tradingViewRef}>
              <Typography variant="body1" align="center" sx={{ py: 10 }}>
                {selectedHolding ? 
                  'Loading TradingView chart...' : 
                  'Please select a holding to view TradingView chart'
                }
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
      
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            About Stock Charts
          </Typography>
          <Typography variant="body1" paragraph>
            This page allows you to view historical price data for your investments in two ways:
          </Typography>
          <Typography variant="body2" component="ul">
            <li>
              <strong>Historical Prices:</strong> Shows price data from Easy Equities for the selected period.
            </li>
            <li>
              <strong>TradingView Chart:</strong> Provides an interactive TradingView chart with advanced technical analysis tools.
            </li>
          </Typography>
          <Typography variant="body1" paragraph>
            To use this feature, enter a contract code (e.g., EQU.ZA.SYGJP) or select from your holdings, 
            choose a time period, and click "Load Chart".
          </Typography>
        </CardContent>
      </Card>
    </div>
  );
}

export default StockCharts;