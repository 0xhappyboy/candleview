export interface IMarkStyle {
    updateStyles(styles: {
        [key: string]: any;
    }): void;

    getCurrentStyles(): Record<string, any>;
}