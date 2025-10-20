import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

export const LineToolIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 17L9 11L13 15L21 7" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M16 7H21V12" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const FibonacciIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M7 10L12 15L17 10" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M7 14L12 19L17 14" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M3 3V21" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M21 3V21" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const IndicatorIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 3V19H21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 14L10 11L13 15L17 9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const SettingsIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke={color} strokeWidth="2" />
    <path d="M19.4 15C19.2662 15.466 19.1334 15.932 19.0006 16.398L21.5 18.898C21.7472 19.1452 21.7472 19.5548 21.5 19.802L19.802 21.5C19.5548 21.7472 19.1452 21.7472 18.898 21.5L16.398 19.0006C15.932 19.1334 15.466 19.2662 15 19.4V22C15 22.5523 14.5523 23 14 23H10C9.44772 23 9 22.5523 9 22V19.4C8.534 19.2662 8.068 19.1334 7.602 19.0006L5.102 21.5C4.85478 21.7472 4.44522 21.7472 4.198 21.5L2.5 19.802C2.25278 19.5548 2.25278 19.1452 2.5 18.898L5.0006 16.398C4.8678 15.932 4.734 15.466 4.6 15H2C1.44772 15 1 14.5523 1 14V10C1 9.44772 1.44772 9 2 9H4.6C4.734 8.534 4.8678 8.068 5.0006 7.602L2.5 5.102C2.25278 4.85478 2.25278 4.44522 2.5 4.198L4.198 2.5C4.44522 2.25278 4.85478 2.25278 5.102 2.5L7.602 5.0006C8.068 4.8678 8.534 4.734 9 4.6V2C9 1.44772 9.44772 1 10 1H14C14.5523 1 15 1.44772 15 2V4.6C15.466 4.734 15.932 4.8678 16.398 5.0006L18.898 2.5C19.1452 2.25278 19.5548 2.25278 19.802 2.5L21.5 4.198C21.7472 4.44522 21.7472 4.85478 21.5 5.102L19.0006 7.602C19.1334 8.068 19.2662 8.534 19.4 9H22C22.5523 9 23 9.44772 23 10V14C23 14.5523 22.5523 15 22 15H19.4Z" stroke={color} strokeWidth="2" />
  </svg>
);

export const ChartTypeIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 3V19H21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 14L10 11L13 15L17 9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const TimeframeIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
    <path d="M12 7V12L15 15" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const CompareIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M21 21H6V3" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M18 6L15 3L12 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15 3V15" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const FullscreenIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M8 3H5C4.44772 3 4 3.44772 4 4V7" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M16 3H19C19.5523 3 20 3.44772 20 4V7" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M8 21H5C4.44772 21 4 20.5523 4 20V17" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M16 21H19C19.5523 21 20 20.5523 20 20V17" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const TradeIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

export const BuyIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

export const SellIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M10 14l2 2 2-2" />
    <path d="M12 10v6" />
  </svg>
);

export const OrderIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <line x1="8" y1="8" x2="16" y2="8" />
    <line x1="8" y1="12" x2="16" y2="12" />
    <line x1="8" y1="16" x2="13" y2="16" />
  </svg>
);

export const DrawingIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);

