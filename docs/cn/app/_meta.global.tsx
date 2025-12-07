import { MetaRecord } from "nextra";

const DOCS_ITEMS: MetaRecord = {
  index: '快速启动',
  theme: "主题",
  i18n: "国际化",
  charttype: '图表类型',
  ai: 'AI',
  command: '命令系统',
  drawing: '绘图',
  graphics: '图形',
  mainindicators: '主图技术指标',
  subindicators: '副图技术指标',
  timeframe: '时间框架',
  timezone: '时区',
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
    title: '文档',
    items: DOCS_ITEMS
  },
}
