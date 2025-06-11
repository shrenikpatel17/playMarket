import { Order, Trade, Market } from '@/types/market';
import { useState, useEffect, useMemo } from 'react';

interface SystemMonitorProps {
  orders: Order[];
  trades: Trade[];
  markets: Market[];
  isSimulationRunning: boolean;
}

interface SystemEvent {
  id: string;
  type: 'ORDER_GENERATED' | 'ORDER_MATCHED' | 'PRICE_UPDATE' | 'SYSTEM_INFO';
  message: string;
  details: string;
  timestamp: Date;
  severity: 'info' | 'success' | 'warning';
}

export default function SystemMonitor({ orders, trades, markets, isSimulationRunning }: SystemMonitorProps) {
  const [events, setEvents] = useState<SystemEvent[]>([]);
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const [lastTradeCount, setLastTradeCount] = useState(0);
  const [lastPrices, setLastPrices] = useState<Record<string, { yes: number; no: number }>>({});

  // Monitor order generation
  useEffect(() => {
    if (orders.length > lastOrderCount) {
      const newOrders = orders.slice(lastOrderCount);
      const newEvents: SystemEvent[] = newOrders.map(order => ({
        id: `order-${order.id}`,
        type: 'ORDER_GENERATED',
        message: `New ${order.type} order: ${order.side} @ $${order.price.toFixed(2)}`,
        details: `User ${order.userId} placed a ${order.type} order for ${order.amount} ${order.side} shares at $${order.price.toFixed(2)} per share. Order ID: ${order.id}. Market: ${order.marketId}. The order matching engine will now attempt to find a counterparty.`,
        timestamp: order.timestamp,
        severity: 'info'
      }));

      setEvents(prev => [...prev, ...newEvents].slice(-100));
      setLastOrderCount(orders.length);
    }
  }, [orders.length, lastOrderCount]);

  // Monitor trade execution
  useEffect(() => {
    if (trades.length > lastTradeCount) {
      const newTrades = trades.slice(lastTradeCount);
      const newEvents: SystemEvent[] = newTrades.map(trade => ({
        id: `trade-${trade.id}`,
        type: 'ORDER_MATCHED',
        message: `Trade executed: ${trade.amount} ${trade.side} @ $${trade.price.toFixed(2)}`,
        details: `Order matching successful! Buyer ${trade.buyerId} and Seller ${trade.sellerId} agreed on ${trade.amount} ${trade.side} shares at $${trade.price.toFixed(2)}. The matching algorithm found compatible orders where the buy price >= sell price. Total value: $${(trade.price * trade.amount).toFixed(2)}.`,
        timestamp: trade.timestamp,
        severity: 'success'
      }));

      setEvents(prev => [...prev, ...newEvents].slice(-100));
      setLastTradeCount(trades.length);
    }
  }, [trades.length, lastTradeCount]);

  // Memoize current prices to prevent unnecessary re-renders
  const currentPrices = useMemo(() => {
    const prices: Record<string, { yes: number; no: number }> = {};
    markets.forEach(market => {
      prices[market.id] = { yes: market.yesPrice, no: market.noPrice };
    });
    return prices;
  }, [markets]);

  // Monitor price changes
  useEffect(() => {
    Object.keys(currentPrices).forEach(marketId => {
      const current = currentPrices[marketId];
      const previous = lastPrices[marketId];

      if (previous) {
        const yesChange = current.yes - previous.yes;
        const noChange = current.no - previous.no;

        if (Math.abs(yesChange) > 0.01 || Math.abs(noChange) > 0.01) {
          const market = markets.find(m => m.id === marketId);
          const event: SystemEvent = {
            id: `price-${marketId}-${Date.now()}`,
            type: 'PRICE_UPDATE',
            message: `Price update: ${market?.question.substring(0, 30)}...`,
            details: `Market prices updated based on recent trading activity. YES: $${previous.yes.toFixed(2)} → $${current.yes.toFixed(2)} (${yesChange > 0 ? '+' : ''}${yesChange.toFixed(2)}), NO: $${previous.no.toFixed(2)} → $${current.no.toFixed(2)} (${noChange > 0 ? '+' : ''}${noChange.toFixed(2)}). Price discovery mechanism uses weighted average of recent trades with 30% weight on new trades and 70% on existing price.`,
            timestamp: new Date(),
            severity: 'warning'
          };

          setEvents(prev => [...prev, event].slice(-100));
        }
      }
    });

    setLastPrices(currentPrices);
  }, [currentPrices, lastPrices, markets]);

  // Add system info events
  useEffect(() => {
    if (isSimulationRunning) {
      const interval = setInterval(() => {
        const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
        const filledOrders = orders.filter(o => o.status === 'FILLED').length;
        const totalVolume = trades.reduce((sum, t) => sum + (t.price * t.amount), 0);

        const event: SystemEvent = {
          id: `system-${Date.now()}`,
          type: 'SYSTEM_INFO',
          message: `System Status: ${pendingOrders} pending orders, ${filledOrders} filled`,
          details: `Trading engine status: ${pendingOrders} orders awaiting matching, ${filledOrders} orders successfully filled, ${trades.length} total trades executed, $${totalVolume.toFixed(2)} total volume traded. Order matching runs continuously, checking for price-time priority matches every second.`,
          timestamp: new Date(),
          severity: 'info'
        };

        setEvents(prev => [...prev, event].slice(-100));
      }, 10000); // Every 10 seconds

      return () => clearInterval(interval);
    }
  }, [isSimulationRunning, orders, trades]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const getEventIcon = (type: SystemEvent['type']) => {
    switch (type) {
      case 'ORDER_GENERATED': return '📝';
      case 'ORDER_MATCHED': return '🤝';
      case 'PRICE_UPDATE': return '📈';
      case 'SYSTEM_INFO': return '⚙️';
      default: return '📊';
    }
  };

  const getEventColor = (severity: SystemEvent['severity']) => {
    switch (severity) {
      case 'success': return 'border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20';
      case 'warning': return 'border-orange-200 bg-orange-50 dark:border-orange-700 dark:bg-orange-900/20';
      default: return 'border-blue-200 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">System Monitor</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isSimulationRunning ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-xs text-gray-500">
            {isSimulationRunning ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* Real-time stats */}
      <div className="grid grid-cols-4 gap-3 mb-4 text-xs">
        <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
          <div className="font-medium">Pending Orders</div>
          <div className="text-lg font-bold text-blue-600">
            {orders.filter(o => o.status === 'PENDING').length}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
          <div className="font-medium">Filled Orders</div>
          <div className="text-lg font-bold text-green-600">
            {orders.filter(o => o.status === 'FILLED').length}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
          <div className="font-medium">Total Trades</div>
          <div className="text-lg font-bold text-purple-600">{trades.length}</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
          <div className="font-medium">Match Rate</div>
          <div className="text-lg font-bold text-orange-600">
            {orders.length > 0 ? Math.round((trades.length / orders.length) * 100) : 0}%
          </div>
        </div>
      </div>

      {/* Event log */}
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {events.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <div className="text-lg mb-2">⚡</div>
            <div>System monitoring active</div>
            <div className="text-xs mt-1">Events will appear here as the simulation runs</div>
          </div>
        ) : (
          events.slice().reverse().map((event, index) => (
            <div 
              key={`${event.id}-${index}`} 
              className={`border rounded-lg p-3 ${getEventColor(event.severity)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">{getEventIcon(event.type)}</span>
                  <span className="font-medium text-sm">{event.message}</span>
                </div>
                <span className="text-xs text-gray-500">{formatTime(event.timestamp)}</span>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                {event.details}
              </div>
            </div>
          ))
        )}
      </div>

      {/* System explanation */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
        <div className="text-xs text-gray-600 dark:text-gray-400">
          <div className="font-medium mb-1">How the Intelligent Trading Engine Works:</div>
          <div className="space-y-1">
            <div>• <strong>User Beliefs:</strong> Each trader has personal beliefs about market outcomes (5-95% probability)</div>
            <div>• <strong>Rational Orders:</strong> Users only trade when they see profitable opportunities vs their beliefs</div>
            <div>• <strong>Market Makers:</strong> 30% of orders provide liquidity with bid-ask spreads</div>
            <div>• <strong>Risk Management:</strong> Order sizes based on confidence, risk tolerance, and expected value</div>
            <div>• <strong>Belief Evolution:</strong> User beliefs slowly adjust toward market consensus over time</div>
            <div>• <strong>Price Discovery:</strong> Market prices update based on order book depth and recent trades</div>
            <div>• <strong>Trading Styles:</strong> Conservative, moderate, and aggressive traders with different behaviors</div>
          </div>
        </div>
      </div>
    </div>
  );
} 