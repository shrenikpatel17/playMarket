'use client';

import { useState, useEffect } from 'react';
import { User, Market, Order, Trade, OrderBook as OrderBookType } from '@/types/market';
import { 
  generateUsers, 
  generateMarkets, 
  generateIntelligentOrder,
  generateMarketMakerOrder,
  matchOrders, 
  updateMarketPrices, 
  createOrderBook,
  updateUserBeliefs,
  logMarketActivity
} from '@/utils/marketSimulation';
import MarketCard from '@/components/MarketCard';
import OrderBook from '@/components/OrderBook';
import TradeHistory from '@/components/TradeHistory';
import UserList from '@/components/UserList';
import TradeExplanation from '@/components/TradeExplanation';
import SystemMonitor from '@/components/SystemMonitor';
import PriceChart from '@/components/PriceChart';

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [selectedMarketId, setSelectedMarketId] = useState<string>('');
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);

  // Initialize data
  useEffect(() => {
    const initialMarkets = generateMarkets();
    const initialUsers = generateUsers(initialMarkets); // Pass markets to generate beliefs
    
    setUsers(initialUsers);
    setMarkets(initialMarkets);
    setSelectedMarketId(initialMarkets[0]?.id || '');
    
    // Generate some initial intelligent orders and market maker orders
    const initialOrders: Order[] = [];
    
    // Generate 15 intelligent orders
    for (let i = 0; i < 15; i++) {
      const order = generateIntelligentOrder(initialUsers, initialMarkets);
      if (order) {
        initialOrders.push(order);
      }
    }
    
    // Generate 10 market maker orders for liquidity
    for (let i = 0; i < 10; i++) {
      const order = generateMarketMakerOrder(initialUsers, initialMarkets);
      if (order) {
        initialOrders.push(order);
      }
    }
    
    setOrders(initialOrders);
  }, []);

  // Simulation loop
  useEffect(() => {
    if (!isSimulationRunning || users.length === 0 || markets.length === 0) return;

    const interval = setInterval(() => {
      // Generate mix of intelligent orders and market maker orders
      const newOrders: Order[] = [];
      
      // 70% intelligent orders, 30% market maker orders
      const orderCount = Math.floor(Math.random() * 3) + 2; // 2-4 orders per cycle
      
      for (let i = 0; i < orderCount; i++) {
        let order: Order | null = null;
        
        if (Math.random() < 0.7) {
          // Generate intelligent order
          order = generateIntelligentOrder(users, markets);
        } else {
          // Generate market maker order
          order = generateMarketMakerOrder(users, markets);
        }
        
        if (order) {
          newOrders.push(order);
        }
      }

      setOrders(prevOrders => {
        const allOrders = [...prevOrders, ...newOrders];
        
        // Match orders and generate trades
        const { trades: newTrades, updatedOrders } = matchOrders(allOrders);
        
        if (newTrades.length > 0) {
          setTrades(prevTrades => [...prevTrades, ...newTrades]);
          
          // Update market prices based on new trades and current order book
          setMarkets(prevMarkets => 
            prevMarkets.map(market => updateMarketPrices(market, newTrades, updatedOrders))
          );
          
          // Update user beliefs based on market movements
          setUsers(prevUsers => updateUserBeliefs(prevUsers, markets, newTrades));
          
          // Log successful trades
          console.log(`✅ ${newTrades.length} new trades executed!`);
        }
        
        const pendingOrders = updatedOrders.filter(o => o.status === 'PENDING');
        const filledOrders = updatedOrders.filter(o => o.status === 'FILLED');
        
        // Debug logging every 10 cycles
        if (Math.random() < 0.1) {
          logMarketActivity([...pendingOrders, ...filledOrders], trades, users);
        }
        
        return [...pendingOrders, ...filledOrders];
      });
    }, 500); // Slow down to 0.5 seconds to see trades better

    return () => clearInterval(interval);
  }, [isSimulationRunning, users, markets]);

  const selectedMarket = markets.find(m => m.id === selectedMarketId);
  const selectedOrderBook = selectedMarketId ? createOrderBook(orders, selectedMarketId) : null;
  const selectedMarketTrades = trades.filter(t => t.marketId === selectedMarketId);

  const toggleSimulation = () => {
    setIsSimulationRunning(!isSimulationRunning);
  };

  const resetSimulation = () => {
    setIsSimulationRunning(false);
    setOrders([]);
    setTrades([]);
    
    // Reset market prices and regenerate users with new beliefs
    const resetMarkets = generateMarkets();
    const resetUsers = generateUsers(resetMarkets);
    setMarkets(resetMarkets);
    setUsers(resetUsers);
    setSelectedMarketId(resetMarkets[0]?.id || '');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                PolyMarket Simulation
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Real-time prediction market trading simulation with detailed analysis
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={toggleSimulation}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isSimulationRunning
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isSimulationRunning ? 'Stop Simulation' : 'Start Simulation'}
              </button>
              
              <button
                onClick={resetSimulation}
                className="px-4 py-2 rounded-lg font-medium bg-gray-600 hover:bg-gray-700 text-white transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
          
          {/* Status indicators */}
          <div className="flex items-center space-x-6 mt-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isSimulationRunning ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-gray-600 dark:text-gray-400">
                Simulation {isSimulationRunning ? 'Running' : 'Stopped'}
              </span>
            </div>
            <span className="text-gray-600 dark:text-gray-400">
              Total Orders: {orders.length} ({orders.filter(o => o.status === 'PENDING').length} pending)
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              Total Trades: {trades.length}
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              Active Markets: {markets.length}
            </span>
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left sidebar - Markets and Users */}
          <div className="col-span-3 space-y-6">
            {/* Markets */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h2 className="font-semibold mb-4">Markets</h2>
              <div className="space-y-3">
                {markets.map(market => (
                  <MarketCard
                    key={market.id}
                    market={market}
                    isSelected={market.id === selectedMarketId}
                    onClick={() => setSelectedMarketId(market.id)}
                  />
                ))}
              </div>
            </div>

            {/* Users */}
            <UserList users={users} />
          </div>

          {/* Center - Market details, price chart, and order book */}
          <div className="col-span-6">
            {selectedMarket && (
              <div className="space-y-6">
                {/* Market details */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h2 className="text-xl font-semibold mb-2">{selectedMarket.question}</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{selectedMarket.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">${selectedMarket.yesPrice.toFixed(2)}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">YES</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">${selectedMarket.noPrice.toFixed(2)}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">NO</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Volume: ${selectedMarket.totalVolume.toLocaleString()}</span>
                    <span>Ends: {selectedMarket.endDate.toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Price Chart */}
                <PriceChart market={selectedMarket} trades={selectedMarketTrades} />

                {/* Order book */}
                {selectedOrderBook && (
                  <OrderBook orderBook={selectedOrderBook} users={users} />
                )}

                {/* Trade history */}
                <TradeHistory trades={selectedMarketTrades} users={users} />
              </div>
            )}
          </div>

          {/* Right sidebar - Analysis and Monitoring */}
          <div className="col-span-3 space-y-6">
            {/* System Monitor */}
            <SystemMonitor 
              orders={orders}
              trades={trades}
              markets={markets}
              isSimulationRunning={isSimulationRunning}
            />
          </div>
        </div>

        {/* Bottom section - Trade Analysis */}
        <div className="mt-6">
          <TradeExplanation 
            trades={trades}
            orders={orders}
            users={users}
            markets={markets}
            isSimulationRunning={isSimulationRunning}
          />
        </div>
      </div>
    </div>
  );
}
