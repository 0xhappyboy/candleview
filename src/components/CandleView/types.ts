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
  Text, Emoji, LineSegment, ArrowLine, HorizontalLine, VerticalLine, ParallelChannel, LinearRegressionChannel,
  EquidistantChannel, DisjointChannel
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
    case MarkType.ParallelChannel:
      return 'parallel-channel';
    case MarkType.LinearRegressionChannel:
      return 'linear-regression-channel';
      return 'parallel-channel';
    case MarkType.EquidistantChannel:
      return 'equidistant-channel';
    case MarkType.DisjointChannel:
      return 'disjoint-channel';
    default:
      return '';
  }
}