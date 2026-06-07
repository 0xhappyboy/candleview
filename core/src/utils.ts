export function convertToHexColor(color: string): string {
    if (!color) return '#000000';

    // 如果已经是十六进制格式，直接返回
    if (color.startsWith('#')) {
        return color;
    }

    // 处理 rgb(r, g, b) 格式
    const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
        const r = parseInt(rgbMatch[1]);
        const g = parseInt(rgbMatch[2]);
        const b = parseInt(rgbMatch[3]);
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    // 处理 rgba(r, g, b, a) 格式
    const rgbaMatch = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/);
    if (rgbaMatch) {
        const r = parseInt(rgbaMatch[1]);
        const g = parseInt(rgbaMatch[2]);
        const b = parseInt(rgbaMatch[3]);
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    // 处理颜色名称（简单映射几个常见的）
    const colorNames: { [key: string]: string } = {
        'white': '#FFFFFF',
        'black': '#000000',
        'red': '#FF0000',
        'green': '#00FF00',
        'blue': '#0000FF',
        'yellow': '#FFFF00',
        'cyan': '#00FFFF',
        'magenta': '#FF00FF',
        'gray': '#808080',
        'grey': '#808080',
    };

    const lowerColor = color.toLowerCase();
    if (colorNames[lowerColor]) {
        return colorNames[lowerColor];
    }

    // 默认返回黑色
    return '#000000';
}