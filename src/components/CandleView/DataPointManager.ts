import { ICandleViewDataPoint } from "./types";

export class DataPointManager {
    private static lastFirstRealDataInViewport: boolean = true;
    private static lastLastRealDataInViewport: boolean = true;
    private static lastFirstRealDataLeftViewport: boolean = false;
    private static lastFirstRealDataRightViewport: boolean = false;
    private static lastLastRealDataLeftViewport: boolean = false;
    private static lastLastRealDataRightViewport: boolean = false;
    private static lastFirstRealDataNearRightViewport: boolean = false;
    private static lastLastRealDataNearLeftViewport: boolean = false;

    public static getRealDataRange(data: ICandleViewDataPoint[]): { firstIndex: number; lastIndex: number } | null {
        if (data.length === 0) {
            return null;
        }
        let firstIndex = -1;
        let lastIndex = -1;
        for (let i = 0; i < data.length; i++) {
            const dataPoint = data[i];
            const isRealData = !dataPoint.isVirtual;
            if (isRealData) {
                firstIndex = i;
                break;
            }
        }
        for (let i = data.length - 1; i >= 0; i--) {
            const dataPoint = data[i];
            const isRealData = !dataPoint.isVirtual;
            if (isRealData) {
                lastIndex = i;
                break;
            }
        }
        return { firstIndex, lastIndex };
    }

    public static checkDataPointPositions(
        visibleLogicalRange: { from: number; to: number } | null,
        realDataRange: { firstIndex: number; lastIndex: number } | null,
        callbacks: {
            onFirstRealDataExitLeftViewport?: () => void;
            onFirstRealDataExitRightViewport?: () => void;
            onLastRealDataExitLeftViewport?: () => void;
            onLastRealDataExitRightViewport?: () => void;
            onFirstRealDataExitViewport?: () => void;
            onLastRealDataExitViewport?: () => void;
            onFirstRealDataEnterLeftViewport?: () => void;
            onFirstRealDataNearRightViewport?: () => void;
            onLastRealDataNearLeftViewport?: () => void;
            onFirstRealDataLeaveNearRightViewport?: () => void;
            onLastRealDataLeaveNearLeftViewport?: () => void;
        }
    ): void {
        if (!visibleLogicalRange || !realDataRange) return;
        const { firstIndex, lastIndex } = realDataRange;
        const { from: viewportStart, to: viewportEnd } = visibleLogicalRange;

        const firstRealDataInViewport = firstIndex >= viewportStart && firstIndex <= viewportEnd;
        const lastRealDataInViewport = lastIndex >= viewportStart && lastIndex <= viewportEnd;
        const firstRealDataLeftViewport = firstIndex < viewportStart;
        const firstRealDataRightViewport = firstIndex > viewportEnd;
        const lastRealDataLeftViewport = lastIndex < viewportStart;
        const lastRealDataRightViewport = lastIndex > viewportEnd;

        const viewportWidth = viewportEnd - viewportStart;
        const nearThreshold = viewportWidth * 0.1;

        const firstRealDataNearRightViewport = firstIndex >= (viewportEnd - nearThreshold) && firstIndex <= viewportEnd;
        const lastRealDataNearLeftViewport = lastIndex >= viewportStart && lastIndex <= (viewportStart + nearThreshold);

        // 第一根有效数据点离开左侧可视区
        if (!this.lastFirstRealDataLeftViewport && firstRealDataLeftViewport) {
            callbacks.onFirstRealDataExitLeftViewport?.();
        }

        // 第一根有效数据点离开右侧可视区
        if (!this.lastFirstRealDataRightViewport && firstRealDataRightViewport) {
            callbacks.onFirstRealDataExitRightViewport?.();
        }

        // 最后一根有效数据点离开左侧可视区
        if (!this.lastLastRealDataLeftViewport && lastRealDataLeftViewport) {
            callbacks.onLastRealDataExitLeftViewport?.();
        }

        // 最后一根有效数据点离开右侧可视区
        if (!this.lastLastRealDataRightViewport && lastRealDataRightViewport) {
            callbacks.onLastRealDataExitRightViewport?.();
        }

        // 第一根有效数据点从左侧进入可视区
        if (this.lastFirstRealDataLeftViewport && !firstRealDataLeftViewport && firstRealDataInViewport) {
            callbacks.onFirstRealDataEnterLeftViewport?.();
        }

        // 第一根有效数据点即将离开右侧可视区
        if (!this.lastFirstRealDataNearRightViewport && firstRealDataNearRightViewport) {
            callbacks.onFirstRealDataNearRightViewport?.();
        }

        // 最后一根有效数据点即将离开左侧可视区
        if (!this.lastLastRealDataNearLeftViewport && lastRealDataNearLeftViewport) {
            callbacks.onLastRealDataNearLeftViewport?.();
        }

        // 第一根有效数据点离开"即将离开右侧"状态
        if (this.lastFirstRealDataNearRightViewport && !firstRealDataNearRightViewport) {
            callbacks.onFirstRealDataLeaveNearRightViewport?.();
        }

        // 最后一根有效数据点离开"即将离开左侧"状态
        if (this.lastLastRealDataNearLeftViewport && !lastRealDataNearLeftViewport) {
            callbacks.onLastRealDataLeaveNearLeftViewport?.();
        }

        // 第一根有效数据点离开视口 - 已滚动到虚拟数据区域（开始）
        if (this.lastFirstRealDataInViewport && !firstRealDataInViewport) {
            callbacks.onFirstRealDataExitViewport?.();
        }

        // 最后一根有效数据点离开视口 - 已滚动到虚拟数据区域（结束）
        if (this.lastLastRealDataInViewport && !lastRealDataInViewport) {
            callbacks.onLastRealDataExitViewport?.();
        }

        this.lastFirstRealDataInViewport = firstRealDataInViewport;
        this.lastLastRealDataInViewport = lastRealDataInViewport;
        this.lastFirstRealDataLeftViewport = firstRealDataLeftViewport;
        this.lastFirstRealDataRightViewport = firstRealDataRightViewport;
        this.lastLastRealDataLeftViewport = lastRealDataLeftViewport;
        this.lastLastRealDataRightViewport = lastRealDataRightViewport;
        this.lastFirstRealDataNearRightViewport = firstRealDataNearRightViewport;
        this.lastLastRealDataNearLeftViewport = lastRealDataNearLeftViewport;
    }

    public static reset(): void {
        this.lastFirstRealDataInViewport = true;
        this.lastLastRealDataInViewport = true;
        this.lastFirstRealDataLeftViewport = false;
        this.lastFirstRealDataRightViewport = false;
        this.lastLastRealDataLeftViewport = false;
        this.lastLastRealDataRightViewport = false;
        this.lastFirstRealDataNearRightViewport = false;
        this.lastLastRealDataNearLeftViewport = false;
    }

    public static getCurrentState(): {
        lastFirstRealDataInViewport: boolean;
        lastLastRealDataInViewport: boolean;
        lastFirstRealDataLeftViewport: boolean;
        lastFirstRealDataRightViewport: boolean;
        lastLastRealDataLeftViewport: boolean;
        lastLastRealDataRightViewport: boolean;
        lastFirstRealDataNearRightViewport: boolean;
        lastLastRealDataNearLeftViewport: boolean;
    } {
        return {
            lastFirstRealDataInViewport: this.lastFirstRealDataInViewport,
            lastLastRealDataInViewport: this.lastLastRealDataInViewport,
            lastFirstRealDataLeftViewport: this.lastFirstRealDataLeftViewport,
            lastFirstRealDataRightViewport: this.lastFirstRealDataRightViewport,
            lastLastRealDataLeftViewport: this.lastLastRealDataLeftViewport,
            lastLastRealDataRightViewport: this.lastLastRealDataRightViewport,
            lastFirstRealDataNearRightViewport: this.lastFirstRealDataNearRightViewport,
            lastLastRealDataNearLeftViewport: this.lastLastRealDataNearLeftViewport
        };
    }
}