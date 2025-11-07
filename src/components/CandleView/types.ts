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
  Text, Emoji, LineSegment, HorizontalLine, VerticalLine
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
    default:
      return '';
  }
}