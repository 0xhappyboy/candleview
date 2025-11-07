export interface IMarkManager<T = any> {
    /**
     * 获取当前拖拽的目标对象
     */
    getCurrentDragTarget(): T | null;

    /**
     * 获取当前拖拽的点类型
     */
    getCurrentDragPoint(): string | null;

    /**
     * 获取当前操作的标记对象
     */
    getCurrentOperatingMark(): T | null;

    /**
     * 判断是否正在操作图表
     */
    isOperatingOnChart(): boolean;

    /**
     * 获取所有标记对象
     */
    getAllMarks(): T[];

    /**
     * 取消当前操作模式
     */
    cancelOperationMode(): any;

}