import { CandleView } from '../CandleViewCore';
import { Executor } from './sandbox';
import { ExecutionResult } from './sandbox/types';

export interface CVSEngineConfig {
    autoExecuteOnNewCandle?: boolean;
    enableLogging?: boolean;
}

export class CVSEngine {
    private candleView: CandleView;
    private executor: Executor;
    private config: CVSEngineConfig;
    private script: string = '';
    private isRunning: boolean = false;
    private onNewCandleHandler: (() => void) | null = null;

    constructor(candleView: CandleView, config?: CVSEngineConfig) {
        this.candleView = candleView;
        this.config = {
            autoExecuteOnNewCandle: true,
            enableLogging: true,
            ...config,
        };
        this.executor = new Executor(candleView);
    }

    public loadScript(script: string): void {
        this.script = script;
        if (this.config.enableLogging) {
            console.log('[CVSEngine] Script loaded, length:', script.length);
        }
    }

    public execute(): ExecutionResult {
        if (!this.script) {
            return { success: false, error: 'No script loaded' };
        }
        if (this.config.enableLogging) {
            console.log('[CVSEngine] Executing script...');
        }
        const result = this.executor.execute(this.script);
        if (this.config.enableLogging) {
            console.log('[CVSEngine] Execution result:', result.success ? 'success' : 'failed', result.duration?.toFixed(2), 'ms');
        }
        return result;
    }

    public start(): void {
        if (this.isRunning) return;
        this.isRunning = true;
        if (this.config.autoExecuteOnNewCandle) {
            this.onNewCandleHandler = () => this.onNewCandle();
            this.candleView.dsl.on('newCandle', this.onNewCandleHandler);
        }
        this.execute();
        if (this.config.enableLogging) {
            console.log('[CVSEngine] Started');
        }
    }

    public stop(): void {
        if (!this.isRunning) return;
        this.isRunning = false;
        if (this.onNewCandleHandler) {
            this.candleView.dsl.off('newCandle', this.onNewCandleHandler);
            this.onNewCandleHandler = null;
        }
        if (this.config.enableLogging) {
            console.log('[CVSEngine] Stopped');
        }
    }

    private onNewCandle(): void {
        this.execute();
    }

    public registerFunction(name: string, fn: Function): void {
        console.log('[CVSEngine] Register custom function:', name);
    }
}

export * from './sandbox/types';