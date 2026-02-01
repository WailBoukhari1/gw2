import React from 'react';
import { formatCurrency } from '../utils/calculation';

interface Props {
  amount: number;
  className?: string;
  hideZero?: boolean;
  hideIcons?: boolean;
}

export const CurrencyDisplay: React.FC<Props> = ({ amount, className = '', hideZero = false, hideIcons = false }) => {
  const { gold, silver, copper } = formatCurrency(amount);

  if (hideZero && amount === 0) return null;

  return (
    <div className={`flex items-center gap-2 font-mono ${className}`}>
      {gold > 0 && (
        <span className="flex items-center text-gold-400">
          {gold.toLocaleString()} {!hideIcons && <img src="https://wiki.guildwars2.com/images/d/d1/Gold_coin.png" alt="g" className="w-4 h-4 ml-1" />}
        </span>
      )}
      {(gold > 0 || silver > 0) && (
        <span className="flex items-center text-gray-300">
          {silver} {!hideIcons && <img src="https://wiki.guildwars2.com/images/3/3c/Silver_coin.png" alt="s" className="w-4 h-4 ml-1" />}
        </span>
      )}
      {(copper > 0 || (!hideZero && gold === 0 && silver === 0)) && (
        <span className="flex items-center text-orange-400">
          {copper} {!hideIcons && <img src="https://wiki.guildwars2.com/images/e/eb/Copper_coin.png" alt="c" className="w-4 h-4 ml-1" />}
        </span>
      )}
    </div>
  );
};
