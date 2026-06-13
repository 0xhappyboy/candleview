export interface ExecutionResult {
    success: boolean;
    result?: any;
    error?: string;
    duration?: number;
}

export interface SandboxContext {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    getClose: (index: number) => number;
    getOpen: (index: number) => number;
    getHigh: (index: number) => number;
    getLow: (index: number) => number;
    getVolume: (index: number) => number;
    getTime: (index: number) => number;
    [key: string]: any;
}