import { DrawingConfig } from "../DrawingConfigs";

export const trendChannelToolConfig: DrawingConfig = {
  type: 'trend-channel',
  name: '趋势通道',
  minPoints: 3,
  maxPoints: 3,
  draw: (ctx, drawing) => {
    if (drawing.points.length === 3) {
      const [p1, p2, p3] = drawing.points;
      
      // 计算通道宽度
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const channelHeight = p3.y - p1.y;
      
      // 下轨线
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      
      // 上轨线
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y + channelHeight);
      ctx.lineTo(p2.x, p2.y + channelHeight);
      ctx.stroke();
      
      // 连接线
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p1.x, p1.y + channelHeight);
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  },
  getBoundingBox: (drawing) => {
    if (drawing.points.length !== 3) return { x: 0, y: 0, width: 0, height: 0 };

    const p1 = drawing.points[0];
    const p2 = drawing.points[1];
    const p3 = drawing.points[2];
    
    const minX = Math.min(p1.x, p2.x);
    const maxX = Math.max(p1.x, p2.x);
    const minY = Math.min(p1.y, p2.y, p3.y);
    const maxY = Math.max(p1.y, p2.y, p3.y);

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  },
  isPointInShape: (drawing, point) => {
    if (drawing.points.length !== 3) return false;

    const bbox = trendChannelToolConfig.getBoundingBox(drawing);
    return point.x >= bbox.x && point.x <= bbox.x + bbox.width &&
      point.y >= bbox.y && point.y <= bbox.y + bbox.height;
  }
};