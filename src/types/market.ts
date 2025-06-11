export interface User {
  id: string;
  name: string;
  balance: number;
  avatar: string;
  beliefs: Record<string, number>; // marketId -> belief probability (0-1)
  riskTolerance: number; // 0-1, higher = more willing to take risks
  tradingStyle: 'conservative' | 'moderate' | 'aggressive';
  maxOrderSize: number; // Maximum amount willing to trade in single order
  confidenceLevel: number; // 0-1, how confident they are in their beliefs
}

export interface Market {
  id: string;
  question: string;
  description: string;
  endDate: Date;
  totalVolume: number;
  yesPrice: number;
  noPrice: number;
  isActive: boolean;
}

export interface Order {
  id: string;
  userId: string;
  marketId: string;
  side: 'YES' | 'NO';
  type: 'BUY' | 'SELL';
  price: number;
  amount: number;
  timestamp: Date;
  status: 'PENDING' | 'FILLED' | 'CANCELLED';
}

export interface Trade {
  id: string;
  marketId: string;
  buyerId: string;
  sellerId: string;
  side: 'YES' | 'NO';
  price: number;
  amount: number;
  timestamp: Date;
}

export interface OrderBook {
  marketId: string;
  yesBids: Order[];
  yesAsks: Order[];
  noBids: Order[];
  noAsks: Order[];
}

export interface MarketData {
  market: Market;
  orderBook: OrderBook;
  recentTrades: Trade[];
  priceHistory: { timestamp: Date; yesPrice: number; noPrice: number }[];
} 