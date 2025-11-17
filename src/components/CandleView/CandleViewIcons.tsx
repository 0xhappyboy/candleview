import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

// 统一的细线风格配置
const strokeWidth = 1.5;
const strokeLinecap = 'round';
const strokeLinejoin = 'round';

export const LineToolIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 17L9 11L13 15L21 7" stroke={color} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} />
    <path d="M16 7H21V12" stroke={color} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} />
  </svg>
);

export const FibonacciIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 1024 1024" fill={color}>
    <path d="M190.848 171.818667h680.533333a20.181333 20.181333 0 0 1 0 40.362666H190.805333a20.181333 20.181333 0 0 1 0-40.362666zM190.848 385.152h509.866667a20.181333 20.181333 0 0 1 0 40.362667H190.805333a20.181333 20.181333 0 0 1 0-40.362667zM190.848 598.485333h680.533333a20.181333 20.181333 0 0 1 0 40.362667H190.805333a20.181333 20.181333 0 1 1 0-40.362667zM361.514667 811.818667h509.866666a20.181333 20.181333 0 0 1 0 40.362666H361.472a20.181333 20.181333 0 1 1 0-40.362666z" />
    <path d="M797.482667 512a106.666667 106.666667 0 1 0 0-213.333333 106.666667 106.666667 0 0 0 0 213.333333z m0-42.666667a64 64 0 1 1 0-128 64 64 0 0 1 0 128zM267.264 938.666667a106.666667 106.666667 0 1 0 0-213.333334 106.666667 106.666667 0 0 0 0 213.333334z m0-42.666667a64 64 0 1 1 0-128 64 64 0 0 1 0 128z" />
  </svg>
);

export const IndicatorIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 3V19H21" stroke={color} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} strokeLinejoin={strokeLinejoin} />
    <path d="M7 14L10 11L13 15L17 9" stroke={color} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} strokeLinejoin={strokeLinejoin} />
  </svg>
);

export const SettingsIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke={color} strokeWidth={strokeWidth} />
    <path d="M19.4 15C19.2662 15.466 19.1334 15.932 19.0006 16.398L21.5 18.898C21.7472 19.1452 21.7472 19.5548 21.5 19.802L19.802 21.5C19.5548 21.7472 19.1452 21.7472 18.898 21.5L16.398 19.0006C15.932 19.1334 15.466 19.2662 15 19.4V22C15 22.5523 14.5523 23 14 23H10C9.44772 23 9 22.5523 9 22V19.4C8.534 19.2662 8.068 19.1334 7.602 19.0006L5.102 21.5C4.85478 21.7472 4.44522 21.7472 4.198 21.5L2.5 19.802C2.25278 19.5548 2.25278 19.1452 2.5 18.898L5.0006 16.398C4.8678 15.932 4.734 15.466 4.6 15H2C1.44772 15 1 14.5523 1 14V10C1 9.44772 1.44772 9 2 9H4.6C4.734 8.534 4.8678 8.068 5.0006 7.602L2.5 5.102C2.25278 4.85478 2.25278 4.44522 2.5 4.198L4.198 2.5C4.44522 2.25278 4.85478 2.25278 5.102 2.5L7.602 5.0006C8.068 4.8678 8.534 4.734 9 4.6V2C9 1.44772 9.44772 1 10 1H14C14.5523 1 15 1.44772 15 2V4.6C15.466 4.734 15.932 4.8678 16.398 5.0006L18.898 2.5C19.1452 2.25278 19.5548 2.25278 19.802 2.5L21.5 4.198C21.7472 4.44522 21.7472 4.85478 21.5 5.102L19.0006 7.602C19.1334 8.068 19.2662 8.534 19.4 9H22C22.5523 9 23 9.44772 23 10V14C23 14.5523 22.5523 15 22 15H19.4Z" stroke={color} strokeWidth={strokeWidth} />
  </svg>
);

export const ChartTypeIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 3V19H21" stroke={color} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} strokeLinejoin={strokeLinejoin} />
    <path d="M7 14L10 11L13 15L17 9" stroke={color} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} strokeLinejoin={strokeLinejoin} />
  </svg>
);

export const TimeframeIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} />
    <path d="M12 7V12L15 15" stroke={color} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} />
  </svg>
);

export const CompareIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M21 21H6V3" stroke={color} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} />
    <path d="M18 6L15 3L12 6" stroke={color} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} strokeLinejoin={strokeLinejoin} />
    <path d="M15 3V15" stroke={color} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} />
  </svg>
);

export const FullscreenIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M8 3H5C4.44772 3 4 3.44772 4 4V7" stroke={color} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} />
    <path d="M16 3H19C19.5523 3 20 3.44772 20 4V7" stroke={color} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} />
    <path d="M8 21H5C4.44772 21 4 20.5523 4 20V17" stroke={color} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} />
    <path d="M16 21H19C19.5523 21 20 20.5523 20 20V17" stroke={color} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} />
  </svg>
);

export const TradeIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

export const BuyIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

export const SellIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M10 14l2 2 2-2" />
    <path d="M12 10v6" />
  </svg>
);

export const OrderIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <line x1="8" y1="8" x2="16" y2="8" />
    <line x1="8" y1="12" x2="16" y2="12" />
    <line x1="8" y1="16" x2="13" y2="16" />
  </svg>
);

export const HorizontalLineIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M3 12H21" stroke={color} strokeWidth={strokeWidth} />
  </svg>
);

export const VerticalLineIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 3V21" stroke={color} strokeWidth={strokeWidth} />
  </svg>
);

export const RectangleIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="18" height="18" stroke={color} strokeWidth={strokeWidth} />
  </svg>
);

export const TextIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M4 7L4 4L20 4L20 7" stroke={color} strokeWidth={strokeWidth} />
    <path d="M12 20L12 4" stroke={color} strokeWidth={strokeWidth} />
    <path d="M8 20L16 20" stroke={color} strokeWidth={strokeWidth} />
  </svg>
);

export const DrawingIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M15.2322 5.23223L18.7677 8.76777" stroke={color} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} />
    <path d="M13.2929 10.1716C12.9024 9.78105 12.9024 9.14788 13.2929 8.75736C13.6834 8.36683 14.3166 8.36683 14.7071 8.75736L15.2426 9.29289C15.6331 9.68342 15.6331 10.3166 15.2426 10.7071C14.8521 11.0976 14.2189 11.0976 13.8284 10.7071L13.2929 10.1716Z" stroke={color} strokeWidth={strokeWidth} />
    <path d="M13.2929 16.5147C12.9024 16.1242 12.9024 15.491 13.2929 15.1005C13.6834 14.71 14.3166 14.71 14.7071 15.1005L15.2426 15.6361C15.6331 16.0266 15.6331 16.6598 15.2426 17.0503C14.8521 17.4408 14.2189 17.4408 13.8284 17.0503L13.2929 16.5147Z" stroke={color} strokeWidth={strokeWidth} />
    <path d="M9.17157 13.2929C8.78105 12.9024 8.14788 12.9024 7.75736 13.2929C7.36684 13.6834 7.36684 14.3166 7.75736 14.7071L8.29289 15.2426C8.68342 15.6331 9.31658 15.6331 9.70711 15.2426C10.0976 14.8521 10.0976 14.2189 9.70711 13.8284L9.17157 13.2929Z" stroke={color} strokeWidth={strokeWidth} />
    <path d="M16.6569 7.75736C17.0474 7.36684 17.6805 7.36684 18.0711 7.75736C18.4616 8.14788 18.4616 8.78105 18.0711 9.17157L8.17157 19.0711C7.78105 19.4616 7.14788 19.4616 6.75736 19.0711C6.36684 18.6805 6.36684 18.0474 6.75736 17.6569L16.6569 7.75736Z" stroke={color} strokeWidth={strokeWidth} />
  </svg>
);

export const EmojiIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} strokeLinejoin={strokeLinejoin}>
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" />
    <line x1="15" y1="9" x2="15.01" y2="9" />
  </svg>
);

export const ChannelIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
    <path d="M3 12h18M6 12v6M18 12v6" />
  </svg>
);

export const TrendChannelIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
    <path d="M3 3v18h18M7 13l10-4M7 17l10-4" />
  </svg>
);

export const CircleIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
    <circle cx="12" cy="12" r="8" />
  </svg>
);

export const TriangleIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
    <path d="M12 4l8 16H4z" />
  </svg>
);

export const ArrowIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

export const FibonacciExtensionIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
    <path d="M3 12h18M8 12v4h8v-4" />
  </svg>
);

export const AndrewPitchforkIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
    <path d="M3 12h18M6 8v8M12 6v12M18 8v8" />
  </svg>
);

export const GannFanIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
    <path d="M3 21L21 3M12 3v18M3 12h18" />
  </svg>
);

export const LineIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
    <path d="M3 12L21 12" />
  </svg>
);

export const LineWithDotsIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 1024 1024" fill={color}>
    <path d="M256 896c-70.4 0-128-57.6-128-128s57.6-128 128-128 128 57.6 128 128-57.6 128-128 128z m0-192c-35.2 0-64 28.8-64 64s28.8 64 64 64 64-28.8 64-64-28.8-64-64-64zM768 384c-70.4 0-128-57.6-128-128s57.6-128 128-128 128 57.6 128 128-57.6 128-128 128z m0-192c-35.2 0-64 28.8-64 64s28.8 64 64 64 64-28.8 64-64-28.8-64-64-64z" />
    <path d="M324 732c-8 0-16.4-3.2-22.8-9.2-12.4-12.4-12.4-32.8 0-45.2l376-376c12.4-12.4 32.8-12.4 45.2 0 12.4 12.4 12.4 32.8 0 45.2l-376 376c-6 6-14.4 9.2-22.4 9.2z" />
  </svg>
);

export const CycleLinesIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
    <path d="M3 12h18M6 6v12M12 3v18M18 6v12" />
  </svg>
);

export const GannBoxIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M8 8h8v8H8z" />
  </svg>
);

export const PitchforkIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
    <path d="M3 12h18M6 9v6M12 6v12M18 9v6" />
  </svg>
);

export const MAIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
    <path d="M3 12l4-4 4 4 4-4 4 4" strokeLinecap={strokeLinecap} />
  </svg>
);

export const RsiIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
    <path d="M3 12h18M6 8v8M12 6v12M18 10v4" />
  </svg>
);

export const MacdIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
    <path d="M3 12h18M6 10v4M12 8v8M18 6v12" />
  </svg>
);

export const BollingerBandsIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
    <path d="M3 12l4-4 4 4 4-4 4 4" strokeLinecap={strokeLinecap} />
    <path d="M3 8l4 4 4-4 4 4 4-4" strokeLinecap={strokeLinecap} />
    <path d="M3 16l4-4 4 4 4-4 4 4" strokeLinecap={strokeLinecap} />
  </svg>
);

export const VolumeIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
    <path d="M3 8v8h4l5 4V4L7 8H3z" />
  </svg>
);

export const IchimokuIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
    <path d="M3 12l4-4 4 4 4-4 4 4" strokeLinecap={strokeLinecap} />
    <path d="M3 8l4 4 4-4 4 4 4-4" strokeLinecap={strokeLinecap} />
  </svg>
);

export const EllipseIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
    <ellipse cx="12" cy="12" rx="8" ry="5" />
  </svg>
);

export const PieChartIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
    <path d="M22 12A10 10 0 0 0 12 2v10z" />
  </svg>
);

export const PencilIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M17 3L21 7L7 21H3V17L17 3Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} strokeLinejoin={strokeLinejoin} />
    <path d="M15 5L19 9" stroke={color} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} strokeLinejoin={strokeLinejoin} />
  </svg>
);

export const PenIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 19L19 12L22 15L15 22L12 19Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} strokeLinejoin={strokeLinejoin} />
    <path d="M18 13L16.5 5.5L2 2L5.5 16.5L13 18L18 13Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} strokeLinejoin={strokeLinejoin} />
    <path d="M2 2L9.5 9.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} strokeLinejoin={strokeLinejoin} />
  </svg>
);

export const BrushIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M20 10V3H7L3 7V21H13L21 13V10H20Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} strokeLinejoin={strokeLinejoin} />
    <path d="M9 21C9 19.3431 10.3431 18 12 18C13.6569 18 15 19.3431 15 21H9Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} strokeLinejoin={strokeLinejoin} />
  </svg>
);

export const HighlighterIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M9 11L3 17V21H7L13 15" stroke={color} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} strokeLinejoin={strokeLinejoin} />
    <path d="M21 12L15 18L11 14L17 8L21 12Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} strokeLinejoin={strokeLinejoin} />
    <path d="M15 6L17 4L20 7L18 9L15 6Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} strokeLinejoin={strokeLinejoin} />
  </svg>
);

export const EraserIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M7 21H21L16 12L12 16L7 21Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} strokeLinejoin={strokeLinejoin} />
    <path d="M16 12L12 16" stroke={color} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} strokeLinejoin={strokeLinejoin} />
    <path d="M3 13L8 8L16 16L11 21H3V13Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} strokeLinejoin={strokeLinejoin} />
  </svg>
);

export const CalligraphyPenIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 19L19 12L15 8L8 15L12 19Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} strokeLinejoin={strokeLinejoin} />
    <path d="M15 8L18 5L21 8L18 11L15 8Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} strokeLinejoin={strokeLinejoin} />
    <path d="M9 15L6 18L3 15L6 12L9 15Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} strokeLinejoin={strokeLinejoin} />
  </svg>
);

export const SprayIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M7 10H17V19H7V10Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} strokeLinejoin={strokeLinejoin} />
    <path d="M12 7V4" stroke={color} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} strokeLinejoin={strokeLinejoin} />
    <path d="M8 4H16" stroke={color} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} strokeLinejoin={strokeLinejoin} />
    <path d="M15 13H9" stroke={color} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} strokeLinejoin={strokeLinejoin} />
    <path d="M15 16H9" stroke={color} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} strokeLinejoin={strokeLinejoin} />
  </svg>
);

export const MarkerIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M9 21H5C4.44772 21 4 20.5523 4 20V11L1 8L4 5V4C4 3.44772 4.44772 3 5 3H19C19.5523 3 20 3.44772 20 4V5L23 8L20 11V20C20 20.5523 19.5523 21 19 21H15" stroke={color} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} strokeLinejoin={strokeLinejoin} />
    <path d="M9 21L12 17L15 21H9Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} strokeLinejoin={strokeLinejoin} />
  </svg>
);

export const RulerIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 7H21V17H3V7Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} strokeLinejoin={strokeLinejoin} />
    <path d="M6 7V17" stroke={color} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} />
    <path d="M9 7V17" stroke={color} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} />
    <path d="M12 7V17" stroke={color} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} />
    <path d="M15 7V17" stroke={color} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} />
    <path d="M18 7V17" stroke={color} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} />
    <path d="M3 12H21" stroke={color} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} />
  </svg>
);

export const TrashIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 6H5H21" stroke={color} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} strokeLinejoin={strokeLinejoin} />
    <path d="M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6M19 6V20C19 20.5523 18.5523 21 18 21H6C5.44772 21 5 20.5523 5 20V6H19Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} strokeLinejoin={strokeLinejoin} />
    <path d="M10 11V17" stroke={color} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} strokeLinejoin={strokeLinejoin} />
    <path d="M14 11V17" stroke={color} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} strokeLinejoin={strokeLinejoin} />
  </svg>
);

export const CursorIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M4 4L16 16L12 12L4 20L8 12L12 12L4 4Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} strokeLinejoin={strokeLinejoin} />
  </svg>
);

export const CursorCrosshairIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 4V8" stroke={color} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} />
    <path d="M12 16V20" stroke={color} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} />
    <path d="M4 12H8" stroke={color} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} />
    <path d="M16 12H20" stroke={color} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} />
    <circle cx="12" cy="12" r="2" stroke={color} strokeWidth={strokeWidth} fill="none" />
  </svg>
);

export const CursorDotIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="4" fill={color} />
    <circle cx="12" cy="12" r="8" stroke={color} strokeWidth={strokeWidth} fill="none" />
  </svg>
);

export const CursorArrowIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M4 4L16 16L12 12L4 20L8 12L12 12L4 4Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} strokeLinejoin={strokeLinejoin} />
  </svg>
);

export const CursorSparkleIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} strokeLinejoin={strokeLinejoin} />
    <circle cx="12" cy="12" r="2" fill={color} />
    <path d="M7 17L8.5 14.5L11 16L8.5 17.5L7 21L5.5 17.5L3 16L5.5 14.5L7 17Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} strokeLinejoin={strokeLinejoin} />
    <path d="M17 7L18.5 4.5L21 6L18.5 7.5L17 11L15.5 7.5L13 6L15.5 4.5L17 7Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} strokeLinejoin={strokeLinejoin} />
  </svg>
);

export const CursorEmojiIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth={strokeWidth} />
    <circle cx="8" cy="10" r="1" fill={color} />
    <circle cx="16" cy="10" r="1" fill={color} />
    <path d="M8 16C8 16 10 14 12 14C14 14 16 16 16 16" stroke={color} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} />
  </svg>
);

// 斐波那契相关图标
export const FibonacciTimeZonesIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
    <path d="M1 12h22M12 1v22M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const FibonacciArcIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
    <path d="M12 21c-4.97 0-9-4.03-9-9s4.03-9 9-9 9 4.03 9 9-4.03 9-9 9z" />
    <path d="M12 15c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" />
  </svg>
);

export const FibonacciWedgeIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
    <path d="M3 21l7-18M21 21l-7-18M12 3l-9 18" />
  </svg>
);

export const FibonacciSpiralIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
    <path d="M12 21c-4.97 0-9-4.03-9-9s4.03-9 9-9 9 4.03 9 9-4.03 9-9 9z" strokeDasharray="2 2" />
    <path d="M12 15c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" strokeDasharray="1 1" />
  </svg>
);

export const FibonacciChannelIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
    <path d="M3 12h18M3 6h18M3 18h18" />
    <path d="M6 3v18M12 3v18M18 3v18" />
  </svg>
);

// 江恩相关图标
export const GannSquareIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 12h18M12 3v18M8 3v18M16 3v18M3 8h18M3 16h18" />
  </svg>
);

export const GannGridIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
    <path d="M3 3h18v18H3z" />
    <path d="M3 8h18M3 13h18M3 18h18M8 3v18M13 3v18M18 3v18" />
  </svg>
);

export const GannAnglesIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
    <path d="M12 3v18M3 12h18M5 5l14 14M19 5L5 19" />
    <path d="M8 3l8 18M16 3L8 21" />
  </svg>
);

export const GannSwingsIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
    <path d="M3 12h18M12 3v18" strokeDasharray="2 2" />
    <path d="M6 6l12 12M18 6L6 18" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

export const GannLevelsIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
    <path d="M3 7h18M3 12h18M3 17h18" />
    <path d="M7 3v18M12 3v18M17 3v18" />
  </svg>
);

// 项目信息相关图标
export const FlagIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" y1="22" x2="4" y2="15" />
  </svg>
);

export const TimelineIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export const ProgressIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);

export const NoteIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

export const LinkIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

// 不规则图形相关图标
export const PolygonIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
    <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
  </svg>
);

export const CurveIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
    <path d="M17 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
    <path d="M7 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
    <path d="M20 15c-2-4-6-6-8-6s-6 2-8 6" />
  </svg>
);

export const StarIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export const HeartIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

export const CloudIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
  </svg>
);

export const CalloutIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
    <path d="M10 13h4M10 9h4M10 17h1M14 8V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2v2a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-2h2a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-4z" />
  </svg>
);

export const CameraIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap={strokeLinecap}
      strokeLinejoin={strokeLinejoin} />
    <circle cx="12" cy="13" r="4"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap={strokeLinecap}
      strokeLinejoin={strokeLinejoin} />
  </svg>
);