# EasyEquities Dashboard

A modern web application for tracking and visualizing your EasyEquities investments.

## Project Structure

The project consists of two main parts:

1. **Backend**: Django REST API that interfaces with the EasyEquities client library
2. **Frontend**: React application with Material UI

## Prerequisites

- Python 3.8+
- Node.js 14+
- npm or yarn
- EasyEquities account credentials

## Setup

### Backend Setup

```bash

# Install base EasyEquities client
pip install easy-equities-client

# Navigate to the backend directory
cd backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Install the Easy Equities client library
pip install -e ../..

# Run migrations
python manage.py migrate

# Start the Django development server
python manage.py runserver
```

### Frontend Setup

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. The application will automatically connect to your EasyEquities account
3. Navigate through the different sections using the sidebar menu

## Features

- View all your EasyEquities accounts in one place
- Track your investment holdings and their performance
- Analyze profit and loss across your portfolio
- View transaction history
- Interactive stock charts
- Portfolio overview with asset allocation visualization
- Responsive design for desktop and mobile

## API Endpoints

The backend provides the following API endpoints:

- `GET /api/accounts/` - List all accounts
- `GET /api/dashboard/:account_id/` - Get dashboard data for an account
- `GET /api/holdings/:account_id/` - Get holdings for an account
- `GET /api/transactions/:account_id/` - Get transactions for an account
- `GET /api/profit-loss/:account_id/` - Get profit/loss data for an account
- `GET /api/all-holdings/` - Get all holdings across all accounts
- `GET /api/historical-prices/:contract_code/:period/` - Get historical prices for an instrument
