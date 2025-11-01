
import { DrawingConfig } from "../DrawingConfigs";


export const emojiConfig: DrawingConfig = {
    type: 'emoji',
    name: '表情',
    minPoints: 1,
    maxPoints: 1,
    draw: (ctx, drawing) => {
        
        
    },
    getBoundingBox: (drawing) => {
        if (drawing.points.length < 1 || !drawing.properties?.emoji) {
            return { x: 0, y: 0, width: 0, height: 0 };
        }

        const point = drawing.points[0];
        const fontSize = drawing.properties.fontSize || 24; 

        return {
            x: point.x - 5,
            y: point.y - 5,
            width: fontSize + 10,
            height: fontSize + 10
        };
    },
    isPointInShape: (drawing, point) => {
        if (drawing.points.length < 1 || !drawing.properties?.emoji) return false;

        const bbox = emojiConfig.getBoundingBox(drawing);
        return point.x >= bbox.x &&
            point.x <= bbox.x + bbox.width &&
            point.y >= bbox.y &&
            point.y <= bbox.y + bbox.height;
    }
};


export interface EmojiCategory {
    id: string;
    name: string;
}

export interface EmojiItem {
    character: string;
    name: string;
    category: string;
}


export const EMOJI_CATEGORIES: EmojiCategory[] = [
    { id: 'smileys', name: '表情' },
    { id: 'people', name: '人物' },
    { id: 'animals', name: '动物' },
    { id: 'food', name: '食物' },
    { id: 'activities', name: '活动' },
    { id: 'travel', name: '旅行' },
    { id: 'objects', name: '物品' },
    { id: 'symbols', name: '符号' },
    { id: 'flags', name: '旗帜' },
];


export const EMOJI_LIST: EmojiItem[] = [
    
    { character: '😀', name: '笑脸', category: 'smileys' },
    { character: '😃', name: '大笑', category: 'smileys' },
    { character: '😄', name: '微笑', category: 'smileys' },
    { character: '😁', name: '笑嘻嘻', category: 'smileys' },
    { character: '😆', name: '哈哈笑', category: 'smileys' },
    { character: '😅', name: '流汗笑', category: 'smileys' },
    { character: '😂', name: '笑哭', category: 'smileys' },
    { character: '🤣', name: '打滚笑', category: 'smileys' },
    { character: '😊', name: '微笑脸', category: 'smileys' },
    { character: '😇', name: '天使', category: 'smileys' },
    { character: '🙂', name: '微微笑', category: 'smileys' },
    { character: '🙃', name: '倒脸', category: 'smileys' },
    { character: '😉', name: '眨眼', category: 'smileys' },
    { character: '😍', name: '爱心眼', category: 'smileys' },
    { character: '🥰', name: '微笑爱心', category: 'smileys' },
    { character: '😘', name: '飞吻', category: 'smileys' },
    { character: '😋', name: '美味', category: 'smileys' },
    { character: '😎', name: '墨镜', category: 'smileys' },
    { character: '🤩', name: '星星眼', category: 'smileys' },
    { character: '🥳', name: '派对', category: 'smileys' },
    { character: '😏', name: '得意', category: 'smileys' },
    { character: '😢', name: '哭泣', category: 'smileys' },
    { character: '😭', name: '大哭', category: 'smileys' },
    { character: '😡', name: '愤怒', category: 'smileys' },
    { character: '🤯', name: '爆炸头', category: 'smileys' },

    
    { character: '👶', name: '婴儿', category: 'people' },
    { character: '👧', name: '女孩', category: 'people' },
    { character: '👦', name: '男孩', category: 'people' },
    { character: '👩', name: '女人', category: 'people' },
    { character: '👨', name: '男人', category: 'people' },
    { character: '👵', name: '老奶奶', category: 'people' },
    { character: '👴', name: '老爷爷', category: 'people' },
    { character: '👮‍♀️', name: '女警察', category: 'people' },
    { character: '👮‍♂️', name: '男警察', category: 'people' },
    { character: '👷‍♀️', name: '女建筑工人', category: 'people' },
    { character: '👷‍♂️', name: '男建筑工人', category: 'people' },
    { character: '👩‍⚕️', name: '女医生', category: 'people' },
    { character: '👨‍⚕️', name: '男医生', category: 'people' },
    { character: '👩‍🍳', name: '女厨师', category: 'people' },
    { character: '👨‍🍳', name: '男厨师', category: 'people' },
    { character: '👩‍🎓', name: '女学生', category: 'people' },
    { character: '👨‍🎓', name: '男学生', category: 'people' },
    { character: '👸', name: '公主', category: 'people' },
    { character: '🤴', name: '王子', category: 'people' },
    { character: '🦸‍♀️', name: '女超级英雄', category: 'people' },

    
    { character: '🐵', name: '猴脸', category: 'animals' },
    { character: '🐒', name: '猴子', category: 'animals' },
    { character: '🐶', name: '狗脸', category: 'animals' },
    { character: '🐕', name: '狗', category: 'animals' },
    { character: '🐩', name: '贵宾犬', category: 'animals' },
    { character: '🐺', name: '狼', category: 'animals' },
    { character: '🦊', name: '狐狸', category: 'animals' },
    { character: '🐱', name: '猫脸', category: 'animals' },
    { character: '🐈', name: '猫', category: 'animals' },
    { character: '🦁', name: '狮子', category: 'animals' },
    { character: '🐯', name: '老虎脸', category: 'animals' },
    { character: '🐴', name: '马脸', category: 'animals' },
    { character: '🦄', name: '独角兽', category: 'animals' },
    { character: '🦓', name: '斑马', category: 'animals' },
    { character: '🐮', name: '牛脸', category: 'animals' },
    { character: '🐷', name: '猪脸', category: 'animals' },
    { character: '🐭', name: '老鼠脸', category: 'animals' },
    { character: '🐹', name: '仓鼠', category: 'animals' },
    { character: '🐰', name: '兔子脸', category: 'animals' },
    { character: '🐻', name: '熊', category: 'animals' },
    { character: '🐨', name: '考拉', category: 'animals' },
    { character: '🐼', name: '熊猫', category: 'animals' },
    { character: '🐔', name: '鸡', category: 'animals' },
    { character: '🐦', name: '鸟', category: 'animals' },
    { character: '🐧', name: '企鹅', category: 'animals' },

    
    { character: '🍎', name: '红苹果', category: 'food' },
    { character: '🍐', name: '梨', category: 'food' },
    { character: '🍊', name: '橙子', category: 'food' },
    { character: '🍋', name: '柠檬', category: 'food' },
    { character: '🍌', name: '香蕉', category: 'food' },
    { character: '🍉', name: '西瓜', category: 'food' },
    { character: '🍇', name: '葡萄', category: 'food' },
    { character: '🍓', name: '草莓', category: 'food' },
    { character: '🍑', name: '桃子', category: 'food' },
    { character: '🍍', name: '菠萝', category: 'food' },
    { character: '🥭', name: '芒果', category: 'food' },
    { character: '🥥', name: '椰子', category: 'food' },
    { character: '🥑', name: '牛油果', category: 'food' },
    { character: '🍅', name: '番茄', category: 'food' },
    { character: '🍆', name: '茄子', category: 'food' },
    { character: '🥦', name: '西兰花', category: 'food' },
    { character: '🥕', name: '胡萝卜', category: 'food' },
    { character: '🌽', name: '玉米', category: 'food' },
    { character: '🍞', name: '面包', category: 'food' },
    { character: '🥐', name: '牛角包', category: 'food' },
    { character: '🧀', name: '奶酪', category: 'food' },
    { character: '🍗', name: '鸡腿', category: 'food' },
    { character: '🍔', name: '汉堡', category: 'food' },
    { character: '🍕', name: '披萨', category: 'food' },
    { character: '🌭', name: '热狗', category: 'food' },

    
    { character: '⚽', name: '足球', category: 'activities' },
    { character: '🏀', name: '篮球', category: 'activities' },
    { character: '🏈', name: '美式足球', category: 'activities' },
    { character: '⚾', name: '棒球', category: 'activities' },
    { character: '🎾', name: '网球', category: 'activities' },
    { character: '🏐', name: '排球', category: 'activities' },
    { character: '🎱', name: '台球', category: 'activities' },
    { character: '🏓', name: '乒乓球', category: 'activities' },
    { character: '🏸', name: '羽毛球', category: 'activities' },
    { character: '🥊', name: '拳击手套', category: 'activities' },
    { character: '🎯', name: '射箭靶', category: 'activities' },
    { character: '🎳', name: '保龄球', category: 'activities' },
    { character: '🏹', name: '弓和箭', category: 'activities' },
    { character: '🎣', name: '钓鱼竿', category: 'activities' },
    { character: '⛸️', name: '溜冰鞋', category: 'activities' },
    { character: '🎿', name: '滑雪', category: 'activities' },
    { character: '🏒', name: '冰球', category: 'activities' },
    { character: '🏏', name: '板球', category: 'activities' },
    { character: '🏆', name: '奖杯', category: 'activities' },
    { character: '🥇', name: '金牌', category: 'activities' },

    
    { character: '🚗', name: '汽车', category: 'travel' },
    { character: '🚕', name: '出租车', category: 'travel' },
    { character: '🚙', name: 'SUV', category: 'travel' },
    { character: '🚌', name: '巴士', category: 'travel' },
    { character: '🚎', name: '电车', category: 'travel' },
    { character: '🏎️', name: '赛车', category: 'travel' },
    { character: '🚓', name: '警车', category: 'travel' },
    { character: '🚑', name: '救护车', category: 'travel' },
    { character: '🚒', name: '消防车', category: 'travel' },
    { character: '🚐', name: '小巴', category: 'travel' },
    { character: '🚚', name: '卡车', category: 'travel' },
    { character: '🚛', name: '铰接式卡车', category: 'travel' },
    { character: '🚲', name: '自行车', category: 'travel' },
    { character: '🛴', name: '滑板车', category: 'travel' },
    { character: '🚁', name: '直升机', category: 'travel' },
    { character: '✈️', name: '飞机', category: 'travel' },
    { character: '🛩️', name: '小飞机', category: 'travel' },
    { character: '🛫', name: '飞机起飞', category: 'travel' },
    { character: '🛬', name: '飞机降落', category: 'travel' },
    { character: '🚀', name: '火箭', category: 'travel' },

    
    { character: '⌚', name: '手表', category: 'objects' },
    { character: '📱', name: '手机', category: 'objects' },
    { character: '📲', name: '手机箭头', category: 'objects' },
    { character: '💻', name: '笔记本电脑', category: 'objects' },
    { character: '⌨️', name: '键盘', category: 'objects' },
    { character: '🖥️', name: '台式电脑', category: 'objects' },
    { character: '🖨️', name: '打印机', category: 'objects' },
    { character: '🖱️', name: '电脑鼠标', category: 'objects' },
    { character: '🕹️', name: '游戏摇杆', category: 'objects' },
    { character: '📷', name: '相机', category: 'objects' },
    { character: '📹', name: '摄像机', category: 'objects' },
    { character: '🎥', name: '电影摄像机', category: 'objects' },
    { character: '📺', name: '电视', category: 'objects' },
    { character: '📻', name: '收音机', category: 'objects' },
    { character: '🎙️', name: '录音麦克风', category: 'objects' },
    { character: '🎚️', name: '音量滑块', category: 'objects' },
    { character: '🎛️', name: '控制旋钮', category: 'objects' },
    { character: '📞', name: '电话听筒', category: 'objects' },
    { character: '📟', name: '寻呼机', category: 'objects' },
    { character: '📠', name: '传真机', category: 'objects' },

    
    { character: '❤️', name: '红心', category: 'symbols' },
    { character: '🧡', name: '橙心', category: 'symbols' },
    { character: '💛', name: '黄心', category: 'symbols' },
    { character: '💚', name: '绿心', category: 'symbols' },
    { character: '💙', name: '蓝心', category: 'symbols' },
    { character: '💜', name: '紫心', category: 'symbols' },
    { character: '🖤', name: '黑心', category: 'symbols' },
    { character: '💔', name: '破碎的心', category: 'symbols' },
    { character: '❣️', name: '心叹号', category: 'symbols' },
    { character: '💕', name: '两颗心', category: 'symbols' },
    { character: '💞', name: '旋转的心', category: 'symbols' },
    { character: '💓', name: '跳动的心', category: 'symbols' },
    { character: '💗', name: '长大的心', category: 'symbols' },
    { character: '💖', name: '闪亮的心', category: 'symbols' },
    { character: '💘', name: '箭穿心', category: 'symbols' },
    { character: '💝', name: '丝带心', category: 'symbols' },
    { character: '💟', name: '心形装饰', category: 'symbols' },
    { character: '☮️', name: '和平符号', category: 'symbols' },
    { character: '✝️', name: '拉丁十字架', category: 'symbols' },
    { character: '☪️', name: '星月', category: 'symbols' },

    
    { character: '🏁', name: '方格旗', category: 'flags' },
    { character: '🚩', name: '三角旗', category: 'flags' },
    { character: '🎌', name: '交叉旗', category: 'flags' },
    { character: '🏴', name: '黑旗', category: 'flags' },
    { character: '🏳️', name: '白旗', category: 'flags' },
    { character: '🏳️‍🌈', name: '彩虹旗', category: 'flags' },
    { character: '🏴‍☠️', name: '海盗旗', category: 'flags' },
    { character: '🇺🇳', name: '联合国', category: 'flags' },
    { character: '🇺🇸', name: '美国', category: 'flags' },
    { character: '🇬🇧', name: '英国', category: 'flags' },
    { character: '🇨🇳', name: '中国', category: 'flags' },
    { character: '🇯🇵', name: '日本', category: 'flags' },
    { character: '🇰🇷', name: '韩国', category: 'flags' },
    { character: '🇩🇪', name: '德国', category: 'flags' },
    { character: '🇫🇷', name: '法国', category: 'flags' },
    { character: '🇮🇹', name: '意大利', category: 'flags' },
    { character: '🇷🇺', name: '俄罗斯', category: 'flags' },
    { character: '🇨🇦', name: '加拿大', category: 'flags' },
    { character: '🇦🇺', name: '澳大利亚', category: 'flags' },
    { character: '🇧🇷', name: '巴西', category: 'flags' },
];


export interface EmojiProperties {
    emoji: string;
    fontSize: number;
    id: string;
}


export const createDefaultEmojiProperties = (): EmojiProperties => ({
    emoji: '😀',
    fontSize: 24,
    id: `emoji_${Date.now()}`
});