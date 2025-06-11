import { User, Market, Order, Trade, OrderBook, MarketData } from '@/types/market';

// Generate mock users
export const generateUsers = (): User[] => {
  const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry', 'Ivy', 'Jack'];
  return names.map((name, index) => ({
    id: `user-${index + 1}`,
    name,
    balance: Math.floor(Math.random() * 10000) + 5000,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
  }));
};

// Generate mock markets
export const generateMarkets = (): Market[] => {
  const questions = [
    {
      question: "Will Bitcoin reach $100,000 by end of 2024?",
      description: "Market resolves YES if Bitcoin (BTC) reaches or exceeds $100,000 USD at any point before January 1, 2025."
    },
    {
      question: "Will AI achieve AGI by 2025?",
      description: "Market resolves YES if a widely recognized AI system demonstrates general intelligence capabilities by December 31, 2025."
    },
    {
      question: "Will SpaceX land humans on Mars by 2030?",
      description: "Market resolves YES if SpaceX successfully lands human astronauts on Mars before January 1, 2030."
    }
  ];

  return questions.map((q, index) => {
    // Generate YES price between 0.20 and 0.80, then NO = 1 - YES
    const yesPrice = 0.20 + Math.random() * 0.60;
    const noPrice = 1.00 - yesPrice;
    
    return {
      id: `market-${index + 1}`,
      question: q.question,
      description: q.description,
      endDate: new Date(Date.now() + (30 + index * 10) * 24 * 60 * 60 * 1000),
      totalVolume: Math.floor(Math.random() * 100000) + 50000,
      yesPrice: Math.round(yesPrice * 100) / 100,
      noPrice: Math.round(noPrice * 100) / 100,
      isActive: true
    };
  });
};

// Generate random order
export const generateRandomOrder = (users: User[], markets: Market[]): Order => {
  const user = users[Math.floor(Math.random() * users.length)];
  const market = markets[Math.floor(Math.random() * markets.length)];
  const side = Math.random() > 0.5 ? 'YES' : 'NO';
  const type = Math.random() > 0.5 ? 'BUY' : 'SELL';
  
  const basePrice = side === 'YES' ? market.yesPrice : market.noPrice;
  
  // Generate price variation that respects the $1.00 constraint
  let price: number;
  if (side === 'YES') {
    // YES price should be between 0.01 and 0.99, but consider current market
    const variation = (Math.random() - 0.5) * 0.2; // ±10% variation
    price = Math.max(0.01, Math.min(0.99, basePrice + variation));
  } else {
    // NO price should complement YES price (sum to ~1.00)
    const variation = (Math.random() - 0.5) * 0.2; // ±10% variation
    price = Math.max(0.01, Math.min(0.99, basePrice + variation));
  }
  
  return {
    id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId: user.id,
    marketId: market.id,
    side,
    type,
    price: Math.round(price * 100) / 100,
    amount: Math.floor(Math.random() * 1000) + 100,
    timestamp: new Date(),
    status: 'PENDING'
  };
};

// Simple order matching logic
export const matchOrders = (orders: Order[]): { trades: Trade[], updatedOrders: Order[] } => {
  const trades: Trade[] = [];
  const updatedOrders = [...orders];
  
  // Group orders by market and side
  const ordersByMarket = updatedOrders.reduce((acc, order) => {
    if (!acc[order.marketId]) {
      acc[order.marketId] = { YES: { BUY: [], SELL: [] }, NO: { BUY: [], SELL: [] } };
    }
    if (order.status === 'PENDING') {
      acc[order.marketId][order.side][order.type].push(order);
    }
    return acc;
  }, {} as Record<string, { YES: { BUY: Order[], SELL: Order[] }, NO: { BUY: Order[], SELL: Order[] } }>);

  // Match orders for each market
  Object.keys(ordersByMarket).forEach(marketId => {
    const marketOrders = ordersByMarket[marketId];
    
    // Match YES orders
    matchSideOrders(marketOrders.YES.BUY, marketOrders.YES.SELL, 'YES', trades);
    // Match NO orders
    matchSideOrders(marketOrders.NO.BUY, marketOrders.NO.SELL, 'NO', trades);
  });

  return { trades, updatedOrders };
};

const matchSideOrders = (buyOrders: Order[], sellOrders: Order[], side: 'YES' | 'NO', trades: Trade[]) => {
  // Sort buy orders by price (highest first), sell orders by price (lowest first)
  buyOrders.sort((a, b) => b.price - a.price);
  sellOrders.sort((a, b) => a.price - b.price);

  for (const buyOrder of buyOrders) {
    for (const sellOrder of sellOrders) {
      if (buyOrder.price >= sellOrder.price && buyOrder.status === 'PENDING' && sellOrder.status === 'PENDING') {
        const tradeAmount = Math.min(buyOrder.amount, sellOrder.amount);
        const tradePrice = (buyOrder.price + sellOrder.price) / 2;

        trades.push({
          id: `trade-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          marketId: buyOrder.marketId,
          buyerId: buyOrder.userId,
          sellerId: sellOrder.userId,
          side,
          price: Math.round(tradePrice * 100) / 100,
          amount: tradeAmount,
          timestamp: new Date()
        });

        // Update order amounts
        buyOrder.amount -= tradeAmount;
        sellOrder.amount -= tradeAmount;

        // Mark orders as filled if amount is 0
        if (buyOrder.amount === 0) buyOrder.status = 'FILLED';
        if (sellOrder.amount === 0) sellOrder.status = 'FILLED';
      }
    }
  }
};

// Update market prices based on order book spreads (highest buy and lowest sell)
export const updateMarketPrices = (market: Market, recentTrades: Trade[], allOrders: Order[]): Market => {
  // Get current order book for this market
  const marketOrders = allOrders.filter(order => order.marketId === market.id && order.status === 'PENDING');
  
  let newYesPrice = market.yesPrice;
  let newNoPrice = market.noPrice;

  // Calculate YES price from order book
  const yesBuyOrders = marketOrders.filter(o => o.side === 'YES' && o.type === 'BUY').sort((a, b) => b.price - a.price);
  const yesSellOrders = marketOrders.filter(o => o.side === 'YES' && o.type === 'SELL').sort((a, b) => a.price - b.price);
  
  if (yesBuyOrders.length > 0 && yesSellOrders.length > 0) {
    const highestBuy = yesBuyOrders[0].price;
    const lowestSell = yesSellOrders[0].price;
    newYesPrice = (highestBuy + lowestSell) / 2;
  } else if (yesBuyOrders.length > 0) {
    // Only buy orders, price tends toward highest buy
    newYesPrice = yesBuyOrders[0].price * 0.95; // Slightly below highest buy
  } else if (yesSellOrders.length > 0) {
    // Only sell orders, price tends toward lowest sell
    newYesPrice = yesSellOrders[0].price * 1.05; // Slightly above lowest sell
  }

  // Calculate NO price from order book
  const noBuyOrders = marketOrders.filter(o => o.side === 'NO' && o.type === 'BUY').sort((a, b) => b.price - a.price);
  const noSellOrders = marketOrders.filter(o => o.side === 'NO' && o.type === 'SELL').sort((a, b) => a.price - b.price);
  
  if (noBuyOrders.length > 0 && noSellOrders.length > 0) {
    const highestBuy = noBuyOrders[0].price;
    const lowestSell = noSellOrders[0].price;
    newNoPrice = (highestBuy + lowestSell) / 2;
  } else if (noBuyOrders.length > 0) {
    // Only buy orders, price tends toward highest buy
    newNoPrice = noBuyOrders[0].price * 0.95; // Slightly below highest buy
  } else if (noSellOrders.length > 0) {
    // Only sell orders, price tends toward lowest sell
    newNoPrice = noSellOrders[0].price * 1.05; // Slightly above lowest sell
  }

  // Ensure YES + NO prices sum to approximately $1.00 (prediction market constraint)
  const totalPrice = newYesPrice + newNoPrice;
  if (totalPrice > 0) {
    // Normalize prices to sum to $1.00
    newYesPrice = newYesPrice / totalPrice;
    newNoPrice = newNoPrice / totalPrice;
  }

  // Ensure prices stay within bounds
  newYesPrice = Math.max(0.01, Math.min(0.99, newYesPrice));
  newNoPrice = Math.max(0.01, Math.min(0.99, newNoPrice));

  // Final adjustment to ensure they sum to 1.00
  const finalTotal = newYesPrice + newNoPrice;
  if (Math.abs(finalTotal - 1.0) > 0.01) {
    // If they don't sum to 1, adjust proportionally
    newYesPrice = newYesPrice / finalTotal;
    newNoPrice = newNoPrice / finalTotal;
  }

  // Calculate volume from recent trades
  const marketTrades = recentTrades.filter(trade => trade.marketId === market.id);
  const additionalVolume = marketTrades.reduce((sum, t) => sum + t.amount, 0);

  return {
    ...market,
    yesPrice: Math.round(newYesPrice * 100) / 100,
    noPrice: Math.round(newNoPrice * 100) / 100,
    totalVolume: market.totalVolume + additionalVolume
  };
};

// Create order book from orders
export const createOrderBook = (orders: Order[], marketId: string): OrderBook => {
  const marketOrders = orders.filter(order => order.marketId === marketId && order.status === 'PENDING');
  
  return {
    marketId,
    yesBids: marketOrders.filter(o => o.side === 'YES' && o.type === 'BUY').sort((a, b) => b.price - a.price),
    yesAsks: marketOrders.filter(o => o.side === 'YES' && o.type === 'SELL').sort((a, b) => a.price - b.price),
    noBids: marketOrders.filter(o => o.side === 'NO' && o.type === 'BUY').sort((a, b) => b.price - a.price),
    noAsks: marketOrders.filter(o => o.side === 'NO' && o.type === 'SELL').sort((a, b) => a.price - b.price)
  };
}; 