import { ChartSeries } from "../../ChartLayer/ChartTypeManager";
import { Point } from "../../types";
import { LineMark } from "../Graph/Line/LineMark";

export interface LineMarkManagerProps {
  chartSeries: ChartSeries | null;
  chart: any;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onCloseDrawing?: () => void;
}

export interface LineMarkState {
  isLineMarkMode: boolean;
  lineMarkStartPoint: Point | null;
  currentLineMark: LineMark | null;
  isDragging: boolean;
  dragTarget: LineMark | null;
  dragPoint: 'start' | 'end' | 'line' | null;
}

export class LineMarkManager {
  private props: LineMarkManagerProps;
  private state: LineMarkState;
  private previewLineMark: LineMark | null = null;
  private lineMarks: LineMark[] = [];
  private mouseDownPoint: Point | null = null;
  private dragStartData: { time: number; price: number } | null = null;

  constructor(props: LineMarkManagerProps) {
    this.props = props;
    this.state = {
      isLineMarkMode: false,
      lineMarkStartPoint: null,
      currentLineMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
  }
  
  public setLineMarkMode = (): LineMarkState => {
    this.state = {
      ...this.state,
      isLineMarkMode: true,
      lineMarkStartPoint: null,
      currentLineMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
    return this.state;
  };
  
  public cancelLineMarkMode = (): LineMarkState => {
    if (this.previewLineMark) {
      this.props.chartSeries?.series.detachPrimitive(this.previewLineMark);
      this.previewLineMark = null;
    }

    // 隐藏所有控制点
    this.lineMarks.forEach(mark => {
      mark.setShowHandles(false);
    });

    this.state = {
      ...this.state,
      isLineMarkMode: false,
      lineMarkStartPoint: null,
      currentLineMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
    return this.state;
  };
  
  public handleMouseDown = (point: Point): LineMarkState => {
    const { chartSeries, chart, containerRef } = this.props;
    if (!chartSeries || !chart) {
      return this.state;
    }

    try {
      const chartElement = chart.chartElement();
      if (!chartElement) return this.state;

      const chartRect = chartElement.getBoundingClientRect();
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return this.state;

      const relativeX = point.x - (containerRect.left - chartRect.left);
      const relativeY = point.y - (containerRect.top - chartRect.top);

      const timeScale = chart.timeScale();
      const time = timeScale.coordinateToTime(relativeX);
      const price = chartSeries.series.coordinateToPrice(relativeY);

      if (time === null || price === null) return this.state;

      this.mouseDownPoint = point;
      this.dragStartData = { time, price };

      // 检查是否点击了已有的控制点或直线
      if (this.state.isLineMarkMode) {
        for (const mark of this.lineMarks) {
          const handleType = mark.isPointNearHandle(relativeX, relativeY);
          if (handleType) {
            // 开始拖动控制点
            this.state = {
              ...this.state,
              isDragging: true,
              dragTarget: mark,
              dragPoint: handleType
            };
            mark.setDragging(true, handleType);
            return this.state;
          }
        }

        // 检查是否点击了直线本身
        for (const mark of this.lineMarks) {
          const bounds = mark.getBounds();
          if (bounds && this.isPointNearLine(relativeX, relativeY, bounds)) {
            // 开始拖动整条直线
            this.state = {
              ...this.state,
              isDragging: true,
              dragTarget: mark,
              dragPoint: 'line'
            };
            mark.setDragging(true, 'line');
            return this.state;
          }
        }
      }

      // 创建新直线
      if (this.state.isLineMarkMode && !this.state.isDragging) {
        if (!this.state.lineMarkStartPoint) {
          this.state = {
            ...this.state,
            lineMarkStartPoint: point
          };

          this.previewLineMark = new LineMark(
            time.toString(),
            price,
            time.toString(),
            price,
            '#2962FF',
            2,
            true
          );
          chartSeries.series.attachPrimitive(this.previewLineMark);
        } else {
          if (this.previewLineMark) {
            chartSeries.series.detachPrimitive(this.previewLineMark);
            const finalLineMark = new LineMark(
              this.previewLineMark.getStartTime(),
              this.previewLineMark.getStartPrice(),
              time.toString(),
              price,
              '#2962FF',
              2,
              false
            );
            chartSeries.series.attachPrimitive(finalLineMark);
            this.lineMarks.push(finalLineMark);
            this.previewLineMark = null;
          }

          this.state = {
            ...this.state,
            isLineMarkMode: false,
            lineMarkStartPoint: null,
            currentLineMark: null
          };
          
          if (this.props.onCloseDrawing) {
            this.props.onCloseDrawing();
          }
        }
      }

    } catch (error) {
      console.error('Error placing line mark:', error);
      this.state = this.cancelLineMarkMode();
    }

    return this.state;
  };

  // 检查点是否靠近直线
  private isPointNearLine(x: number, y: number, bounds: any, threshold: number = 8): boolean {
    const { startX, startY, endX, endY, minX, maxX, minY, maxY } = bounds;
    
    // 快速边界检查
    if (x < minX - threshold || x > maxX + threshold || y < minY - threshold || y > maxY + threshold) {
      return false;
    }

    // 计算点到直线的距离
    const A = x - startX;
    const B = y - startY;
    const C = endX - startX;
    const D = endY - startY;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) {
      param = dot / lenSq;
    }

    let xx, yy;

    if (param < 0) {
      xx = startX;
      yy = startY;
    } else if (param > 1) {
      xx = endX;
      yy = endY;
    } else {
      xx = startX + param * C;
      yy = startY + param * D;
    }

    const dx = x - xx;
    const dy = y - yy;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance <= threshold;
  }

  public handleMouseMove = (point: Point): void => {
    const { chartSeries, chart, containerRef } = this.props;
    if (!chartSeries || !chart) return;

    try {
      const chartElement = chart.chartElement();
      if (!chartElement) return;

      const chartRect = chartElement.getBoundingClientRect();
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;

      const relativeX = point.x - (containerRect.left - chartRect.left);
      const relativeY = point.y - (containerRect.top - chartRect.top);

      const timeScale = chart.timeScale();
      const time = timeScale.coordinateToTime(relativeX);
      const price = chartSeries.series.coordinateToPrice(relativeY);

      if (time === null || price === null) return;

      // 拖动处理
      if (this.state.isDragging && this.state.dragTarget && this.dragStartData) {
        const deltaTime = time - this.dragStartData.time;
        const deltaPrice = price - this.dragStartData.price;

        if (this.state.dragPoint === 'start') {
          this.state.dragTarget.updateStartPoint(time.toString(), price);
        } else if (this.state.dragPoint === 'end') {
          this.state.dragTarget.updateEndPoint(time.toString(), price);
        } else if (this.state.dragPoint === 'line') {
          // 拖动整条直线
          this.state.dragTarget.dragLine(deltaTime, deltaPrice);
        }
        return;
      }

      // 预览模式下的直线更新
      if (this.state.isLineMarkMode && !this.state.isDragging) {
        if (this.state.lineMarkStartPoint && this.previewLineMark) {
          this.previewLineMark.updateEndPoint(time.toString(), price);
          chart.timeScale().widthChanged();
        }

        // 显示/隐藏控制点
        let showHandles = false;
        for (const mark of this.lineMarks) {
          const handleType = mark.isPointNearHandle(relativeX, relativeY);
          if (handleType || this.isPointNearLine(relativeX, relativeY, mark.getBounds())) {
            showHandles = true;
            break;
          }
        }
        
        // 更新所有直线的控制点显示状态
        this.lineMarks.forEach(mark => {
          mark.setShowHandles(showHandles);
        });
      }

    } catch (error) {
      console.error('Error updating line mark:', error);
    }
  };

  public handleMouseUp = (point: Point): LineMarkState => {
    if (this.state.isDragging) {
      // 结束拖动
      if (this.state.dragTarget) {
        this.state.dragTarget.setDragging(false, null);
      }
      
      this.state = {
        ...this.state,
        isDragging: false,
        dragTarget: null,
        dragPoint: null
      };
    }
    
    this.mouseDownPoint = null;
    this.dragStartData = null;
    return this.state;
  };
  
  public handleKeyDown = (event: KeyboardEvent): LineMarkState => {
    if (event.key === 'Escape') {
      if (this.state.isDragging) {
        // 如果正在拖动，取消拖动
        if (this.state.dragTarget) {
          this.state.dragTarget.setDragging(false, null);
        }
        this.state = {
          ...this.state,
          isDragging: false,
          dragTarget: null,
          dragPoint: null
        };
      } else if (this.state.isLineMarkMode) {
        return this.cancelLineMarkMode();
      }
    }
    return this.state;
  };
  
  public getState(): LineMarkState {
    return { ...this.state };
  }
  
  public updateProps(newProps: Partial<LineMarkManagerProps>): void {
    this.props = { ...this.props, ...newProps };
  }
  
  public destroy(): void {
    if (this.previewLineMark) {
      this.props.chartSeries?.series.detachPrimitive(this.previewLineMark);
      this.previewLineMark = null;
    }
    
    // 清理所有直线标注
    this.lineMarks.forEach(mark => {
      this.props.chartSeries?.series.detachPrimitive(mark);
    });
    this.lineMarks = [];
  }

  // 获取所有直线标注
  public getLineMarks(): LineMark[] {
    return [...this.lineMarks];
  }

  // 移除指定的直线标注
  public removeLineMark(mark: LineMark): void {
    const index = this.lineMarks.indexOf(mark);
    if (index > -1) {
      this.props.chartSeries?.series.detachPrimitive(mark);
      this.lineMarks.splice(index, 1);
    }
  }
}