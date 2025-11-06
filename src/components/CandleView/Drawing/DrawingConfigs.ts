import { Drawing } from "../types";
import { arrowToolConfig } from './TecGraph/ArrowTool';
import { channelToolConfig } from "./TecGraph/ChannelTool";
import { trendChannelToolConfig } from "./TecGraph/TrendChannelTool";
import { lineToolConfig } from "./TecGraph/LineTool";
import { verticalLineToolConfig } from "./TecGraph/VerticalLineTool";

export interface DrawingConfig {
  type: string;
  name: string;
  minPoints: number;
  maxPoints: number;
  draw: (ctx: CanvasRenderingContext2D, drawing: Drawing) => void;
  getBoundingBox: (drawing: Drawing) => { x: number; y: number; width: number; height: number };
  isPointInShape: (drawing: Drawing, point: { x: number; y: number }) => boolean;
}


export const pointToLineDistance = (
  point: { x: number; y: number },
  lineStart: { x: number; y: number },
  lineEnd: { x: number; y: number }
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


export const lineConfig: DrawingConfig = {
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


export const horizontalLineConfig: DrawingConfig = {
  type: 'horizontal-line',
  name: '水平线',
  minPoints: 1,
  maxPoints: 1,
  draw: (ctx, drawing) => {
    if (drawing.points.length >= 1) {
      const y = drawing.points[0].y;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(ctx.canvas.width, y);
      ctx.stroke();
    }
  },
  getBoundingBox: (drawing) => {
    if (drawing.points.length < 1) return { x: 0, y: 0, width: 0, height: 0 };

    return {
      x: 0,
      y: drawing.points[0].y - 2,
      width: 1000,
      height: 4
    };
  },
  isPointInShape: (drawing, point) => {
    if (drawing.points.length < 1) return false;
    return Math.abs(point.y - drawing.points[0].y) < 5;
  }
};


export const verticalLineConfig: DrawingConfig = {
  type: 'vertical-line',
  name: '垂直线',
  minPoints: 1,
  maxPoints: 1,
  draw: (ctx, drawing) => {
    if (drawing.points.length >= 1) {
      const x = drawing.points[0].x;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, ctx.canvas.height);
      ctx.stroke();
    }
  },
  getBoundingBox: (drawing) => {
    if (drawing.points.length < 1) return { x: 0, y: 0, width: 0, height: 0 };

    return {
      x: drawing.points[0].x - 2,
      y: 0,
      width: 4,
      height: 1000
    };
  },
  isPointInShape: (drawing, point) => {
    if (drawing.points.length < 1) return false;
    return Math.abs(point.x - drawing.points[0].x) < 5;
  }
};


export const rectangleConfig: DrawingConfig = {
  type: 'rectangle',
  name: '矩形',
  minPoints: 2,
  maxPoints: 2,
  draw: (ctx, drawing) => {
    if (drawing.points.length === 2) {
      const [start, end] = drawing.points;
      const width = end.x - start.x;
      const height = end.y - start.y;
      ctx.beginPath();
      ctx.rect(start.x, start.y, width, height);
      ctx.stroke();
    }
  },
  getBoundingBox: (drawing) => {
    if (drawing.points.length !== 2) return { x: 0, y: 0, width: 0, height: 0 };

    const start = drawing.points[0];
    const end = drawing.points[1];

    return {
      x: Math.min(start.x, end.x),
      y: Math.min(start.y, end.y),
      width: Math.abs(end.x - start.x),
      height: Math.abs(end.y - start.y)
    };
  },
  isPointInShape: (drawing, point) => {
    if (drawing.points.length !== 2) return false;

    const bbox = rectangleConfig.getBoundingBox(drawing);
    return point.x >= bbox.x && point.x <= bbox.x + bbox.width &&
      point.y >= bbox.y && point.y <= bbox.y + bbox.height;
  }
};


export const drawingConfigs: Map<string, DrawingConfig> = new Map([
  ['line', lineConfig],
  ['horizontal-line', horizontalLineConfig],
  ['vertical-line', verticalLineConfig],
  ['rectangle', rectangleConfig]
]);


export const registerDrawingConfig = (config: DrawingConfig) => {
  drawingConfigs.set(config.type, config);
};


export const unregisterDrawingConfig = (type: string) => {
  drawingConfigs.delete(type);
};


export const getSupportedDrawingTypes = (): string[] => {
  return Array.from(drawingConfigs.keys());
};


export const getDrawingConfig = (type: string): DrawingConfig | undefined => {
  return drawingConfigs.get(type);
};



drawingConfigs.set('channel', channelToolConfig);
drawingConfigs.set('trend-channel', trendChannelToolConfig);
drawingConfigs.set('arrow', arrowToolConfig);
drawingConfigs.set('horizonta-line', lineToolConfig);
drawingConfigs.set('trend-channel', trendChannelToolConfig);
drawingConfigs.set('vertical-line', verticalLineToolConfig);