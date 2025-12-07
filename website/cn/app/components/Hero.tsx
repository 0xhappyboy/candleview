'use client';

import { useEffect, useRef, useState } from 'react';
import { siteConfig } from '../config';
import { Github, Star } from 'lucide-react';
import { useI18n } from '../providers/I18nProvider';
import { useVersion } from '../hooks/UseVersion';

interface GitHubStats {
  stars: number;
  loading: boolean;
  error: boolean;
}

interface CandleData {
  open: number;
  high: number;
  low: number;
  close: number;
  time: number;
}

interface LocalizableContent {
  en: string;
  cn: string;
  [key: string]: string;
}

type LocalizableConfig = string | LocalizableContent;

const renderHighlightedTitle = (title: string, highlight: string) => {
  if (!title.includes(highlight)) {
    return <span className="text-foreground">{title}</span>;
  }
  const parts = title.split(highlight);
  return (
    <span className="text-foreground">
      {parts[0]}
      <span className="relative">
        <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
          {highlight}
        </span>
        <span className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 blur-xl opacity-50" />
      </span>
      {parts[1]}
    </span>
  );
};

const getLocalizedContent = (config: LocalizableConfig, locale: string): string => {
  if (typeof config === 'object') {
    const obj = config as Record<string, string>;
    if (obj[locale]) {
      return obj[locale];
    }
    if (obj['en']) {
      return obj['en'];
    }
  }
  return config as string;
};

export default function Hero() {
  const { locale } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const candleDataRef = useRef<CandleData[]>([]);
  const animationRef = useRef<number | null>(null);
  const [isDark, setIsDark] = useState(true);
  const [githubStats, setGithubStats] = useState<GitHubStats>({
    stars: 0,
    loading: true,
    error: false
  });
  const [activeTab, setActiveTab] = useState<'npm' | 'yarn' | 'pnpm'>('npm');
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const hero = siteConfig.hero;
  // const localizedAnnouncementLabel = getLocalizedContent(hero.announcement.label, locale);
  const versionInfo = useVersion();
  const localizedAnnouncementLabel = getLocalizedContent(
    versionInfo.loading
      ? ''
      : {
        en: `${versionInfo.latest} Launch`,
        cn: `${versionInfo.latest} 正式发布`
      },
    locale
  );
  const localizedTitleMain = getLocalizedContent(hero.title.main, locale);
  const localizedTitleHighlight = getLocalizedContent(hero.title.highlight, locale);
  const localizedDescriptionText = getLocalizedContent(hero.description.text, locale);
  const localizedPrimaryButtonLabel = getLocalizedContent(hero.buttons.primary.label, locale);
  const localizedSecondaryButtonLabel = getLocalizedContent(hero.buttons.secondary.label, locale);

  const installationCommands = {
    npm: 'npm i candleview',
    yarn: 'yarn add candleview',
    pnpm: 'pnpm add candleview'
  };

  const copyMessages = {
    en: {
      copy: 'Copy',
      copied: 'Copied!'
    },
    cn: {
      copy: '复制',
      copied: '已复制!'
    }
  };

  const currentCopyMessages = copyMessages[locale as keyof typeof copyMessages] || copyMessages.en;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(installationCommands[activeTab]).then(() => {
      setShowCopySuccess(true);
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = setTimeout(() => {
        setShowCopySuccess(false);
      }, 2000);
    }).catch(err => {
    });
  };

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const fetchGitHubStars = async () => {
    try {
      const githubUrl = hero.buttons.secondary.href;
      if (!githubUrl) return;
      const repoMatch = githubUrl.match(/github\.com\/([^\/]+\/[^\/]+)/);
      if (!repoMatch) return;
      const repoPath = repoMatch[1];
      const response = await fetch(`https://api.github.com/repos/${repoPath}`);
      if (response.ok) {
        const data = await response.json();
        setGithubStats({
          stars: data.stargazers_count || 0,
          loading: false,
          error: false
        });
      } else {
        setGithubStats(prev => ({ ...prev, loading: false, error: true }));
      }
    } catch (error) {
      setGithubStats(prev => ({ ...prev, loading: false, error: true }));
    }
  };

  useEffect(() => {
    if (hero.buttons.secondary.showStars) {
      fetchGitHubStars();
    }
  }, [hero.buttons.secondary.showStars]);

  useEffect(() => {
    const checkTheme = () => {
      if (document.documentElement.classList.contains('dark')) {
        setIsDark(true);
      } else {
        setIsDark(false);
      }
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const themeColors = {
      dark: {
        bg: 'rgba(0, 0, 0, 0.5)',
        grid: 'rgba(255, 255, 255, 0.05)',
        text: 'rgba(255, 255, 255, 0.6)',
        up: '#10b981',
        down: '#ef4444',
        line: '#3b82f6',
        glow: 'rgba(59, 130, 246, 0.1)',
      },
      light: {
        bg: 'rgba(255, 255, 255, 0.5)',
        grid: 'rgba(0, 0, 0, 0.05)',
        text: 'rgba(0, 0, 0, 0.6)',
        up: '#059669',
        down: '#dc2626',
        line: '#2563eb',
        glow: 'rgba(37, 99, 235, 0.1)',
      },
    };

    const colors = isDark ? themeColors.dark : themeColors.light;

    const generateCandleData = (count: number): CandleData[] => {
      const data: CandleData[] = [];
      let price = 100;
      const baseTime = Date.now();
      for (let i = 0; i < count; i++) {
        const change = (Math.random() - 0.5) * 3;
        const open = price;
        const close = price + change;
        const high = Math.max(open, close) + Math.random() * 2;
        const low = Math.min(open, close) - Math.random() * 2;
        data.push({
          open,
          high,
          low,
          close,
          time: baseTime - (count - i - 1) * 1000,
        });
        price = close;
      }
      return data;
    };

    const generateLiveCandle = (): CandleData => {
      const lastCandle = candleDataRef.current[candleDataRef.current.length - 1] || { close: 100 };
      const basePrice = lastCandle.close;
      const volatility = 0.8;
      const time = Date.now() / 1000;
      const sineWave = Math.sin(time * 3) * 0.4;
      const randomWalk = (Math.random() - 0.5) * volatility;
      const change = sineWave + randomWalk;
      const open = lastCandle.close;
      const close = basePrice + change;
      const high = Math.max(open, close) + Math.abs(change) * 3 + Math.random() * 0.8;
      const low = Math.min(open, close) - Math.abs(change) * 3 - Math.random() * 0.8;
      return {
        open,
        high,
        low,
        close,
        time: Date.now(),
      };
    };

    const drawCandle = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      candle: CandleData,
      candleWidth: number,
      scaleY: (value: number) => number
    ) => {
      const isUp = candle.close >= candle.open;
      const color = isUp ? colors.up : colors.down;
      const bodyTop = scaleY(Math.max(candle.open, candle.close));
      const bodyBottom = scaleY(Math.min(candle.open, candle.close));
      const bodyHeight = Math.abs(bodyBottom - bodyTop);
      const wickTop = scaleY(candle.high);
      const wickBottom = scaleY(candle.low);
      ctx.beginPath();
      ctx.moveTo(x + candleWidth / 2, wickTop);
      ctx.lineTo(x + candleWidth / 2, bodyTop);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + candleWidth / 2, bodyBottom);
      ctx.lineTo(x + candleWidth / 2, wickBottom);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.fillRect(x, bodyTop, candleWidth, bodyHeight || 1);
      if (isUp) {
        ctx.strokeStyle = color;
        ctx.strokeRect(x, bodyTop, candleWidth, bodyHeight || 1);
      }
    };

    const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number, padding: number) => {
      ctx.strokeStyle = colors.grid;
      ctx.lineWidth = 1;
      const horizontalLines = 6;
      for (let i = 0; i <= horizontalLines; i++) {
        const y = padding + (i * (height - 2 * padding)) / horizontalLines;
        ctx.beginPath();
        ctx.setLineDash([5, 5]);
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
      }
      const verticalLines = 8;
      for (let i = 0; i <= verticalLines; i++) {
        const x = padding + (i * (width - 2 * padding)) / verticalLines;
        ctx.beginPath();
        ctx.setLineDash([5, 5]);
        ctx.moveTo(x, padding);
        ctx.lineTo(x, height - padding);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    };

    let lastUpdateTime = Date.now();
    const updateInterval = 1000;

    const draw = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const padding = 0;
      const currentTime = Date.now();
      if (currentTime - lastUpdateTime > updateInterval) {
        if (candleDataRef.current.length > 0) {
          const liveCandle = generateLiveCandle();
          candleDataRef.current.push(liveCandle);

          if (candleDataRef.current.length > 200) {
            candleDataRef.current = candleDataRef.current.slice(-150);
          }
        }
        lastUpdateTime = currentTime;
      }
      const visibleData = candleDataRef.current.slice(-80);
      const allPrices = visibleData.flatMap(candle => [candle.high, candle.low]);
      const maxPrice = Math.max(...allPrices);
      const minPrice = Math.min(...allPrices);
      const priceRange = maxPrice - minPrice || 1;
      const scaleY = (price: number) => {
        return ((maxPrice - price) / priceRange) * height;
      };
      const visibleCandles = 60;
      const candleWidth = Math.max(2, (width - (visibleCandles - 1) * 2) / visibleCandles);
      const spacing = 1;
      const totalWidth = visibleCandles * (candleWidth + spacing);
      const xStart = (width - totalWidth) / 2;
      const shouldRedrawGrid = Math.abs(maxPrice - minPrice) > 0.5;
      if (shouldRedrawGrid) {
        drawGrid(ctx, width, height, padding);
      }
      const displayData = candleDataRef.current.slice(-visibleCandles);
      displayData.forEach((candle, index) => {
        const x = xStart + index * (candleWidth + spacing);
        drawCandle(ctx, x, 0, candle, candleWidth, scaleY);
      });
      if (displayData.length > 0) {
        const lastCandle = displayData[displayData.length - 1];
        const lastX = xStart + (displayData.length - 1) * (candleWidth + spacing);
        const lastY = scaleY(lastCandle.close);
        ctx.beginPath();
        ctx.moveTo(lastX + candleWidth, lastY);
        ctx.lineTo(width - 20, lastY);
        ctx.strokeStyle = colors.line;
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.stroke();
        ctx.setLineDash([]);
        const time = Date.now();
        if (Math.floor(time / 500) % 2 === 0) {
          ctx.beginPath();
          ctx.arc(lastX + candleWidth / 2, lastY, 3, 0, Math.PI * 2);
          ctx.fillStyle = colors.line;
          ctx.fill();
        }
      }
    };
    let lastFrameTime = 0;
    const animate = (timestamp: number) => {
      const frameInterval = 33; // 33ms ≈ 30fps
      if (timestamp - lastFrameTime >= frameInterval) {
        draw();
        lastFrameTime = timestamp;
      }
      animationRef.current = requestAnimationFrame(animate);
    };
    const initCanvas = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      const initialData = generateCandleData(100);
      candleDataRef.current = initialData;
      candleDataRef.current.push(generateLiveCandle());
    };
    const handleResize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };
    initCanvas();
    animationRef.current = requestAnimationFrame(animate);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isDark]);

  const macWindowColors = {
    dark: {
      bg: 'bg-gray-900',
      headerBg: 'bg-gray-800',
      headerBorder: 'border-gray-700',
      tabBg: 'bg-gray-700',
      tabActive: 'bg-gray-900 text-gray-100',
      tabInactive: 'text-gray-400 hover:text-gray-200 hover:bg-gray-600/50',
      codeBg: 'bg-gray-950',
      codeBorder: 'border-gray-800',
      textSecondary: 'text-gray-400',
      copyBtn: 'text-gray-400 hover:text-gray-200',
      copyBtnBg: 'hover:bg-gray-700',
      copyBtnBorder: 'border-gray-600 hover:border-gray-500',
      successBg: 'bg-green-500',
      successText: 'text-gray-100',
    },
    light: {
      bg: 'bg-gray-50',
      headerBg: 'bg-gray-100',
      headerBorder: 'border-gray-200',
      tabBg: 'bg-gray-200',
      tabActive: 'bg-white text-gray-800 shadow-sm',
      tabInactive: 'text-gray-500 hover:text-gray-700 hover:bg-gray-300/50',
      codeBg: 'bg-white',
      codeBorder: 'border-gray-300',
      textSecondary: 'text-gray-500',
      copyBtn: 'text-gray-500 hover:text-gray-700',
      copyBtnBg: 'hover:bg-gray-200',
      copyBtnBorder: 'border-gray-300 hover:border-gray-400',
      successBg: 'bg-green-400',
      successText: 'text-white',
    }
  };

  const colors = isDark ? macWindowColors.dark : macWindowColors.light;

  return (
    <section className="relative overflow-hidden pt-12 pb-0 sm:pt-16 lg:pt-20">
      <div className="absolute inset-0">
        <canvas
          ref={canvasRef}
          className={hero.canvas.className}
        />
        <div className={hero.gradientOverlay.className} />
      </div>
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className={hero.container.className}>
          <div className={hero.announcement.className}>
            {hero.announcement.showDot && (
              <div className={`w-2 h-2 rounded-full animate-pulse ${hero.announcement.dotColor}`} />
            )}
            <span className="text-sm font-medium text-primary">
              {localizedAnnouncementLabel}
            </span>
          </div>
          <h1 className={hero.title.className}>
            {renderHighlightedTitle(localizedTitleMain, localizedTitleHighlight)}
          </h1>
          <p className={hero.description.className}>
            {localizedDescriptionText}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className={`${hero.buttons.primary.className} cursor-pointer`}>
              <span className="relative z-10">
                {localizedPrimaryButtonLabel}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/60 to-primary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
            <a
              href={hero.buttons.secondary.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative px-8 py-3 rounded-lg overflow-hidden font-semibold transition-all duration-300 flex items-center gap-2.5 ${isDark
                ? 'bg-gradient-to-r from-gray-800/80 to-gray-900/80 hover:from-gray-800 hover:to-gray-900 text-gray-100'
                : 'bg-gradient-to-r from-gray-100/80 to-gray-200/80 hover:from-gray-100 hover:to-gray-200 text-gray-800'
                }`}
            >
              <Github
                className={`w-5 h-5 relative z-10 ${isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}
              />
              <span className="relative z-10 font-semibold">
                {localizedSecondaryButtonLabel}
              </span>
              <div
                className={`h-4 w-px relative z-10 ${isDark ? 'bg-gray-600' : 'bg-gray-400'
                  }`}
              />
              <div className="flex items-center gap-1.5 relative z-10">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="font-semibold">
                  {githubStats.loading ? (
                    <span
                      className={`inline-block w-10 h-4 rounded animate-pulse ${isDark ? 'bg-gray-600' : 'bg-gray-300'
                        }`}
                    />
                  ) : (
                    githubStats.stars.toLocaleString()
                  )}
                </span>
              </div>
              <div
                className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isDark
                  ? 'bg-gradient-to-r from-gray-700/40 to-gray-800/40'
                  : 'bg-gradient-to-r from-gray-300/40 to-gray-400/40'
                  }`}
              />
            </a>
          </div>
          <div className="mt-12 max-w-xl mx-auto">
            <div className={`${colors.bg} rounded-lg overflow-hidden border ${colors.headerBorder} shadow-lg`}>
              <div className={`flex items-center justify-between px-3 py-2 ${colors.headerBg} border-b ${colors.headerBorder}`}>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 hover:bg-red-600 cursor-pointer transition-colors" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 hover:bg-yellow-600 cursor-pointer transition-colors" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 hover:bg-green-600 cursor-pointer transition-colors" />
                  </div>
                  <div className="ml-3 flex items-center ${colors.tabBg} rounded-md p-0.5">
                    {(['npm', 'yarn', 'pnpm'] as const).map((tab) => (
                      <button
                        key={tab}
                        className={`px-2 py-1 text-xs font-medium rounded transition-all duration-200 ${activeTab === tab
                          ? colors.tabActive
                          : colors.tabInactive
                          }`}
                        onClick={() => setActiveTab(tab)}
                      >
                        {tab.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <button
                    onClick={copyToClipboard}
                    className={`text-xs ${colors.copyBtn} flex items-center gap-1 px-2 py-1 rounded transition-all duration-200 border ${colors.copyBtnBorder} ${colors.copyBtnBg} ${showCopySuccess ? 'opacity-0' : 'opacity-100'
                      }`}
                    style={{ transition: 'opacity 150ms ease-in-out' }}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    {currentCopyMessages.copy}
                  </button>
                  {showCopySuccess && (
                    <div
                      className={`absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center ${colors.successBg} ${colors.successText} text-xs font-medium rounded border ${colors.copyBtnBorder} transition-all duration-200 animate-in fade-in slide-in-from-top-1`}
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {currentCopyMessages.copied}
                    </div>
                  )}
                </div>
              </div>
              <div className="p-4">
                <div className={`${colors.codeBg} rounded border ${colors.codeBorder} overflow-hidden`}>
                  <div className="p-3">
                    <pre className="text-sm font-mono overflow-x-auto">
                      <code className="block min-h-[20px]">
                        <span className="text-green-500">$</span>{' '}
                        <span className={isDark ? 'text-gray-100' : 'text-gray-800'}>
                          {installationCommands[activeTab]}
                        </span>
                      </code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style jsx global>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          animation: gradient 3s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
