import { CandleView, CustomLineConfig, CustomSubLineConfig } from '@candleview/core';
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

    // Store user-registered custom functions
    private customFunctions: Map<string, Function> = new Map();

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
        }
    }

    public execute(): ExecutionResult {
        if (!this.script) {
            return { success: false, error: 'No script loaded' };
        }
        if (this.config.enableLogging) {
        }

        // Merge registered custom functions into the sandbox
        const result = this.executor.execute(this.script, this.customFunctions);

        if (this.config.enableLogging) {
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
        }
    }

    private onNewCandle(): void {
        this.execute();
    }

    /**
     * Register a custom function that can be called from scripts
     * @param name Function name
     * @param fn Function implementation
     */
    public registerFunction(name: string, fn: Function): void {
        this.customFunctions.set(name, fn);
        if (this.config.enableLogging) {
        }
    }

    /**
     * Register a custom main chart indicator
     * @param id Indicator ID
     * @param config Indicator configuration
     */
    public registerCustomMainIndicator(
        id: string,
        config: Omit<CustomLineConfig, 'id'>
    ): void {
        this.candleView.dsl.plotMain({
            id: id,
            calculator: config.calculator,
            options: config.options
        });
        if (this.config.enableLogging) {
        }
    }

    /**
     * Register a custom sub chart indicator
     * @param id Indicator ID
     * @param config Indicator configuration
     */
    public registerCustomSubIndicator(
        id: string,
        config: Omit<CustomSubLineConfig, 'id'>
    ): void {
        this.candleView.dsl.plotSub({
            id: id,
            calculator: config.calculator,
            options: config.options
        });
        if (this.config.enableLogging) {
        }
    }

    /**
     * Remove a custom main chart indicator
     */
    public removeCustomMainIndicator(id: string): void {
        this.candleView.dsl.removeMain(id);
        if (this.config.enableLogging) {
        }
    }

    /**
     * Remove a custom sub chart indicator
     */
    public removeCustomSubIndicator(id: string): void {
        this.candleView.dsl.removeSub(id);
        if (this.config.enableLogging) {
        }
    }

    /**
     * Update a custom main chart indicator
     */
    public updateCustomMainIndicator(id: string): void {
        this.candleView.dsl.updateMain(id);
        if (this.config.enableLogging) {
        }
    }

    /**
     * Update a custom sub chart indicator
     */
    public updateCustomSubIndicator(id: string): void {
        this.candleView.dsl.updateSub(id);
        if (this.config.enableLogging) {
        }
    }

    /**
     * Register multiple custom main chart indicators
     */
    public registerCustomMainIndicators(indicators: CustomLineConfig[]): void {
        indicators.forEach(indicator => {
            this.candleView.dsl.plotMain(indicator);
        });
        if (this.config.enableLogging) {
        }
    }

    /**
     * Register multiple custom sub chart indicators
     */
    public registerCustomSubIndicators(indicators: CustomSubLineConfig[]): void {
        indicators.forEach(indicator => {
            this.candleView.dsl.plotSub(indicator);
        });
        if (this.config.enableLogging) {
        }
    }

    /**
     * Clear all custom indicators
     */
    public clearAllCustomIndicators(): void {
        this.candleView.dsl.clearAllMain();
        this.candleView.dsl.clearAllSub();
        if (this.config.enableLogging) {
        }
    }
}

export * from './sandbox/types';