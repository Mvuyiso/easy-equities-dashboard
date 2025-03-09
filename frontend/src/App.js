import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';

// Components
import Dashboard from './components/Dashboard';
import Accounts from './components/Accounts';
import Holdings from './components/Holdings';
import Transactions from './components/Transactions';
import ProfitLoss from './components/ProfitLoss';
import StockCharts from './components/StockCharts';
import Navigation from './components/Navigation';
import AccountHoldingsGraph from './components/AccountHoldingsGraph';
import PortfolioOverview from './components/PortfolioOverview';

// Create a theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2E7D32', // Green color for finance
      light: '#4CAF50',
      dark: '#1B5E20',
      contrastText: '#fff',
    },
    secondary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#fff',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    success: {
      main: '#4caf50',
    },
    error: {
      main: '#f44336',
    },
    warning: {
      main: '#ff9800',
    },
    info: {
      main: '#2196f3',
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif'
    ].join(','),
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 500,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
          borderRadius: 12,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
  },
});

function App() {
  const [selectedAccount, setSelectedAccount] = useState(null);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <Navigation selectedAccount={selectedAccount} setSelectedAccount={setSelectedAccount} />
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            p: { xs: 2, sm: 3, md: 4 }, 
            mt: 8,
            backgroundColor: theme.palette.background.default,
          }}
        >
          <Routes>
            <Route path="/" element={<Dashboard selectedAccount={selectedAccount} />} />
            <Route path="/accounts" element={<Accounts setSelectedAccount={setSelectedAccount} />} />
            <Route path="/holdings" element={<Holdings selectedAccount={selectedAccount} />} />
            <Route path="/transactions" element={<Transactions selectedAccount={selectedAccount} />} />
            <Route path="/profit-loss" element={<ProfitLoss selectedAccount={selectedAccount} />} />
            <Route path="/stock-charts" element={<StockCharts />} />
            <Route path="/holdings-graph/:account_id" element={<AccountHoldingsGraph />} />
            <Route path="/portfolio" element={<PortfolioOverview selectedAccount={selectedAccount} />} />
          </Routes>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
