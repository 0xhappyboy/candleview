export interface Point {
  x: number;
  y: number;
}

export interface MarkDrawing {
  id: string;
  type: string;
  markType: MarkType;
  mark: any;
  points: Point[];
  color: string;
  lineWidth: number;
  isSelected?: boolean;
  rotation?: number;
  properties?: any;
  graphColor?: string;
  graphWidth?: number;
  graphStyle?: 'solid' | 'dashed' | 'dotted';
}

export interface HistoryRecord {
  drawings: MarkDrawing[];
  description: string;
}

export interface ICandleViewDataPoint {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  isVirtual?: boolean;
}

// ============================================= top panel type start =============================================
export enum TimeframeEnum {
  // s
  ONE_SECOND = '1s',
  FIVE_SECONDS = '5s',
  FIFTEEN_SECONDS = '15s',
  THIRTY_SECONDS = '30s',
  // m
  ONE_MINUTE = '1m',
  THREE_MINUTES = '3m',
  FIVE_MINUTES = '5m',
  FIFTEEN_MINUTES = '15m',
  THIRTY_MINUTES = '30m',
  FORTY_FIVE_MINUTES = '45m',
  // h
  ONE_HOUR = '1H',
  TWO_HOURS = '2H',
  THREE_HOURS = '3H',
  FOUR_HOURS = '4H',
  SIX_HOURS = '6H',
  EIGHT_HOURS = '8H',
  TWELVE_HOURS = '12H',
  // d
  ONE_DAY = '1D',
  THREE_DAYS = '3D',
  // w
  ONE_WEEK = '1W',
  TWO_WEEKS = '2W',
  // m
  ONE_MONTH = '1M',
  THREE_MONTHS = '3M',
  SIX_MONTHS = '6M'
}

export enum TimezoneEnum {
  NEW_YORK = 'America/New_York',
  CHICAGO = 'America/Chicago',
  DENVER = 'America/Denver',
  LOS_ANGELES = 'America/Los_Angeles',
  TORONTO = 'America/Toronto',
  LONDON = 'Europe/London',
  PARIS = 'Europe/Paris',
  FRANKFURT = 'Europe/Frankfurt',
  ZURICH = 'Europe/Zurich',
  MOSCOW = 'Europe/Moscow',
  DUBAI = 'Asia/Dubai',
  KARACHI = 'Asia/Karachi',
  KOLKATA = 'Asia/Kolkata',
  SHANGHAI = 'Asia/Shanghai',
  HONG_KONG = 'Asia/Hong_Kong',
  SINGAPORE = 'Asia/Singapore',
  TOKYO = 'Asia/Tokyo',
  SEOUL = 'Asia/Seoul',
  SYDNEY = 'Australia/Sydney',
  AUCKLAND = 'Pacific/Auckland',
  UTC = 'UTC'
}

// ============================================= top panel type end =============================================

// cursor type
export enum CursorType {
  Default = 'default',
  Crosshair = 'crosshair',
  None = 'none',
  // customize
  Circle = 'circle',
  Dot = 'dot',
}

// ============================================= chart indicator type start =============================================
export enum ChartType {
  MainChart = 'MainChart',
  SubChart = 'SubChart',
}

export enum MainChartType {
  Candle = "Candle",
  HollowCandle = "HollowCandle",
  Bar = "Bar",
  BaseLine = "BaseLine",
  Line = "Line",
  Area = "Area",
  StepLine = "StepLine",
  Histogram = "Histogram",
  HeikinAshi = "HeikinAshi",
  LineBreak = "LineBreak",
  Mountain = "Mountain",
  BaselineArea = "BaselineArea",
  HighLow = "HighLow",
  HLCArea = "HLCArea"
}

export enum MainChartIndicatorType {
  MA = 'MA',
  EMA = 'EMA',
  BOLLINGER = 'BOLLINGER',
  ICHIMOKU = 'ICHIMOKU',
  DONCHIAN = 'DONCHIAN',
  ENVELOPE = 'ENVELOPE',
  VWAP = 'VWAP',
  HEATMAP = 'HEATMAP',
  MARKETPROFILE = 'MARKETPROFILE'
}

export enum SubChartIndicatorType {
  RSI = 'RSI',
  MACD = 'MACD',
  VOLUME = 'VOLUME',
  SAR = 'SAR',
  KDJ = 'KDJ',
  ATR = 'ATR',
  STOCHASTIC = 'STOCHASTIC',
  CCI = 'CCI',
  BBWIDTH = 'BBWIDTH',
  ADX = 'ADX',
  OBV = 'OBV',
}
// ============================================= chart indicator type end =============================================


// ============================================= mark type start =============================================
export enum MarkType {
  Text, Emoji, LineSegment, ArrowLine, ThickArrowLine, HorizontalLine, VerticalLine, ParallelChannel, LinearRegressionChannel,
  EquidistantChannel, DisjointChannel, Pitchfork,
  AndrewPitchfork, EnhancedAndrewPitchfork, SchiffPitchfork,
  Rectangle, Circle, Ellipse, Sector,
  Curve, DoubleCurve,
  Triangle, GannFan, GannBox, GannRectangle,
  FibonacciTimeZoon, FibonacciRetracement, FibonacciArc, FibonacciCircle, FibonacciSpiral, FibonacciWedge, FibonacciFan,
  FibonacciChannel, FibonacciExtensionBasePrice, FibonacciExtensionBaseTime,
  XABCD, HeadAndShoulders, ABCD, TriangleABCD,
  Elliott_Impulse, Elliott_Corrective, Elliott_Triangle, Elliott_Double_Combination, Elliott_Triple_Combination,
  TimeRange, PriceRange, TimePriceRange,
  Pencil, Pen, Brush, MarkerPen, Eraser,
  Image, Table, LongPosition, ShortPosition, PriceLabel, Flag, PriceNote, SignPost, Pin, BubbleBox,
  TextEdit,
  MockKLine,
  HeatMap,
  TimeEvent, PriceEvent
}

export function markTypeName(markType: MarkType): string {
  switch (markType) {
    case MarkType.Text:
      return 'text';
    case MarkType.Text:
      return 'emoji';
    case MarkType.Text:
      return 'line-segment';
    case MarkType.Text:
      return 'horizontal-line';
    case MarkType.Text:
      return 'vertical-line';
    case MarkType.ArrowLine:
      return 'arrow-line';
    case MarkType.ThickArrowLine:
      return 'thick-arrow-line';
    case MarkType.ParallelChannel:
      return 'parallel-channel';
    case MarkType.LinearRegressionChannel:
      return 'linear-regression-channel';
    case MarkType.EquidistantChannel:
      return 'equidistant-channel';
    case MarkType.DisjointChannel:
      return 'disjoint-channel';
    case MarkType.Pitchfork:
      return 'pitch-pitch-fork';
    case MarkType.AndrewPitchfork:
      return 'andrew-pitch-fork';
    case MarkType.SchiffPitchfork:
      return 'schiff-pitch-fork';
    case MarkType.EnhancedAndrewPitchfork:
      return 'enhanced-andrew-pitch-fork';
    case MarkType.Rectangle:
      return 'rectangle';
    case MarkType.Circle:
      return 'circle';
    case MarkType.Ellipse:
      return 'ellipse';
    case MarkType.Triangle:
      return 'triangle';
    case MarkType.GannFan:
      return 'gann-fan';
    case MarkType.GannBox:
      return 'gann-box';
    case MarkType.GannRectangle:
      return 'gann-rectangle';
    case MarkType.FibonacciTimeZoon:
      return 'fibonacci-time-zoon';
    case MarkType.FibonacciRetracement:
      return 'fibonacci-retracement';
    case MarkType.FibonacciArc:
      return 'fibonacci-fibonacci-arc';
    case MarkType.FibonacciCircle:
      return 'fibonacci-circle';
    case MarkType.FibonacciSpiral:
      return 'fibonacci-spiral';
    case MarkType.FibonacciWedge:
      return 'fibonacci-wedge';
    case MarkType.FibonacciFan:
      return 'fibonacci-fan';
    case MarkType.FibonacciChannel:
      return 'fibonacci-channel';
    case MarkType.FibonacciExtensionBasePrice:
      return 'fibonacci-extension-base-price';
    case MarkType.FibonacciExtensionBaseTime:
      return 'fibonacci-extension-base-time';
    case MarkType.Sector:
      return 'sector';
    case MarkType.Curve:
      return 'curve';
    case MarkType.DoubleCurve:
      return 'double-curve';
    case MarkType.XABCD:
      return 'xabcd';
    case MarkType.HeadAndShoulders:
      return 'head-and-shoulders';
    case MarkType.ABCD:
      return 'abcd';
    case MarkType.TriangleABCD:
      return 'triangle-abcd';
    case MarkType.Elliott_Impulse:
      return 'elliott-impulse';
    case MarkType.Elliott_Corrective:
      return 'elliott-corrective';
    case MarkType.Elliott_Triangle:
      return 'elliott-triangle';
    case MarkType.Elliott_Double_Combination:
      return 'elliott-double-combination';
    case MarkType.Elliott_Triple_Combination:
      return 'elliott-triple-combination';
    case MarkType.TimeRange:
      return 'time-range';
    case MarkType.PriceRange:
      return 'price-range';
    case MarkType.TimePriceRange:
      return 'time-price-range';
    case MarkType.Pencil:
      return 'pencil';
    case MarkType.Pen:
      return 'pen';
    case MarkType.Brush:
      return 'brush';
    case MarkType.MarkerPen:
      return 'marker-pen';
    case MarkType.Eraser:
      return 'eraser';
    case MarkType.Image:
      return 'image';
    case MarkType.Table:
      return 'table';
    case MarkType.LongPosition:
      return 'long-position';
    case MarkType.ShortPosition:
      return 'short-position';
    case MarkType.PriceLabel:
      return 'price-label';
    case MarkType.Flag:
      return 'flag';
    case MarkType.PriceNote:
      return 'price-note';
    case MarkType.SignPost:
      return 'signpost';
    case MarkType.Pin:
      return 'pin';
    case MarkType.BubbleBox:
      return 'bubble-box';
    case MarkType.TextEdit:
      return 'text-edit';
    case MarkType.MockKLine:
      return 'mock-line';
    case MarkType.HeatMap:
      return "heat-map"
    default:
      return '';
  }
}

// ============================================= mark type start =============================================

export enum ScriptType {
  Time = 'time',
  Price = 'price',
  None = 'none'
}