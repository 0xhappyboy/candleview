import { SubChartIndicatorType } from "../types";
import { IChartPane } from "./IChartPanes";

export abstract class BaseChartPane implements IChartPane {
    constructor(
        public readonly id: string,
        public readonly size: number,
        public readonly vertPosition: 'left' | 'right',
        public readonly indicatorType: SubChartIndicatorType,
        protected paneInstance: any
    ) { }

    getChart(): any {
        return this.paneInstance;
    }

    updateData(chartData: any[]): void { }

    setStyles(styles: any): void { }

    setVisible(visible: boolean): void { }

    destroy(): void { }

    protected getPriceScaleOptions(): any {
        return {
            scaleMargins: {
                top: 0.1,
                bottom: 0.1,
            },
            borderVisible: true,
            entireTextOnly: false,
            autoScale: true
        };
    }

    protected getDefaultPriceScaleId(): string {
        return 'right';
    }
}