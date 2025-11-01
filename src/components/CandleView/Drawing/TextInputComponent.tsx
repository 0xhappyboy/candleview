// TextInputComponent.tsx
import React from 'react';
import { ThemeConfig } from '../CandleViewTheme';

interface TextInputComponentProps {
  isActive: boolean;
  position: { x: number; y: number } | null;
  value: string;
  theme: ThemeConfig;
  cursorVisible: boolean;
  onChange: (value: string) => void;
  onSave: (text: string) => void;
  onCancel: () => void;
}

interface TextInputComponentState {
  cursorPosition: number;
  inputWidth: number;
  inputHeight: number;
  isComposing: boolean;
  isResizing: boolean;
  isFocused: boolean;
}

class TextInputComponent extends React.Component<TextInputComponentProps, TextInputComponentState> {
  private textareaRef = React.createRef<HTMLTextAreaElement>();
  private containerRef = React.createRef<HTMLDivElement>();
  private keyDownHandler: ((e: KeyboardEvent) => void) | null = null;
  private mouseMoveHandler: ((e: MouseEvent) => void) | null = null;
  private mouseUpHandler: ((e: MouseEvent) => void) | null = null;
  private focusTimeout: NodeJS.Timeout | null = null;

  constructor(props: TextInputComponentProps) {
    super(props);
    this.state = {
      cursorPosition: 0,
      inputWidth: 200,
      inputHeight: 60,
      isComposing: false,
      isResizing: false,
      isFocused: false
    };
  }

  componentDidMount() {
    this.setupEventListeners();
    this.focusInput();
    this.calculateInputSize();
  }

  componentDidUpdate(prevProps: TextInputComponentProps) {
    // 当组件变为激活状态时，自动聚焦
    if (this.props.isActive && !prevProps.isActive) {
      this.focusInput();
    }

    if (this.props.value !== prevProps.value) {
      this.calculateInputSize();
      if (!this.state.isComposing) {
        this.updateCursorPosition();
      }
    }
  }

  componentWillUnmount() {
    this.cleanupEventListeners();
    if (this.focusTimeout) {
      clearTimeout(this.focusTimeout);
    }
  }

  private setupEventListeners() {
    this.keyDownHandler = this.handleKeyDown.bind(this);
    document.addEventListener('keydown', this.keyDownHandler);
  }

  private cleanupEventListeners() {
    if (this.keyDownHandler) {
      document.removeEventListener('keydown', this.keyDownHandler);
    }
    this.removeResizeListeners();
  }

  private removeResizeListeners() {
    if (this.mouseMoveHandler) {
      document.removeEventListener('mousemove', this.mouseMoveHandler);
    }
    if (this.mouseUpHandler) {
      document.removeEventListener('mouseup', this.mouseUpHandler);
    }
  }

  private focusInput = () => {
    if (this.props.isActive && this.textareaRef.current) {
      // 使用 setTimeout 确保 DOM 已经更新
      this.focusTimeout = setTimeout(() => {
        if (this.textareaRef.current) {
          this.textareaRef.current.focus();
          this.textareaRef.current.setSelectionRange(
            this.props.value.length,
            this.props.value.length
          );
          this.setState({ isFocused: true });
        }
      }, 10);
    }
  };

  private calculateInputSize() {
    const { value } = this.props;
    
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    let inputWidth = 200;
    let inputHeight = 60;

    if (tempCtx && value) {
      tempCtx.font = '14px Arial';
      
      // 计算文本宽度
      const lines = value.split('\n');
      let maxWidth = 0;
      lines.forEach(line => {
        const lineWidth = tempCtx.measureText(line).width;
        maxWidth = Math.max(maxWidth, lineWidth);
      });
      
      inputWidth = Math.max(200, Math.min(600, maxWidth + 30));
      inputHeight = Math.max(60, Math.min(300, lines.length * 18 + 20));
    }

    this.setState({ inputWidth, inputHeight });
  }

  private updateCursorPosition() {
    if (this.textareaRef.current) {
      this.setState({
        cursorPosition: this.textareaRef.current.selectionStart || 0
      });
    }
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (!this.props.isActive) return;
    if (this.state.isComposing) return;

    // 阻止事件冒泡，避免被父组件处理
    e.stopPropagation();

    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      if (this.props.value.trim()) {
        this.props.onSave(this.props.value.trim());
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      this.props.onCancel();
    }
    // 其他按键不阻止，允许正常输入
  };

  private handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.props.onChange(e.target.value);
    setTimeout(() => {
      if (!this.state.isComposing) {
        this.updateCursorPosition();
      }
    }, 0);
  };

  private handleMouseUp = () => {
    setTimeout(() => {
      this.updateCursorPosition();
    }, 0);
  };

  private handleKeyUp = () => {
    setTimeout(() => {
      this.updateCursorPosition();
    }, 0);
  };

  private handleCompositionStart = () => {
    this.setState({ isComposing: true });
  };

  private handleCompositionEnd = () => {
    this.setState({ isComposing: false }, () => {
      setTimeout(() => {
        this.updateCursorPosition();
      }, 0);
    });
  };

  // 处理文本区域焦点事件
  private handleFocus = () => {
    this.setState({ isFocused: true });
  };

  // 处理文本区域失去焦点事件
  private handleBlur = () => {
    this.setState({ isFocused: false });
  };

  // 开始调整大小
  private handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    this.setState({ isResizing: true });
    
    this.mouseMoveHandler = this.handleResizeMove.bind(this);
    this.mouseUpHandler = this.handleResizeEnd.bind(this);
    
    document.addEventListener('mousemove', this.mouseMoveHandler);
    document.addEventListener('mouseup', this.mouseUpHandler);
  };

  private handleResizeMove = (e: MouseEvent) => {
    if (!this.state.isResizing || !this.containerRef.current) return;
    
    const containerRect = this.containerRef.current.getBoundingClientRect();
    const newWidth = Math.max(200, e.clientX - containerRect.left + 10);
    const newHeight = Math.max(60, e.clientY - containerRect.top + 10);
    
    this.setState({
      inputWidth: newWidth,
      inputHeight: newHeight
    });
  };

  private handleResizeEnd = () => {
    this.setState({ isResizing: false });
    this.removeResizeListeners();
  };

  // 计算光标位置
  private getCursorPosition(): { top: number; left: number } {
    const { value } = this.props;
    const { cursorPosition, inputWidth } = this.state;
    
    if (!this.textareaRef.current) {
      return { top: 10, left: 10 };
    }

    const textBeforeCursor = value.substring(0, cursorPosition);
    const lines = textBeforeCursor.split('\n');
    const currentLine = lines[lines.length - 1];
    const lineIndex = lines.length - 1;
    
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    let left = 10;
    if (tempCtx) {
      tempCtx.font = '14px Arial';
      left = tempCtx.measureText(currentLine).width + 10;
    }
    
    const top = lineIndex * 18 + 10;
    
    return { top, left };
  }

  render() {
    const { isActive, position, value, theme, cursorVisible } = this.props;
    const { inputWidth, inputHeight, isResizing, isFocused } = this.state;

    if (!isActive || !position) return null;

    const cursorPos = this.getCursorPosition();

    return (
      <div
        ref={this.containerRef}
        data-component="text-input"
        className="text-input-component"
        style={{
          position: 'absolute',
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: 1000,
          background: theme.toolbar.background,
          border: `2px solid ${isFocused ? theme.chart.bottomColor : theme.chart.lineColor}`,
          borderRadius: '4px',
          padding: '0px',
          width: `${inputWidth}px`,
          height: `${inputHeight}px`,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          cursor: 'text',
        }}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          this.focusInput(); // 点击容器也聚焦
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
      >
        {/* 文本输入区域 */}
        <textarea
          ref={this.textareaRef}
          data-component="text-input-textarea"
          value={value}
          onChange={this.handleChange}
          onMouseUp={this.handleMouseUp}
          onKeyUp={this.handleKeyUp}
          onCompositionStart={this.handleCompositionStart}
          onCompositionEnd={this.handleCompositionEnd}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            height: '100%',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: theme.layout.textColor,
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'normal',
            fontStyle: 'normal',
            lineHeight: '18px',
            padding: '10px',
            resize: 'none',
            caretColor: theme.chart.lineColor, // 显示原生光标
          }}
          placeholder="输入文字..."
          autoFocus // 添加自动聚焦属性
        />
        
        {/* 自定义竖线光标 */}
        {cursorVisible && (
          <div
            style={{
              position: 'absolute',
              left: `${cursorPos.left}px`,
              top: `${cursorPos.top}px`,
              width: '2px',
              height: '16px',
              background: theme.chart.lineColor,
              animation: 'blink 1s infinite',
              pointerEvents: 'none',
            }}
          />
        )}

        {/* 调整大小的手柄 */}
        <div
          style={{
            position: 'absolute',
            right: '2px',
            bottom: '2px',
            width: '12px',
            height: '12px',
            background: theme.chart.lineColor,
            cursor: 'nwse-resize',
            borderRadius: '2px',
            opacity: 0.7,
          }}
          onMouseDown={this.handleResizeStart}
        />

        <style>
          {`
            @keyframes blink {
              0%, 50% { opacity: 1; }
              51%, 100% { opacity: 0; }
            }
          `}
        </style>
        
        {/* 操作提示 */}
        <div
          style={{
            position: 'absolute',
            bottom: '-25px',
            left: '0',
            fontSize: '10px',
            color: theme.layout.textColor,
            background: theme.toolbar.background,
            padding: '2px 6px',
            borderRadius: '3px',
            border: `1px solid ${theme.toolbar.border}`,
          }}
        >
          Ctrl+Enter 保存 • Esc 取消
        </div>
      </div>
    );
  }
}

export { TextInputComponent };