import { ICandleViewDataPoint } from './types';

export interface DataLoaderConfig {
    data?: ICandleViewDataPoint[];
}

export class DataLoader {

    static loadData(config: DataLoaderConfig): ICandleViewDataPoint[] {
        if (config.data && config.data.length > 0) {
            return this.validateAndFormatData(config.data);
        }
        return [];
    }

    private static loadFromLocalFile(filePath: string): ICandleViewDataPoint[] {
        try {
            const normalizedPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
            const xhr = new XMLHttpRequest();
            xhr.open('GET', normalizedPath, false);
            xhr.send();
            if (xhr.status !== 200) {
                throw new Error(`Failed to fetch file: ${xhr.status}`);
            }
            const text = xhr.responseText;
            if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
                throw new Error('Received HTML instead of JSON. Check file path.');
            }
            const jsonData = JSON.parse(text);
            return this.parseOHLCData(jsonData);
        } catch (error) {
            try {
                const cleanPath = filePath.replace(/^\.?\//, '');
                const jsonData = require(`../${cleanPath}`);
                return this.parseOHLCData(jsonData);
            } catch (requireError) {
                return [];
            }
        }
    }

    private static loadFromUrl(url: string): ICandleViewDataPoint[] {
        try {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', url, false);
            xhr.send();
            if (xhr.status !== 200) {
                throw new Error(`HTTP error! status: ${xhr.status}`);
            }
            const contentType = xhr.getResponseHeader('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                // not json type
            }
            const jsonData = JSON.parse(xhr.responseText);
            return this.parseOHLCData(jsonData);
        } catch (error) {
            return [];
        }
    }

    private static parseOHLCData(jsonData: any): ICandleViewDataPoint[] {
        if (Array.isArray(jsonData)) {
            return jsonData.map((item: any) => ({
                time: item.time,
                open: Number(item.open),
                high: Number(item.high),
                low: Number(item.low),
                close: Number(item.close),
                volume: Number(item.volume || 0)
            })).filter((item: ICandleViewDataPoint) =>
                !isNaN(item.time) &&
                !isNaN(item.open) &&
                !isNaN(item.high) &&
                !isNaN(item.low) &&
                !isNaN(item.close)
            );
        } else if (jsonData.data && Array.isArray(jsonData.data)) {
            return this.parseOHLCData(jsonData.data);
        } else if (jsonData.ohlc && Array.isArray(jsonData.ohlc)) {
            return this.parseOHLCData(jsonData.ohlc);
        } else if (jsonData.series && Array.isArray(jsonData.series)) {
            return this.parseOHLCData(jsonData.series);
        } else if (jsonData.result && Array.isArray(jsonData.result)) {
            return this.parseOHLCData(jsonData.result);
        } else if (jsonData.values && Array.isArray(jsonData.values)) {
            return this.parseOHLCData(jsonData.values);
        }
        return [];
    }

    private static validateAndFormatData(data: ICandleViewDataPoint[]): ICandleViewDataPoint[] {
        return data;
    }

    static validateConfig(config: DataLoaderConfig): boolean {
        const sources = [
            config.data && config.data.length > 0
        ].filter(Boolean).length;
        if (sources === 0) {
            return false;
        }
        if (sources > 1) {
        }
        return true;
    }

    static getActiveDataSource(config: DataLoaderConfig): string {
        if (config.data && config.data.length > 0) return 'data';
        return 'none';
    }
}