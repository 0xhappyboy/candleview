export interface IMarkStyle {
    /**
     * 批量修改样式
     * @param styles 样式对象
     */
    updateStyles(styles: {
        [key: string]: any;
    }): void;

    /**
     * 获取当前样式
     */
    getCurrentStyles(): Record<string, any>;
}