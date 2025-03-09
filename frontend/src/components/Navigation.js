import React, { useState, useEffect } from 'react';
import { 
  NavLink,
  useLocation 
} from 'react-router-dom';
import axios from 'axios';
import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Chip,
  useMediaQuery,
  useTheme,
  Badge,
  Tooltip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  AccountBalance as AccountBalanceIcon,
  ShowChart as HoldingsIcon,
  Receipt as TransactionsIcon,
  AttachMoney as ProfitLossIcon,
  BarChart as StockChartsIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Person as PersonIcon,
  PieChart as PieChartIcon
} from '@mui/icons-material';

const drawerWidth = 260;

function Navigation({ selectedAccount, setSelectedAccount }) {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    setMounted(true);
    
    const fetchAccounts = async () => {
      try {
        const response = await axios.get('/api/accounts/');
        if (mounted) {
          if (response.status === 200) {
            setAccounts(response.data);
            if (response.data.length > 0 && !selectedAccount) {
              setSelectedAccount(response.data[0]);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching accounts:', error);
      }
    };

    fetchAccounts();
    
    return () => {
      setMounted(false);
    };
  }, [setSelectedAccount, selectedAccount, mounted]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleAccountChange = (event) => {
    if (!mounted) return;
    
    const accountId = event.target.value;
    const account = accounts.find(acc => acc.id === accountId);
    setSelectedAccount(account);
  };

  const drawer = (
    <>
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          height: '100%'
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            p: 2
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
            EasyEquities
          </Typography>
          {isMobile && (
            <IconButton onClick={handleDrawerToggle}>
              <ChevronLeftIcon />
            </IconButton>
          )}
        </Box>
        
        <Divider />
        
        {selectedAccount && (
          <Box sx={{ p: 2 }}>
            <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 2 }}>
              <InputLabel id="account-select-label">Account</InputLabel>
              <Select
                labelId="account-select-label"
                id="account-select"
                value={selectedAccount.id}
                onChange={handleAccountChange}
                label="Account"
              >
                {accounts.map((account) => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}
        
        <List sx={{ flexGrow: 1 }}>
          <ListItem 
            button 
            component={NavLink} 
            to="/" 
            sx={{ 
              borderRadius: 2, 
              mx: 1, 
              mb: 1,
              color: location.pathname === '/' ? theme.palette.primary.main : 'inherit',
              backgroundColor: location.pathname === '/' ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.05)
              }
            }}
            onClick={isMobile ? handleDrawerToggle : undefined}
          >
            <ListItemIcon sx={{ color: location.pathname === '/' ? theme.palette.primary.main : 'inherit' }}>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>
          
          <ListItem 
            button 
            component={NavLink} 
            to="/portfolio" 
            sx={{ 
              borderRadius: 2, 
              mx: 1, 
              mb: 1,
              color: location.pathname === '/portfolio' ? theme.palette.primary.main : 'inherit',
              backgroundColor: location.pathname === '/portfolio' ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.05)
              }
            }}
            onClick={isMobile ? handleDrawerToggle : undefined}
          >
            <ListItemIcon sx={{ color: location.pathname === '/portfolio' ? theme.palette.primary.main : 'inherit' }}>
              <PieChartIcon />
            </ListItemIcon>
            <ListItemText primary="Portfolio Overview" />
          </ListItem>
          
          <ListItem 
            button 
            component={NavLink} 
            to="/accounts" 
            sx={{ 
              borderRadius: 2, 
              mx: 1, 
              mb: 1,
              color: location.pathname === '/accounts' ? theme.palette.primary.main : 'inherit',
              backgroundColor: location.pathname === '/accounts' ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.05)
              }
            }}
            onClick={isMobile ? handleDrawerToggle : undefined}
          >
            <ListItemIcon sx={{ color: location.pathname === '/accounts' ? theme.palette.primary.main : 'inherit' }}>
              <AccountBalanceIcon />
            </ListItemIcon>
            <ListItemText primary="Accounts" />
          </ListItem>
          
          <ListItem 
            button 
            component={NavLink} 
            to="/holdings" 
            sx={{ 
              borderRadius: 2, 
              mx: 1, 
              mb: 1,
              color: location.pathname === '/holdings' ? theme.palette.primary.main : 'inherit',
              backgroundColor: location.pathname === '/holdings' ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.05)
              }
            }}
            onClick={isMobile ? handleDrawerToggle : undefined}
          >
            <ListItemIcon sx={{ color: location.pathname === '/holdings' ? theme.palette.primary.main : 'inherit' }}>
              <HoldingsIcon />
            </ListItemIcon>
            <ListItemText primary="Holdings" />
          </ListItem>
          
          <ListItem 
            button 
            component={NavLink} 
            to="/transactions" 
            sx={{ 
              borderRadius: 2, 
              mx: 1, 
              mb: 1,
              color: location.pathname === '/transactions' ? theme.palette.primary.main : 'inherit',
              backgroundColor: location.pathname === '/transactions' ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.05)
              }
            }}
            onClick={isMobile ? handleDrawerToggle : undefined}
          >
            <ListItemIcon sx={{ color: location.pathname === '/transactions' ? theme.palette.primary.main : 'inherit' }}>
              <TransactionsIcon />
            </ListItemIcon>
            <ListItemText primary="Transactions" />
          </ListItem>
          
          <ListItem 
            button 
            component={NavLink} 
            to="/profit-loss" 
            sx={{ 
              borderRadius: 2, 
              mx: 1, 
              mb: 1,
              color: location.pathname === '/profit-loss' ? theme.palette.primary.main : 'inherit',
              backgroundColor: location.pathname === '/profit-loss' ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.05)
              }
            }}
            onClick={isMobile ? handleDrawerToggle : undefined}
          >
            <ListItemIcon sx={{ color: location.pathname === '/profit-loss' ? theme.palette.primary.main : 'inherit' }}>
              <ProfitLossIcon />
            </ListItemIcon>
            <ListItemText primary="Profit/Loss" />
          </ListItem>
          
          <ListItem 
            button 
            component={NavLink} 
            to="/stock-charts" 
            sx={{ 
              borderRadius: 2, 
              mx: 1, 
              mb: 1,
              color: location.pathname === '/stock-charts' ? theme.palette.primary.main : 'inherit',
              backgroundColor: location.pathname === '/stock-charts' ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.05)
              }
            }}
            onClick={isMobile ? handleDrawerToggle : undefined}
          >
            <ListItemIcon sx={{ color: location.pathname === '/stock-charts' ? theme.palette.primary.main : 'inherit' }}>
              <StockChartsIcon />
            </ListItemIcon>
            <ListItemText primary="Stock Charts" />
          </ListItem>
        </List>
        
        <Box sx={{ p: 2 }}>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 32, height: 32, mr: 1 }}>
              <PersonIcon fontSize="small" />
            </Avatar>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              EasyEquities User
            </Typography>
          </Box>
        </Box>
      </Box>
    </>
  );

  return (
    <>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          boxShadow: '0 2px 10px 0 rgba(0,0,0,0.05)',
          backgroundColor: 'white',
          color: 'text.primary'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            {selectedAccount ? selectedAccount.name : 'EasyEquities Dashboard'}
          </Typography>
          {selectedAccount && (
            <Chip
              label={`${selectedAccount.name}`}
              color="primary"
              variant="outlined"
              sx={{ display: { xs: 'none', sm: 'flex' } }}
            />
          )}
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
    </>
  );
}

// Helper function to create alpha colors
function alpha(color, opacity) {
  return color + opacity.toString(16).padStart(2, '0');
}

export default Navigation;
