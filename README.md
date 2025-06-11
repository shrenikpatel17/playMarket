# PolyMarket Simulation

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app). It simulates a sophisticated prediction market where intelligent traders with personal beliefs compete to find profitable opportunities.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Features

### 🧠 Intelligent Trading System

- **Personal Beliefs**: Each trader has unique beliefs about market outcomes (5-95% probability)
- **Rational Decision Making**: Users only trade when they identify profitable opportunities
- **Risk Management**: Order sizes determined by confidence levels, risk tolerance, and expected value
- **Trading Personalities**: Conservative, moderate, and aggressive trading styles with different behaviors

### 📊 Market Dynamics

- **Diverse User Archetypes**: Very optimistic, pessimistic, moderate, and neutral traders create market tension
- **Market Makers**: 30% of orders provide liquidity with bid-ask spreads to ensure tradability
- **Belief Evolution**: User beliefs slowly adjust toward market consensus while maintaining independence
- **Price Discovery**: Real-time price updates based on order book depth and trading activity

### 🎯 Prediction Markets

- **Market Questions**: Trade on questions like "Will Bitcoin reach $100,000 by end of 2024?" and "Will SpaceX land humans on Mars by 2030?"
- **Binary Outcomes**: YES/NO shares that sum to $1.00, representing probability
- **Order Matching**: Sophisticated engine matches buyers and sellers based on price-time priority
- **Real-time Analytics**: Live order books, trade history, and price charts

### 🔧 Technical Features

- **Order Book Management**: Full depth tracking with bid/ask spreads
- **Trade Execution**: Automatic matching when buy price ≥ sell price
- **System Monitoring**: Real-time event logging and performance metrics
- **Responsive UI**: Modern interface with dark mode support

## How It Works

1. **User Generation**: 10 traders with diverse beliefs, risk tolerances, and trading styles
2. **Market Analysis**: Users continuously evaluate markets for profitable opportunities
3. **Order Placement**: Intelligent orders based on belief vs market price discrepancies
4. **Market Making**: Liquidity providers place orders around current prices
5. **Order Matching**: Engine matches compatible orders and executes trades
6. **Price Updates**: Market prices adjust based on order book and recent trades
7. **Belief Updates**: User beliefs evolve slowly based on market movements

## Educational Value

This simulation demonstrates key concepts in:

- **Prediction Market Theory**: How markets aggregate information and discover prices
- **Behavioral Finance**: Different trader personalities and decision-making processes
- **Market Microstructure**: Order books, spreads, and liquidity provision
- **Information Efficiency**: How diverse beliefs lead to price discovery

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
