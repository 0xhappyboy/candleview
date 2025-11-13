export interface Point {
  x: number;
  y: number;
}

export interface Drawing {
  id: string;
  type: string;
  points: Point[];
  color: string;
  lineWidth: number;
  isSelected?: boolean;
  rotation?: number;
  properties?: any;
}

export interface HistoryRecord {
  drawings: Drawing[];
  description: string;
}

export enum MarkType {
  Text, Emoji, LineSegment, ArrowLine, ThickArrowLine, HorizontalLine, VerticalLine, ParallelChannel, LinearRegressionChannel,
  EquidistantChannel, DisjointChannel, Pitchfork, AndrewPitchfork, EnhancedAndrewPitchfork, Rectangle, Circle, Ellipse, Sector,
  Curve, DoubleCurve,
  Triangle, GannFan, GannBox, GannRectangle,
  FibonacciTimeZoon, FibonacciRetracement, FibonacciArc, FibonacciCircle, FibonacciSpiral, FibonacciWedge, FibonacciFan,
  FibonacciChannel, FibonacciExtensionBasePrice, FibonacciExtensionBaseTime,
  XABCD, HeadAndShoulders, ABCD, TriangleABCD,
  Elliott_Impulse, Elliott_Corrective, Elliott_Triangle, Elliott_Double_Combination, Elliott_Triple_Combination,
  TimeRange, PriceRange, TimePriceRange,
  Pencil, Pen, Brush, MarkerPen, Eraser,
  Image, Table, LongPosition, ShortPosition, PriceLabel
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
    default:
      return '';
  }
}