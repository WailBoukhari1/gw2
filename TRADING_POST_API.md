# 📊 Trading Post API Integration

This dashboard fully integrates with the Guild Wars 2 Trading Post API to provide real-time access to your buy/sell orders and transaction history.

## 🔐 Required Permissions

Your API key must have the following permissions enabled:
- ✅ `tradingpost` - Access to current orders and transaction history
- ✅ `wallet` - Access to delivery box coins
- ✅ `account` - Basic account information

## 📡 Implemented Endpoints

### 1. Current Active Orders
The dashboard fetches your active unfulfilled orders:

**Buy Orders:**
```
GET /v2/commerce/transactions/current/buys?access_token=<API_KEY>
```

**Sell Orders:**
```
GET /v2/commerce/transactions/current/sells?access_token=<API_KEY>
```

**Response Fields:**
- `id` - Internal transaction ID
- `item_id` - Item identifier
- `price` - Unit price (in copper)
- `quantity` - Remaining count
- `created` - ISO8601 creation time

### 2. Transaction History (Last ~90 Days)
The dashboard retrieves your completed transactions:

**Buy History:**
```
GET /v2/commerce/transactions/history/buys?access_token=<API_KEY>
```

**Sell History:**
```
GET /v2/commerce/transactions/history/sells?access_token=<API_KEY>
```

**Response Fields:**
- `id` - Internal record ID
- `item_id` - Item purchased/sold
- `price` - Unit price
- `quantity` - How many were matched
- `created` - When the order was placed
- `purchased` - When it was matched/fulfilled

### 3. Delivery Box
Fetches items and coins waiting for pickup:

```
GET /v2/commerce/delivery?access_token=<API_KEY>
```

**Response:**
- `coins` - Amount of copper waiting
- `items` - Array of items ready for pickup

## 🎯 Features in the Dashboard

### Trading Post Hub Page
Located at `/trading-post`, this page provides:

1. **Active Listings Tab**
   - Current buy orders with total exposure
   - Current sell orders with total value
   - Real-time item details and icons
   - Time since order creation

2. **Transaction History Tab**
   - Last 90 days of completed buys
   - Last 90 days of completed sells
   - Profit/loss calculations
   - Fulfillment timestamps

3. **Delivery Box**
   - Highlighted section when items/coins are waiting
   - Total unclaimed coins display
   - Item list with quantities
   - Visual indicators for pickup

4. **Summary Statistics**
   - Net Trading Value (total exposure)
   - Buy Order Exposure (locked capital)
   - Selling Value (pending revenue)

## 🔄 Data Refresh

The dashboard automatically:
- Fetches data on page load
- Refreshes when API key changes
- Validates API key permissions
- Shows loading states during sync

## 🛡️ Error Handling

The implementation includes robust error handling:
- 404 responses for empty transaction history (normal)
- Permission validation before API calls
- Graceful degradation if API is unavailable
- User-friendly error messages

## 💡 Implementation Details

### File: `src/services/api.service.ts`

```typescript
async getTransactionHistory(
  apiKey: string, 
  type: 'buys' | 'sells', 
  state: 'current' | 'history'
): Promise<any[]> {
  try {
    const response = await smartRequest(
      `${API_BASE}/account/commerce/transactions/${state}/${type}`, 
      apiKey
    );
    return response.data || [];
  } catch (error: any) {
    // GW2 API returns 404 if no history exists
    if (error.response?.status === 404) {
      return [];
    }
    console.error(`Error fetching trade history (${state}/${type})`, error);
    return [];
  }
}
```

### File: `src/pages/TradingPostPage.tsx`

The page component:
1. Fetches all transaction data in parallel
2. Enriches transactions with item details
3. Calculates aggregate statistics
4. Renders tabbed interface with animations
5. Handles Arabic RTL layout

## 📝 Notes

- **History Limit:** Only the last ~90 days are available via the official API
- **Cancelled Orders:** Do not appear in history (only matched trades)
- **Pagination:** Endpoints support `?page=<number>&page_size=<number>` (max 200)
- **Rate Limiting:** The dashboard uses a rate limiter to prevent API throttling

## 🎨 UI Enhancements

The Trading Post page features:
- Premium glassmorphic design
- Smooth animations and transitions
- Color-coded buy/sell indicators
- Responsive grid layouts
- Real-time currency displays with coin icons
- Arabic language support with RTL layout

## 🚀 Future Enhancements

Potential additions:
- Export transaction history to CSV
- Profit/loss analytics and charts
- Price alerts for specific items
- Automated trading strategies
- Historical price tracking
