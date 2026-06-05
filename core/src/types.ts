export interface CandleViewConfig {
    title?: string;
    data?: ICandleViewDataPoint[];
    theme?: 'light' | 'dark';
    locale?: 'en' | 'zh-cn';
    showTopPanel?: boolean;
    showLeftPanel?: boolean;
    chartType?: MainChartType;
    container: HTMLElement;
    activeTimeframe?: string;
    currentTimezone?: string;
    onTimeframeChange?: (timeframe: string) => void;
    onChartTypeChange?: (type: MainChartType) => void;
    onIndicatorSelect?: (indicator: string) => void;
    onMainChartIndicatorSelect?: (indicator: any) => void;
    onSubChartIndicatorSelect?: (indicators: any[]) => void;
    onToolSelect?: (tool: string) => void;
    onThemeToggle?: (theme: 'light' | 'dark') => void;
    onCameraClick?: () => void;
    onFullscreenClick?: () => void;
    onTimezoneSelect?: (timezone: string) => void;
}

export interface Point {
    x: number;
    y: number;
}

export interface MarkDrawing {
    id: string;
    type: string;
    markType: DrawingType;
    mark: any;
    points: Point[];
    color: string;
    lineWidth: number;
    isSelected?: boolean;
    rotation?: number;
    properties?: any;
    graphColor?: string;
    graphWidth?: number;
    graphStyle?: 'solid' | 'dashed' | 'dotted';
}

export interface HistoryRecord {
    drawings: MarkDrawing[];
    description: string;
}

export interface ICandleViewDataPoint {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    isVirtual?: boolean;
}

export interface CandleViewConfig {
    title?: string;
    data?: ICandleViewDataPoint[];
    theme?: 'light' | 'dark';
    locale?: 'en' | 'zh-cn';
    showTopPanel?: boolean;
    showLeftPanel?: boolean;
    container: HTMLElement;
    onTimeframeChange?: (timeframe: string) => void;
    onChartTypeChange?: (type: MainChartType) => void;
    onIndicatorSelect?: (indicator: string) => void;
    onToolSelect?: (tool: string) => void;
}

export interface Point {
    x: number;
    y: number;
}

export interface MarkDrawing {
    id: string;
    type: string;
    markType: DrawingType;
    mark: any;
    points: Point[];
    color: string;
    lineWidth: number;
    isSelected?: boolean;
    rotation?: number;
    properties?: any;
    graphColor?: string;
    graphWidth?: number;
    graphStyle?: 'solid' | 'dashed' | 'dotted';
}

export interface HistoryRecord {
    drawings: MarkDrawing[];
    description: string;
}

export interface ICandleViewDataPoint {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    isVirtual?: boolean;
}

export enum TimeframeEnum {

    ONE_SECOND = '1s',
    FIVE_SECONDS = '5s',
    FIFTEEN_SECONDS = '15s',
    THIRTY_SECONDS = '30s',

    ONE_MINUTE = '1m',
    THREE_MINUTES = '3m',
    FIVE_MINUTES = '5m',
    FIFTEEN_MINUTES = '15m',
    THIRTY_MINUTES = '30m',
    FORTY_FIVE_MINUTES = '45m',

    ONE_HOUR = '1H',
    TWO_HOURS = '2H',
    THREE_HOURS = '3H',
    FOUR_HOURS = '4H',
    SIX_HOURS = '6H',
    EIGHT_HOURS = '8H',
    TWELVE_HOURS = '12H',

    ONE_DAY = '1D',
    THREE_DAYS = '3D',

    ONE_WEEK = '1W',
    TWO_WEEKS = '2W',

    ONE_MONTH = '1M',
    THREE_MONTHS = '3M',
    SIX_MONTHS = '6M'
}

export enum TimezoneEnum {
    NEW_YORK = 'America/New_York',
    CHICAGO = 'America/Chicago',
    DENVER = 'America/Denver',
    LOS_ANGELES = 'America/Los_Angeles',
    TORONTO = 'America/Toronto',
    LONDON = 'Europe/London',
    PARIS = 'Europe/Paris',
    FRANKFURT = 'Europe/Frankfurt',
    ZURICH = 'Europe/Zurich',
    MOSCOW = 'Europe/Moscow',
    DUBAI = 'Asia/Dubai',
    KARACHI = 'Asia/Karachi',
    KOLKATA = 'Asia/Kolkata',
    SHANGHAI = 'Asia/Shanghai',
    HONG_KONG = 'Asia/Hong_Kong',
    SINGAPORE = 'Asia/Singapore',
    TOKYO = 'Asia/Tokyo',
    SEOUL = 'Asia/Seoul',
    SYDNEY = 'Australia/Sydney',
    AUCKLAND = 'Pacific/Auckland',
    UTC = 'UTC'
}



export enum CursorType {
    Default = 'default',
    Crosshair = 'crosshair',
    None = 'none',

    Circle = 'circle',
    Dot = 'dot',
}

export enum ChartType {
    MainChart = 'MainChart',
    SubChart = 'SubChart',
}

export enum MainChartType {
    Candle = "Candle",
    HollowCandle = "HollowCandle",
    Bar = "Bar",
    BaseLine = "BaseLine",
    Line = "Line",
    Area = "Area",
    StepLine = "StepLine",
    Histogram = "Histogram",
    HeikinAshi = "HeikinAshi",
    LineBreak = "LineBreak",
    Mountain = "Mountain",
    BaselineArea = "BaselineArea",
    HighLow = "HighLow",
    HLCArea = "HLCArea"
}

export enum MainChartIndicatorType {
    MA = 'MA',
    EMA = 'EMA',
    BOLLINGER = 'BOLLINGER',
    ICHIMOKU = 'ICHIMOKU',
    DONCHIAN = 'DONCHIAN',
    ENVELOPE = 'ENVELOPE',
    VWAP = 'VWAP',
    HEATMAP = 'HEATMAP',
    MARKETPROFILE = 'MARKETPROFILE'
}

export enum SubChartIndicatorType {
    RSI = 'RSI',
    MACD = 'MACD',
    VOLUME = 'VOLUME',
    SAR = 'SAR',
    KDJ = 'KDJ',
    ATR = 'ATR',
    STOCHASTIC = 'STOCHASTIC',
    CCI = 'CCI',
    BBWIDTH = 'BBWIDTH',
    ADX = 'ADX',
    OBV = 'OBV',
}


export enum DrawingType {
    Text, Emoji, LineSegment, ArrowLine, ThickArrowLine, HorizontalLine, VerticalLine, ParallelChannel, LinearRegressionChannel,
    EquidistantChannel, DisjointChannel, Pitchfork,
    AndrewPitchfork, EnhancedAndrewPitchfork, SchiffPitchfork,
    Rectangle, Circle, Ellipse, Sector,
    Curve, DoubleCurve,
    Triangle, GannFan, GannBox, GannRectangle,
    FibonacciTimeZoon, FibonacciRetracement, FibonacciArc, FibonacciCircle, FibonacciSpiral, FibonacciWedge, FibonacciFan,
    FibonacciChannel, FibonacciExtensionBasePrice, FibonacciExtensionBaseTime,
    XABCD, HeadAndShoulders, ABCD, TriangleABCD,
    Elliott_Impulse, Elliott_Corrective, Elliott_Triangle, Elliott_Double_Combination, Elliott_Triple_Combination,
    TimeRange, PriceRange, TimePriceRange,
    Pencil, Pen, Brush, MarkerPen, Eraser,
    Image, Table, LongPosition, ShortPosition, PriceLabel, Flag, PriceNote, SignPost, Pin, BubbleBox,
    TextEdit,
    MockKLine,
    HeatMap,
    TimeEvent, PriceEvent
}

export function drawingTypeName(markType: DrawingType): string {
    switch (markType) {
        case DrawingType.Text:
            return 'text';
        case DrawingType.Text:
            return 'emoji';
        case DrawingType.Text:
            return 'line-segment';
        case DrawingType.Text:
            return 'horizontal-line';
        case DrawingType.Text:
            return 'vertical-line';
        case DrawingType.ArrowLine:
            return 'arrow-line';
        case DrawingType.ThickArrowLine:
            return 'thick-arrow-line';
        case DrawingType.ParallelChannel:
            return 'parallel-channel';
        case DrawingType.LinearRegressionChannel:
            return 'linear-regression-channel';
        case DrawingType.EquidistantChannel:
            return 'equidistant-channel';
        case DrawingType.DisjointChannel:
            return 'disjoint-channel';
        case DrawingType.Pitchfork:
            return 'pitch-pitch-fork';
        case DrawingType.AndrewPitchfork:
            return 'andrew-pitch-fork';
        case DrawingType.SchiffPitchfork:
            return 'schiff-pitch-fork';
        case DrawingType.EnhancedAndrewPitchfork:
            return 'enhanced-andrew-pitch-fork';
        case DrawingType.Rectangle:
            return 'rectangle';
        case DrawingType.Circle:
            return 'circle';
        case DrawingType.Ellipse:
            return 'ellipse';
        case DrawingType.Triangle:
            return 'triangle';
        case DrawingType.GannFan:
            return 'gann-fan';
        case DrawingType.GannBox:
            return 'gann-box';
        case DrawingType.GannRectangle:
            return 'gann-rectangle';
        case DrawingType.FibonacciTimeZoon:
            return 'fibonacci-time-zoon';
        case DrawingType.FibonacciRetracement:
            return 'fibonacci-retracement';
        case DrawingType.FibonacciArc:
            return 'fibonacci-fibonacci-arc';
        case DrawingType.FibonacciCircle:
            return 'fibonacci-circle';
        case DrawingType.FibonacciSpiral:
            return 'fibonacci-spiral';
        case DrawingType.FibonacciWedge:
            return 'fibonacci-wedge';
        case DrawingType.FibonacciFan:
            return 'fibonacci-fan';
        case DrawingType.FibonacciChannel:
            return 'fibonacci-channel';
        case DrawingType.FibonacciExtensionBasePrice:
            return 'fibonacci-extension-base-price';
        case DrawingType.FibonacciExtensionBaseTime:
            return 'fibonacci-extension-base-time';
        case DrawingType.Sector:
            return 'sector';
        case DrawingType.Curve:
            return 'curve';
        case DrawingType.DoubleCurve:
            return 'double-curve';
        case DrawingType.XABCD:
            return 'xabcd';
        case DrawingType.HeadAndShoulders:
            return 'head-and-shoulders';
        case DrawingType.ABCD:
            return 'abcd';
        case DrawingType.TriangleABCD:
            return 'triangle-abcd';
        case DrawingType.Elliott_Impulse:
            return 'elliott-impulse';
        case DrawingType.Elliott_Corrective:
            return 'elliott-corrective';
        case DrawingType.Elliott_Triangle:
            return 'elliott-triangle';
        case DrawingType.Elliott_Double_Combination:
            return 'elliott-double-combination';
        case DrawingType.Elliott_Triple_Combination:
            return 'elliott-triple-combination';
        case DrawingType.TimeRange:
            return 'time-range';
        case DrawingType.PriceRange:
            return 'price-range';
        case DrawingType.TimePriceRange:
            return 'time-price-range';
        case DrawingType.Pencil:
            return 'pencil';
        case DrawingType.Pen:
            return 'pen';
        case DrawingType.Brush:
            return 'brush';
        case DrawingType.MarkerPen:
            return 'marker-pen';
        case DrawingType.Eraser:
            return 'eraser';
        case DrawingType.Image:
            return 'image';
        case DrawingType.Table:
            return 'table';
        case DrawingType.LongPosition:
            return 'long-position';
        case DrawingType.ShortPosition:
            return 'short-position';
        case DrawingType.PriceLabel:
            return 'price-label';
        case DrawingType.Flag:
            return 'flag';
        case DrawingType.PriceNote:
            return 'price-note';
        case DrawingType.SignPost:
            return 'signpost';
        case DrawingType.Pin:
            return 'pin';
        case DrawingType.BubbleBox:
            return 'bubble-box';
        case DrawingType.TextEdit:
            return 'text-edit';
        case DrawingType.MockKLine:
            return 'mock-line';
        case DrawingType.HeatMap:
            return "heat-map"
        default:
            return '';
    }
}


export enum ScriptType {
    Time = 'time',
    Price = 'price',
    None = 'none'
}





export interface TimeZoneConfig {
    name: string;
    offset: string;
    displayName: string;
}

export const TIMEZONE_CONFIGS: { [key in TimezoneEnum]: TimeZoneConfig } = {
    [TimezoneEnum.NEW_YORK]: { name: 'America/New_York', offset: '-05:00', displayName: 'New York' },
    [TimezoneEnum.CHICAGO]: { name: 'America/Chicago', offset: '-06:00', displayName: 'Chicago' },
    [TimezoneEnum.DENVER]: { name: 'America/Denver', offset: '-07:00', displayName: 'Denver' },
    [TimezoneEnum.LOS_ANGELES]: { name: 'America/Los_Angeles', offset: '-08:00', displayName: 'Los Angeles' },
    [TimezoneEnum.TORONTO]: { name: 'America/Toronto', offset: '-05:00', displayName: 'Toronto' },
    [TimezoneEnum.LONDON]: { name: 'Europe/London', offset: '+00:00', displayName: 'London' },
    [TimezoneEnum.PARIS]: { name: 'Europe/Paris', offset: '+01:00', displayName: 'Paris' },
    [TimezoneEnum.FRANKFURT]: { name: 'Europe/Frankfurt', offset: '+01:00', displayName: 'Frankfurt' },
    [TimezoneEnum.ZURICH]: { name: 'Europe/Zurich', offset: '+01:00', displayName: 'Zurich' },
    [TimezoneEnum.MOSCOW]: { name: 'Europe/Moscow', offset: '+03:00', displayName: 'Moscow' },
    [TimezoneEnum.DUBAI]: { name: 'Asia/Dubai', offset: '+04:00', displayName: 'Dubai' },
    [TimezoneEnum.KARACHI]: { name: 'Asia/Karachi', offset: '+05:00', displayName: 'Karachi' },
    [TimezoneEnum.KOLKATA]: { name: 'Asia/Kolkata', offset: '+05:30', displayName: 'Kolkata' },
    [TimezoneEnum.SHANGHAI]: { name: 'Asia/Shanghai', offset: '+08:00', displayName: 'Shanghai' },
    [TimezoneEnum.HONG_KONG]: { name: 'Asia/Hong_Kong', offset: '+08:00', displayName: 'Hong Kong' },
    [TimezoneEnum.SINGAPORE]: { name: 'Asia/Singapore', offset: '+08:00', displayName: 'Singapore' },
    [TimezoneEnum.TOKYO]: { name: 'Asia/Tokyo', offset: '+09:00', displayName: 'Tokyo' },
    [TimezoneEnum.SEOUL]: { name: 'Asia/Seoul', offset: '+09:00', displayName: 'Seoul' },
    [TimezoneEnum.SYDNEY]: { name: 'Australia/Sydney', offset: '+10:00', displayName: 'Sydney' },
    [TimezoneEnum.AUCKLAND]: { name: 'Pacific/Auckland', offset: '+12:00', displayName: 'Auckland' },
    [TimezoneEnum.UTC]: { name: 'UTC', offset: '+00:00', displayName: 'UTC' }
};

export interface TimeframeConfig {
    seconds: number;
    groupBy: 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month';
}

export const TIMEFRAME_CONFIGS: { [key: string]: TimeframeConfig } = {
    [TimeframeEnum.ONE_SECOND]: { seconds: 1, groupBy: 'second' },
    [TimeframeEnum.FIVE_SECONDS]: { seconds: 5, groupBy: 'second' },
    [TimeframeEnum.FIFTEEN_SECONDS]: { seconds: 15, groupBy: 'second' },
    [TimeframeEnum.THIRTY_SECONDS]: { seconds: 30, groupBy: 'second' },
    [TimeframeEnum.ONE_MINUTE]: { seconds: 60, groupBy: 'minute' },
    [TimeframeEnum.THREE_MINUTES]: { seconds: 180, groupBy: 'minute' },
    [TimeframeEnum.FIVE_MINUTES]: { seconds: 300, groupBy: 'minute' },
    [TimeframeEnum.FIFTEEN_MINUTES]: { seconds: 900, groupBy: 'minute' },
    [TimeframeEnum.THIRTY_MINUTES]: { seconds: 1800, groupBy: 'minute' },
    [TimeframeEnum.FORTY_FIVE_MINUTES]: { seconds: 2700, groupBy: 'minute' },
    [TimeframeEnum.ONE_HOUR]: { seconds: 3600, groupBy: 'hour' },
    [TimeframeEnum.TWO_HOURS]: { seconds: 7200, groupBy: 'hour' },
    [TimeframeEnum.THREE_HOURS]: { seconds: 10800, groupBy: 'hour' },
    [TimeframeEnum.FOUR_HOURS]: { seconds: 14400, groupBy: 'hour' },
    [TimeframeEnum.SIX_HOURS]: { seconds: 21600, groupBy: 'hour' },
    [TimeframeEnum.EIGHT_HOURS]: { seconds: 28800, groupBy: 'hour' },
    [TimeframeEnum.TWELVE_HOURS]: { seconds: 43200, groupBy: 'hour' },
    [TimeframeEnum.ONE_DAY]: { seconds: 86400, groupBy: 'day' },
    [TimeframeEnum.THREE_DAYS]: { seconds: 259200, groupBy: 'day' },
    [TimeframeEnum.ONE_WEEK]: { seconds: 604800, groupBy: 'week' },
    [TimeframeEnum.TWO_WEEKS]: { seconds: 1209600, groupBy: 'week' },
    [TimeframeEnum.ONE_MONTH]: { seconds: 2592000, groupBy: 'month' },
    [TimeframeEnum.THREE_MONTHS]: { seconds: 7776000, groupBy: 'month' },
    [TimeframeEnum.SIX_MONTHS]: { seconds: 15552000, groupBy: 'month' }
};