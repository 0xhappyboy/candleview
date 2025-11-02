import { DrawingConfig } from "../DrawingConfigs";

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
