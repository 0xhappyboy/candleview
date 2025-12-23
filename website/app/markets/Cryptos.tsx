import React from 'react';

interface CryptosProps {
  isDark: boolean;
  locale: string;
  cryptoList: CryptoItem[];
  onCryptoClick?: (pair: string) => void;
}

interface CryptoItem {
  pair: string;
  currentPrice: number;
  change24h: number;
}

const Cryptos: React.FC<CryptosProps> = ({
  isDark,
  locale,
  cryptoList,
  onCryptoClick,
}) => {
  const handleClick = (pair: string) => {
    if (onCryptoClick) {
      onCryptoClick(pair);
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="divide-y">
        {cryptoList.map((crypto, index) => (
          <div
            key={index}
            onClick={() => handleClick(crypto.pair)}
            className={`flex items-center justify-between px-2 py-2 min-h-[35px] transition-colors cursor-pointer ${isDark
              ? 'bg-gray-900 hover:bg-gray-800 active:bg-gray-700 border-gray-700'
              : 'bg-white hover:bg-gray-100 active:bg-gray-200 border-gray-200'
              } border-b last:border-b-0`}
          >
            <div className="flex flex-col flex-1 min-w-0">
              <span className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {crypto.pair}
              </span>
              <span className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {locale === 'cn' ? '现货' : 'Spot'}
              </span>
            </div>
            <div className="flex flex-col items-center mx-2 min-w-[70px]">
              <span
                className={`text-xs font-semibold ${crypto.change24h >= 0
                  ? isDark ? 'text-green-400' : 'text-green-600'
                  : isDark ? 'text-red-400' : 'text-red-600'
                  }`}
              >
                {crypto.change24h >= 0 ? '↗' : '↘'}{Math.abs(crypto.change24h).toFixed(2)}%
              </span>
              <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                {locale === 'cn' ? '24h' : '24h'}
              </span>
            </div>
            <div className="flex flex-col items-end flex-1 min-w-0">
              <span className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {crypto.currentPrice.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: crypto.currentPrice >= 100 ? 2 : 4,
                })}
              </span>
              <span className={`text-[10px] truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {locale === 'cn' ? '现价' : 'Price'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Cryptos;
