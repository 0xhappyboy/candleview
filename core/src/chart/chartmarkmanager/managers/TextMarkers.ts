import { MarkManagerContext, MarkManagerModule } from '../types';
import { Chart } from '../../Chart';
import { BubbleBoxMarkManager } from '../../../MarkManager/Text/BubbleBoxMarkManager';
import { EmojiMarkManager } from '../../../MarkManager/Text/EmojiMarkManager';
import { FlagMarkManager } from '../../../MarkManager/Text/FlagMarkManager';
import { PinMarkManager } from '../../../MarkManager/Text/PinMarkManager';
import { PriceLabelMarkManager } from '../../../MarkManager/Text/PriceLabelMarkManager';
import { PriceNoteMarkManager } from '../../../MarkManager/Text/PriceNoteMarkManager';
import { SignPostMarkManager } from '../../../MarkManager/Text/SignPostMarkManager';
import { TextEditMarkManager } from '../../../MarkManager/Text/TextEditMarkManager';
import { DrawingType } from '../../../types';

export class TextMarkersManager implements MarkManagerModule {
    public priceLabelMarkManager: PriceLabelMarkManager | null = null;
    public flagMarkManager: FlagMarkManager | null = null;
    public priceNoteMarkManager: PriceNoteMarkManager | null = null;
    public signpostMarkManager: SignPostMarkManager | null = null;
    public emojiMarkManager: EmojiMarkManager | null = null;
    public pinMarkManager: PinMarkManager | null = null;
    public bubbleBoxMarkManager: BubbleBoxMarkManager | null = null;
    public textEditMarkManager: TextEditMarkManager | null = null;

    initialize(context: MarkManagerContext): void {
        const chart = context.chart;
        this.priceLabelMarkManager = new PriceLabelMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef.current,
            onCloseDrawing: chart.onCloseDrawing
        });
        this.flagMarkManager = new FlagMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef.current,
            onCloseDrawing: chart.onCloseDrawing
        });
        this.priceNoteMarkManager = new PriceNoteMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef.current,
            onCloseDrawing: chart.onCloseDrawing
        });
        this.signpostMarkManager = new SignPostMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef.current,
            onCloseDrawing: chart.onCloseDrawing
        });
        this.emojiMarkManager = new EmojiMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef.current,
            onCloseDrawing: chart.onCloseDrawing
        });
        this.pinMarkManager = new PinMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef.current,
            onCloseDrawing: chart.onCloseDrawing
        });
        this.bubbleBoxMarkManager = new BubbleBoxMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef.current,
            onCloseDrawing: chart.onCloseDrawing
        });
        this.textEditMarkManager = new TextEditMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef.current,
            onCloseDrawing: chart.onCloseDrawing
        });
    }

    updateProps(context: MarkManagerContext): void {
        const chart = context.chart;
        this.priceLabelMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
        this.flagMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
        this.priceNoteMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
        this.signpostMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
        this.emojiMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
        this.pinMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
        this.bubbleBoxMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
        this.textEditMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
    }

    destroy(): void {
        this.priceLabelMarkManager?.destroy();
        this.flagMarkManager?.destroy();
        this.priceNoteMarkManager?.destroy();
        this.signpostMarkManager?.destroy();
        this.emojiMarkManager?.destroy();
        this.pinMarkManager?.destroy();
        this.bubbleBoxMarkManager?.destroy();
        this.textEditMarkManager?.destroy();
    }

    clearState(): void {
        this.priceLabelMarkManager?.clearState();
        this.flagMarkManager?.clearState();
        this.priceNoteMarkManager?.clearState();
        this.signpostMarkManager?.clearState();
        this.emojiMarkManager?.clearState();
        this.pinMarkManager?.clearState();
        this.bubbleBoxMarkManager?.clearState();
        this.textEditMarkManager?.clearState();
    }

    isOperatingOnChart(): boolean {
        return !!(this.priceLabelMarkManager?.isOperatingOnChart?.() ||
            this.flagMarkManager?.isOperatingOnChart?.() ||
            this.priceNoteMarkManager?.isOperatingOnChart?.() ||
            this.signpostMarkManager?.isOperatingOnChart?.() ||
            this.emojiMarkManager?.isOperatingOnChart?.() ||
            this.pinMarkManager?.isOperatingOnChart?.() ||
            this.bubbleBoxMarkManager?.isOperatingOnChart?.() ||
            this.textEditMarkManager?.isOperatingOnChart?.());
    }

    getMarkAtPoint(point: { x: number; y: number }): any {
        const managers = [
            this.priceLabelMarkManager,
            this.flagMarkManager,
            this.priceNoteMarkManager,
            this.signpostMarkManager,
            this.emojiMarkManager,
            this.pinMarkManager,
            this.bubbleBoxMarkManager,
            this.textEditMarkManager
        ];
        for (const manager of managers) {
            if (manager?.getMarkAtPoint) {
                const result = manager.getMarkAtPoint(point);
                if (result) return result;
            }
        }
        return null;
    }

    handleMouseDown(point: { x: number; y: number }): any {
        let result: any = null;
        if (this.priceLabelMarkManager) {
            result = this.priceLabelMarkManager.handleMouseDown(point);
            if (result) return result;
        }
        if (this.flagMarkManager) {
            result = this.flagMarkManager.handleMouseDown(point);
            if (result) return result;
        }
        if (this.priceNoteMarkManager) {
            result = this.priceNoteMarkManager.handleMouseDown(point);
            if (result) return result;
        }
        if (this.signpostMarkManager) {
            result = this.signpostMarkManager.handleMouseDown(point);
            if (result) return result;
        }
        if (this.emojiMarkManager) {
            result = this.emojiMarkManager.handleMouseDown(point);
            if (result) return result;
        }
        if (this.pinMarkManager) {
            result = this.pinMarkManager.handleMouseDown(point);
            if (result) return result;
        }
        if (this.bubbleBoxMarkManager) {
            result = this.bubbleBoxMarkManager.handleMouseDown(point);
            if (result) return result;
        }
        if (this.textEditMarkManager) {
            result = this.textEditMarkManager.handleMouseDown(point);
            if (result) return result;
        }
        return null;
    }

    handleMouseMove(point: { x: number; y: number }): any {
        let result: any = null;
        if (this.priceLabelMarkManager) {
            result = this.priceLabelMarkManager.handleMouseMove(point);
            if (result) return result;
        }
        if (this.flagMarkManager) {
            result = this.flagMarkManager.handleMouseMove(point);
            if (result) return result;
        }
        if (this.priceNoteMarkManager) {
            result = this.priceNoteMarkManager.handleMouseMove(point);
            if (result) return result;
        }
        if (this.signpostMarkManager) {
            result = this.signpostMarkManager.handleMouseMove(point);
            if (result) return result;
        }
        if (this.emojiMarkManager) {
            result = this.emojiMarkManager.handleMouseMove(point);
            if (result) return result;
        }
        if (this.pinMarkManager) {
            result = this.pinMarkManager.handleMouseMove(point);
            if (result) return result;
        }
        if (this.bubbleBoxMarkManager) {
            result = this.bubbleBoxMarkManager.handleMouseMove(point);
            if (result) return result;
        }
        if (this.textEditMarkManager) {
            result = this.textEditMarkManager.handleMouseMove(point);
            if (result) return result;
        }
        return null;
    }

    handleMouseUp(point: { x: number; y: number }): any {
        let result: any = null;
        if (this.priceLabelMarkManager) {
            result = this.priceLabelMarkManager.handleMouseUp(point);
            if (result) return result;
        }
        if (this.flagMarkManager) {
            result = this.flagMarkManager.handleMouseUp(point);
            if (result) return result;
        }
        if (this.priceNoteMarkManager) {
            result = this.priceNoteMarkManager.handleMouseUp(point);
            if (result) return result;
        }
        if (this.signpostMarkManager) {
            result = this.signpostMarkManager.handleMouseUp(point);
            if (result) return result;
        }
        if (this.emojiMarkManager) {
            result = this.emojiMarkManager.handleMouseUp(point);
            if (result) return result;
        }
        if (this.pinMarkManager) {
            result = this.pinMarkManager.handleMouseUp(point);
            if (result) return result;
        }
        if (this.bubbleBoxMarkManager) {
            result = this.bubbleBoxMarkManager.handleMouseUp(point);
            if (result) return result;
        }
        if (this.textEditMarkManager) {
            result = this.textEditMarkManager.handleMouseUp(point);
            if (result) return result;
        }
        return null;
    }

    handleKeyDown(event: KeyboardEvent): any {
        let result: any = null;
        if (this.textEditMarkManager) {
            result = this.textEditMarkManager.handleKeyDown?.(event);
            if (result) return result;
        }
        return null;
    }

    setPriceLabelMode(chart: Chart): any {
        if (!this.priceLabelMarkManager) return null;
        const newState = this.priceLabelMarkManager.setPriceLabelMarkMode();
        chart.currentDrawingType = DrawingType.PriceLabel;
        return newState;
    }

    setFlagMarkMode(chart: Chart): any {
        if (!this.flagMarkManager) return null;
        const newState = this.flagMarkManager.setFlagMarkMode();
        chart.currentDrawingType = DrawingType.Flag;
        return newState;
    }

    setPriceNoteMarkMode(chart: Chart): any {
        if (!this.priceNoteMarkManager) return null;
        const newState = this.priceNoteMarkManager.setPriceNoteMarkMode();
        chart.currentDrawingType = DrawingType.PriceNote;
        return newState;
    }

    setSignpostMarkMode(chart: Chart): any {
        if (!this.signpostMarkManager) return null;
        const newState = this.signpostMarkManager.setSignPostMarkMode();
        chart.currentDrawingType = DrawingType.SignPost;
        return newState;
    }

    setEmojiMarkMode(chart: Chart, emoji: string): any {
        if (!this.emojiMarkManager) return null;
        const newState = this.emojiMarkManager.setEmojiMarkMode(emoji);
        chart.currentDrawingType = DrawingType.Emoji;
        return newState;
    }

    setPinMarkMode(chart: Chart): any {
        if (!this.pinMarkManager) return null;
        const newState = this.pinMarkManager.setPinMarkMode();
        chart.currentDrawingType = DrawingType.Pin;
        return newState;
    }

    setBubbleBoxMarkMode(chart: Chart): any {
        if (!this.bubbleBoxMarkManager) return null;
        const newState = this.bubbleBoxMarkManager.setBubbleBoxMarkMode();
        chart.currentDrawingType = DrawingType.BubbleBox;
        return newState;
    }

    setTextEditMarkMode(chart: Chart): any {
        if (!this.textEditMarkManager) return null;
        const newState = this.textEditMarkManager.setTextEditMarkMode();
        chart.currentDrawingType = DrawingType.TextEdit;
        return newState;
    }

    deleteMark(drawingType: DrawingType, iGraph: any): void {
        switch (drawingType) {
            case DrawingType.PriceLabel:
                this.priceLabelMarkManager?.removePriceLabelMark(iGraph);
                break;
            case DrawingType.Flag:
                this.flagMarkManager?.removeFlagMark(iGraph);
                break;
            case DrawingType.PriceNote:
                this.priceNoteMarkManager?.removePriceNoteMark(iGraph);
                break;
            case DrawingType.SignPost:
                this.signpostMarkManager?.removeSignPostMark(iGraph);
                break;
            case DrawingType.Emoji:
                this.emojiMarkManager?.removeEmojiMark(iGraph);
                break;
            case DrawingType.Pin:
                this.pinMarkManager?.removePinMark(iGraph);
                break;
            case DrawingType.BubbleBox:
                this.bubbleBoxMarkManager?.removeBubbleBoxMark(iGraph);
                break;
            case DrawingType.TextEdit:
                this.textEditMarkManager?.removeTextEditMark(iGraph);
                break;
        }
    }

    deleteAllMarks(): void {
        this.priceLabelMarkManager?.getPriceLabelMarks().forEach(mark => {
            this.priceLabelMarkManager?.removePriceLabelMark(mark);
        });
        this.flagMarkManager?.getFlagMarks().forEach(mark => {
            this.flagMarkManager?.removeFlagMark(mark);
        });
        this.priceNoteMarkManager?.getPriceNoteMarks().forEach(mark => {
            this.priceNoteMarkManager?.removePriceNoteMark(mark);
        });
        this.signpostMarkManager?.getSignPostMarks().forEach(mark => {
            this.signpostMarkManager?.removeSignPostMark(mark);
        });
        this.emojiMarkManager?.getEmojiMarks().forEach(mark => {
            this.emojiMarkManager?.removeEmojiMark(mark);
        });
        this.pinMarkManager?.getPinMarks().forEach(mark => {
            this.pinMarkManager?.removePinMark(mark);
        });
        this.bubbleBoxMarkManager?.getBubbleBoxMarks().forEach(mark => {
            this.bubbleBoxMarkManager?.removeBubbleBoxMark(mark);
        });
        this.textEditMarkManager?.getTextEditMarks().forEach(mark => {
            this.textEditMarkManager?.removeTextEditMark(mark);
        });
    }

    showAllMarks(): void {
        this.priceLabelMarkManager?.showAllMarks();
        this.flagMarkManager?.showAllMarks();
        this.priceNoteMarkManager?.showAllMarks();
        this.signpostMarkManager?.showAllMarks();
        this.emojiMarkManager?.showAllMarks();
        this.pinMarkManager?.showAllMarks();
        this.bubbleBoxMarkManager?.showAllMarks();
        this.textEditMarkManager?.showAllMarks();
    }

    hideAllMarks(): void {
        this.priceLabelMarkManager?.hideAllMarks();
        this.flagMarkManager?.hideAllMarks();
        this.priceNoteMarkManager?.hideAllMarks();
        this.signpostMarkManager?.hideAllMarks();
        this.emojiMarkManager?.hideAllMarks();
        this.pinMarkManager?.hideAllMarks();
        this.bubbleBoxMarkManager?.hideAllMarks();
        this.textEditMarkManager?.hideAllMarks();
    }
}