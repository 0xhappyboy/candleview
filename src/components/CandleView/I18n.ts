export interface I18n {
    mainChartIndicators: string;
    subChartIndicators: string;
    searchIndicators: string;
    theme: string;
    light: string;
    dark: string;
    timeframeSections: {
        second: string;
        minute: string;
        hour: string;
        day: string;
        week: string;
        month: string;
    };
    chartTypes: {
        candle: string;
        line: string;
        area: string;
        baseline: string;
        hollowCandle: string;
        heikinAshi: string;
        column: string;
        lineWithMarkers: string;
        stepLine: string;
    };
    toolbarButtons: {
        hint: string;
        replay: string;
        fullScreen: string;
        screenshot: string;
        contrast: string;
    };
    indicators: {
        ma: string;
        ema: string;
        bollinger: string;
        ichimoku: string;
        donchian: string;
        envelope: string;
        vwap: string;
    };
    leftPanel: {
        cursorCrosshair: string;
        cursorCrosshairDesc: string;
        cursorDot: string;
        cursorDotDesc: string;
        cursorArrow: string;
        cursorArrowDesc: string;
        cursorSparkle: string;
        cursorSparkleDesc: string;
        cursorEmoji: string;
        cursorEmojiDesc: string;
        pencil: string;
        pencilDesc: string;
        pen: string;
        penDesc: string;
        brush: string;
        brushDesc: string;
        markerPen: string;
        markerPenDesc: string;
        eraser: string;
        eraserDesc: string;
        lineTools: string;
        arrowTools: string;
        channelTools: string;
        pitchforkTools: string;
        penTools: string;
        gannTools: string;
        fibonacciTools: string;
        technicalPatterns: string;
        elliottWave: string;
        regularShapes: string;
        rangeTools: string;
        positionTools: string;
        simulationTools: string;
        textTools: string;
        contentTools: string;
        lineSegment: string;
        lineSegmentDesc: string;
        horizontalLine: string;
        horizontalLineDesc: string;
        verticalLine: string;
        verticalLineDesc: string;
        arrowLine: string;
        arrowLineDesc: string;
        thickArrowLine: string;
        thickArrowLineDesc: string;
        parallelChannel: string;
        parallelChannelDesc: string;
        linearRegressionChannel: string;
        linearRegressionChannelDesc: string;
        equidistantChannel: string;
        equidistantChannelDesc: string;
        disjointChannel: string;
        disjointChannelDesc: string;
        andrewPitchfork: string;
        andrewPitchforkDesc: string;
        enhancedAndrewPitchfork: string;
        enhancedAndrewPitchforkDesc: string;
        schiffPitchfork: string;
        schiffPitchforkDesc: string;
        internalPitchfork: string;
        internalPitchforkDesc: string;
        wavePitchfork: string;
        wavePitchforkDesc: string;
        gannFan: string;
        gannFanDesc: string;
        gannBox: string;
        gannBoxDesc: string;
        gannRectangle: string;
        gannRectangleDesc: string;
        fibonacciTimeZones: string;
        fibonacciTimeZonesDesc: string;
        fibonacciRetracement: string;
        fibonacciRetracementDesc: string;
        fibonacciArc: string;
        fibonacciArcDesc: string;
        fibonacciCircle: string;
        fibonacciCircleDesc: string;
        fibonacciSpiral: string;
        fibonacciSpiralDesc: string;
        fibonacciWedge: string;
        fibonacciWedgeDesc: string;
        fibonacciFan: string;
        fibonacciFanDesc: string;
        fibonacciChannel: string;
        fibonacciChannelDesc: string;
        fibonacciExtensionPrice: string;
        fibonacciExtensionPriceDesc: string;
        fibonacciExtensionTime: string;
        fibonacciExtensionTimeDesc: string;
        xabcdPattern: string;
        xabcdPatternDesc: string;
        headAndShoulders: string;
        headAndShouldersDesc: string;
        abcdPattern: string;
        abcdPatternDesc: string;
        triangleAbcd: string;
        triangleAbcdDesc: string;
        elliottImpulse: string;
        elliottImpulseDesc: string;
        elliottCorrective: string;
        elliottCorrectiveDesc: string;
        elliottTriangle: string;
        elliottTriangleDesc: string;
        elliottDoubleCombo: string;
        elliottDoubleComboDesc: string;
        elliottTripleCombo: string;
        elliottTripleComboDesc: string;
        rectangle: string;
        rectangleDesc: string;
        circle: string;
        circleDesc: string;
        ellipse: string;
        ellipseDesc: string;
        triangle: string;
        triangleDesc: string;
        sector: string;
        sectorDesc: string;
        curve: string;
        curveDesc: string;
        doubleCurve: string;
        doubleCurveDesc: string;
        timeRange: string;
        timeRangeDesc: string;
        priceRange: string;
        priceRangeDesc: string;
        timePriceRange: string;
        timePriceRangeDesc: string;
        longPosition: string;
        longPositionDesc: string;
        shortPosition: string;
        shortPositionDesc: string;
        mockKline: string;
        mockKlineDesc: string;
        text: string;
        textDesc: string;
        priceNote: string;
        priceNoteDesc: string;
        bubbleBox: string;
        bubbleBoxDesc: string;
        pin: string;
        pinDesc: string;
        signpost: string;
        signpostDesc: string;
        priceLabel: string;
        priceLabelDesc: string;
        flagMark: string;
        flagMarkDesc: string;
        image: string;
        imageDesc: string;
        video: string;
        videoDesc: string;
        audio: string;
        audioDesc: string;
        idea: string;
        ideaDesc: string;
        mouseCursor: string;
        drawingTools: string;
        fibonacciToolsTitle: string;
        projectInfoTools: string;
        shapeTools: string;
        brushTitle: string;
        textMark: string;
        emojiMark: string;
        deleteTool: string;
        setting: string;
        selectedTool: string;
        clickToStartDrawing: string;
        selectEmoji: string;
        selectedEmoji: string;
        clickToPlaceEmoji: string;
    };
}

export const EN: I18n = {
    mainChartIndicators: "Main Chart Indicators",
    subChartIndicators: "Sub Chart Indicators",
    searchIndicators: "Search indicators...",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    timeframeSections: {
        second: "Second",
        minute: "Minute",
        hour: "Hour",
        day: "Day",
        week: "Week",
        month: "Month"
    },
    chartTypes: {
        candle: "Candlestick",
        line: "Line",
        area: "Area",
        baseline: "Baseline",
        hollowCandle: "Hollow Candle",
        heikinAshi: "Heikin Ashi",
        column: "Column",
        lineWithMarkers: "Line with Markers",
        stepLine: "Step Line"
    },
    toolbarButtons: {
        hint: "Hint",
        replay: "Replay",
        fullScreen: "Full Screen",
        screenshot: "Screenshot",
        contrast: "Contrast"
    },
    indicators: {
        ma: "Moving Average",
        ema: "Exponential Moving Average",
        bollinger: "Bollinger Bands",
        ichimoku: "Ichimoku Cloud",
        donchian: "Donchian Channel",
        envelope: "Envelope",
        vwap: "VWAP"
    },
    leftPanel: {
        cursorCrosshair: "Crosshair",
        cursorCrosshairDesc: "Crosshair cursor with space",
        cursorDot: "Dot Cursor",
        cursorDotDesc: "Round dot cursor style",
        cursorArrow: "Arrow Cursor",
        cursorArrowDesc: "Arrow pointer style",
        cursorSparkle: "Sparkle",
        cursorSparkleDesc: "Sparkle effect cursor",
        cursorEmoji: "Emoji Cursor",
        cursorEmojiDesc: "Emoji symbol cursor",
        pencil: "Pencil",
        pencilDesc: "Thin line drawing tool",
        pen: "Pen",
        penDesc: "Smooth line drawing",
        brush: "Brush",
        brushDesc: "Soft brush effect",
        markerPen: "Marker",
        markerPenDesc: "Bold marker pen",
        eraser: "Eraser",
        eraserDesc: "Erase drawing content",
        lineTools: "Lines",
        arrowTools: "Arrows",
        channelTools: "Channels",
        pitchforkTools: "Pitchforks",
        penTools: "Pens",
        gannTools: "Gann Tools",
        fibonacciTools: "Fibonacci Tools",
        technicalPatterns: "Technical Patterns",
        elliottWave: "Elliott Wave",
        regularShapes: "Regular Shapes",
        rangeTools: "Ranges",
        positionTools: "Positions",
        simulationTools: "Simulation",
        textTools: "Text",
        contentTools: "Content",
        lineSegment: "Line Segment",
        lineSegmentDesc: "Draw line segment",
        horizontalLine: "Horizontal Line",
        horizontalLineDesc: "Draw horizontal line marker",
        verticalLine: "Vertical Line",
        verticalLineDesc: "Draw vertical line marker",
        arrowLine: "Arrow Line",
        arrowLineDesc: "Draw arrow line marker",
        thickArrowLine: "Thick Arrow Line",
        thickArrowLineDesc: "Draw thick arrow line marker",
        parallelChannel: "Parallel Channel",
        parallelChannelDesc: "Draw parallel channel",
        linearRegressionChannel: "Linear Regression Channel",
        linearRegressionChannelDesc: "Draw regression channel",
        equidistantChannel: "Equidistant Channel",
        equidistantChannelDesc: "Draw equidistant channel",
        disjointChannel: "Disjoint Channel",
        disjointChannelDesc: "Draw disjoint channel",
        andrewPitchfork: "Andrew's Pitchfork",
        andrewPitchforkDesc: "Draw Andrew's pitchfork",
        enhancedAndrewPitchfork: "Enhanced Andrew Pitchfork",
        enhancedAndrewPitchforkDesc: "Draw enhanced pitchfork",
        schiffPitchfork: "Schiff Pitchfork",
        schiffPitchforkDesc: "Draw Schiff pitchfork",
        internalPitchfork: "Internal Pitchfork Lines",
        internalPitchforkDesc: "Draw internal pitchfork lines",
        wavePitchfork: "Wave Pitchfork",
        wavePitchforkDesc: "Draw wave pitchfork",
        gannFan: "Gann Fan",
        gannFanDesc: "Gann fan analysis tool",
        gannBox: "Gann Box",
        gannBoxDesc: "Gann box analysis tool",
        gannRectangle: "Gann Square",
        gannRectangleDesc: "Gann square analysis",
        fibonacciTimeZones: "Fibonacci Time Zones",
        fibonacciTimeZonesDesc: "Fibonacci time zones analysis",
        fibonacciRetracement: "Fibonacci Retracement",
        fibonacciRetracementDesc: "Draw Fibonacci retracement lines",
        fibonacciArc: "Fibonacci Arc",
        fibonacciArcDesc: "Draw Fibonacci arcs",
        fibonacciCircle: "Fibonacci Circle",
        fibonacciCircleDesc: "Fibonacci circle analysis",
        fibonacciSpiral: "Fibonacci Spiral",
        fibonacciSpiralDesc: "Fibonacci spiral analysis",
        fibonacciWedge: "Fibonacci Wedge",
        fibonacciWedgeDesc: "Fibonacci wedge analysis",
        fibonacciFan: "Fibonacci Fan",
        fibonacciFanDesc: "Fibonacci fan analysis",
        fibonacciChannel: "Fibonacci Channel",
        fibonacciChannelDesc: "Fibonacci channel analysis",
        fibonacciExtensionPrice: "Fibonacci Extension (Price)",
        fibonacciExtensionPriceDesc: "Draw Fibonacci extension lines",
        fibonacciExtensionTime: "Fibonacci Extension (Time)",
        fibonacciExtensionTimeDesc: "Draw Fibonacci extension lines",
        xabcdPattern: "XABCD Pattern",
        xabcdPatternDesc: "Draw XABCD pattern",
        headAndShoulders: "Head and Shoulders",
        headAndShouldersDesc: "Draw head and shoulders pattern",
        abcdPattern: "ABCD Pattern",
        abcdPatternDesc: "Draw ABCD pattern",
        triangleAbcd: "ABCD Triangle",
        triangleAbcdDesc: "Draw ABCD triangle pattern",
        elliottImpulse: "Elliott Impulse Wave",
        elliottImpulseDesc: "Draw Elliott impulse wave",
        elliottCorrective: "Elliott Corrective Wave",
        elliottCorrectiveDesc: "Draw Elliott corrective wave",
        elliottTriangle: "Elliott Triangle Wave",
        elliottTriangleDesc: "Draw Elliott triangle wave",
        elliottDoubleCombo: "Elliott Double Combo",
        elliottDoubleComboDesc: "Draw Elliott double combo wave",
        elliottTripleCombo: "Elliott Triple Combo",
        elliottTripleComboDesc: "Draw Elliott triple combo wave",
        rectangle: "Rectangle",
        rectangleDesc: "Draw rectangular area",
        circle: "Circle",
        circleDesc: "Draw circular area",
        ellipse: "Ellipse",
        ellipseDesc: "Draw elliptical area",
        triangle: "Triangle",
        triangleDesc: "Draw triangle",
        sector: "Sector",
        sectorDesc: "Draw sector",
        curve: "Curve",
        curveDesc: "Draw curve",
        doubleCurve: "Double Curve",
        doubleCurveDesc: "Draw double curve",
        timeRange: "Time Range",
        timeRangeDesc: "Draw time range",
        priceRange: "Price Range",
        priceRangeDesc: "Draw price range",
        timePriceRange: "Time-Price Range",
        timePriceRangeDesc: "Draw time-price range",
        longPosition: "Long Position",
        longPositionDesc: "Long position marker",
        shortPosition: "Short Position",
        shortPositionDesc: "Short position marker",
        mockKline: "Mock K-line",
        mockKlineDesc: "Simulate K-line data",
        text: "Text",
        textDesc: "Text annotation",
        priceNote: "Price Note",
        priceNoteDesc: "Price annotation",
        bubbleBox: "Bubble Box",
        bubbleBoxDesc: "Bubble annotation box",
        pin: "Pin",
        pinDesc: "Pin marker",
        signpost: "Signpost",
        signpostDesc: "Signpost marker",
        priceLabel: "Price Label",
        priceLabelDesc: "Price label marker",
        flagMark: "Flag Mark",
        flagMarkDesc: "Flag marker",
        image: "Image",
        imageDesc: "Image annotation",
        video: "Video",
        videoDesc: "Video annotation",
        audio: "Audio",
        audioDesc: "Audio annotation",
        idea: "Idea",
        ideaDesc: "Idea annotation",
        mouseCursor: "Mouse Cursor",
        drawingTools: "Drawing Tools",
        fibonacciToolsTitle: "Fibonacci Tools",
        projectInfoTools: "Project Info Tools",
        shapeTools: "Shape Tools",
        brushTitle: "Brush",
        textMark: "Text Mark",
        emojiMark: "Emoji Mark",
        deleteTool: "Delete Tool",
        setting: "Setting",
        selectedTool: "Selected",
        clickToStartDrawing: "Click chart to start drawing",
        selectEmoji: "Select Emoji",
        selectedEmoji: "Selected",
        clickToPlaceEmoji: "Click chart to place emoji"
    }
}

export const zhCN: I18n = {
    mainChartIndicators: "主图指标",
    subChartIndicators: "副图指标",
    searchIndicators: "搜索指标...",
    theme: "主题",
    light: "浅色",
    dark: "深色",
    timeframeSections: {
        second: "秒",
        minute: "分钟",
        hour: "小时",
        day: "天",
        week: "周",
        month: "月"
    },
    chartTypes: {
        candle: "蜡烛图",
        line: "线图",
        area: "面积图",
        baseline: "基线图",
        hollowCandle: "空心蜡烛图",
        heikinAshi: "平均K线图",
        column: "柱状图",
        lineWithMarkers: "带标记线图",
        stepLine: "阶梯线图"
    },
    toolbarButtons: {
        hint: "提示",
        replay: "回放",
        fullScreen: "全屏",
        screenshot: "截图",
        contrast: "对比"
    },
    indicators: {
        ma: "移动平均线",
        ema: "指数移动平均线",
        bollinger: "布林带",
        ichimoku: "一目均衡表",
        donchian: "唐奇安通道",
        envelope: "包络线",
        vwap: "成交量加权平均价"
    },
    leftPanel: {
        cursorCrosshair: "十字准星",
        cursorCrosshairDesc: "带空格的十字准星",
        cursorDot: "点状光标",
        cursorDotDesc: "圆点光标样式",
        cursorArrow: "箭头光标",
        cursorArrowDesc: "箭头指示样式",
        cursorSparkle: "烟花棒",
        cursorSparkleDesc: "烟花效果光标",
        cursorEmoji: "表情光标",
        cursorEmojiDesc: "表情符号光标",
        pencil: "铅笔",
        pencilDesc: "细线绘制工具",
        pen: "钢笔",
        penDesc: "流畅线条绘制",
        brush: "刷子",
        brushDesc: "柔和笔刷效果",
        markerPen: "马克笔",
        markerPenDesc: "粗体标记笔",
        eraser: "橡皮擦",
        eraserDesc: "擦除绘制内容",
        lineTools: "线",
        arrowTools: "箭头",
        channelTools: "通道",
        pitchforkTools: "叉",
        penTools: "画笔",
        gannTools: "江恩分析工具",
        fibonacciTools: "斐波那契工具",
        technicalPatterns: "技术图形",
        elliottWave: "艾略特波浪",
        regularShapes: "规则图形",
        rangeTools: "区间",
        positionTools: "标尺",
        simulationTools: "模拟",
        textTools: "文本",
        contentTools: "内容",
        lineSegment: "线段",
        lineSegmentDesc: "绘制线段",
        horizontalLine: "水平线",
        horizontalLineDesc: "绘制水平线标记",
        verticalLine: "垂直线",
        verticalLineDesc: "绘制垂直线标记",
        arrowLine: "箭头线",
        arrowLineDesc: "绘制箭头线标记",
        thickArrowLine: "粗箭头线",
        thickArrowLineDesc: "绘制箭头线标记",
        parallelChannel: "并行通道",
        parallelChannelDesc: "绘制并行通道",
        linearRegressionChannel: "线性回归通道",
        linearRegressionChannelDesc: "绘制回归通道",
        equidistantChannel: "等距通道",
        equidistantChannelDesc: "绘制等距通道",
        disjointChannel: "不相交通道",
        disjointChannelDesc: "绘制不相交通道",
        andrewPitchfork: "安德鲁干草叉",
        andrewPitchforkDesc: "绘制安德鲁干草叉",
        enhancedAndrewPitchfork: "改良安德鲁干草叉",
        enhancedAndrewPitchforkDesc: "绘制叉子",
        schiffPitchfork: "希夫干草叉",
        schiffPitchforkDesc: "绘制希夫干草叉",
        internalPitchfork: "内部干草叉线",
        internalPitchforkDesc: "绘制内部干草叉线",
        wavePitchfork: "波浪干草叉",
        wavePitchforkDesc: "绘制波浪干草叉",
        gannFan: "江恩扇",
        gannFanDesc: "江恩扇形线分析工具",
        gannBox: "江恩箱",
        gannBoxDesc: "江恩箱体分析工具",
        gannRectangle: "江恩正方体",
        gannRectangleDesc: "江恩正方体分析",
        fibonacciTimeZones: "斐波那契时间周期",
        fibonacciTimeZonesDesc: "斐波那契时间周期线分析",
        fibonacciRetracement: "斐波那契回调",
        fibonacciRetracementDesc: "绘制斐波那契回调线",
        fibonacciArc: "斐波那契弧线",
        fibonacciArcDesc: "绘制斐波那契弧线",
        fibonacciCircle: "斐波那契圆",
        fibonacciCircleDesc: "斐波那契圆线分析",
        fibonacciSpiral: "斐波那契螺旋",
        fibonacciSpiralDesc: "斐波那契螺旋线分析",
        fibonacciWedge: "斐波那契楔形",
        fibonacciWedgeDesc: "斐波那契楔形线分析",
        fibonacciFan: "斐波那契扇形",
        fibonacciFanDesc: "斐波那契扇形线分析",
        fibonacciChannel: "斐波那契通道",
        fibonacciChannelDesc: "斐波那契通道线分析",
        fibonacciExtensionPrice: "斐波那契扩展(基于价格)",
        fibonacciExtensionPriceDesc: "绘制斐波那契扩展线",
        fibonacciExtensionTime: "斐波那契扩展(基于时间)",
        fibonacciExtensionTimeDesc: "绘制斐波那契扩展线",
        xabcdPattern: "XABCD图形",
        xabcdPatternDesc: "绘制XABCD图形",
        headAndShoulders: "头肩图形",
        headAndShouldersDesc: "绘制头肩图形",
        abcdPattern: "ABCD图形",
        abcdPatternDesc: "绘制ABCD图形",
        triangleAbcd: "ABCD三角图形",
        triangleAbcdDesc: "绘制ABCD三角图形",
        elliottImpulse: "艾略特脉冲波",
        elliottImpulseDesc: "绘制艾略特脉冲波",
        elliottCorrective: "艾略特修正浪",
        elliottCorrectiveDesc: "绘制艾略特修正浪",
        elliottTriangle: "艾略特三角波",
        elliottTriangleDesc: "绘制艾略特三角波",
        elliottDoubleCombo: "艾略特双重组合波",
        elliottDoubleComboDesc: "绘制艾略特双重组合波",
        elliottTripleCombo: "艾略特三重组合波",
        elliottTripleComboDesc: "绘制艾略特三重组合波",
        rectangle: "矩形",
        rectangleDesc: "绘制矩形区域",
        circle: "圆形",
        circleDesc: "绘制圆形区域",
        ellipse: "椭圆",
        ellipseDesc: "绘制椭圆区域",
        triangle: "三角形",
        triangleDesc: "绘制三角形",
        sector: "扇形",
        sectorDesc: "绘制扇形",
        curve: "曲线",
        curveDesc: "绘制曲线",
        doubleCurve: "双曲线",
        doubleCurveDesc: "绘制双曲线",
        timeRange: "时间区间",
        timeRangeDesc: "绘制时间区间",
        priceRange: "价格区间",
        priceRangeDesc: "绘制价格区间",
        timePriceRange: "时间价格区间",
        timePriceRangeDesc: "绘制时间价格区间",
        longPosition: "多头",
        longPositionDesc: "多头标记",
        shortPosition: "空头",
        shortPositionDesc: "空头标记",
        mockKline: "模拟K线",
        mockKlineDesc: "模拟K线数据",
        text: "文本",
        textDesc: "文本标注",
        priceNote: "价格标记",
        priceNoteDesc: "价格标注",
        bubbleBox: "气泡框",
        bubbleBoxDesc: "气泡标注框",
        pin: "定位",
        pinDesc: "定位标记",
        signpost: "路标",
        signpostDesc: "路标标记",
        priceLabel: "价格标签",
        priceLabelDesc: "价格标签标记",
        flagMark: "旗标",
        flagMarkDesc: "旗标标记",
        image: "图片",
        imageDesc: "图片标注",
        video: "视频",
        videoDesc: "视频标注",
        audio: "音频",
        audioDesc: "音频标注",
        idea: "点子",
        ideaDesc: "点子标注",
        mouseCursor: "鼠标光标",
        drawingTools: "绘图工具",
        fibonacciToolsTitle: "斐波那契工具",
        projectInfoTools: "项目信息工具",
        shapeTools: "图形工具",
        brushTitle: "画笔",
        textMark: "文字标记",
        emojiMark: "表情标记",
        deleteTool: "删除工具",
        setting: "设置",
        selectedTool: "已选择",
        clickToStartDrawing: "点击图表开始绘制",
        selectEmoji: "选择表情",
        selectedEmoji: "已选择",
        clickToPlaceEmoji: "点击图表放置表情"
    }
}