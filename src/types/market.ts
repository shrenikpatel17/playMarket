export interface User {
  id: string;
  name: string;
  balance: number;
  avatar: string;
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