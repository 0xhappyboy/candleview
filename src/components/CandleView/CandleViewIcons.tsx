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

export const HorizontalLineIcon = (props: { size?: number; color?: string }) => (
  <svg width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none">
    <path d="M3 12H21" stroke={props.color || "currentColor"} strokeWidth="2" />
  </svg>
);

export const VerticalLineIcon = (props: { size?: number; color?: string }) => (
  <svg width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none">
    <path d="M12 3V21" stroke={props.color || "currentColor"} strokeWidth="2" />
  </svg>
);

export const RectangleIcon = (props: { size?: number; color?: string }) => (
  <svg width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="18" height="18" stroke={props.color || "currentColor"} strokeWidth="2" />
  </svg>
);

export const TextIcon = (props: { size?: number; color?: string }) => (
  <svg width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none">
    <path d="M4 7L4 4L20 4L20 7" stroke={props.color || "currentColor"} strokeWidth="2" />
    <path d="M12 20L12 4" stroke={props.color || "currentColor"} strokeWidth="2" />
    <path d="M8 20L16 20" stroke={props.color || "currentColor"} strokeWidth="2" />
  </svg>
);

export const DrawingIcon = (props: { size?: number; color?: string }) => (
  <svg width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none">
    <path d="M15.2322 5.23223L18.7677 8.76777" stroke={props.color || "currentColor"} strokeWidth="2" strokeLinecap="round" />
    <path d="M13.2929 10.1716C12.9024 9.78105 12.9024 9.14788 13.2929 8.75736C13.6834 8.36683 14.3166 8.36683 14.7071 8.75736L15.2426 9.29289C15.6331 9.68342 15.6331 10.3166 15.2426 10.7071C14.8521 11.0976 14.2189 11.0976 13.8284 10.7071L13.2929 10.1716Z" stroke={props.color || "currentColor"} strokeWidth="2" />
    <path d="M13.2929 16.5147C12.9024 16.1242 12.9024 15.491 13.2929 15.1005C13.6834 14.71 14.3166 14.71 14.7071 15.1005L15.2426 15.6361C15.6331 16.0266 15.6331 16.6598 15.2426 17.0503C14.8521 17.4408 14.2189 17.4408 13.8284 17.0503L13.2929 16.5147Z" stroke={props.color || "currentColor"} strokeWidth="2" />
    <path d="M9.17157 13.2929C8.78105 12.9024 8.14788 12.9024 7.75736 13.2929C7.36684 13.6834 7.36684 14.3166 7.75736 14.7071L8.29289 15.2426C8.68342 15.6331 9.31658 15.6331 9.70711 15.2426C10.0976 14.8521 10.0976 14.2189 9.70711 13.8284L9.17157 13.2929Z" stroke={props.color || "currentColor"} strokeWidth="2" />
    <path d="M16.6569 7.75736C17.0474 7.36684 17.6805 7.36684 18.0711 7.75736C18.4616 8.14788 18.4616 8.78105 18.0711 9.17157L8.17157 19.0711C7.78105 19.4616 7.14788 19.4616 6.75736 19.0711C6.36684 18.6805 6.36684 18.0474 6.75736 17.6569L16.6569 7.75736Z" stroke={props.color || "currentColor"} strokeWidth="2" />
  </svg>
);


export const EmojiIcon = ({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" />
    <line x1="15" y1="9" x2="15.01" y2="9" />
  </svg>
);


export const ChannelIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M3 12h18M6 12v6M18 12v6" />
  </svg>
);

export const TrendChannelIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M3 3v18h18M7 13l10-4M7 17l10-4" />
  </svg>
);

export const CircleIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="12" cy="12" r="8" />
  </svg>
);

export const TriangleIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M12 4l8 16H4z" />
  </svg>
);

export const ArrowIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);


export const FibonacciExtensionIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M3 12h18M8 12v4h8v-4" />
  </svg>
);


export const AndrewPitchforkIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M3 12h18M6 8v8M12 6v12M18 8v8" />
  </svg>
);

export const GannFanIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M3 21L21 3M12 3v18M3 12h18" />
  </svg>
);

export const CycleLinesIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M3 12h18M6 6v12M12 3v18M18 6v12" />
  </svg>
);

export const GannBoxIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M8 8h8v8H8z" />
  </svg>
);

export const PitchforkIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M3 12h18M6 9v6M12 6v12M18 9v6" />
  </svg>
);


export const MAIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M3 12l4-4 4 4 4-4 4 4" strokeLinecap="round" />
  </svg>
);

export const RsiIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M3 12h18M6 8v8M12 6v12M18 10v4" />
  </svg>
);

export const MacdIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M3 12h18M6 10v4M12 8v8M18 6v12" />
  </svg>
);

export const BollingerBandsIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M3 12l4-4 4 4 4-4 4 4" strokeLinecap="round" />
    <path d="M3 8l4 4 4-4 4 4 4-4" strokeLinecap="round" />
    <path d="M3 16l4-4 4 4 4-4 4 4" strokeLinecap="round" />
  </svg>
);

export const VolumeIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M3 8v8h4l5 4V4L7 8H3z" />
  </svg>
);

export const IchimokuIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M3 12l4-4 4 4 4-4 4 4" strokeLinecap="round" />
    <path d="M3 8l4 4 4-4 4 4 4-4" strokeLinecap="round" />
  </svg>
);

export const EllipseIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <ellipse cx="12" cy="12" rx="8" ry="5" />
  </svg>
);

export const PieChartIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
    <path d="M22 12A10 10 0 0 0 12 2v10z" />
  </svg>
);

export const PencilIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M17 3L21 7L7 21H3V17L17 3Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15 5L19 9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const PenIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 19L19 12L22 15L15 22L12 19Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18 13L16.5 5.5L2 2L5.5 16.5L13 18L18 13Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2 2L9.5 9.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const BrushIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M20 10V3H7L3 7V21H13L21 13V10H20Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 21C9 19.3431 10.3431 18 12 18C13.6569 18 15 19.3431 15 21H9Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const HighlighterIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M9 11L3 17V21H7L13 15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M21 12L15 18L11 14L17 8L21 12Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15 6L17 4L20 7L18 9L15 6Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const EraserIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M7 21H21L16 12L12 16L7 21Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 12L12 16" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 13L8 8L16 16L11 21H3V13Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CalligraphyPenIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 19L19 12L15 8L8 15L12 19Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15 8L18 5L21 8L18 11L15 8Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 15L6 18L3 15L6 12L9 15Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const SprayIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M7 10H17V19H7V10Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 7V4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 4H16" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15 13H9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15 16H9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const MarkerIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M9 21H5C4.44772 21 4 20.5523 4 20V11L1 8L4 5V4C4 3.44772 4.44772 3 5 3H19C19.5523 3 20 3.44772 20 4V5L23 8L20 11V20C20 20.5523 19.5523 21 19 21H15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 21L12 17L15 21H9Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const RulerIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 7H21V17H3V7Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 7V17" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M9 7V17" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M12 7V17" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M15 7V17" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M18 7V17" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M3 12H21" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const TrashIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 6H5H21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6M19 6V20C19 20.5523 18.5523 21 18 21H6C5.44772 21 5 20.5523 5 20V6H19Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 11V17" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 11V17" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CursorIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M4 4L16 16L12 12L4 20L8 12L12 12L4 4Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const CursorCrosshairIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 4V8" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M12 16V20" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M4 12H8" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M16 12H20" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="12" r="2" stroke={color} strokeWidth="2" fill="none"/>
  </svg>
);

export const CursorDotIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="4" fill={color}/>
    <circle cx="12" cy="12" r="8" stroke={color} strokeWidth="2" fill="none"/>
  </svg>
);

export const CursorArrowIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M4 4L16 16L12 12L4 20L8 12L12 12L4 4Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const CursorSparkleIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="2" fill={color}/>
    <path d="M7 17L8.5 14.5L11 16L8.5 17.5L7 21L5.5 17.5L3 16L5.5 14.5L7 17Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 7L18.5 4.5L21 6L18.5 7.5L17 11L15.5 7.5L13 6L15.5 4.5L17 7Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const CursorEmojiIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2"/>
    <circle cx="8" cy="10" r="1" fill={color}/>
    <circle cx="16" cy="10" r="1" fill={color}/>
    <path d="M8 16C8 16 10 14 12 14C14 14 16 16 16 16" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);