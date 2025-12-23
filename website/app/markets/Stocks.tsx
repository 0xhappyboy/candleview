import React from 'react';

interface StocksProps {
  isDark: boolean;
  locale: string;
  stockList: StockItem[];
  onStockClick?: (symbol: string) => void;
}

interface StockItem {
  symbol: string;
  name: string;
  currentPrice: number;
  changePercent: number;
  changeAmount: number;
  volume: number;
  marketCap?: number;
  peRatio?: number;
  sector?: string;
  exchange?: string;
}

const Stocks: React.FC<StocksProps> = ({
  isDark,
  locale,
  stockList,
  onStockClick,
}) => {
  const handleClick = (symbol: string) => {
    if (onStockClick) {
      onStockClick(symbol);
    }
  };

  const formatNumber = (value: number): string => {
    if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
    return value.toFixed(2);
  };

  const formatPrice = (price: number): string => {
    if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (price >= 100) return price.toFixed(2);
    if (price >= 10) return price.toFixed(2);
    if (price >= 1) return price.toFixed(2);
    return price.toFixed(3);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="divide-y">
        {stockList.map((stock, index) => (
          <div
            key={`${stock.symbol}-${index}`}
            onClick={() => handleClick(stock.symbol)}
            className={`flex items-center justify-between px-3 py-2 min-h-[40px] transition-colors cursor-pointer ${isDark
              ? 'bg-gray-900 hover:bg-gray-800 active:bg-gray-700 border-gray-700'
              : 'bg-white hover:bg-gray-100 active:bg-gray-200 border-gray-200'
              } border-b last:border-b-0`}
          >
            <div className="flex flex-col flex-1 min-w-0 mr-2">
              <div className="flex items-center">
                <span className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stock.symbol}
                </span>
                {stock.exchange && (
                  <span className={`ml-1 text-[10px] px-1 py-0.5 rounded ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                    {stock.exchange}
                  </span>
                )}
              </div>
              <span className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {stock.name}
              </span>
              {stock.sector && (
                <span className={`text-[10px] truncate ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                  {stock.sector}
                </span>
              )}
            </div>

            <div className="flex flex-col items-center mx-1 min-w-[80px]">
              <div className={`text-sm font-bold ${stock.changePercent >= 0
                ? isDark ? 'text-green-400' : 'text-green-600'
                : isDark ? 'text-red-400' : 'text-red-600'
                }`}
              >
                {stock.changePercent >= 0 ? '↗' : '↘'}{Math.abs(stock.changePercent).toFixed(2)}%
              </div>
              <div className={`text-xs ${stock.changeAmount >= 0
                ? isDark ? 'text-green-400' : 'text-green-600'
                : isDark ? 'text-red-400' : 'text-red-600'
                }`}
              >
                {stock.changeAmount >= 0 ? '+' : ''}{stock.changeAmount.toFixed(2)}
              </div>
              <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                {locale === 'cn' ? '涨跌' : 'Change'}
              </span>
            </div>

            <div className="flex flex-col items-end flex-1 min-w-0">
              <span className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ${formatPrice(stock.currentPrice)}
              </span>
              <div className="flex items-center space-x-2">
                {stock.volume > 0 && (
                  <span className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Vol: {formatNumber(stock.volume)}
                  </span>
                )}
                {stock.marketCap && stock.marketCap > 0 && (
                  <span className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Mkt: {formatNumber(stock.marketCap)}
                  </span>
                )}
              </div>
              {stock.peRatio && (
                <span className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  P/E: {stock.peRatio.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Stocks;
