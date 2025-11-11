import {
    AndrewPitchforkIcon, ArrowIcon, BrushIcon, CalligraphyPenIcon,
    ChannelIcon, CircleIcon, CursorArrowIcon, CursorCrosshairIcon,
    CursorDotIcon, CursorEmojiIcon, CursorSparkleIcon, CycleLinesIcon,
    EllipseIcon, EraserIcon, FibonacciExtensionIcon, FibonacciIcon, GannBoxIcon,
    GannFanIcon, HighlighterIcon, LineToolIcon, MarkerIcon, PencilIcon, PenIcon,
    PieChartIcon, PitchforkIcon, RectangleIcon, SprayIcon, TextIcon, TrendChannelIcon,
    TriangleIcon
} from "../CandleViewIcons";

export const cursorStyles = [
    { id: 'cursor-crosshair', name: '十字准星', description: '带空格的十字准星', icon: CursorCrosshairIcon },
    { id: 'cursor-dot', name: '点状光标', description: '圆点光标样式', icon: CursorDotIcon },
    { id: 'cursor-arrow', name: '箭头光标', description: '箭头指示样式', icon: CursorArrowIcon },
    { id: 'cursor-sparkle', name: '烟花棒', description: '烟花效果光标', icon: CursorSparkleIcon },
    { id: 'cursor-emoji', name: '表情光标', description: '表情符号光标', icon: CursorEmojiIcon },
];

export const rulerTools = [
    {
        title: "标尺",
        tools: [
            { id: 'pencil', name: '价格标尺', description: '价格标尺工具', icon: PencilIcon },
            { id: 'pencil', name: '垂直距离', description: '垂直距离工具', icon: PencilIcon },
            { id: 'pencil', name: '十字线尺子', description: '十字线尺子工具', icon: PencilIcon },
            { id: 'pencil', name: '趋势线角度尺', description: '趋势线角度尺工具', icon: PencilIcon },
            { id: 'pencil', name: '斐波那契回撤尺', description: '斐波那契回撤尺工具', icon: PencilIcon },
            { id: 'pencil', name: '平行通道尺', description: '平行通道尺工具', icon: PencilIcon },
            { id: 'pencil', name: '箭头标注尺', description: '箭头标注尺工具', icon: PencilIcon },
            { id: 'pencil', name: '文本标注尺', description: '文本标注尺工具', icon: PencilIcon },
            { id: 'pencil', name: '矩形测量尺', description: '矩形测量尺工具', icon: PencilIcon },
            { id: 'pencil', name: '椭圆测量尺', description: '矩形测量尺工具', icon: PencilIcon },
            { id: 'pencil', name: '三角形测量尺', description: '矩形测量尺工具', icon: PencilIcon },
        ]
    },
];

export const brushTools = [
    {
        title: "基础",
        tools: [
            { id: 'pencil', name: '铅笔', description: '细线绘制工具', icon: PencilIcon },
            { id: 'pen', name: '钢笔', description: '流畅线条绘制', icon: PenIcon },
            { id: 'brush', name: '刷子', description: '柔和笔刷效果', icon: BrushIcon },
            { id: 'marker', name: '马克笔', description: '粗体标记笔', icon: MarkerIcon },
        ]
    },
    {
        title: "特效",
        tools: [
            { id: 'highlighter', name: '荧光笔', description: '半透明高亮效果', icon: HighlighterIcon },
            { id: 'calligraphy-pen', name: '书法笔', description: '书法风格笔触', icon: CalligraphyPenIcon },
            { id: 'spray', name: '喷枪', description: '喷雾效果笔刷', icon: SprayIcon },
        ]
    },
    {
        title: "修改",
        tools: [
            { id: 'eraser', name: '橡皮擦', description: '擦除绘制内容', icon: EraserIcon },
        ]
    }
];

export const drawingTools = [
    {
        title: "线",
        tools: [
            { id: 'line-segment', name: '线段', description: '绘制线段', icon: LineToolIcon },
            { id: 'arrow-line', name: '箭头线', description: '绘制箭头线标记', icon: ArrowIcon },
            { id: 'horizontal-line', name: '水平线', description: '绘制水平线标记', icon: ArrowIcon },
            { id: 'vertical-line', name: '垂直线', description: '绘制垂直线标记', icon: ArrowIcon },
        ]
    },
    {
        title: "通道",
        tools: [
            { id: 'parallel-channel', name: '并行通道', description: '绘制并行通道', icon: LineToolIcon },
            { id: 'linear-regression-channel', name: '线性回归通道', description: '绘制回归通道', icon: ChannelIcon },
            { id: 'equidistant-channel', name: '等距通道', description: '绘制等距通道', icon: ArrowIcon },
            { id: 'disjoint-channel', name: '不相交通道', description: '绘制不相交通道', icon: ArrowIcon },
        ]
    },
    {
        title: "叉",
        tools: [
            { id: 'andrew-pitchfork', name: '安德鲁干草叉', description: '绘制安德鲁干草叉', icon: AndrewPitchforkIcon },
            { id: 'enhanced-andrew-pitch-fork', name: '改良安德鲁干草叉', description: '绘制叉子', icon: LineToolIcon },
            { id: 'channel', name: '希夫干草叉', description: '绘制希夫干草叉', icon: ChannelIcon },
            { id: 'channel', name: '内部干草叉线', description: '绘制内部干草叉线', icon: ChannelIcon },
            { id: 'channel', name: '波浪干草叉', description: '绘制波浪干草叉', icon: ChannelIcon },
        ]
    },
];

export const fibonacciTools = [
    {
        title: "斐波那契工具",
        tools: [
            { id: 'fibonacci-time-zoon', name: '斐波那契时间周期', description: '斐波那契时间周期线分析', icon: GannFanIcon },
            { id: 'fibonacci-retracement', name: '斐波那契回调', description: '绘制斐波那契回调线', icon: FibonacciIcon },
            { id: 'fibonacci-arc', name: '斐波那契弧线', description: '绘制斐波那契弧线', icon: CircleIcon },
            { id: 'fibonacci-circle', name: '斐波那契圆', description: '斐波那契圆线分析', icon: GannFanIcon },
            { id: 'fibonacci-spiral', name: '斐波那契螺旋', description: '斐波那契螺旋线分析', icon: GannFanIcon },
            { id: 'fibonacci-wedge', name: '斐波那契楔形', description: '斐波那契楔形线分析', icon: GannFanIcon },
            { id: 'fibonacci-fan', name: '斐波那契扇形', description: '斐波那契扇形线分析', icon: GannFanIcon },
            { id: 'fibonacci-channel', name: '斐波那契通道', description: '斐波那契通道线分析', icon: GannFanIcon },
            { id: 'fibonacci-extension-base-price', name: '斐波那契扩展(基于价格)', description: '绘制斐波那契扩展线', icon: FibonacciExtensionIcon },
            { id: 'fibonacci-extension-base-time', name: '斐波那契扩展(基于时间)', description: '绘制斐波那契扩展线', icon: FibonacciExtensionIcon },


            // { id: 'fibonacci-fan', name: '斐波那契平行四边形', description: '斐波那契平行四边形线分析', icon: GannFanIcon },
            // { id: 'fibonacci-fan', name: '斐波那契三角形', description: '斐波那契三角形线分析', icon: GannFanIcon },
            // { id: 'fibonacci-fan', name: '斐波那契波浪', description: '斐波那契波浪线分析', icon: GannFanIcon },
            // { id: 'fibonacci-fan', name: '斐波那契RV回撤', description: '斐波那契RV回撤线分析', icon: GannFanIcon },
        ]
    }
];

export const gannTools = [
    {
        title: "江恩分析工具",
        tools: [
            { id: 'gann-fan', name: '江恩扇', description: '江恩扇形线分析工具', icon: GannFanIcon },
            { id: 'gann-box', name: '江恩箱', description: '江恩箱体分析工具', icon: GannBoxIcon },
            { id: 'gann-rectang', name: '江恩正方体', description: '江恩正方体分析', icon: GannBoxIcon },
            // { id: 'gann-square', name: '江恩四方图', description: '江恩四方图分析', icon: RectangleIcon },
            // { id: 'gann-wheel', name: '江恩轮', description: '江恩轮分析工具', icon: CircleIcon },
            // { id: 'gann-swings', name: '江恩摆动', description: '江恩摆动分析', icon: TrendChannelIcon },
            // { id: 'gann-box', name: '江恩网格', description: '江恩网格体分析', icon: GannBoxIcon },
            // { id: 'gann-box', name: '江恩时间周期线', description: '江恩时间周期线体分析', icon: GannBoxIcon },
            // { id: 'gann-box', name: '江恩历史时间周期线', description: '江恩历史时间周期线体分析', icon: GannBoxIcon },
            // { id: 'gann-box', name: '江恩通道', description: '江恩通道体分析', icon: GannBoxIcon },
            // { id: 'gann-box', name: '江恩波浪', description: '江恩波浪体分析', icon: GannBoxIcon },
        ]
    }
];

export const irregularShapeTools = [
    {
        title: "技术图形",
        tools: [
            { id: 'xabcd', name: 'XABCD图形', description: '绘制矩形区域', icon: RectangleIcon },
            // { id: 'cypher-pattern', name: 'Cypher图形', description: '绘制圆形区域', icon: CircleIcon },
            { id: 'head-and-shoulders', name: '头肩图形', description: '绘制椭圆区域', icon: EllipseIcon },
            { id: 'abcd', name: 'ABCD图形', description: '绘制三角形', icon: TriangleIcon },
            { id: 'triangle-abcd', name: 'ABCD三角图形', description: '绘制三角形', icon: TriangleIcon },
            { id: 'triangle-6', name: '六点绘制三角形', description: '绘制扇形', icon: TriangleIcon },
            { id: 'three-drives', name: '三驱动图形', description: '绘制扇形', icon: TriangleIcon },
        ]
    },
    {
        title: "艾略特波浪",
        tools: [
            { id: 'elliott-lmpulse-wave', name: '艾略特脉冲波', description: '绘制矩形区域', icon: RectangleIcon },
            { id: 'elliott-correction-wave', name: '艾略特修正浪', description: '绘制圆形区域', icon: CircleIcon },
            { id: 'elliott-triangle-wave', name: '艾略特三角波', description: '绘制椭圆区域', icon: EllipseIcon },
            { id: 'elliott-double-combo-wave', name: '艾略特双重组合波', description: '绘制三角形', icon: TriangleIcon },
            { id: 'elliott-triple-combo-wave', name: '艾略特三重组合波', description: '绘制三角形', icon: TriangleIcon },
        ]
    },
    {
        title: "规则图形",
        tools: [
            { id: 'rectangle', name: '矩形', description: '绘制矩形区域', icon: RectangleIcon },
            { id: 'circle', name: '圆形', description: '绘制圆形区域', icon: CircleIcon },
            { id: 'ellipse', name: '椭圆', description: '绘制椭圆区域', icon: EllipseIcon },
            { id: 'triangle', name: '三角形', description: '绘制三角形', icon: TriangleIcon },
            { id: 'sector', name: '扇形', description: '绘制扇形', icon: TriangleIcon },
            { id: 'curve', name: '曲线', description: '绘制扇形', icon: TriangleIcon },
            { id: 'double-curve', name: '双曲线', description: '绘制扇形', icon: TriangleIcon },
            { id: 'fan', name: '弧形', description: '绘制扇形', icon: TriangleIcon },
        ]
    },
    {
        title: "不规则图形",
        tools: [
            { id: 'freehand-shape', name: '自由绘制', description: '手绘不规则图形', icon: PencilIcon },
            { id: 'polygon-shape', name: '多边形', description: '绘制多边形图形', icon: LineToolIcon },
            { id: 'bezier-curve', name: '贝塞尔曲线', description: '绘制贝塞尔曲线', icon: PenIcon },
            { id: 'star-shape', name: '星形', description: '绘制星形图案', icon: CursorSparkleIcon },
            { id: 'cloud-shape', name: '云形标注', description: '云形标注工具', icon: TextIcon },
        ]
    }
];

export const projectInfoTools = [
    {
        title: "区间",
        tools: [
            { id: 'project-milestone', name: '时间区间', description: '绘制时间区间', icon: MarkerIcon },
            { id: 'project-timeline', name: '价格区间', description: '绘制价格区间', icon: LineToolIcon },
            { id: 'project-phase', name: '时间价格区间', description: '绘制时间价格区间', icon: RectangleIcon },
        ]
    },
    {
        title: "其他",
        tools: [
            { id: 'project-milestone', name: '项目里程碑', description: '标记项目重要节点', icon: MarkerIcon },
            { id: 'project-timeline', name: '项目时间线', description: '绘制项目时间线', icon: LineToolIcon },
            { id: 'project-phase', name: '项目阶段', description: '标记项目不同阶段', icon: RectangleIcon },
            { id: 'project-resource', name: '资源分配', description: '资源分配标记工具', icon: PieChartIcon },
            { id: 'project-risk', name: '风险标记', description: '项目风险标记工具', icon: TriangleIcon },
        ]
    }
];
