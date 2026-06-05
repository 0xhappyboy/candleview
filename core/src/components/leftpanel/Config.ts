import { I18n } from '../../i18n';

export interface ToolConfig {
    cursorStyles: Array<{
        id: string;
        name: string;
        description: string;
        icon: string;
    }>;
    penTools: Array<{
        title: string;
        tools: Array<{
            id: string;
            name: string;
            description: string;
            icon: string;
        }>;
    }>;
    drawingTools: Array<{
        title: string;
        tools: Array<{
            id: string;
            name: string;
            description: string;
            icon: string;
        }>;
    }>;
    gannAndFibonacciTools: Array<{
        title: string;
        tools: Array<{
            id: string;
            name: string;
            description: string;
            icon: string;
        }>;
    }>;
    irregularShapeTools: Array<{
        title: string;
        tools: Array<{
            id: string;
            name: string;
            description: string;
            icon: string;
        }>;
    }>;
    projectInfoTools: Array<{
        title: string;
        tools: Array<{
            id: string;
            name: string;
            description: string;
            icon: string;
        }>;
    }>;
    textTools: Array<{
        title: string;
        tools: Array<{
            id: string;
            name: string;
            description: string;
            icon: string;
        }>;
    }>;
    aiTools: Array<{
        title: string;
        tools: Array<{
            id: string;
            name: string;
            description: string;
            icon: string;
        }>;
    }>;
    scriptTools: Array<{
        title: string;
        tools: Array<{
            id: string;
            name: string;
            description: string;
            icon: string;
        }>;
    }>;
}

function getIconSvg(name: string, color: string): string {
    const svgs: Record<string, string> = {
        cursorArrow: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M5 4L18 12L5 20V4Z" stroke-linejoin="round"/></svg>`,
        cursorCrosshair: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M12 4V8" stroke-linecap="round"/><path d="M12 16V20" stroke-linecap="round"/><path d="M4 12H8" stroke-linecap="round"/><path d="M16 12H20" stroke-linecap="round"/><circle cx="12" cy="12" r="2" fill="none"/></svg>`,
        cursorCircle: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><circle cx="12" cy="12" r="10" fill="none"/><circle cx="12" cy="12" r="6" fill="none" opacity="0.7"/><circle cx="12" cy="12" r="1.5" fill="${color}"/></svg>`,
        cursorDot: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><circle cx="12" cy="12" r="4" fill="${color}"/><circle cx="12" cy="12" r="8" fill="none"/></svg>`,
        cursorSparkle: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" stroke-linejoin="round"/><circle cx="12" cy="12" r="2" fill="${color}"/></svg>`,
        pencil: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M17 3L21 7L7 21H3V17L17 3Z" stroke-linejoin="round"/><path d="M15 5L19 9" stroke-linecap="round"/></svg>`,
        pen: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M12 19L19 12L22 15L15 22L12 19Z" stroke-linejoin="round"/><path d="M18 13L16.5 5.5L2 2L5.5 16.5L13 18L18 13Z" stroke-linejoin="round"/><path d="M2 2L9.5 9.5" stroke-linecap="round"/></svg>`,
        brush: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M12 2V18" stroke-linecap="round"/><path d="M6 18H18L17 21H7L6 18Z" stroke-linejoin="round"/></svg>`,
        markerPen: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M6 3H18L19 8V21L18 22H6L5 21V8L6 3Z" stroke-linejoin="round"/><path d="M6 8H18" stroke-linecap="round"/></svg>`,
        eraser: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M6 7H18V19H6V7Z" stroke-linejoin="round"/><path d="M6 7L12 4L18 7" stroke-linejoin="round"/><path d="M6 19L12 22L18 19" stroke-linejoin="round"/></svg>`,
        lineSegment: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M4 20L20 4" stroke-linecap="round"/><circle cx="4" cy="20" r="1.8" fill="none"/><circle cx="20" cy="4" r="1.8" fill="none"/></svg>`,
        horizontalLine: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M1 12H23" stroke-linecap="round"/><circle cx="12" cy="12" r="2.2" fill="none"/></svg>`,
        verticalLine: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M12 1V23" stroke-linecap="round"/><circle cx="12" cy="12" r="2.2" fill="none"/></svg>`,
        arrowLine: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M3 12H21" stroke-linecap="round"/><path d="M17 8L21 12L17 16" stroke-linejoin="round"/></svg>`,
        thickArrowLine: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><path d="M3 12H21" stroke-linecap="round"/><path d="M17 8L21 12L17 16" stroke-linejoin="round"/></svg>`,
        parallelChannel: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M3 6V18" stroke-linecap="round"/><path d="M12 4V20" stroke-linecap="round"/><path d="M21 6V18" stroke-linecap="round"/><path d="M3 6L21 6" stroke-linecap="round"/><path d="M3 18L21 18" stroke-linecap="round"/></svg>`,
        linearRegressionChannel: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M3 18L8 8L13 16L18 6L21 10" stroke-linecap="round"/><path d="M5 14L19 10" stroke-linecap="round" stroke-dasharray="2 2"/><path d="M7 6L17 18" stroke-linecap="round"/></svg>`,
        equidistantChannel: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M3 8L12 2L21 8" stroke-linecap="round"/><path d="M3 16L12 22L21 16" stroke-linecap="round"/><path d="M6 5V19" stroke-linecap="round"/><path d="M18 5V19" stroke-linecap="round"/></svg>`,
        disjointChannel: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M2 5V13" stroke-linecap="round"/><path d="M12 7V15" stroke-linecap="round"/><path d="M22 9V17" stroke-linecap="round"/><path d="M2 5L12 7" stroke-linecap="round"/><path d="M2 13L12 15" stroke-linecap="round"/><path d="M12 7L22 9" stroke-linecap="round"/><path d="M12 15L22 17" stroke-linecap="round"/></svg>`,
        andrewPitchfork: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M12 2V22" stroke-linecap="round"/><path d="M5 6V18" stroke-linecap="round"/><path d="M19 6V18" stroke-linecap="round"/><path d="M5 6L12 12L19 6" stroke-linejoin="round"/><path d="M5 18L12 12L19 18" stroke-linejoin="round"/></svg>`,
        enhancedAndrewPitchfork: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M12 2V22" stroke-linecap="round"/><path d="M5 6V18" stroke-linecap="round"/><path d="M19 6V18" stroke-linecap="round"/><path d="M7 4L17 4" stroke-linecap="round"/><path d="M7 20L17 20" stroke-linecap="round"/><circle cx="12" cy="12" r="1.2" fill="${color}"/></svg>`,
        schiffPitchfork: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M7 2V22" stroke-linecap="round"/><path d="M17 2V22" stroke-linecap="round"/><path d="M12 6V18" stroke-linecap="round"/><path d="M7 6L17 6" stroke-linecap="round"/><path d="M7 18L17 18" stroke-linecap="round"/><path d="M7 12L17 12" stroke-linecap="round"/></svg>`,
        rectangle: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><rect x="4" y="4" width="16" height="16" fill="none"/></svg>`,
        circle: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><circle cx="12" cy="12" r="8" fill="none"/></svg>`,
        ellipse: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><ellipse cx="12" cy="12" rx="8" ry="5" fill="none"/></svg>`,
        triangle: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M12 4L20 20H4L12 4Z" fill="none"/></svg>`,
        sector: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M4 20A16 16 0 0 1 20 4L20 20L4 20Z" fill="none"/></svg>`,
        curve: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M4 12C4 12 8 8 12 12C16 16 20 12 20 12" fill="none"/></svg>`,
        doubleCurve: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M4 8C4 8 8 4 12 8C16 12 20 8 20 8" fill="none"/><path d="M4 16C4 16 8 12 12 16C16 20 20 16 20 16" fill="none"/></svg>`,
        gannFan: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M3 21L21 3" stroke-linecap="round"/><path d="M12 3V21" stroke-linecap="round"/><path d="M3 12H21" stroke-linecap="round"/></svg>`,
        gannBox: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" fill="none"/><path d="M8 8h8v8H8z" fill="none"/></svg>`,
        gannRectangle: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><rect x="4" y="4" width="16" height="16" fill="none"/><path d="M4 12H20" stroke-linecap="round"/><path d="M12 4V20" stroke-linecap="round"/><path d="M8 8L16 16" stroke-linecap="round"/><path d="M8 16L16 8" stroke-linecap="round"/></svg>`,
        fibonacciTimeZones: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M2 12H22" stroke-linecap="round"/><path d="M12 2V22" stroke-linecap="round"/><path d="M4 4L20 20" stroke-linecap="round"/><path d="M20 4L4 20" stroke-linecap="round"/></svg>`,
        fibonacciRetracement: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M2 4H22" stroke-linecap="round"/><path d="M2 9H22" stroke-linecap="round"/><path d="M2 15H22" stroke-linecap="round"/><path d="M2 20H22" stroke-linecap="round"/><circle cx="6" cy="4" r="1.5" fill="none"/><circle cx="12" cy="9" r="2" fill="none"/><circle cx="18" cy="15" r="1.5" fill="none"/></svg>`,
        fibonacciArc: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M1 12A11 11 0 0 1 23 12" fill="none"/><path d="M3 12A9 9 0 0 1 21 12" fill="none"/><path d="M5 12A7 7 0 0 1 19 12" fill="none"/></svg>`,
        fibonacciCircle: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><circle cx="12" cy="12" r="10" fill="none"/><circle cx="12" cy="12" r="6" fill="none"/><circle cx="12" cy="12" r="3" fill="none"/></svg>`,
        fibonacciSpiral: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M12 12c1-.4.7-1.8 0-2.4-1.1-.9-2.7-.4-3.4.8-1.5 2.4.9 5 3.4 4.9 2.7-.2 4.3-2.9 3.7-5.4-.7-3-3.9-4.5-6.7-3.6-2.6.8-4.2 3.5-4 6.2.3 3 2.6 5.4 5.5 5.9 2.8.5 5.7-.8 7.2-3.2" fill="none"/></svg>`,
        fibonacciWedge: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M4 20L12 4L20 20" fill="none"/><path d="M6 16L18 16" stroke-linecap="round"/><path d="M8 12L16 12" stroke-linecap="round"/><path d="M10 8L14 8" stroke-linecap="round"/></svg>`,
        fibonacciFan: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M12 4V20" stroke-linecap="round"/><path d="M12 4L4 12" stroke-linecap="round"/><path d="M12 4L20 12" stroke-linecap="round"/><path d="M12 4L8 16" stroke-linecap="round"/><path d="M12 4L16 16" stroke-linecap="round"/></svg>`,
        fibonacciChannel: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M4 6L20 18" stroke-linecap="round"/><path d="M4 12L20 12" stroke-linecap="round"/><path d="M4 18L20 6" stroke-linecap="round"/></svg>`,
        fibonacciExtensionPrice: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M12 2V22" stroke-linecap="round"/><path d="M8 6H16" stroke-linecap="round"/><path d="M6 9H18" stroke-linecap="round"/><path d="M4 12H20" stroke-linecap="round"/></svg>`,
        fibonacciExtensionTime: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M2 12H22" stroke-linecap="round"/><path d="M6 8V16" stroke-linecap="round"/><path d="M9 6V18" stroke-linecap="round"/><path d="M12 4V20" stroke-linecap="round"/><path d="M15 6V18" stroke-linecap="round"/><path d="M18 8V16" stroke-linecap="round"/></svg>`,
        xabcdPattern: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M2 20L8 4L14 18L22 2" stroke-linecap="round"/></svg>`,
        headAndShoulders: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M2 20L6 6L10 16L14 6L18 16L22 20" stroke-linecap="round"/><path d="M3 16L21 16" stroke-linecap="round" stroke-dasharray="2 2"/></svg>`,
        abcdPattern: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M2 20L12 2L22 20" stroke-linecap="round"/></svg>`,
        triangleAbcd: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M2 20L12 2L22 20L2 20Z" fill="none"/><path d="M6 16L18 16" stroke-linecap="round" stroke-dasharray="2 2"/></svg>`,
        elliottImpulse: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M2 18L6 6L10 14L14 6L18 10L22 18" stroke-linecap="round"/></svg>`,
        elliottCorrective: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M2 16L6 20L10 8L14 20L18 16" stroke-linecap="round"/><path d="M4 18L16 18" stroke-linecap="round" stroke-dasharray="2 2"/></svg>`,
        elliottTriangle: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M2 18L12 6L22 18L2 18Z" fill="none"/><path d="M6 14L18 14" stroke-linecap="round"/><path d="M8 12L16 12" stroke-linecap="round"/><path d="M10 10L14 10" stroke-linecap="round"/></svg>`,
        elliottDoubleCombo: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M2 18L6 10L10 14L14 8L18 12L22 16" stroke-linecap="round"/><path d="M10 14L14 8" stroke-linecap="round" stroke-dasharray="2 2"/></svg>`,
        elliottTripleCombo: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M2 18L5 12L8 16L11 10L14 14L17 8L20 12L22 18" stroke-linecap="round"/><path d="M8 16L11 10" stroke-linecap="round" stroke-dasharray="2 2"/><path d="M14 14L17 8" stroke-linecap="round" stroke-dasharray="2 2"/></svg>`,
        timeRange: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M2 4H22" stroke-linecap="round"/><path d="M2 20H22" stroke-linecap="round"/><rect x="7" y="4" width="10" height="16" fill="none"/></svg>`,
        priceRange: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M4 2V22" stroke-linecap="round"/><path d="M20 2V22" stroke-linecap="round"/><rect x="4" y="7" width="16" height="10" fill="none"/></svg>`,
        timePriceRange: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M4 2V22" stroke-linecap="round"/><path d="M2 20H22" stroke-linecap="round"/><rect x="7" y="7" width="10" height="10" fill="none"/></svg>`,
        heatMap: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><rect x="4" y="4" width="16" height="16" rx="1" fill="none"/><rect x="6" y="6" width="4" height="4" fill="${color}" opacity="0.2"/><rect x="11" y="6" width="4" height="4" fill="${color}" opacity="0.5"/><rect x="16" y="6" width="2" height="4" fill="${color}" opacity="0.8"/></svg>`,
        longPosition: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M12 4V20" stroke-linecap="round"/><path d="M8 8L12 4L16 8" stroke-linejoin="round"/></svg>`,
        shortPosition: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M12 4V20" stroke-linecap="round"/><path d="M8 16L12 20L16 16" stroke-linejoin="round"/></svg>`,
        mockKline: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><rect x="4" y="4" width="16" height="16" fill="none"/><path d="M7 8V16" stroke-linecap="round"/><path d="M10 12V16" stroke-linecap="round"/><path d="M13 6V16" stroke-linecap="round"/><path d="M16 10V16" stroke-linecap="round"/></svg>`,
        text: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M4 7L4 4L20 4L20 7" stroke-linecap="round"/><path d="M12 20L12 4" stroke-linecap="round"/><path d="M8 20L16 20" stroke-linecap="round"/></svg>`,
        priceNote: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M12 1V23" stroke-linecap="round"/><circle cx="12" cy="5" r="2.5" fill="none"/><path d="M7 5H17" stroke-linecap="round"/></svg>`,
        bubbleBox: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><rect x="4" y="4" width="16" height="14" rx="2" fill="none"/><path d="M11 19L12 21L13 19" stroke-linecap="round"/></svg>`,
        pin: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M12 21L12 10" stroke-linecap="round"/><path d="M12 10L16 6L12 10L8 6L12 10Z" stroke-linejoin="round"/><circle cx="12" cy="4" r="3.2" fill="none"/></svg>`,
        signpost: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M12 2V22" stroke-linecap="round"/><path d="M7 6H17" stroke-linecap="round"/><path d="M9 12H15" stroke-linecap="round"/><path d="M8 18H16" stroke-linecap="round"/></svg>`,
        priceLabel: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M12 2L22 12L12 22L2 12L12 2Z" fill="none"/><circle cx="12" cy="12" r="2.2" fill="none"/><path d="M7 7L17 17" stroke-linecap="round"/><path d="M7 17L17 7" stroke-linecap="round"/></svg>`,
        flagMark: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M5 21L5 4" stroke-linecap="round"/><path d="M5 4L19 4L13 10L19 16L5 16" fill="none"/></svg>`,
        image: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><rect x="4" y="4" width="16" height="16" rx="2" fill="none"/><circle cx="8.5" cy="8.5" r="1.5" fill="none"/><path d="M5 19L9 15L13 19L19 13" stroke-linecap="round"/></svg>`,
        ai: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><ellipse cx="12" cy="20" rx="10" ry="3" fill="none"/><circle cx="12" cy="10.5" r="8" fill="none"/><path d="M7 8C9 6 15 6 17 8" fill="none"/><circle cx="9" cy="9" r="1.5" fill="${color}"/><path d="M12 5L14 2L16 5L19 6L16 7L14 10L12 7L9 6Z" fill="${color}"/></svg>`,
        terminal: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><rect x="3" y="4" width="18" height="16" rx="2" fill="none"/><path d="M6 9L9 12L6 15" stroke-linecap="round"/><path d="M11 15H15" stroke-linecap="round"/></svg>`,
        script: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M14 2H6C5.44772 2 5 2.44772 5 3V21C5 21.5523 5.44772 22 6 22H18C18.5523 22 19 21.5523 19 21V8L14 2Z" fill="none"/><path d="M14 2V8H19" fill="none"/><path d="M9 12H15" stroke-linecap="round"/><path d="M9 16H12" stroke-linecap="round"/></svg>`,
        trash: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M3 6H5H21" stroke-linecap="round"/><path d="M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6M19 6V20C19 20.5523 18.5523 21 18 21H6C5.44772 21 5 20.5523 5 20V6H19Z" fill="none"/><path d="M10 11V17" stroke-linecap="round"/><path d="M14 11V17" stroke-linecap="round"/></svg>`,
        lock: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><rect x="3" y="10" width="18" height="12" rx="2" fill="none"/><path d="M7 10V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V10" fill="none"/><circle cx="12" cy="15" r="1" fill="${color}"/><path d="M12 15V17" stroke-linecap="round"/></svg>`,
        unlock: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><rect x="3" y="10" width="18" height="12" rx="2" fill="none"/><path d="M7 10V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7" fill="none" stroke-dasharray="12 12"/><circle cx="12" cy="15" r="1" fill="${color}"/><path d="M12 15V17" stroke-linecap="round"/></svg>`,
        eyeOpen: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" fill="none"/><circle cx="12" cy="12" r="3" fill="none"/></svg>`,
        eyeClosed: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M2 12C2 12 6 4 13 4C20 4 24 12 24 12C24 12 20 20 13 20C6 20 2 12 2 12Z" fill="none"/><path d="M4.93 4.93L19.07 19.07" stroke-linecap="round"/><path d="M9.76 14.24C8.79 13.27 8.79 11.73 9.76 10.76C10.73 9.79 12.27 9.79 13.24 10.76" stroke-linecap="round"/></svg>`,
        emoji: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><circle cx="12" cy="12" r="10" fill="none"/><path d="M8 14s1.5 2 4 2 4-2 4-2" stroke-linecap="round"/><circle cx="9" cy="9" r="1" fill="${color}"/><circle cx="15" cy="9" r="1" fill="${color}"/></svg>`,
        functionIcon: `<svg width="20" height="20" viewBox="0 0 56 56" fill="none" stroke="${color}" stroke-width="1.5"><path d="M 27.9266 43.8337 C 28.6400 43.8337 29.1436 43.4350 29.1436 42.7216 C 29.1436 42.4069 29.0597 42.2391 28.8289 41.7984 C 26.2691 37.8329 24.8213 33.2799 24.8213 28.3492 C 24.8213 23.5863 26.1852 18.8235 28.8289 14.8369 C 29.0597 14.3963 29.1436 14.2285 29.1436 13.9137 C 29.1436 13.2423 28.6400 12.8017 27.9266 12.8017 C 27.2343 12.8017 26.6677 13.1164 25.9963 14.0396 C 22.8491 18.0471 21.2545 23.0408 21.2545 28.3282 C 21.2545 33.6156 22.7861 38.4623 25.9963 42.5958 C 26.6677 43.5189 27.2343 43.8337 27.9266 43.8337 Z M 49.3490 43.8337 C 50.0413 43.8337 50.5870 43.5189 51.2582 42.5958 C 54.4685 38.4623 56 33.6156 56 28.3282 C 56 23.0408 54.4264 18.0471 51.2582 14.0396 C 50.5870 13.1164 50.0413 12.8017 49.3490 12.8017 C 48.6357 12.8017 48.1321 13.2423 48.1321 13.9137 C 48.1321 14.2285 48.1948 14.3963 48.4256 14.8369 C 51.0906 18.8235 52.4541 23.5863 52.4541 28.3492 C 52.4541 33.2799 50.9858 37.8329 48.4466 41.7984 C 48.1948 42.2391 48.1321 42.4069 48.1321 42.7216 C 48.1321 43.3931 48.6357 43.8337 49.3490 43.8337 Z M 2.8325 43.7917 C 6.9449 43.7917 8.8543 42.0292 9.8404 37.3084 L 12.2323 25.8314 L 16.0300 25.8314 C 17.2470 25.8314 18.0233 25.1809 18.0233 24.1318 C 18.0233 23.2296 17.4358 22.6631 16.4706 22.6631 L 12.9247 22.6631 L 13.5122 19.8096 C 14.0577 17.1449 14.8970 16.0539 17.2260 16.0539 C 17.5617 16.0539 17.8974 16.0329 18.1282 16.0119 C 19.1773 15.9070 19.6389 15.4244 19.6389 14.5222 C 19.6389 13.3472 18.6527 12.8227 16.6385 12.8227 C 12.6310 12.8227 10.5748 14.8160 9.6516 19.3060 L 8.9382 22.6631 L 6.3365 22.6631 C 5.1195 22.6631 4.3222 23.3136 4.3222 24.3626 C 4.3222 25.2648 4.9307 25.8314 5.8959 25.8314 L 8.2668 25.8314 L 5.9588 36.8048 C 5.3713 39.5534 4.5110 40.5605 2.2660 40.5605 C 1.9723 40.5605 1.6995 40.5815 1.4897 40.6025 C 0.5245 40.7284 0 41.2529 0 42.1342 C 0 43.2672 0.9652 43.7917 2.8325 43.7917 Z M 32.3118 38.2735 C 33.0042 38.2735 33.4658 38.0427 33.9904 37.2874 L 38.5853 30.7411 L 38.6691 30.7411 L 43.3692 37.3923 C 43.8939 38.1267 44.3971 38.2735 44.9007 38.2735 C 45.9079 38.2735 46.5796 37.5601 46.5796 36.6999 C 46.5796 36.3012 46.4537 35.9236 46.1808 35.5669 L 40.8095 28.2652 L 46.1808 21.0685 C 46.4537 20.7118 46.5796 20.3341 46.5796 19.8935 C 46.5796 18.9913 45.8241 18.3619 44.9849 18.3619 C 44.2295 18.3619 43.7886 18.7396 43.3903 19.3480 L 38.9630 25.8314 L 38.8582 25.8314 L 34.4100 19.3270 C 34.0114 18.7185 33.5078 18.3619 32.7105 18.3619 C 31.7453 18.3619 31.0109 19.1382 31.0109 19.9774 C 31.0109 20.5859 31.1788 20.9636 31.4726 21.3203 L 36.5711 28.1603 L 31.1578 35.6508 C 30.8431 36.0495 30.7802 36.4062 30.7802 36.8258 C 30.7802 37.6441 31.4726 38.2735 32.3118 38.2735 Z" fill="${color}"/></svg>`,
    };
    return svgs[name] || '';
}

export const getToolConfig = (i18n: I18n): ToolConfig => {
    const color = 'currentColor';
    return {
        cursorStyles: [
            { id: 'default', name: i18n.t('cursorArrow'), description: i18n.t('cursorArrowDesc'), icon: getIconSvg('cursorArrow', color) },
            { id: 'crosshair', name: i18n.t('cursorCrosshair'), description: i18n.t('cursorCrosshairDesc'), icon: getIconSvg('cursorCrosshair', color) },
            { id: 'circle', name: i18n.t('cursorCircle'), description: i18n.t('cursorCircleDesc'), icon: getIconSvg('cursorCircle', color) },
            { id: 'dot', name: i18n.t('cursorDot'), description: i18n.t('cursorDotDesc'), icon: getIconSvg('cursorDot', color) },
            { id: 'sparkle', name: i18n.t('cursorSparkle'), description: i18n.t('cursorSparkleDesc'), icon: getIconSvg('cursorSparkle', color) },
        ],
        penTools: [{
            title: i18n.t('penTools'),
            tools: [
                { id: 'pencil', name: i18n.t('pencil'), description: i18n.t('pencilDesc'), icon: getIconSvg('pencil', color) },
                { id: 'pen', name: i18n.t('pen'), description: i18n.t('penDesc'), icon: getIconSvg('pen', color) },
                { id: 'brush', name: i18n.t('brush'), description: i18n.t('brushDesc'), icon: getIconSvg('brush', color) },
                { id: 'marker-pen', name: i18n.t('markerPen'), description: i18n.t('markerPenDesc'), icon: getIconSvg('markerPen', color) },
                { id: 'eraser', name: i18n.t('eraser'), description: i18n.t('eraserDesc'), icon: getIconSvg('eraser', color) },
            ]
        }],
        drawingTools: [
            {
                title: i18n.t('lineTools'),
                tools: [
                    { id: 'line-segment', name: i18n.t('lineSegment'), description: i18n.t('lineSegmentDesc'), icon: getIconSvg('lineSegment', color) },
                    { id: 'horizontal-line', name: i18n.t('horizontalLine'), description: i18n.t('horizontalLineDesc'), icon: getIconSvg('horizontalLine', color) },
                    { id: 'vertical-line', name: i18n.t('verticalLine'), description: i18n.t('verticalLineDesc'), icon: getIconSvg('verticalLine', color) },
                ]
            },
            {
                title: i18n.t('arrowTools'),
                tools: [
                    { id: 'arrow-line', name: i18n.t('arrowLine'), description: i18n.t('arrowLineDesc'), icon: getIconSvg('arrowLine', color) },
                    { id: 'thick-arrow-line', name: i18n.t('thickArrowLine'), description: i18n.t('thickArrowLineDesc'), icon: getIconSvg('thickArrowLine', color) },
                ]
            },
            {
                title: i18n.t('channelTools'),
                tools: [
                    { id: 'parallel-channel', name: i18n.t('parallelChannel'), description: i18n.t('parallelChannelDesc'), icon: getIconSvg('parallelChannel', color) },
                    { id: 'linear-regression-channel', name: i18n.t('linearRegressionChannel'), description: i18n.t('linearRegressionChannelDesc'), icon: getIconSvg('linearRegressionChannel', color) },
                    { id: 'equidistant-channel', name: i18n.t('equidistantChannel'), description: i18n.t('equidistantChannelDesc'), icon: getIconSvg('equidistantChannel', color) },
                    { id: 'disjoint-channel', name: i18n.t('disjointChannel'), description: i18n.t('disjointChannelDesc'), icon: getIconSvg('disjointChannel', color) },
                ]
            },
            {
                title: i18n.t('pitchforkTools'),
                tools: [
                    { id: 'andrew-pitchfork', name: i18n.t('andrewPitchfork'), description: i18n.t('andrewPitchforkDesc'), icon: getIconSvg('andrewPitchfork', color) },
                    { id: 'enhanced-andrew-pitch-fork', name: i18n.t('enhancedAndrewPitchfork'), description: i18n.t('enhancedAndrewPitchforkDesc'), icon: getIconSvg('enhancedAndrewPitchfork', color) },
                    { id: 'schiff-pitch-fork', name: i18n.t('schiffPitchfork'), description: i18n.t('schiffPitchforkDesc'), icon: getIconSvg('schiffPitchfork', color) },
                ]
            },
        ],
        gannAndFibonacciTools: [
            {
                title: i18n.t('gannTools'),
                tools: [
                    { id: 'gann-fan', name: i18n.t('gannFan'), description: i18n.t('gannFanDesc'), icon: getIconSvg('gannFan', color) },
                    { id: 'gann-box', name: i18n.t('gannBox'), description: i18n.t('gannBoxDesc'), icon: getIconSvg('gannBox', color) },
                    { id: 'gann-rectang', name: i18n.t('gannRectangle'), description: i18n.t('gannRectangleDesc'), icon: getIconSvg('gannRectangle', color) },
                ]
            },
            {
                title: i18n.t('fibonacciTools'),
                tools: [
                    { id: 'fibonacci-time-zoon', name: i18n.t('fibonacciTimeZones'), description: i18n.t('fibonacciTimeZonesDesc'), icon: getIconSvg('fibonacciTimeZones', color) },
                    { id: 'fibonacci-retracement', name: i18n.t('fibonacciRetracement'), description: i18n.t('fibonacciRetracementDesc'), icon: getIconSvg('fibonacciRetracement', color) },
                    { id: 'fibonacci-arc', name: i18n.t('fibonacciArc'), description: i18n.t('fibonacciArcDesc'), icon: getIconSvg('fibonacciArc', color) },
                    { id: 'fibonacci-circle', name: i18n.t('fibonacciCircle'), description: i18n.t('fibonacciCircleDesc'), icon: getIconSvg('fibonacciCircle', color) },
                    { id: 'fibonacci-spiral', name: i18n.t('fibonacciSpiral'), description: i18n.t('fibonacciSpiralDesc'), icon: getIconSvg('fibonacciSpiral', color) },
                    { id: 'fibonacci-wedge', name: i18n.t('fibonacciWedge'), description: i18n.t('fibonacciWedgeDesc'), icon: getIconSvg('fibonacciWedge', color) },
                    { id: 'fibonacci-fan', name: i18n.t('fibonacciFan'), description: i18n.t('fibonacciFanDesc'), icon: getIconSvg('fibonacciFan', color) },
                    { id: 'fibonacci-channel', name: i18n.t('fibonacciChannel'), description: i18n.t('fibonacciChannelDesc'), icon: getIconSvg('fibonacciChannel', color) },
                    { id: 'fibonacci-extension-base-price', name: i18n.t('fibonacciExtensionPrice'), description: i18n.t('fibonacciExtensionPriceDesc'), icon: getIconSvg('fibonacciExtensionPrice', color) },
                    { id: 'fibonacci-extension-base-time', name: i18n.t('fibonacciExtensionTime'), description: i18n.t('fibonacciExtensionTimeDesc'), icon: getIconSvg('fibonacciExtensionTime', color) },
                ]
            }
        ],
        irregularShapeTools: [
            {
                title: i18n.t('technicalPatterns'),
                tools: [
                    { id: 'xabcd', name: i18n.t('xabcdPattern'), description: i18n.t('xabcdPatternDesc'), icon: getIconSvg('xabcdPattern', color) },
                    { id: 'head-and-shoulders', name: i18n.t('headAndShoulders'), description: i18n.t('headAndShouldersDesc'), icon: getIconSvg('headAndShoulders', color) },
                    { id: 'abcd', name: i18n.t('abcdPattern'), description: i18n.t('abcdPatternDesc'), icon: getIconSvg('abcdPattern', color) },
                    { id: 'triangle-abcd', name: i18n.t('triangleAbcd'), description: i18n.t('triangleAbcdDesc'), icon: getIconSvg('triangleAbcd', color) },
                ]
            },
            {
                title: i18n.t('elliottWave'),
                tools: [
                    { id: 'elliott-lmpulse', name: i18n.t('elliottImpulse'), description: i18n.t('elliottImpulseDesc'), icon: getIconSvg('elliottImpulse', color) },
                    { id: 'elliott-corrective', name: i18n.t('elliottCorrective'), description: i18n.t('elliottCorrectiveDesc'), icon: getIconSvg('elliottCorrective', color) },
                    { id: 'elliott-triangle', name: i18n.t('elliottTriangle'), description: i18n.t('elliottTriangleDesc'), icon: getIconSvg('elliottTriangle', color) },
                    { id: 'elliott-double-combo', name: i18n.t('elliottDoubleCombo'), description: i18n.t('elliottDoubleComboDesc'), icon: getIconSvg('elliottDoubleCombo', color) },
                    { id: 'elliott-triple-combo', name: i18n.t('elliottTripleCombo'), description: i18n.t('elliottTripleComboDesc'), icon: getIconSvg('elliottTripleCombo', color) },
                ]
            },
            {
                title: i18n.t('regularShapes'),
                tools: [
                    { id: 'rectangle', name: i18n.t('rectangle'), description: i18n.t('rectangleDesc'), icon: getIconSvg('rectangle', color) },
                    { id: 'circle', name: i18n.t('circle'), description: i18n.t('circleDesc'), icon: getIconSvg('circle', color) },
                    { id: 'ellipse', name: i18n.t('ellipse'), description: i18n.t('ellipseDesc'), icon: getIconSvg('ellipse', color) },
                    { id: 'triangle', name: i18n.t('triangle'), description: i18n.t('triangleDesc'), icon: getIconSvg('triangle', color) },
                    { id: 'sector', name: i18n.t('sector'), description: i18n.t('sectorDesc'), icon: getIconSvg('sector', color) },
                    { id: 'curve', name: i18n.t('curve'), description: i18n.t('curveDesc'), icon: getIconSvg('curve', color) },
                    { id: 'double-curve', name: i18n.t('doubleCurve'), description: i18n.t('doubleCurveDesc'), icon: getIconSvg('doubleCurve', color) },
                ]
            },
        ],
        projectInfoTools: [
            {
                title: i18n.t('rangeTools'),
                tools: [
                    { id: 'time-range', name: i18n.t('timeRange'), description: i18n.t('timeRangeDesc'), icon: getIconSvg('timeRange', color) },
                    { id: 'price-range', name: i18n.t('priceRange'), description: i18n.t('priceRangeDesc'), icon: getIconSvg('priceRange', color) },
                    { id: 'time-price-range', name: i18n.t('timePriceRange'), description: i18n.t('timePriceRangeDesc'), icon: getIconSvg('timePriceRange', color) },
                    { id: 'heat-map', name: i18n.t('heatMap'), description: i18n.t('heatMap'), icon: getIconSvg('heatMap', color) },
                ]
            },
            {
                title: i18n.t('positionTools'),
                tools: [
                    { id: 'long-position', name: i18n.t('longPosition'), description: i18n.t('longPositionDesc'), icon: getIconSvg('longPosition', color) },
                    { id: 'short-position', name: i18n.t('shortPosition'), description: i18n.t('shortPositionDesc'), icon: getIconSvg('shortPosition', color) },
                ]
            },
            {
                title: i18n.t('simulationTools'),
                tools: [
                    { id: 'mock-kline', name: i18n.t('mockKline'), description: i18n.t('mockKlineDesc'), icon: getIconSvg('mockKline', color) },
                ]
            },
        ],
        textTools: [
            {
                title: i18n.t('textTools'),
                tools: [
                    { id: 'text', name: i18n.t('text'), description: i18n.t('textDesc'), icon: getIconSvg('text', color) },
                    { id: 'price-note', name: i18n.t('priceNote'), description: i18n.t('priceNoteDesc'), icon: getIconSvg('priceNote', color) },
                    { id: 'bubble-box', name: i18n.t('bubbleBox'), description: i18n.t('bubbleBoxDesc'), icon: getIconSvg('bubbleBox', color) },
                    { id: 'pin', name: i18n.t('pin'), description: i18n.t('pinDesc'), icon: getIconSvg('pin', color) },
                    { id: 'signpost', name: i18n.t('signpost'), description: i18n.t('signpostDesc'), icon: getIconSvg('signpost', color) },
                    { id: 'price-label', name: i18n.t('priceLabel'), description: i18n.t('priceLabelDesc'), icon: getIconSvg('priceLabel', color) },
                    { id: 'flag-mark', name: i18n.t('flagMark'), description: i18n.t('flagMarkDesc'), icon: getIconSvg('flagMark', color) },
                ]
            },
            {
                title: i18n.t('contentTools'),
                tools: [
                    { id: 'image', name: i18n.t('image'), description: i18n.t('imageDesc'), icon: getIconSvg('image', color) },
                ]
            },
        ],
        aiTools: [
            { title: 'OpenAI', tools: [{ id: 'openai-chart', name: i18n.t('describeChart'), description: i18n.t('describeChartDesc'), icon: getIconSvg('ai', color) }] },
            { title: 'Aliyun', tools: [{ id: 'aliyun-chart', name: i18n.t('describeChart'), description: i18n.t('describeChartDesc'), icon: getIconSvg('ai', color) }] },
            { title: 'DeepSeek', tools: [{ id: 'deepseek-chart', name: i18n.t('describeChart'), description: i18n.t('describeChartDesc'), icon: getIconSvg('ai', color) }] },
        ],
        scriptTools: [{
            title: i18n.t('scriptTools'),
            tools: [{ id: 'price-event', name: i18n.t('priceEvent'), description: i18n.t('priceEventDesc'), icon: getIconSvg('script', color) }]
        }]
    };
};