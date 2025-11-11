export interface IGraphStyle {
    /**
     * 修改标记颜色
     * @param color 颜色值，如 '#2962FF'
     */
    updateColor(color: string): void;

    /**
     * 修改线条粗细
     * @param lineWidth 线条宽度
     */
    updateLineWidth(lineWidth: number): void;

    /**
     * 修改线条样式
     * @param lineStyle 线条样式：solid-实线, dashed-虚线, dotted-点线
     */
    updateLineStyle(lineStyle: 'solid' | 'dashed' | 'dotted'): void;

    /**
     * 批量修改样式
     * @param styles 样式对象
     */
    updateStyles(styles: {
        color?: string;
        lineWidth?: number;
        lineStyle?: 'solid' | 'dashed' | 'dotted';
        [key: string]: any;
    }): void;

    /**
     * 获取当前样式
     */
    getCurrentStyles(): Record<string, any>;
}