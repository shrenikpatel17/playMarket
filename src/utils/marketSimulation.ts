import { User, Market, Order, Trade, OrderBook, MarketData } from '@/types/market';

// Generate mock users with beliefs and trading characteristics
export const generateUsers = (markets: Market[] = []): User[] => {
  const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry', 'Ivy', 'Jack'];
  const tradingStyles: ('conservative' | 'moderate' | 'aggressive')[] = ['conservative', 'moderate', 'aggressive'];
  
  return names.map((name, index) => {
    // Generate beliefs for each market with much more diversity
    const beliefs: Record<string, number> = {};
    markets.forEach((market, marketIndex) => {
      // Create distinct user archetypes with very different beliefs
      let baseBelief: number;
      
      switch (index % 5) {
        case 0: // Very optimistic users
          baseBelief = 0.75 + Math.random() * 0.2; // 75-95%
          break;
        case 1: // Very pessimistic users  
          baseBelief = 0.05 + Math.random() * 0.2; // 5-25%
          break;
        case 2: // Moderate optimistic
          baseBelief = 0.55 + Math.random() * 0.2; // 55-75%
          break;
        case 3: // Moderate pessimistic
          baseBelief = 0.25 + Math.random() * 0.2; // 25-45%
          break;
        case 4: // Neutral with slight variation
          baseBelief = 0.45 + Math.random() * 0.1; // 45-55%
          break;
        default:
          baseBelief = 0.5;
      }
      
      // Add some market-specific variation
      const marketVariation = (Math.sin(marketIndex + index) * 0.15); // -15% to +15%
      baseBelief = Math.max(0.05, Math.min(0.95, baseBelief + marketVariation));
      
      beliefs[market.id] = Math.round(baseBelief * 100) / 100;
    });

    const riskTolerance = Math.random(); // 0-1
    const tradingStyle = tradingStyles[index % 3];
    const baseBalance = Math.floor(Math.random() * 10000) + 5000;
    
    // Max order size based on balance and risk tolerance
    const maxOrderSize = Math.floor(baseBalance * (0.05 + riskTolerance * 0.25)); // 5-30% of balance
    
    return {
      id: `user-${index + 1}`,
      name,
      balance: baseBalance,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      beliefs,
      riskTolerance,
      tradingStyle,
      maxOrderSize,
      confidenceLevel: 0.4 + Math.random() * 0.5 // 40-90% confidence
    };
  });
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

// Generate intelligent order based on user beliefs and market analysis
export const generateIntelligentOrder = (users: User[], markets: Market[]): Order | null => {
  // Select a random user
  const user = users[Math.floor(Math.random() * users.length)];
  
  // Find markets where user has strong opinions (belief differs significantly from market price)
  const opportunities = markets.map(market => {
    const userBelief = user.beliefs[market.id] || 0.5;
    const marketImpliedProb = market.yesPrice; // Market price implies probability
    
    // Calculate expected value for YES and NO positions
    const yesExpectedValue = userBelief - market.yesPrice; // Profit if user is right about YES
    const noExpectedValue = (1 - userBelief) - market.noPrice; // Profit if user is right about NO
    
    return {
      market,
      userBelief,
      marketImpliedProb,
      yesExpectedValue,
      noExpectedValue,
      maxExpectedValue: Math.max(yesExpectedValue, noExpectedValue),
      bestSide: yesExpectedValue > noExpectedValue ? 'YES' : 'NO'
    };
  }).filter(opp => Math.abs(opp.maxExpectedValue) > 0.02); // Lower threshold for trading (2% edge)

  // If no opportunities, sometimes don't trade, but be more willing to trade
  if (opportunities.length === 0 || Math.random() > (user.riskTolerance * 0.8 + 0.2)) {
    return null;
  }

  // Sort by expected value and confidence
  opportunities.sort((a, b) => Math.abs(b.maxExpectedValue) * user.confidenceLevel - Math.abs(a.maxExpectedValue) * user.confidenceLevel);
  
  const selectedOpportunity = opportunities[0];
  const market = selectedOpportunity.market;
  const side = selectedOpportunity.bestSide as 'YES' | 'NO';
  
  // Determine if buying or selling based on user's belief vs market price
  let type: 'BUY' | 'SELL';
  let targetPrice: number;
  
  if (side === 'YES') {
    if (selectedOpportunity.userBelief > selectedOpportunity.marketImpliedProb) {
      // User thinks YES is underpriced, so BUY YES
      type = 'BUY';
      // Be more aggressive with pricing to ensure trades happen
      const maxWillingToPay = Math.min(0.95, selectedOpportunity.userBelief * (0.8 + user.confidenceLevel * 0.2));
      targetPrice = market.yesPrice + (maxWillingToPay - market.yesPrice) * 0.7; // More aggressive
    } else {
      // User thinks YES is overpriced, so SELL YES
      type = 'SELL';
      // Be more aggressive with pricing
      const minWillingToSell = Math.max(0.05, selectedOpportunity.userBelief * (1.2 - user.confidenceLevel * 0.2));
      targetPrice = Math.max(market.yesPrice * 0.95, minWillingToSell); // Slightly below market
    }
  } else {
    // Similar logic for NO
    if ((1 - selectedOpportunity.userBelief) > market.noPrice) {
      type = 'BUY';
      const maxWillingToPay = Math.min(0.95, (1 - selectedOpportunity.userBelief) * (0.8 + user.confidenceLevel * 0.2));
      targetPrice = market.noPrice + (maxWillingToPay - market.noPrice) * 0.7;
    } else {
      type = 'SELL';
      const minWillingToSell = Math.max(0.05, (1 - selectedOpportunity.userBelief) * (1.2 - user.confidenceLevel * 0.2));
      targetPrice = Math.max(market.noPrice * 0.95, minWillingToSell);
    }
  }

  // Ensure price is within bounds
  targetPrice = Math.max(0.01, Math.min(0.99, targetPrice));

  // Calculate order size based on confidence, risk tolerance, and expected value
  const baseOrderSize = user.maxOrderSize * user.confidenceLevel * Math.abs(selectedOpportunity.maxExpectedValue) * 2; // More aggressive sizing
  let orderSize: number;
  
  switch (user.tradingStyle) {
    case 'conservative':
      orderSize = Math.floor(baseOrderSize * 0.6);
      break;
    case 'moderate':
      orderSize = Math.floor(baseOrderSize * 0.8);
      break;
    case 'aggressive':
      orderSize = Math.floor(baseOrderSize * 1.2);
      break;
  }

  // Ensure reasonable order size and don't exceed balance
  orderSize = Math.max(100, Math.min(orderSize, user.balance * 0.5)); // Increased max to 50% of balance

  return {
    id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId: user.id,
    marketId: market.id,
    side,
    type,
    price: Math.round(targetPrice * 100) / 100,
    amount: orderSize,
    timestamp: new Date(),
    status: 'PENDING'
  };
};

// Keep the old function for backward compatibility, but mark as deprecated
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

// Update user beliefs based on market movements and new information
export const updateUserBeliefs = (users: User[], markets: Market[], recentTrades: Trade[]): User[] => {
  return users.map(user => {
    const updatedBeliefs = { ...user.beliefs };
    
    markets.forEach(market => {
      const currentBelief = user.beliefs[market.id] || 0.5;
      const marketPrice = market.yesPrice;
      
      // Users slowly adjust their beliefs toward market consensus, but maintain some independence
      const marketInfluence = 0.05; // 5% adjustment toward market price each update
      const personalityFactor = user.confidenceLevel; // More confident users resist market influence
      
      // Calculate how much to adjust belief toward market price
      const adjustment = (marketPrice - currentBelief) * marketInfluence * (1 - personalityFactor);
      
      // Add some random noise based on "new information"
      const randomNoise = (Math.random() - 0.5) * 0.02; // ±1% random adjustment
      
      // Update belief
      let newBelief = currentBelief + adjustment + randomNoise;
      
      // Keep beliefs within reasonable bounds
      newBelief = Math.max(0.05, Math.min(0.95, newBelief));
      
      updatedBeliefs[market.id] = newBelief;
    });
    
    return {
      ...user,
      beliefs: updatedBeliefs
    };
  });
};

// Generate market maker orders to provide liquidity
export const generateMarketMakerOrder = (users: User[], markets: Market[]): Order | null => {
  // Select a user to act as market maker (prefer users with higher balances)
  const sortedUsers = users.sort((a, b) => b.balance - a.balance);
  const marketMaker = sortedUsers[Math.floor(Math.random() * Math.min(3, sortedUsers.length))]; // Top 3 users
  
  const market = markets[Math.floor(Math.random() * markets.length)];
  const side = Math.random() > 0.5 ? 'YES' : 'NO';
  
  // Market makers provide liquidity by placing orders slightly away from current market price
  const currentPrice = side === 'YES' ? market.yesPrice : market.noPrice;
  const spread = 0.02 + Math.random() * 0.03; // 2-5% spread
  
  let type: 'BUY' | 'SELL';
  let price: number;
  
  if (Math.random() > 0.5) {
    // Place a buy order below market price
    type = 'BUY';
    price = Math.max(0.01, currentPrice - spread);
  } else {
    // Place a sell order above market price
    type = 'SELL';
    price = Math.min(0.99, currentPrice + spread);
  }
  
  // Market makers use smaller, consistent order sizes
  const orderSize = Math.floor(marketMaker.balance * 0.02) + 200; // 2% of balance + base amount
  
  return {
    id: `mm-order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId: marketMaker.id,
    marketId: market.id,
    side,
    type,
    price: Math.round(price * 100) / 100,
    amount: Math.min(orderSize, marketMaker.balance * 0.1),
    timestamp: new Date(),
    status: 'PENDING'
  };
};

// Debug function to log order and trade information
export const logMarketActivity = (orders: Order[], trades: Trade[], users: User[]) => {
  const pendingOrders = orders.filter(o => o.status === 'PENDING');
  const recentTrades = trades.slice(-5); // Last 5 trades
  
  console.log('=== Market Activity Debug ===');
  console.log(`Pending Orders: ${pendingOrders.length}`);
  console.log(`Total Trades: ${trades.length}`);
  
  if (pendingOrders.length > 0) {
    console.log('Sample Pending Orders:');
    pendingOrders.slice(0, 3).forEach(order => {
      const user = users.find(u => u.id === order.userId);
      console.log(`  ${user?.name}: ${order.type} ${order.side} at $${order.price} (${order.amount} shares)`);
    });
  }
  
  if (recentTrades.length > 0) {
    console.log('Recent Trades:');
    recentTrades.forEach(trade => {
      const buyer = users.find(u => u.id === trade.buyerId);
      const seller = users.find(u => u.id === trade.sellerId);
      console.log(`  ${buyer?.name} bought ${trade.side} from ${seller?.name} at $${trade.price} (${trade.amount} shares)`);
    });
  }
  
  console.log('========================');
}; 