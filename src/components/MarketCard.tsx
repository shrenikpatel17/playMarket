import { Market } from '@/types/market';

interface MarketCardProps {
  market: Market;
  isSelected: boolean;
  onClick: () => void;
}

export default function MarketCard({ market, isSelected, onClick }: MarketCardProps) {
  const formatPrice = (price: number) => `$${price.toFixed(2)}`;
  const formatVolume = (volume: number) => {
    if (volume >= 1000000) return `$${(volume / 1000000).toFixed(1)}M`;
    if (volume >= 1000) return `$${(volume / 1000).toFixed(1)}K`;
    return `$${volume}`;
  };

  const daysUntilEnd = Math.ceil((market.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div 
      className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
        isSelected 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
      }`}
      onClick={onClick}
    >
      <div className="mb-3">
        <h3 className="font-semibold text-sm mb-1 line-clamp-2">{market.question}</h3>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {daysUntilEnd} days left • Volume: {formatVolume(market.totalVolume)}
        </p>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <div className="text-center">
            <div className="text-xs text-gray-500">YES</div>
            <div className="text-sm font-bold text-green-600">{formatPrice(market.yesPrice)}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500">NO</div>
            <div className="text-sm font-bold text-red-600">{formatPrice(market.noPrice)}</div>
          </div>
        </div>
        
        <div className="text-xs text-gray-500">
          {market.isActive ? (
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
              Active
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">
              Closed
            </span>
          )}
        </div>
      </div>
    </div>
  );
} 