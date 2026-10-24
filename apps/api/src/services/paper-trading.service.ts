import { store } from '../models/store.js';
import {
  PaperOrderEntity,
  PortfolioEntity,
  PositionEntity,
  OrderSide,
  OrderType,
  MarketExchange
} from '../models/types.js';
import { marketDataService } from './market-data/market-data.service.js';

export interface PlaceOrderRequest {
  symbol: string;
  exchange?: MarketExchange;
  side: OrderSide;
  orderType: OrderType;
  quantity: number;
  limitPrice?: number;
  idempotencyKey?: string;
}

export class PaperTradingService {
  private readonly FEE_RATE = 0.001; // 0.1% transaction fee
  private readonly MIN_FEE = 1.0; // $1.00 minimum transaction fee
  private processedKeys = new Set<string>();

  public async getPortfolio(): Promise<PortfolioEntity> {
    await this.updatePositionsValuation();
    return store.portfolio;
  }

  public async getOrders(): Promise<PaperOrderEntity[]> {
    return [...store.orders].reverse();
  }

  public async resetAccount(startingCapital: number = 10000.0, currency: 'USD' | 'INR' = 'USD'): Promise<PortfolioEntity> {
    store.resetPortfolio(startingCapital, currency);
    this.processedKeys.clear();
    return store.portfolio;
  }

  public async placeOrder(req: PlaceOrderRequest): Promise<PaperOrderEntity> {
    const symbol = req.symbol.trim().toUpperCase();
    const quantity = Math.floor(req.quantity);

    if (!symbol) {
      throw new Error('Stock symbol is required.');
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error('Quantity must be a positive whole integer.');
    }
    if (req.side !== 'BUY' && req.side !== 'SELL') {
      throw new Error(`Invalid order side: ${req.side}`);
    }
    if (req.orderType !== 'MARKET' && req.orderType !== 'LIMIT') {
      throw new Error(`Invalid order type: ${req.orderType}`);
    }
    if (req.orderType === 'LIMIT' && (!req.limitPrice || req.limitPrice <= 0)) {
      throw new Error('Limit price must be greater than zero for LIMIT orders.');
    }

    // Idempotency check to avoid duplicate rapid submissions
    if (req.idempotencyKey) {
      if (this.processedKeys.has(req.idempotencyKey)) {
        throw new Error('Duplicate order submission detected (idempotency key matched).');
      }
      this.processedKeys.add(req.idempotencyKey);
    }

    // Retrieve observable quote from market data service
    const quote = await marketDataService.getQuote(symbol, req.exchange);
    const observablePrice = quote.price;

    let executionPrice = observablePrice;
    let isFilled = false;
    let statusReason = '';

    if (req.orderType === 'MARKET') {
      isFilled = true;
      executionPrice = observablePrice;
    } else if (req.orderType === 'LIMIT') {
      const limit = req.limitPrice!;
      if (req.side === 'BUY') {
        // Buy limit fills if current price is less than or equal to limit price
        if (observablePrice <= limit) {
          isFilled = true;
          executionPrice = Math.min(observablePrice, limit);
        } else {
          isFilled = false;
          statusReason = `Limit price $${limit} is below current market ask $${observablePrice}`;
        }
      } else {
        // Sell limit fills if current price is greater than or equal to limit price
        if (observablePrice >= limit) {
          isFilled = true;
          executionPrice = Math.max(observablePrice, limit);
        } else {
          isFilled = false;
          statusReason = `Limit price $${limit} is above current market bid $${observablePrice}`;
        }
      }
    }

    // Calculate fees in decimal safety
    const grossValue = Number((executionPrice * quantity).toFixed(2));
    const fee = Number(Math.max(grossValue * this.FEE_RATE, this.MIN_FEE).toFixed(2));
    const totalOrderCost = Number((grossValue + fee).toFixed(2));

    const orderId = `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    if (req.side === 'BUY') {
      if (store.portfolio.cashBalance < totalOrderCost) {
        const rejectedOrder: PaperOrderEntity = {
          id: orderId,
          symbol,
          exchange: quote.exchange,
          side: 'BUY',
          orderType: req.orderType,
          quantity,
          limitPrice: req.limitPrice,
          executionPrice,
          totalValue: grossValue,
          fees: fee,
          status: 'REJECTED',
          quoteTimestampUsed: quote.timestamp,
          rejectionReason: `Insufficient virtual cash balance. Required: $${totalOrderCost}, Available: $${store.portfolio.cashBalance.toFixed(2)}`,
          createdAt: new Date().toISOString()
        };
        store.orders.push(rejectedOrder);
        throw new Error(rejectedOrder.rejectionReason);
      }

      if (isFilled) {
        // Deduct cash
        store.portfolio.cashBalance = Number((store.portfolio.cashBalance - totalOrderCost).toFixed(2));

        // Update positions using weighted average cost accounting
        const existingPos = store.portfolio.positions.find((p) => p.symbol === symbol);
        if (existingPos) {
          const totalExistingCost = existingPos.quantity * existingPos.averagePrice;
          const totalNewCost = quantity * executionPrice;
          const combinedQty = existingPos.quantity + quantity;
          const newAvgPrice = Number(((totalExistingCost + totalNewCost) / combinedQty).toFixed(4));

          existingPos.quantity = combinedQty;
          existingPos.averagePrice = newAvgPrice;
          existingPos.currentPrice = executionPrice;
          existingPos.totalCost = Number((newAvgPrice * combinedQty).toFixed(2));
          existingPos.currentValue = Number((executionPrice * combinedQty).toFixed(2));
          existingPos.unrealizedPnL = Number((existingPos.currentValue - existingPos.totalCost).toFixed(2));
          existingPos.unrealizedPnLPercent = Number(((existingPos.unrealizedPnL / existingPos.totalCost) * 100).toFixed(2));
        } else {
          const newPos: PositionEntity = {
            symbol,
            exchange: quote.exchange,
            quantity,
            averagePrice: executionPrice,
            currentPrice: executionPrice,
            totalCost: grossValue,
            currentValue: grossValue,
            unrealizedPnL: 0.0,
            unrealizedPnLPercent: 0.0
          };
          store.portfolio.positions.push(newPos);
        }
      }
    } else {
      // SELL ORDER
      const existingPos = store.portfolio.positions.find((p) => p.symbol === symbol);
      const heldQty = existingPos?.quantity || 0;

      if (!existingPos || heldQty < quantity) {
        const rejectedOrder: PaperOrderEntity = {
          id: orderId,
          symbol,
          exchange: quote.exchange,
          side: 'SELL',
          orderType: req.orderType,
          quantity,
          limitPrice: req.limitPrice,
          executionPrice,
          totalValue: grossValue,
          fees: fee,
          status: 'REJECTED',
          quoteTimestampUsed: quote.timestamp,
          rejectionReason: `Cannot sell ${quantity} shares of ${symbol}. Currently holding ${heldQty} shares.`,
          createdAt: new Date().toISOString()
        };
        store.orders.push(rejectedOrder);
        throw new Error(rejectedOrder.rejectionReason);
      }

      if (isFilled) {
        const proceeds = Number((grossValue - fee).toFixed(2));
        store.portfolio.cashBalance = Number((store.portfolio.cashBalance + proceeds).toFixed(2));

        // Realized P&L on the sold lot: (executionPrice - averagePrice) * qty - fee
        const realizedOnLot = Number(((executionPrice - existingPos.averagePrice) * quantity - fee).toFixed(2));
        store.portfolio.realizedPnL = Number((store.portfolio.realizedPnL + realizedOnLot).toFixed(2));

        existingPos.quantity -= quantity;
        if (existingPos.quantity === 0) {
          store.portfolio.positions = store.portfolio.positions.filter((p) => p.symbol !== symbol);
        } else {
          existingPos.totalCost = Number((existingPos.quantity * existingPos.averagePrice).toFixed(2));
          existingPos.currentValue = Number((existingPos.quantity * executionPrice).toFixed(2));
          existingPos.unrealizedPnL = Number((existingPos.currentValue - existingPos.totalCost).toFixed(2));
          existingPos.unrealizedPnLPercent = Number(((existingPos.unrealizedPnL / existingPos.totalCost) * 100).toFixed(2));
        }
      }
    }

    const order: PaperOrderEntity = {
      id: orderId,
      symbol,
      exchange: quote.exchange,
      side: req.side,
      orderType: req.orderType,
      quantity,
      limitPrice: req.limitPrice,
      executionPrice: isFilled ? executionPrice : 0,
      totalValue: grossValue,
      fees: isFilled ? fee : 0,
      status: isFilled ? 'FILLED' : 'PENDING',
      quoteTimestampUsed: quote.timestamp,
      rejectionReason: isFilled ? undefined : statusReason,
      createdAt: new Date().toISOString(),
      executedAt: isFilled ? new Date().toISOString() : undefined
    };

    store.orders.push(order);
    await this.updatePositionsValuation();

    return order;
  }

  private async updatePositionsValuation(): Promise<void> {
    let totalPositionsValue = 0;
    let totalUnrealizedPnL = 0;

    for (const pos of store.portfolio.positions) {
      try {
        const quote = await marketDataService.getQuote(pos.symbol, pos.exchange);
        pos.currentPrice = quote.price;
        pos.currentValue = Number((pos.quantity * quote.price).toFixed(2));
        pos.unrealizedPnL = Number((pos.currentValue - pos.totalCost).toFixed(2));
        pos.unrealizedPnLPercent = pos.totalCost > 0
          ? Number(((pos.unrealizedPnL / pos.totalCost) * 100).toFixed(2))
          : 0;
      } catch {
        // preserve current valuation if quote fails
      }

      totalPositionsValue += pos.currentValue;
      totalUnrealizedPnL += pos.unrealizedPnL;
    }

    store.portfolio.unrealizedPnL = Number(totalUnrealizedPnL.toFixed(2));
    store.portfolio.totalPortfolioValue = Number((store.portfolio.cashBalance + totalPositionsValue).toFixed(2));
    store.portfolio.lastUpdated = new Date().toISOString();
  }
}

export const paperTradingService = new PaperTradingService();
