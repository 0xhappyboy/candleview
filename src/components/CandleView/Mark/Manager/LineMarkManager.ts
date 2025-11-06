import { ChartSeries } from "../../ChartLayer/ChartTypeManager";
import { Point } from "../../types";
import { LineMark } from "../Graph/LineMark";

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
}

export class LineMarkManager {
  private props: LineMarkManagerProps;
  private state: LineMarkState;
  private previewLineMark: LineMark | null = null;

  constructor(props: LineMarkManagerProps) {
    this.props = props;
    this.state = {
      isLineMarkMode: false,
      lineMarkStartPoint: null,
      currentLineMark: null
    };
  }
  
  public setLineMarkMode = (): LineMarkState => {
    this.state = {
      ...this.state,
      isLineMarkMode: true,
      lineMarkStartPoint: null,
      currentLineMark: null
    };
    return this.state;
  };
  
  public cancelLineMarkMode = (): LineMarkState => {
    if (this.previewLineMark) {
      this.props.chartSeries?.series.detachPrimitive(this.previewLineMark);
      this.previewLineMark = null;
    }

    this.state = {
      ...this.state,
      isLineMarkMode: false,
      lineMarkStartPoint: null,
      currentLineMark: null
    };
    return this.state;
  };
  
  public handleMouseDown = (point: Point): LineMarkState => {
    const { chartSeries, chart, containerRef } = this.props;
    if (!this.state.isLineMarkMode || !chartSeries || !chart) {
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
          this.previewLineMark = null;
        }

        this.state = this.cancelLineMarkMode();
        if (this.props.onCloseDrawing) {
          this.props.onCloseDrawing();
        }
      }
    } catch (error) {
      console.error('Error placing line mark:', error);
      this.state = this.cancelLineMarkMode();
    }

    return this.state;
  };

  
  public handleMouseMove = (point: Point): void => {
    if (!this.state.isLineMarkMode || !this.state.lineMarkStartPoint || !this.previewLineMark) {
      return;
    }

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

      if (time !== null && price !== null && this.previewLineMark) {
        
        this.previewLineMark.updateEndPoint(time.toString(), price);

        
        chart.timeScale().widthChanged();
      }
    } catch (error) {
      console.error('Error updating line mark preview:', error);
    }
  };

  
  public handleKeyDown = (event: KeyboardEvent): LineMarkState => {
    if (event.key === 'Escape' && this.state.isLineMarkMode) {
      return this.cancelLineMarkMode();
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
  }
}