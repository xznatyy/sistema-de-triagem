import React from 'react';
import { ManchesterColor, MANCHESTER_RULES } from '../types';
import { AlertTriangle, Clock, ShieldAlert, CheckCircle, Info } from 'lucide-react';

interface ManchesterBadgeProps {
  color: ManchesterColor;
  size?: 'sm' | 'md' | 'lg';
  showCategory?: boolean;
  showWaitTime?: boolean;
  pulse?: boolean;
}

export const ManchesterBadge: React.FC<ManchesterBadgeProps> = ({
  color,
  size = 'md',
  showCategory = true,
  showWaitTime = false,
  pulse = false
}) => {
  const config = MANCHESTER_RULES[color] || MANCHESTER_RULES.blue;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-semibold gap-1',
    md: 'px-2.5 py-1 text-sm font-semibold gap-1.5',
    lg: 'px-3.5 py-1.5 text-base font-bold gap-2'
  }[size];

  const getIcon = () => {
    switch (color) {
      case 'red':
        return <ShieldAlert className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />;
      case 'orange':
        return <AlertTriangle className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />;
      case 'yellow':
        return <Clock className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />;
      case 'green':
        return <CheckCircle className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />;
      case 'blue':
        return <Info className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />;
    }
  };

  const isPulsing = pulse && (color === 'red' || color === 'orange');

  return (
    <span
      className={`inline-flex items-center rounded-full shadow-xs ${config.badgeBg} ${config.badgeText} ${sizeClasses} ${
        isPulsing ? 'animate-pulse ring-2 ring-red-400/50 ring-offset-1' : ''
      }`}
      style={{ backgroundColor: config.hexColor }}
      title={config.description}
    >
      {getIcon()}
      <span>{config.label}</span>
      {showCategory && <span className="opacity-90 font-normal">({config.category})</span>}
      {showWaitTime && (
        <span className="ml-1 opacity-85 font-mono text-[11px] bg-black/20 px-1.5 py-0.2 rounded-sm">
          {config.maxWaitMinutes === 0 ? '0 min' : `máx ${config.maxWaitMinutes}m`}
        </span>
      )}
    </span>
  );
};
