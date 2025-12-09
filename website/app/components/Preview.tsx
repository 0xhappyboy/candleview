'use client';

import { useEffect, useState } from 'react';
import { siteConfig } from '../config';
import { useI18n } from '../providers/I18nProvider';
import { CandleView, ICandleViewDataPoint } from 'candleview';
import { TEST_CANDLEVIEW_DATA8 } from '../mock/mock_data_1';

interface LocalizableContent {
  en: string;
  cn: string;
  [key: string]: string;
}

type LocalizableConfig = string | LocalizableContent;

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

export default function Preview() {
  const { locale } = useI18n();
  const [isDark, setIsDark] = useState(true);
  const preview = siteConfig.preview;
  const localizedTitleMain = getLocalizedContent(preview.title.main, locale);
  const localizedTitleHighlight = getLocalizedContent(preview.title.highlight, locale);
  const localizedSubtitleText = getLocalizedContent(preview.subtitle.text, locale);

  useEffect(() => {
    const checkTheme = () => {
      const isDarkTheme = document.documentElement.classList.contains('dark');
      setIsDark(isDarkTheme);
    };
    checkTheme();
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          checkTheme();
        }
      });
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => {
      observer.disconnect();
    };
  }, []);

  const getCandleViewI18n = () => {
    if (locale === 'cn') {
      return 'zh-cn';
    }
    return 'en';
  };

  return (
    <section className={preview.container.className}>
      <h2 className={preview.title.className}>
        {renderHighlightedTitle(localizedTitleMain, localizedTitleHighlight)}
      </h2>
      <p className={preview.subtitle.className}>
        {localizedSubtitleText}
      </p>
      <div className={preview.previewArea.className}>
        <CandleView
          data={TEST_CANDLEVIEW_DATA8}
          title='Test'
          theme={isDark ? 'dark' : 'light'}
          i18n={getCandleViewI18n()}
          height={600}
          timeframe='15m'
          leftpanel={true}
          toppanel={true}
          terminal={true}
          ai={true}
          aiconfigs={[
            {
              proxyUrl: '/api',
              brand: 'aliyun',
              model: 'qwen-turbo',
            },
            {
              proxyUrl: '/api',
              brand: 'deepseek',
              model: 'deepseek-chat',
            },
          ]}
        />
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
