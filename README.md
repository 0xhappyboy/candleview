<h1 align="center">
   📊 CandleView
</h1>
<h4 align="center">
K-line (candle chart) front-end component in the financial field.
</h4>
<p align="center">
  <a href="https://https://github.com/0xhappyboy/candleview/LICENSE"><img src="https://img.shields.io/badge/License-GPL3.0-d1d1f6.svg?style=flat&labelColor=1C2C2E&color=BEC5C9&logo=googledocs&label=license&logoColor=BEC5C9" alt="License"></a>
</p>
<p align="center">
<a href="./README_zh-CN.md">简体中文</a> | <a href="./README.md">English</a>
</p>

## Example

```typescript
import React from "react";
import { CandleView } from "./CandleView";

class TestComponent extends React.Component {
  state = {
    chartData: [
      { time: "2025-11-01", value: 100 },
      { time: "2025-11-02", value: 120 },
      { time: "2025-11-03", value: 90 },
    ],
  };

  addDataPoint = () => {
    const newDataPoint = {
      time: `2025-11-0${this.state.chartData.length + 1}`,
      value: Math.random() * 100 + 50,
    };
    this.setState((prevState: any) => ({
      chartData: [...prevState.chartData, newDataPoint],
    }));
  };

  updateAllData = () => {
    const newData = [
      { time: "2025-11-01", value: 200 },
      { time: "2025-11-02", value: 180 },
      { time: "2025-11-03", value: 160 },
    ];
    this.setState({ chartData: newData });
  };

  render() {
    return (
      <div>
        <button onClick={this.addDataPoint}>Add Data</button>
        <button onClick={this.updateAllData}>Update Data</button>
        <CandleView data={this.state.chartData} />
      </div>
    );
  }
}

export default TestComponent;
```
