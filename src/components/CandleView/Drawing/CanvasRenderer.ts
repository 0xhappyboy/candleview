import { Drawing, Point } from './types';
import { DrawingConfig } from './DrawingConfigs';

export class CanvasRenderer {
  static drawShape(ctx: CanvasRenderingContext2D, drawing: Drawing, configs: Map<string, DrawingConfig>) {
    ctx.save();
    ctx.strokeStyle = drawing.color;
    ctx.lineWidth = drawing.lineWidth;
    ctx.fillStyle = drawing.color + '20';

    const config = configs.get(drawing.type);
    if (config) {
      config.draw(ctx, drawing);
    } else {
      this.drawDefaultShape(ctx, drawing);
    }
    ctx.restore();
  }

  static drawPreview(
    ctx: CanvasRenderingContext2D,
    drawingPoints: Point[],
    activeTool: string | null,
    previewColor: string,
    configs: Map<string, DrawingConfig>
  ) {
    if (!activeTool || drawingPoints.length === 0) return;

    ctx.save();
    ctx.strokeStyle = previewColor;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);

    const config = configs.get(activeTool);
    if (config) {
      const previewDrawing: Drawing = {
        id: 'preview',
        type: activeTool,
        points: drawingPoints,
        color: previewColor,
        lineWidth: 2
      };
      config.draw(ctx, previewDrawing);
    }

    ctx.restore();
  }

  static drawSelection(ctx: CanvasRenderingContext2D, drawing: Drawing, configs: Map<string, DrawingConfig>) {
    const config = configs.get(drawing.type);
    if (!config) return;

    const bbox = config.getBoundingBox(drawing);

    ctx.save();
    ctx.strokeStyle = '#4A90E2';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.strokeRect(bbox.x, bbox.y, bbox.width, bbox.height);

    const handles = this.getResizeHandles(bbox);
    ctx.setLineDash([]);
    ctx.fillStyle = '#4A90E2';

    handles.forEach(handle => {
      ctx.fillRect(handle.x - 3, handle.y - 3, 6, 6);
    });

    ctx.restore();
  }

  static getResizeHandles(bbox: { x: number; y: number; width: number; height: number }) {
    return [
      { x: bbox.x, y: bbox.y, type: 'nw' },
      { x: bbox.x + bbox.width, y: bbox.y, type: 'ne' },
      { x: bbox.x, y: bbox.y + bbox.height, type: 'sw' },
      { x: bbox.x + bbox.width, y: bbox.y + bbox.height, type: 'se' }
    ];
  }

  private static drawDefaultShape(ctx: CanvasRenderingContext2D, drawing: Drawing) {
    ctx.beginPath();
    if (drawing.points.length > 0) {
      ctx.moveTo(drawing.points[0].x, drawing.points[0].y);
      drawing.points.forEach(point => {
        ctx.lineTo(point.x, point.y);
      });
    }
    ctx.stroke();
  }
}
