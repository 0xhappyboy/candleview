import { DrawingConfig } from "../DrawingConfigs";
import { Point } from "../../types";

export const lineToolConfig: DrawingConfig = {
  type: 'line',
  name: '趋势线',
  minPoints: 2,
  maxPoints: 2,
  draw: (ctx, drawing) => {
    if (drawing.points.length === 2) {
      ctx.beginPath();
      ctx.moveTo(drawing.points[0].x, drawing.points[0].y);
      ctx.lineTo(drawing.points[1].x, drawing.points[1].y);
      ctx.stroke();
    }
  },
  getBoundingBox: (drawing) => {
    if (drawing.points.length !== 2) return { x: 0, y: 0, width: 0, height: 0 };

    const x1 = Math.min(drawing.points[0].x, drawing.points[1].x);
    const y1 = Math.min(drawing.points[0].y, drawing.points[1].y);
    const x2 = Math.max(drawing.points[0].x, drawing.points[1].x);
    const y2 = Math.max(drawing.points[0].y, drawing.points[1].y);

    return {
      x: x1,
      y: y1,
      width: x2 - x1,
      height: y2 - y1
    };
  },
  isPointInShape: (drawing, point) => {
    if (drawing.points.length !== 2) return false;

    const p1 = drawing.points[0];
    const p2 = drawing.points[1];

    const distance = pointToLineDistance(point, p1, p2);
    return distance < 5;
  }
};

const pointToLineDistance = (
  point: Point,
  lineStart: Point,
  lineEnd: Point
): number => {
  const A = point.x - lineStart.x;
  const B = point.y - lineStart.y;
  const C = lineEnd.x - lineStart.x;
  const D = lineEnd.y - lineStart.y;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;

  if (lenSq !== 0) {
    param = dot / lenSq;
  }

  let xx, yy;

  if (param < 0) {
    xx = lineStart.x;
    yy = lineStart.y;
  } else if (param > 1) {
    xx = lineEnd.x;
    yy = lineEnd.y;
  } else {
    xx = lineStart.x + param * C;
    yy = lineStart.y + param * D;
  }

  const dx = point.x - xx;
  const dy = point.y - yy;
  return Math.sqrt(dx * dx + dy * dy);
};