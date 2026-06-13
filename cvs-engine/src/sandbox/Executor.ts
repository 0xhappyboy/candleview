import { CandleView } from '../../CandleViewCore';
import { ExecutionResult } from './types';

export class Executor {
    private candleView: CandleView;

    constructor(candleView: CandleView) {
        this.candleView = candleView;
    }

    buildSandbox(customFunctions?: Map<string, Function>): Record<string, any> {
        const dsl = this.candleView.dsl;
        const sandbox: Record<string, any> = {
            getClose: dsl.getClose.bind(dsl),
            getOpen: dsl.getOpen.bind(dsl),
            getHigh: dsl.getHigh.bind(dsl),
            getLow: dsl.getLow.bind(dsl),
            getVolume: dsl.getVolume.bind(dsl),
            getTime: dsl.getTime.bind(dsl),
            getCloseAt: dsl.getCloseAt.bind(dsl),
            getOpenAt: dsl.getOpenAt.bind(dsl),
            getHighAt: dsl.getHighAt.bind(dsl),
            getLowAt: dsl.getLowAt.bind(dsl),
            getVolumeAt: dsl.getVolumeAt.bind(dsl),
            getBarCount: dsl.getBarCount.bind(dsl),
            SMA: dsl.SMA.bind(dsl),
            EMA: dsl.EMA.bind(dsl),
            WMA: dsl.WMA.bind(dsl),
            SMMA: dsl.SMMA.bind(dsl),
            RSI: dsl.RSI.bind(dsl),
            MACD: dsl.MACD.bind(dsl),
            BOLL: dsl.BOLL.bind(dsl),
            KDJ: dsl.KDJ.bind(dsl),
            ATR: dsl.ATR.bind(dsl),
            CCI: dsl.CCI.bind(dsl),
            ADX: dsl.ADX.bind(dsl),
            OBV: dsl.OBV.bind(dsl),
            SAR: dsl.SAR.bind(dsl),
            BBWIDTH: dsl.BBWIDTH.bind(dsl),
            addTextMark: dsl.addTextMark.bind(dsl),
            addArrowUp: dsl.addArrowUp.bind(dsl),
            addArrowDown: dsl.addArrowDown.bind(dsl),
            clearAllMarks: dsl.clearAllMarks.bind(dsl),
            openIndicator: dsl.openIndicator.bind(dsl),
            closeIndicator: dsl.closeIndicator.bind(dsl),
            closeAllIndicators: dsl.closeAllIndicators.bind(dsl),
            plotMain: dsl.plotMain.bind(dsl),
            plotSub: dsl.plotSub.bind(dsl),
            updateMain: dsl.updateMain.bind(dsl),
            updateSub: dsl.updateSub.bind(dsl),
            removeMain: dsl.removeMain.bind(dsl),
            removeSub: dsl.removeSub.bind(dsl),
            clearAllMain: dsl.clearAllMain.bind(dsl),
            clearAllSub: dsl.clearAllSub.bind(dsl),
        };
        if (customFunctions) {
            customFunctions.forEach((fn, name) => {
                sandbox[name] = fn;
            });
        }
        return sandbox;
    }

    execute(script: string, customFunctions?: Map<string, Function>): ExecutionResult {
        const startTime = performance.now();
        try {
            const sandbox = this.buildSandbox(customFunctions);
            const sandboxKeys = Object.keys(sandbox);
            const sandboxValues = Object.values(sandbox);
            const fn = new Function(...sandboxKeys, `
                "use strict";
                ${script}
            `);
            const result = fn(...sandboxValues);
            return {
                success: true,
                result,
                duration: performance.now() - startTime,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
                duration: performance.now() - startTime,
            };
        }
    }
}