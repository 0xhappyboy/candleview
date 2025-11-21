import React from 'react';
import { createChart, IChartApi, HistogramSeries, ISeriesApi } from 'lightweight-charts';
import { ThemeConfig } from '../../CandleViewTheme';
import { ICandleViewDataPoint } from '../../types';

interface VolumeProps {
  theme: ThemeConfig;
  data: ICandleViewDataPoint[];
  height: number;
  width: string;
  chart: any;
}

interface VolumeState { }

export class Volume extends React.Component<VolumeProps, VolumeState> {
  private chartContainerRef = React.createRef<HTMLDivElement>();
  private chartRef: IChartApi | null = null;
  private volumeSeries: ISeriesApi<'Histogram'> | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private timeScaleSubscribe: any = null;
  private isSyncing: boolean = false;

  private calculateVolumeData = (priceData: ICandleViewDataPoint[]) => {
    return priceData.map((item, index) => {
      if (item.isVirtual) {
        return {
          time: item.time as any,
          value: 0,
          color: 'transparent'
        };
      }
      const baseColor = index > 0 && item.volume > priceData[index - 1].volume
        ? '#26C6DA'
        : '#FF6B6B';
      return {
        time: item.time as any,
        value: item.volume || 0,
        color: baseColor
      };
    });
  };

  private syncTimeScale = () => {
    const { chart } = this.props;
    if (this.isSyncing || !chart || !this.chartRef) return;
    this.isSyncing = true;
    try {
      const mainTimeScale = chart.timeScale();
      const volumeTimeScale = this.chartRef.timeScale();
      const visibleRange = mainTimeScale.getVisibleLogicalRange();
      if (visibleRange) {
        volumeTimeScale.setVisibleLogicalRange(visibleRange);
      }
    } catch (error) {
      console.error(error);
    } finally {
      this.isSyncing = false;
    }
  };

  private syncTimeScaleOptions = () => {
    const { chart } = this.props;
    if (!chart || !this.chartRef) return;
    try {
      const mainTimeScale = chart.timeScale();
      const volumeTimeScale = this.chartRef.timeScale();
      volumeTimeScale.applyOptions({
        barSpacing: mainTimeScale.options().barSpacing,
        minBarSpacing: mainTimeScale.options().minBarSpacing,
        rightOffset: mainTimeScale.options().rightOffset,
      });
    } catch (error) {
      console.error(error);
    }
  };

  componentDidMount() {
    this.initializeChart();
  }

  componentDidUpdate(prevProps: VolumeProps) {
    if (prevProps.data !== this.props.data && this.volumeSeries) {
      this.updateChartData();
    }
    if (prevProps.height !== this.props.height && this.chartRef) {
      this.chartRef.applyOptions({ height: this.props.height - 24 });
      setTimeout(() => {
        this.syncTimeScale();
      }, 50);
    }
    if (prevProps.chart !== this.props.chart) {
      this.updateChartSubscription();
    }
  }

  componentWillUnmount() {
    this.cleanup();
  }

  private updateChartData = () => {
    if (!this.volumeSeries) return;
    const volumeData = this.calculateVolumeData(this.props.data);
    requestAnimationFrame(() => {
      if (this.volumeSeries) {
        this.volumeSeries.setData(volumeData);
        setTimeout(() => {
          this.syncTimeScale();
        }, 16);
      }
    });
  };

  private updateChartSubscription = () => {
    if (this.timeScaleSubscribe && this.props.chart) {
      this.props.chart.timeScale().unsubscribeVisibleLogicalRangeChange(this.timeScaleSubscribe);
    }
    if (this.props.chart && this.chartRef) {
      this.timeScaleSubscribe = this.props.chart.timeScale().subscribeVisibleLogicalRangeChange(this.syncTimeScale);
      setTimeout(() => {
        this.syncTimeScale();
        this.syncTimeScaleOptions();
      }, 100);
    }
  };

  private initializeChart() {
    const { chart, data, height, theme } = this.props;
    if (!this.chartContainerRef.current) return;
    const container = this.chartContainerRef.current;
    const containerWidth = container.clientWidth;
    this.chartRef = createChart(container, {
      width: containerWidth,
      height: height - 24,
      layout: {
        background: { color: 'transparent' },
        textColor: 'transparent',
        attributionLogo: false,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false }
      },
      rightPriceScale: {
        visible: false,
        borderVisible: false,
        entireTextOnly: false,
      },
      leftPriceScale: {
        visible: false,
        borderVisible: false,
        entireTextOnly: false,
      },
      timeScale: {
        visible: false,
        borderVisible: false,
        rightOffset: 0,
        barSpacing: 6,
        minBarSpacing: 0.5,
      },
      crosshair: {
        vertLine: {
          visible: false,
          labelVisible: false,
        },
        horzLine: {
          visible: false,
          labelVisible: false,
        },
        mode: 0
      },
      handleScale: {
        mouseWheel: false,
        pinch: false,
        axisPressedMouseMove: false,
      },
      handleScroll: {
        mouseWheel: false,
        pressedMouseMove: false,
        horzTouchDrag: false,
        vertTouchDrag: false,
      },
    });
    const volumeData = this.calculateVolumeData(data);
    this.volumeSeries = this.chartRef.addSeries(HistogramSeries, {
      color: '#26C6DA',
      priceFormat: { type: 'volume' },
      lastValueVisible: false,
      priceLineVisible: false,
    }) as ISeriesApi<'Histogram'>;
    this.volumeSeries.setData(volumeData);
    setTimeout(() => {
      if (this.volumeSeries) {
        this.volumeSeries.applyOptions({
          lastValueVisible: false,
          priceLineVisible: false,
        });
      }
      if (this.chartRef) {
        this.chartRef.applyOptions({
          rightPriceScale: {
            visible: false,
            borderVisible: false,
          },
          leftPriceScale: {
            visible: false,
            borderVisible: false,
          }
        });
      }
    }, 100);
    this.updateChartSubscription();
    this.chartRef.timeScale().subscribeVisibleLogicalRangeChange(() => {
      if (!this.isSyncing && chart) {
        this.syncTimeScale();
      }
    });
    this.resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        if (this.chartRef && width > 0) {
          try {
            this.chartRef.applyOptions({ width });
            setTimeout(this.syncTimeScale, 10);
          } catch (error) {
            console.error(error);
          }
        }
      }
    });
    this.resizeObserver.observe(container);
    setTimeout(() => {
      if (this.chartRef && chart) {
        this.chartRef.timeScale().fitContent();
        setTimeout(() => {
          this.syncTimeScale();
          this.syncTimeScaleOptions();
        }, 50);
      }
    }, 300);
  }

  private cleanup() {
    if (this.timeScaleSubscribe && this.props.chart) {
      this.props.chart.timeScale().unsubscribeVisibleLogicalRangeChange(this.timeScaleSubscribe);
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (this.chartRef) {
      try {
        this.chartRef.remove();
      } catch (error) {
        console.error(error);
      }
      this.chartRef = null;
      this.volumeSeries = null;
    }
  }

  render() {
    const { width, height } = this.props;
    return (
      <div
        ref={this.chartContainerRef}
        style={{
          width: width || '100%',
          height: `${height}px`,
          background: 'transparent'
        }}
      />
    );
  }
}

export default Volume;