import { Time } from "lightweight-charts";
import { ChartSeries } from "../ChartLayer/ChartTypeManager";
import { MultiBottomTextMark } from "../Mark/Static/MultiBottomTextMark";
import { MultiTopTextMark } from "../Mark/Static/MultiTopTextMark";

export enum StaticMarkDirection {
    Top = "Top", Bottom = "Bottom"
}

export enum StaticMarkType {
    Text = "Text", Arrow = "Arrow"
}

export interface IStaticMarkData {
    time: number,
    type: string,
    data: {
        direction: string,
        text: string,
        fontSize?: number,
        textColor?: string,
        backgroundColor?: string,
        isCircular?: boolean,
        padding?: number,
    }[]
}

export class StaticMarkManager {
    constructor() { }

    public addMark(
        data: IStaticMarkData[],
        chartSeries: ChartSeries) {
        const timeGroups = new Map<number, IStaticMarkData[]>();
        data.forEach(markData => {
            if (!timeGroups.has(markData.time)) {
                timeGroups.set(markData.time, []);
            }
            timeGroups.get(markData.time)!.push(markData);
        });
        timeGroups.forEach((markDatas, time) => {
            const typeGroups = new Map<StaticMarkType, IStaticMarkData[]>();
            markDatas.forEach(markData => {
                const type = Object.values(StaticMarkType).find(t => t === markData.type);
                if (!type) {
                    console.warn(`Invalid type: ${markData.type}`);
                    return;
                }
                if (!typeGroups.has(type)) {
                    typeGroups.set(type, []);
                }
                typeGroups.get(type)!.push(markData);
            });
            // Create a tag for each type
            typeGroups.forEach((typeDatas, type) => {
                // Merge all data of the same type and at the same point in time.
                const allData = typeDatas.flatMap(markData => markData.data);
                const topItems = allData.filter(item =>
                    Object.values(StaticMarkDirection).find(d => d === item.direction) === StaticMarkDirection.Top
                );
                const bottomItems = allData.filter(item =>
                    Object.values(StaticMarkDirection).find(d => d === item.direction) === StaticMarkDirection.Bottom
                );
                if (topItems.length > 0) {
                    this.addTopMark([{
                        time: time,
                        type: type,
                        data: topItems
                    }], type, chartSeries);
                }
                if (bottomItems.length > 0) {
                    this.addBottomMark([{
                        time: time,
                        type: type,
                        data: bottomItems
                    }], type, chartSeries);
                }
            });
        });
    }

    private addTopMark(data: IStaticMarkData[], type: StaticMarkType, chartSeries: ChartSeries) {
        switch (type) {
            case StaticMarkType.Text:
                data.forEach(markData => {
                    const textItems = markData.data.map(item => {
                        const textItem: any = {
                            text: item.text
                        };
                        if (item.textColor !== undefined) textItem.textColor = item.textColor;
                        if (item.backgroundColor !== undefined) textItem.backgroundColor = item.backgroundColor;
                        if (item.isCircular !== undefined) textItem.isCircular = item.isCircular;
                        if (item.fontSize !== undefined) textItem.fontSize = item.fontSize;
                        if (item.padding !== undefined) textItem.padding = item.padding;
                        return textItem;
                    });
                    const mark = new MultiTopTextMark(markData.time, textItems);
                    chartSeries.series.attachPrimitive(mark);
                });
                break;
            case StaticMarkType.Arrow:
                break;
            default:
                return;
        }
    }

    private addBottomMark(data: IStaticMarkData[], type: StaticMarkType, chartSeries: ChartSeries) {
        switch (type) {
            case StaticMarkType.Text:
                data.forEach(markData => {
                    const textItems = markData.data.map(item => {
                        const textItem: any = {
                            text: item.text
                        };
                        if (item.textColor !== undefined) textItem.textColor = item.textColor;
                        if (item.backgroundColor !== undefined) textItem.backgroundColor = item.backgroundColor;
                        if (item.isCircular !== undefined) textItem.isCircular = item.isCircular;
                        if (item.fontSize !== undefined) textItem.fontSize = item.fontSize;
                        if (item.padding !== undefined) textItem.padding = item.padding;
                        return textItem;
                    });
                    const mark = new MultiBottomTextMark(markData.time, textItems);
                    chartSeries.series.attachPrimitive(mark);
                });
                break;
            case StaticMarkType.Arrow:
                break;
            default:
                return;
        }
    }

    public removeAllMark() { }
}