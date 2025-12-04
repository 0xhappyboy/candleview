import { MetaRecord } from "nextra";

const DOCS_ITEMS: MetaRecord = {
    index: 'Get Started',
    theme: "Theme",
    i18n: "I18n",
    charttype: 'Chart Type',
    drawing: 'Drawing',
    graphics: 'Graphics',
    mainindicators: 'Main Chart Technical Indicators',
    subindicators: 'Sub Chart Technical Indicators',
    timeframe: 'Time Frame',
    timezone: 'Time Zone',
}

export default {
    index: {
        type: 'page',
        theme: {
            layout: 'full',
            toc: false,
            timestamp: false,
        }
    },
    docs: {
        type: 'page',
        title: 'Documentation',
        items: DOCS_ITEMS
    },
}