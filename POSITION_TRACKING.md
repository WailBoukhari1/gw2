# 🎯 Enhanced Position Tracking & AI Simulation System

## Overview
The Locked Trade Positions system has been completely overhauled to track buy/sell status, completion states, and real performance metrics. The AI Simulation Core is now fully functional for performance tracking.

---

## 🔄 Position Tracking Enhancements

### New Position Fields

```typescript
interface Position {
  // Original fields
  itemId: number;
  itemName: string;
  itemIcon: string;
  buyPrice: number;
  quantity: number;
  timestamp: string;
  
  // NEW: Enhanced tracking fields
  type: 'buy' | 'sell';  // Trade direction
  status: 'active' | 'partial' | 'completed';  // Completion state
  
  // NEW: Performance tracking
  sellPrice?: number;  // Actual sell price when completed
  sellTimestamp?: string;  // When position was closed
  realizedProfit?: number;  // Actual profit after 15% TP fee
  quantitySold?: number;  // Units sold (for partial fills)
}
```

### Status Badges

Each position now displays a color-coded status badge:
- **🔵 Active** - Position is open and tracking
- **🟡 Partial** - Some units sold, some remaining
- **🟢 Completed** - All units sold, position closed

---

## 💰 Sell Position Functionality

### How to Sell

1. Click **"🏷️ Sell Position"** button on any active position
2. Enter your **sell price** (defaults to current market price)
3. Specify **quantity to sell** (can do partial sells)
4. Review the **profit calculation** (after 15% TP fee)
5. Click **"Confirm Sell"** to record the transaction

### Profit Calculation

The system automatically calculates:
```
Actual Profit = (Sell Price × 0.85 - Buy Price) × Quantity
```

This accounts for the 15% Trading Post fee.

---

## 📊 Real Performance Tracking

### For Active Positions

The card shows:
- **Total Investment**: Your original cost
- **If Sold Now**: Revenue after TP fee at current price
- **Potential Profit**: Unrealized profit/loss

### For Completed/Partial Positions

A special **"💰 Real Performance"** panel appears showing:
- **Realized Profit**: Actual profit from sold units
- **Sell Date**: When the position was closed
- **Color-coded**: Green for profit, red for loss

### Partial Fills

When you sell only some units:
- Status changes to **"Partial"**
- Shows "✓ X sold" indicator
- Remaining quantity updates automatically
- Can sell more units later
- Realized profit accumulates

---

## 🤖 AI Simulation Core

### Location
Navigate to **Learning Center** page to access the AI Simulation Core.

### Features

#### 1. Real Performance Tracking
- **Level**: Based on completed trades
- **XP Progress**: Visual progress bar
- **Verified Trades**: Count of actual positions closed

#### 2. AI Simulation Stats
- **Sim Level**: AI's learning progress
- **Virtual Wallet**: Fake gold for AI practice
- **Simulated Trades**: Shadow trades count
- **Success Rate**: AI's win percentage

#### 3. Neural Reliance Engine
- **Reliance Score**: 0-100 trust rating
- **Strategy**: supervised → competitive → autonomous
- **Decision Evaluation**: Rate AI suggestions

### How It Works

1. **AI Learns**: The AI makes shadow trades in the background
2. **Performance Tracking**: Both real and simulated trades are tracked
3. **Trust Building**: As AI proves itself, reliance score increases
4. **Strategy Evolution**: System transitions from supervised to autonomous

### Evaluating AI Decisions

Use the evaluation buttons to rate AI suggestions:
- **✅ Better**: AI suggestion was profitable
- **❌ Worse**: AI suggestion lost money

This feedback trains the reliance engine.

---

## 🎮 User Workflow

### Complete Trading Cycle

1. **Lock Position**
   - Use gold/silver/copper input
   - Set quantity
   - Review total investment
   - Confirm

2. **Monitor Position**
   - Status badge shows state
   - Real-time profit tracking
   - AI analysis available
   - Sell recommendations

3. **Sell Position**
   - Click sell button
   - Set price and quantity
   - Confirm transaction
   - Profit recorded

4. **Review Performance**
   - Check realized profit
   - View in Learning Center
   - Track XP and levels
   - Compare with AI

---

## 📈 Performance Metrics

### Real Performance
- Tracks actual trades you complete
- Levels up based on successful flips
- Shows verified profit/loss
- Builds your trading reputation

### AI Simulation
- Runs parallel shadow trades
- Tests strategies without risk
- Learns from market patterns
- Provides recommendations

### Comparison
The Learning Center shows both side-by-side:
- Your real trading skill
- AI's simulated performance
- Trust/reliance score
- Strategy recommendations

---

## 🔧 Technical Implementation

### Store Functions

```typescript
// Add a new position
addPosition(position: Position)

// Update position (for sells)
updatePosition(itemId: number, updates: Partial<Position>)

// Remove position
removePosition(itemId: number)
```

### Sell Modal

The sell modal provides:
- Currency display for sell price
- Quantity selector
- Real-time profit calculation
- Confirmation workflow

### Status Management

Status automatically updates:
- `active` → `partial` when some units sold
- `partial` → `completed` when all units sold
- Realized profit accumulates across sells

---

## 💡 Best Practices

1. **Lock Positions Early**: Record your buys immediately
2. **Use Partial Sells**: Sell in batches to maximize profit
3. **Track Everything**: Even small trades build XP
4. **Review AI Suggestions**: Rate them to improve the system
5. **Check Learning Center**: Monitor your progress regularly

---

## 🎯 Future Enhancements

Planned features:
- Export trade history to CSV
- Profit/loss charts and analytics
- AI-powered sell timing alerts
- Portfolio diversification tracking
- Risk management recommendations

---

## 📝 Notes

- All prices are in copper (1 gold = 10,000 copper)
- 15% Trading Post fee is automatically calculated
- Positions persist across sessions (saved in browser)
- AI simulation runs in background
- No actual API calls for simulated trades
