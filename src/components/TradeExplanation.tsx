import { Trade, Order, User, Market } from '@/types/market';
import { useState, useEffect, useCallback } from 'react';

interface TradeExplanationProps {
  trades: Trade[];
  orders: Order[];
  users: User[];
  markets: Market[];
  isSimulationRunning: boolean;
}

interface TradeExplanation {
  trade: Trade;
  explanation: string;
  orderMatchingDetails: string;
  priceImpact: string;
  marketContext: string;
  timestamp: Date;
}

export default function TradeExplanation({ trades, orders, users, markets, isSimulationRunning }: TradeExplanationProps) {
  const [explanations, setExplanations] = useState<TradeExplanation[]>([]);
  const [lastTradeCount, setLastTradeCount] = useState(0);

  const getUserName = (userId: string) => users.find(u => u.id === userId)?.name || 'Unknown';
  const getMarket = (marketId: string) => markets.find(m => m.id === marketId);

  // Generate explanation for a trade - memoized to prevent infinite re-renders
  const generateTradeExplanation = useCallback((trade: Trade): TradeExplanation => {
    const buyer = users.find(u => u.id === trade.buyerId);
    const seller = users.find(u => u.id === trade.sellerId);
    const market = getMarket(trade.marketId);
    
    if (!buyer || !seller || !market) {
      return {
        trade,
        explanation: "Trade data incomplete",
        orderMatchingDetails: "",
        priceImpact: "",
        marketContext: "",
        timestamp: new Date()
      };
    }

    // Find related orders (approximate based on timing and users)
    const recentOrders = orders.filter(o => 
      o.marketId === trade.marketId && 
      o.side === trade.side &&
      Math.abs(o.timestamp.getTime() - trade.timestamp.getTime()) < 5000 // Within 5 seconds
    );

    const buyOrders = recentOrders.filter(o => o.type === 'BUY' && o.userId === trade.buyerId);
    const sellOrders = recentOrders.filter(o => o.type === 'SELL' && o.userId === trade.sellerId);

    // Main explanation
    const explanation = `${buyer.name} bought ${trade.amount} ${trade.side} shares from ${seller.name} at $${trade.price.toFixed(2)} per share. Total transaction value: $${(trade.price * trade.amount).toFixed(2)}.`;

    // Order matching details
    const orderMatchingDetails = `Order Matching Process: The trading engine found a buy order from ${buyer.name} willing to pay at least $${trade.price.toFixed(2)} and a sell order from ${seller.name} asking for at most $${trade.price.toFixed(2)}. Since the buy price met or exceeded the sell price, the orders were matched automatically. The final trade price was set as the midpoint between the two orders.`;

    // Price impact analysis
    const currentPrice = trade.side === 'YES' ? market.yesPrice : market.noPrice;
    const priceDirection = trade.price > currentPrice ? 'upward' : trade.price < currentPrice ? 'downward' : 'neutral';
    const priceImpact = `Price Impact: This trade occurred at $${trade.price.toFixed(2)}, which is ${Math.abs(((trade.price - currentPrice) / currentPrice) * 100).toFixed(1)}% ${priceDirection === 'upward' ? 'above' : priceDirection === 'downward' ? 'below' : 'equal to'} the current market price of $${currentPrice.toFixed(2)}. Market prices are determined by the spread between the highest buy orders and lowest sell orders in the order book, creating efficient price discovery through supply and demand.`;

    // Market context
    const totalVolume = trades.filter(t => t.marketId === trade.marketId).reduce((sum, t) => sum + (t.price * t.amount), 0);
    const recentTrades = trades.filter(t => t.marketId === trade.marketId).slice(-10);
    const avgRecentPrice = recentTrades.length > 0 ? recentTrades.reduce((sum, t) => sum + t.price, 0) / recentTrades.length : trade.price;
    
    const marketContext = `Market Context: "${market.question}" - This market has seen $${totalVolume.toFixed(2)} in total volume. The average price of the last 10 trades was $${avgRecentPrice.toFixed(2)}. Current market sentiment shows ${trade.side} shares trading at $${currentPrice.toFixed(2)}, suggesting ${currentPrice > 0.5 ? 'bullish' : 'bearish'} sentiment on this outcome.`;

    return {
      trade,
      explanation,
      orderMatchingDetails,
      priceImpact,
      marketContext,
      timestamp: new Date()
    };
  }, [users, markets, orders, trades]);

  // Monitor for new trades and generate explanations
  useEffect(() => {
    if (trades.length > lastTradeCount) {
      const newTrades = trades.slice(lastTradeCount);
      const newExplanations = newTrades.map(generateTradeExplanation);
      
      setExplanations(prev => [...prev, ...newExplanations].slice(-50)); // Keep last 50 explanations
      setLastTradeCount(trades.length);
    }
  }, [trades.length, lastTradeCount, generateTradeExplanation]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Live Trading Analysis</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isSimulationRunning ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-xs text-gray-500">
            {isSimulationRunning ? 'Analyzing trades...' : 'Simulation paused'}
          </span>
        </div>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {explanations.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <div className="text-lg mb-2">🔍</div>
            <div>No trades to analyze yet</div>
            <div className="text-xs mt-1">Start the simulation to see detailed trade explanations</div>
          </div>
        ) : (
          explanations.slice().reverse().map((exp, index) => (
            <div key={`${exp.trade.id}-${index}`} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 space-y-3">
              {/* Trade Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    exp.trade.side === 'YES' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {exp.trade.side}
                  </span>
                  <span className="font-mono font-semibold">${exp.trade.price.toFixed(2)}</span>
                  <span className="text-gray-600 dark:text-gray-400">×{exp.trade.amount}</span>
                </div>
                <span className="text-xs text-gray-500">{formatTime(exp.trade.timestamp)}</span>
              </div>

              {/* Main Explanation */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                <div className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">Trade Summary</div>
                <div className="text-sm text-blue-700 dark:text-blue-400">{exp.explanation}</div>
              </div>

              {/* Order Matching Details */}
              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded">
                <div className="text-sm font-medium text-purple-800 dark:text-purple-300 mb-1">Order Matching Logic</div>
                <div className="text-sm text-purple-700 dark:text-purple-400">{exp.orderMatchingDetails}</div>
              </div>

              {/* Price Impact */}
              <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded">
                <div className="text-sm font-medium text-orange-800 dark:text-orange-300 mb-1">Price Impact Analysis</div>
                <div className="text-sm text-orange-700 dark:text-orange-400">{exp.priceImpact}</div>
              </div>

              {/* Market Context */}
              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded">
                <div className="text-sm font-medium text-gray-800 dark:text-gray-300 mb-1">Market Context</div>
                <div className="text-sm text-gray-700 dark:text-gray-400">{exp.marketContext}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Trading Statistics */}
      {explanations.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium text-gray-800 dark:text-gray-300">Trades Analyzed</div>
              <div className="text-gray-600 dark:text-gray-400">{explanations.length}</div>
            </div>
            <div>
              <div className="font-medium text-gray-800 dark:text-gray-300">Avg Trade Size</div>
              <div className="text-gray-600 dark:text-gray-400">
                {explanations.length > 0 
                  ? Math.round(explanations.reduce((sum, exp) => sum + exp.trade.amount, 0) / explanations.length)
                  : 0
                } shares
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 