from django.urls import path
from . import views

urlpatterns = [
    # Account endpoints
    path('accounts/', views.accounts_list, name='accounts-list'),
    path('dashboard/<str:account_id>/', views.dashboard, name='dashboard'),
    path('holdings/<str:account_id>/', views.holdings, name='holdings'),
    path('transactions/<str:account_id>/', views.transactions, name='transactions'),
    path('profit-loss/<str:account_id>/', views.profit_loss, name='profit-loss'),
    path('all-holdings/', views.all_holdings, name='all-holdings'),
    path('top-holdings-historical-prices/<str:account_id>/<str:period>/', views.top_holdings_historical_prices, name='top-holdings-historical-prices'),
    
        # Instrument endpoints
        path('historical-prices/<str:contract_code>/<str:period>/', views.historical_prices, name='historical-prices'),
]
