import os
import re
import json
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from easy_equities_client.clients import EasyEquitiesClient
from easy_equities_client.instruments.types import Period

# Initialize the client
client = None

def get_client(force_new=False):
    """Get or initialize the EasyEquities client"""
    global client
    if client is None or force_new:
        client = EasyEquitiesClient()
        # Get credentials from environment variables
        username = os.getenv("EASYEQUITIES_USERNAME")
        password = os.getenv("EASYEQUITIES_PASSWORD")
        
        if not username or not password:
            raise ValueError("EASYEQUITIES_USERNAME and EASYEQUITIES_PASSWORD must be set in environment variables")
        
        # Login to Easy Equities
        client.login(username=username, password=password)
    
    return client

@api_view(['GET'])
def accounts_list(request):
    """Get a list of all accounts"""
    try:
        # Try with existing client first
        try:
            client = get_client()
            accounts = client.accounts.list()
        except Exception as e:
            print(f"Error in accounts_list, trying with new client: {str(e)}")
            # If that fails, try with a new client (force re-login)
            client = get_client(force_new=True)
            accounts = client.accounts.list()
        
        # Convert accounts to JSON-serializable format
        accounts_data = []
        for account in accounts:
            account_data = {
                'id': account.id,
                'name': account.name,
                'trading_currency_id': account.trading_currency_id
            }
            
            # Try to get summary information for the account
            try:
                client.accounts._switch_account(account.id)
                valuations = client.accounts.valuations(account.id)
                holdings = client.accounts.holdings(account.id)
                
                account_data['summary'] = {
                    'total_value': valuations.get('TopSummary', {}).get('TotalValue', 'N/A'),
                    'available_cash': valuations.get('TopSummary', {}).get('AvailableCash', 'N/A'),
                    'holdings_count': len(holdings)
                }
            except Exception as e:
                # If we can't get summary info, just continue
                pass
                
            accounts_data.append(account_data)
            
        return Response(accounts_data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def dashboard(request, account_id):
    """Get dashboard data for an account"""
    try:
        # Try with existing client first
        try:
            client = get_client()
            valuations = client.accounts.valuations(account_id)
            holdings_data = client.accounts.holdings(account_id)
        except Exception as e:
            print(f"Error in dashboard, trying with new client: {str(e)}")
            # If that fails, try with a new client (force re-login)
            client = get_client(force_new=True)
            valuations = client.accounts.valuations(account_id)
            holdings_data = client.accounts.holdings(account_id)
        
        # Combine data for dashboard
        dashboard_data = {
            "TopSummary": valuations.get("TopSummary", {}),
            "Holdings": holdings_data,
            "FreeCash": valuations.get("FreeCash", 0)
        }
        
        return Response(dashboard_data)
    except Exception as e:
        print(f"Error in dashboard: {str(e)}")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def holdings(request, account_id):
    """Get holdings for an account"""
    try:
        # Try with existing client first
        try:
            client = get_client()
            holdings_data = client.accounts.holdings(account_id)
        except Exception as e:
            print(f"Error in holdings, trying with new client: {str(e)}")
            # If that fails, try with a new client (force re-login)
            client = get_client(force_new=True)
            holdings_data = client.accounts.holdings(account_id)
        
        return Response(holdings_data)
    except Exception as e:
        print(f"Error in holdings: {str(e)}")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def transactions(request, account_id):
    """Get transactions for an account"""
    try:
        client = get_client()
        transactions = client.accounts.transactions(account_id)
        return Response(transactions)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def profit_loss(request, account_id):
    """Get profit/loss data for an account"""
    try:
        # Try with existing client first
        try:
            client = get_client()
            holdings_data = client.accounts.holdings(account_id)
        except Exception as e:
            print(f"Error in profit_loss, trying with new client: {str(e)}")
            # If that fails, try with a new client (force re-login)
            client = get_client(force_new=True)
            holdings_data = client.accounts.holdings(account_id)
        
        # Calculate profit/loss
        total_purchase_value = 0
        total_current_value = 0
        
        for holding in holdings_data:
            purchase_value = float(re.sub(r'[^\d.]', '', holding['purchase_value'][1:]))
            current_value = float(re.sub(r'[^\d.]', '', holding['current_value'][1:]))
            
            total_purchase_value += purchase_value
            total_current_value += current_value
        
        total_profit_loss = total_current_value - total_purchase_value
        total_profit_loss_percentage = (total_profit_loss / total_purchase_value * 100) if total_purchase_value > 0 else 0
        
        profit_loss_data = {
            "holdings": holdings_data,
            "total_purchase_value": f"R{total_purchase_value:.2f}",
            "total_current_value": f"R{total_current_value:.2f}",
            "total_profit_loss_value": f"R{total_profit_loss:.2f}",
            "total_profit_loss_percentage": total_profit_loss_percentage
        }
        
        return Response(profit_loss_data)
    except Exception as e:
        print(f"Error in profit_loss: {str(e)}")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def all_holdings(request):
    """Get all holdings across all accounts"""
    try:
        # Try with existing client first
        try:
            client = get_client()
            accounts = client.accounts.list()
        except Exception as e:
            print(f"Error in all_holdings, trying with new client: {str(e)}")
            # If that fails, try with a new client (force re-login)
            client = get_client(force_new=True)
            accounts = client.accounts.list()
        
        all_holdings_data = []
        
        for account in accounts:
            try:
                holdings = client.accounts.holdings(account.id)
                for holding in holdings:
                    holding['account_name'] = account.name
                    holding['account_id'] = account.id
                    all_holdings_data.append(holding)
            except Exception as e:
                print(f"Error getting holdings for account {account.name}: {str(e)}")
        
        return Response(all_holdings_data)
    except Exception as e:
        print(f"Error in all_holdings: {str(e)}")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def historical_prices(request, contract_code, period):
    """Get historical prices for an instrument"""
    try:
        # Try with existing client first
        try:
            client = get_client()
            period_enum = Period[period.upper()]
            prices_data = client.instruments.historical_prices(contract_code, period_enum)
        except Exception as e:
            print(f"Error in historical_prices, trying with new client: {str(e)}")
            # If that fails, try with a new client (force re-login)
            client = get_client(force_new=True)
            period_enum = Period[period.upper()]
            prices_data = client.instruments.historical_prices(contract_code, period_enum)
        
        return Response(prices_data)
    except Exception as e:
        print(f"Error in historical_prices: {str(e)}")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def top_holdings_historical_prices(request, account_id, period):
    """Get historical prices for the top 10 holdings of an account"""
    try:
        client = get_client()

        # Convert period string to Period enum
        try:
            period_enum = Period[period.upper()]
        except KeyError:
            return Response(
                {'error': f'Invalid period. Choose from: {", ".join(p.name for p in Period)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get holdings for the account
        holdings = client.accounts.holdings(account_id)

        # Sort holdings by current value to get the top 10
        top_holdings = sorted(holdings, key=lambda h: float(h['current_value'][1:].replace(' ', '').replace(',', '')), reverse=True)[:10]

        # Fetch historical prices for each holding
        historical_data = {}
        for holding in top_holdings:
            contract_code = holding.get('contract_code', '')
            if contract_code:
                prices = client.instruments.historical_prices(contract_code, period_enum)
                historical_data[holding['name']] = prices

        return Response(historical_data)
    except Exception as e:
        print(f"Error in top_holdings_historical_prices: account_id={account_id}, period={period}, error={str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
