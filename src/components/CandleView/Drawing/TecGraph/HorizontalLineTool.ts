import { DrawingConfig } from "../DrawingConfigs";

export const horizontalLineToolConfig: DrawingConfig = {
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