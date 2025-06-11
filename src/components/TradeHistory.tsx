import { Trade, User } from '@/types/market';

interface TradeHistoryProps {
  trades: Trade[];
  users: User[];
}

export default function TradeHistory({ trades, users }: TradeHistoryProps) {
  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.name || 'Unknown';
  };

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const recentTrades = trades.slice(-20).reverse(); // Show last 20 trades, most recent first

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="font-semibold mb-4">Recent Trades</h3>
      
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {recentTrades.length === 0 ? (
          <div className="text-center text-gray-500 py-4">No trades yet</div>
        ) : (
          recentTrades.map(trade => (
            <div 
              key={trade.id} 
              className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-sm"
            >
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  trade.side === 'YES' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                  {trade.side}
                </span>
                <span className="font-mono font-semibold">{formatPrice(trade.price)}</span>
                <span className="text-gray-600 dark:text-gray-400">×{trade.amount}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span>{getUserName(trade.buyerId)} ↔ {getUserName(trade.sellerId)}</span>
                <span>{formatTime(trade.timestamp)}</span>
              </div>
            </div>
          ))
        )}
      </div>
      
      {trades.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Total Trades: {trades.length}</span>
            <span>
              Volume: ${trades.reduce((sum, trade) => sum + (trade.price * trade.amount), 0).toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
} 