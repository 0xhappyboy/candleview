import { LeftPanel } from './LeftPanel';

export class ToolManager {
    constructor() { }

    public handleDrawingToolSelect = (leftPanel: LeftPanel, toolId: string) => {
        leftPanel.closeAllModals();
        leftPanel.setActiveTool(toolId);
        leftPanel.options.onToolSelect?.(toolId);
    };
}