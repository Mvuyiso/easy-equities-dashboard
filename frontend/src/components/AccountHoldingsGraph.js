import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AccountHoldingsGraph = () => {
  const { account_id } = useParams();
  const [period, setPeriod] = useState('7D'); // Default period
  const [historicalData, setHistoricalData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiUrl = '/api/top-holdings-historical-prices/' + account_id + '/' + period;
        console.log('Fetching data from:', apiUrl);
        const response = await fetch(apiUrl);
        if (!response.ok) {
          console.error('HTTP error! status:', response.status);
          throw new Error('HTTP error! status: ' + response.status);
        }
        const data = await response.json();
        console.log('Data received:', data);
        setHistoricalData(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [account_id, period]);

  const handlePeriodChange = (e) => {
    const selectedPeriod = e.target.value;
    if (['ONE_MONTH', 'THREE_MONTHS', 'SIX_MONTHS', 'ONE_YEAR', 'MAX'].includes(selectedPeriod)) {
      setPeriod(selectedPeriod);
    } else {
      setError('Invalid period selected');
    }
  };

  const chartData = {
    datasets: Object.entries(historicalData).map(([holdingName, prices]) => {
      const labels = prices.map(price => new Date(price.date).toLocaleDateString());
      const data = prices.map(price => price.close);

      return {
        label: holdingName,
        data: data,
        fill: false,
        borderColor: '#' + Math.floor(Math.random()*16777215).toString(16), // Random color
        tension: 0.1
      };
    })
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Top Holdings Performance for Account ' + account_id + ' (' + period + ')',
      },
    },
  };

  const periodOptions = ['ONE_MONTH', 'THREE_MONTHS', 'SIX_MONTHS', 'ONE_YEAR', 'MAX'];

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h2>Account Holdings Graph</h2>
      <div>
        <label>Select Period:</label>
        <select value={period} onChange={handlePeriodChange}>
          {periodOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>
      {Object.keys(historicalData).length > 0 ? (
        <Line options={options} data={chartData} />
      ) : (
        <p>No data available for the selected period.</p>
      )}
    </div>
  );
};

export default AccountHoldingsGraph;