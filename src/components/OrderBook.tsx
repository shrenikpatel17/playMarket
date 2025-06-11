import { OrderBook as OrderBookType, Order, User } from '@/types/market';

interface OrderBookProps {
  orderBook: OrderBookType;
  users: User[];
}

export default function OrderBook({ orderBook, users }: OrderBookProps) {
  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.name || 'Unknown';
  };

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  const OrderRow = ({ order, type }: { order: Order; type: 'bid' | 'ask' }) => (
    <div className={`flex justify-between items-center py-1 px-2 text-xs rounded ${
      type === 'bid' ? 'bg-green-50 dark:bg-green-900/10' : 'bg-red-50 dark:bg-red-900/10'
    }`}>
      <span className="font-mono">{formatPrice(order.price)}</span>
      <span>{order.amount}</span>
      <span className="text-gray-600 dark:text-gray-400">{getUserName(order.userId)}</span>
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="font-semibold mb-4">Order Book</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {/* YES Orders */}
        <div>
          <h4 className="font-medium text-green-600 mb-2 text-sm">YES</h4>
          
          {/* YES Asks (Sell orders) */}
          <div className="mb-3">
            <div className="text-xs text-gray-500 mb-1 flex justify-between">
              <span>Price</span>
              <span>Size</span>
              <span>User</span>
            </div>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {orderBook.yesAsks.slice(0, 5).map(order => (
                <OrderRow key={order.id} order={order} type="ask" />
              ))}
              {orderBook.yesAsks.length === 0 && (
                <div className="text-xs text-gray-400 text-center py-2">No sell orders</div>
              )}
            </div>
          </div>

          {/* YES Bids (Buy orders) */}
          <div>
            <div className="text-xs text-gray-500 mb-1 flex justify-between">
              <span>Price</span>
              <span>Size</span>
              <span>User</span>
            </div>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {orderBook.yesBids.slice(0, 5).map(order => (
                <OrderRow key={order.id} order={order} type="bid" />
              ))}
              {orderBook.yesBids.length === 0 && (
                <div className="text-xs text-gray-400 text-center py-2">No buy orders</div>
              )}
            </div>
          </div>
        </div>

        {/* NO Orders */}
        <div>
          <h4 className="font-medium text-red-600 mb-2 text-sm">NO</h4>
          
          {/* NO Asks (Sell orders) */}
          <div className="mb-3">
            <div className="text-xs text-gray-500 mb-1 flex justify-between">
              <span>Price</span>
              <span>Size</span>
              <span>User</span>
            </div>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {orderBook.noAsks.slice(0, 5).map(order => (
                <OrderRow key={order.id} order={order} type="ask" />
              ))}
              {orderBook.noAsks.length === 0 && (
                <div className="text-xs text-gray-400 text-center py-2">No sell orders</div>
              )}
            </div>
          </div>

          {/* NO Bids (Buy orders) */}
          <div>
            <div className="text-xs text-gray-500 mb-1 flex justify-between">
              <span>Price</span>
              <span>Size</span>
              <span>User</span>
            </div>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {orderBook.noBids.slice(0, 5).map(order => (
                <OrderRow key={order.id} order={order} type="bid" />
              ))}
              {orderBook.noBids.length === 0 && (
                <div className="text-xs text-gray-400 text-center py-2">No buy orders</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 