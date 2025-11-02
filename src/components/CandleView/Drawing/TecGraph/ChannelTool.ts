import { DrawingConfig } from "../DrawingConfigs";

export const channelToolConfig: DrawingConfig = {
  type: 'channel',
  name: '通道线',
  minPoints: 2,
  maxPoints: 2,
  draw: (ctx, drawing) => {
    if (drawing.points.length === 2) {
      const [p1, p2] = drawing.points;
      const height = Math.abs(p2.y - p1.y);
      
      // 主趋势线
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      
      // 平行通道线
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y + height);
      ctx.lineTo(p2.x, p2.y + height);
      ctx.setLineDash([5, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  },
  getBoundingBox: (drawing) => {
    if (drawing.points.length !== 2) return { x: 0, y: 0, width: 0, height: 0 };

    const start = drawing.points[0];
    const end = drawing.points[1];
    const height = Math.abs(end.y - start.y);

    return {
      x: Math.min(start.x, end.x),
      y: Math.min(start.y, end.y),
      width: Math.abs(end.x - start.x),
      height: height * 2
    };
  },
  isPointInShape: (drawing, point) => {
    if (drawing.points.length !== 2) return false;

    const bbox = channelToolConfig.getBoundingBox(drawing);
    return point.x >= bbox.x && point.x <= bbox.x + bbox.width &&
      point.y >= bbox.y && point.y <= bbox.y + bbox.height;
  }
};