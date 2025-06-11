import { Market, Trade } from '@/types/market';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useMemo } from 'react';

interface PriceChartProps {
  market: Market;
  trades: Trade[];
}

interface PricePoint {
  timestamp: string;
  time: number;
  yesPrice: number;
  noPrice: number;
  volume: number;
}

export default function PriceChart({ market, trades }: PriceChartProps) {
  // Generate price history that reflects the actual market pricing updates
  const priceHistory = useMemo(() => {
    const marketTrades = trades.filter(t => t.marketId === market.id);
    
    if (marketTrades.length === 0) {
      // If no trades, show initial prices
      return [{
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        time: Date.now(),
        yesPrice: market.yesPrice,
        noPrice: market.noPrice,
        volume: 0
      }];
    }

    // Create price points based on actual market price updates
    // Since prices are now determined by order book spreads, we'll track the market's actual price evolution
    const pricePoints: PricePoint[] = [];
    
    // Add initial price point
    const firstTrade = marketTrades[0];
    const startTime = new Date(firstTrade.timestamp.getTime() - 60000); // 1 minute before first trade
    pricePoints.push({
      timestamp: startTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      time: startTime.getTime(),
      yesPrice: market.yesPrice,
      noPrice: market.noPrice,
      volume: 0
    });

    // Group trades by time intervals to show price evolution
    const timeIntervals: { [key: string]: Trade[] } = {};
    marketTrades.forEach(trade => {
      const timeKey = trade.timestamp.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
      if (!timeIntervals[timeKey]) {
        timeIntervals[timeKey] = [];
      }
      timeIntervals[timeKey].push(trade);
    });

    // Process each time interval to create price points
    // This simulates how the order book-based pricing would evolve
    let currentYesPrice = market.yesPrice;
    let currentNoPrice = market.noPrice;

    Object.keys(timeIntervals).sort().forEach(timeKey => {
      const intervalTrades = timeIntervals[timeKey];
      
      // Simulate order book impact: trades indicate where orders were matched
      // This affects the spread and thus the market price (mean of highest buy/lowest sell)
      intervalTrades.forEach(trade => {
        if (trade.side === 'YES') {
          // YES trade suggests YES demand, which would affect the order book spread
          // Simulate the effect of this on the market price
          const priceInfluence = 0.1; // How much each trade influences the price
          currentYesPrice = currentYesPrice * (1 - priceInfluence) + trade.price * priceInfluence;
        } else {
          // NO trade affects NO price
          const priceInfluence = 0.1;
          currentNoPrice = currentNoPrice * (1 - priceInfluence) + trade.price * priceInfluence;
        }
      });

      // Ensure prices sum to 1.00 (prediction market constraint)
      const total = currentYesPrice + currentNoPrice;
      if (total > 0) {
        currentYesPrice = currentYesPrice / total;
        currentNoPrice = currentNoPrice / total;
      }

      // Ensure bounds
      currentYesPrice = Math.max(0.01, Math.min(0.99, currentYesPrice));
      currentNoPrice = Math.max(0.01, Math.min(0.99, currentNoPrice));

      // Add price point
      const totalVolume = intervalTrades.reduce((sum, t) => sum + t.amount, 0);
      pricePoints.push({
        timestamp: timeKey,
        time: intervalTrades[0].timestamp.getTime(),
        yesPrice: Math.round(currentYesPrice * 100) / 100,
        noPrice: Math.round(currentNoPrice * 100) / 100,
        volume: totalVolume
      });
    });

    // Keep only last 30 points for readability
    return pricePoints.slice(-30);
  }, [market, trades]);

  const formatPrice = (value: number) => `$${value.toFixed(2)}`;
  const formatTooltip = (value: any, name: string) => {
    if (name === 'volume') return [value, 'Volume'];
    return [formatPrice(value), name === 'yesPrice' ? 'YES Price' : 'NO Price'];
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Price History</h3>
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-0.5 bg-green-500"></div>
            <span className="text-gray-600 dark:text-gray-400">YES</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-0.5 bg-red-500"></div>
            <span className="text-gray-600 dark:text-gray-400">NO</span>
          </div>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={priceHistory} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="timestamp" 
              tick={{ fontSize: 10 }}
              interval="preserveStartEnd"
              className="text-gray-600 dark:text-gray-400"
            />
            <YAxis 
              domain={[0, 1]}
              tick={{ fontSize: 10 }}
              tickFormatter={formatPrice}
              className="text-gray-600 dark:text-gray-400"
            />
            <Tooltip 
              formatter={formatTooltip}
              labelStyle={{ color: 'var(--foreground)' }}
              contentStyle={{ 
                backgroundColor: 'var(--background)', 
                border: '1px solid var(--border)',
                borderRadius: '6px'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="yesPrice" 
              stroke="#10b981" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, stroke: '#10b981', strokeWidth: 2 }}
              name="YES Price"
            />
            <Line 
              type="monotone" 
              dataKey="noPrice" 
              stroke="#ef4444" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, stroke: '#ef4444', strokeWidth: 2 }}
              name="NO Price"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 