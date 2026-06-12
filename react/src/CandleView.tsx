import { ICandleViewDataPoint, IStaticMarkOptions, StaticMarkDirection, TimeframeEnum } from "@candleview/core";
import React from "react";

export interface CandleViewProps {
  // theme config
  theme?: "dark" | "light";
  // i18n config
  i18n?: "en" | "zh-cn";
  // height
  height?: number | string;
  // width
  width?: number | string;
  // title
  title: string;
  // show top panel
  toppanel?: boolean;
  // show left panel
  leftpanel?: boolean;
  // mark data
  markData?: {
    time: number;
    text: string;
    direction: StaticMarkDirection;
    options?: IStaticMarkOptions;
  }[];
  // time frame
  timeframe?: string;
  // time zone
  timezone?: string;
  // data
  data?: ICandleViewDataPoint[];
  // enable AI function
  ai?: boolean;
  // terminal
  terminal?: boolean;
  // is mobile mode
  isMobileMode?: boolean;
  // is open viewport segmentation
  isOpenViewportSegmentation?: boolean;
  // is open internal time frame calculation
  isCloseInternalTimeFrameCalculation?: boolean;
  // timeframe callback mapping
  timeframeCallbacks?: Partial<Record<TimeframeEnum, () => void>>;
  isFullScreen?: boolean;
  isScreenshot?: boolean;
  isThemeSelection?: boolean;
  // main hcart indicator
  mainChartIndicators?: string[];
  // sub hcart indicator
  subChartIndicators?: string[];
  // danmakus
  danmakus?: string[];
  // handle screenshot capture
  handleScreenshotCapture?: (imageData: {
    dataUrl: string;
    blob: Blob;
    width: number;
    height: number;
    timestamp: number;
  }) => void;
}

interface CandleViewState {}

export class CandleView extends React.Component<
  CandleViewProps,
  CandleViewState
> {}
