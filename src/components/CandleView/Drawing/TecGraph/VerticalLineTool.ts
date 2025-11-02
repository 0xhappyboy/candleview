// VerticalLineTool.ts

import { DrawingConfig } from "../DrawingConfigs";

export const verticalLineToolConfig: DrawingConfig = {
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