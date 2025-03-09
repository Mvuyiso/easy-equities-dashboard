import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  CircularProgress, 
  Box,
  Button,
  CardActions,
  CardHeader,
  Divider
} from '@mui/material';
import { AccountBalance as AccountIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Accounts({ setSelectedAccount }) {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAccounts = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/accounts/');
        setAccounts(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching accounts:', err);
        setError('Failed to load accounts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  const handleSelectAccount = (account) => {
    setSelectedAccount(account);
    navigate('/holdings');
  };

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

  return (
    <div className="accounts-container">
      <Typography variant="h4" gutterBottom>
        Your Accounts
      </Typography>
      
      {accounts.length === 0 ? (
        <Typography variant="body1">
          No accounts found. Please check your Easy Equities credentials.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {accounts.map((account) => (
            <Grid item xs={12} sm={6} md={4} key={account.id}>
              <Card className="card">
                <CardHeader
                  avatar={<AccountIcon />}
                  title={account.name}
                  subheader={`Currency: ${account.trading_currency_id}`}
                />
                <Divider />
                <CardContent>
                  {account.summary && (
                    <>
                      <Typography variant="body1" gutterBottom>
                        <strong>Total Value:</strong> {account.summary.total_value}
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        <strong>Available Cash:</strong> {account.summary.available_cash}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Holdings:</strong> {account.summary.holdings_count}
                      </Typography>
                    </>
                  )}
                </CardContent>
                <CardActions>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth
                    onClick={() => handleSelectAccount(account)}
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </div>
  );
}

export default Accounts;