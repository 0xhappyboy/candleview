import { MarkType } from "../types";

export interface IGraph<T = any> {
    /**
     * Get the current graphic marker type
     */
    getMarkType(): MarkType;
}