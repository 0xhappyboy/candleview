export const siteConfig = {
  name: '{siteName}',
  metadata: {
    title: {
      en: '🕯️CandleView | AI-Powered financial data visualization charts(KLine) with intelligent insights',
      cn: '🕯️烛光视图 | 人工智能驱动的金融数据可视化图表(K线)与智能洞察引擎'
    },
    description: {
      en: 'An AI-enhanced data visualization charts(KLine) and draw graph engine for the financial industry with intelligent analysis capabilities.',
      cn: '一款人工智能增强的金融数据可视化图表(K线)与图形绘制引擎，具备智能分析能力'
    },
    keywords: {
      en: 'AI financial charts, intelligent trading, machine learning, real-time analytics, WebGL',
      cn: 'AI金融图表, 智能交易, 机器学习, 实时分析, WebGL'
    }
  },
  logo: {
    iconSize: 'h-7 w-7',
    textSize: 'text-lg',
    gradient: 'from-primary to-chart-2',
    imageUrl: 'https://raw.githubusercontent.com/0xhappyboy/candleview/main/assets/logo/logo_100x100.jpeg',
  },
  header: {
    height: 'h-14',
    className: 'sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
  },
  preview: {
    title: {
      main: {
        en: 'AI-Powered Component Preview',
        cn: 'AI增强组件预览'
      },
      highlight: {
        en: 'AI-Powered',
        cn: 'AI增强'
      },
      className: 'text-3xl sm:text-4xl font-bold text-center mb-6 tracking-tight'
    },
    subtitle: {
      text: {
        en: 'Experience intelligent chart analysis with AI-driven insights in real-time',
        cn: '实时体验AI驱动的智能图表分析与洞察'
      },
      className: 'text-lg text-muted-foreground max-w-2xl text-center mb-6 leading-relaxed'
    },
    container: {
      className: 'flex flex-col items-center justify-center py-5 px-5 mt-10'
    },
    previewArea: {
      className: 'w-full max-w-[80%] h-[600px] rounded-xl border-2 bg-card/50 backdrop-blur-sm overflow-hidden'
    }
  },
  hero: {
    announcement: {
      showDot: true,
      dotColor: 'bg-green-500',
      className: 'inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 backdrop-blur-sm'
    },
    title: {
      main: {
        en: 'Intelligent Trading Experiences Powered by AI',
        cn: 'AI驱动的智能交易体验'
      },
      highlight: {
        en: 'AI',
        cn: 'AI驱动'
      },
      className: 'text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 tracking-tight'
    },
    description: {
      text: {
        en: 'An AI-enhanced high-performance, real-time data visualization platform with intelligent pattern recognition and predictive analytics for financial markets.',
        cn: '一个人工智能增强的高性能实时数据可视化平台，具备金融市场的智能模式识别与预测分析能力'
      },
      className: 'text-xl text-muted-foreground max-w-3xl mx-auto mb-6 leading-relaxed'
    },
    buttons: {
      primary: {
        label: {
          en: 'Start with AI',
          cn: 'AI快速开始'
        },
        className: 'group relative px-8 py-3 rounded-lg overflow-hidden bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold transition-all duration-300 hover:from-primary/90 hover:to-primary/70'
      },
      secondary: {
        label: {
          en: 'GitHub Start',
          cn: 'GitHub 星标'
        },
        href: 'https://github.com/0xhappyboy/candleview',
        showStars: true,
        className: 'group relative px-8 py-3 rounded-lg overflow-hidden text-primary-foreground font-semibold transition-all duration-300 flex items-center gap-2.5'
      }
    },
    metrics: [
      {
        value: 'AI模式识别',
        label: {
          en: 'AI Pattern Recognition',
          cn: 'AI模式识别'
        }
      },
      {
        value: '智能预测',
        label: {
          en: 'Intelligent Forecasting',
          cn: '智能预测'
        }
      },
      {
        value: '机器学习',
        label: {
          en: 'Machine Learning',
          cn: '机器学习'
        }
      },
      {
        value: 'AI指标',
        label: {
          en: 'AI Indicators',
          cn: 'AI技术指标'
        }
      }
    ],
    container: {
      className: 'mx-auto max-w-4xl text-center'
    },
    canvas: {
      className: 'w-full h-full absolute inset-0'
    },
    gradientOverlay: {
      className: 'absolute inset-0 bg-gradient-to-b from-background/60 via-background/30 to-background dark:from-background/70 dark:via-background/40 dark:to-background'
    }
  },
  navigation: {
    items: [
      { href: 'https://candleview-docs.vercel.app/', key: 'docs' },
      { href: '/preview', key: 'preview' },
      { href: '/sponsor', key: 'sponsor' },
      { href: '/commercial-license', key: 'license' },
      { href: '/contactus', key: 'customize' },
    ],
    desktop: {
      gap: 'gap-5',
      className: 'text-sm font-medium transition-colors hover:text-primary',
      activeClass: 'text-primary',
      inactiveClass: 'text-foreground/70',
    },
    mobile: {
      activeClass: 'bg-primary/10 text-primary',
      inactiveClass: 'hover:bg-accent',
    },
  },
  footer: {
    brand: {
      name: '{siteName}',
      logo: {
        className: 'h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-chart-2',
        imageUrl: 'https://raw.githubusercontent.com/0xhappyboy/candleview/main/assets/logo/logo_50x50.jpeg',
      },
      description: {
        en: 'An AI-enhanced data visualization charts(KLine) and draw graph engine with intelligent financial analysis.',
        cn: '一款人工智能增强的金融数据可视化图表(K线)与智能分析引擎'
      }
    },
    navSections: [
      {
        titleKey: 'Footer.resources',
        links: [
          { href: 'https://candleview-docs.vercel.app/', labelKey: 'Footer.documentation' },
          { href: '/blog', labelKey: 'Footer.blog' },
          { href: '/contactus', labelKey: 'Footer.support' },
          { href: 'https://github.com/0xhappyboy/candleview/discussions', labelKey: 'Footer.community' },
        ],
      },
      {
        titleKey: 'Footer.legal',
        links: [
          { href: '/privacy', labelKey: 'Footer.privacy' },
          { href: '/terms', labelKey: 'Footer.terms' },
          { href: 'mailto:superhappyboy1995@gmail.com', labelKey: 'Footer.security' },
          { href: '/cookies', labelKey: 'Footer.cookies' },
        ],
      },
    ],
    footerSocialLinks: [
      {
        icon: 'Github',
        href: 'https://github.com/0xhappyboy/candleview',
        label: 'GitHub',
        className: 'rounded-lg border p-2 hover:bg-accent transition-colors',
      },
      {
        icon: 'Twitter',
        href: 'https://x.com/0xhappyboy_',
        label: 'Twitter',
        className: 'rounded-lg border p-2 hover:bg-accent transition-colors',
      },
      {
        icon: 'Mail',
        href: 'mailto:superhappyboy1995@gmail.com',
        label: 'Email',
        className: 'rounded-lg border p-2 hover:bg-accent transition-colors',
      },
    ],
    status: {
      dot: {
        className: 'h-2 w-2 rounded-full bg-green-500 animate-pulse',
      },
      label: {
        en: 'Systems operational',
        cn: '系统运行正常'
      }
    },
    version: 'v1.1.3',
    container: {
      className: 'container mx-auto px-4 py-12 sm:px-6 lg:px-8',
    },
    bottomBar: {
      className: 'mt-12 border-t pt-8',
      copyrightText: {
        en: '© {year} {siteName}. All rights reserved.',
        cn: '© {year} {siteName}. 保留所有权利.'
      }
    },
  },
  socialLinks: [
    {
      icon: 'Github',
      href: 'https://github.com/0xhappyboy/candleview',
      label: 'GitHub',
      component: 'Github' as const,
      sizeAdjustment: 'scale-110',
    },
    {
      icon: 'X',
      href: 'https://x.com/0xhappyboy_',
      label: 'X',
      component: 'XIcon' as const,
      sizeAdjustment: '',
    },
    {
      icon: 'MessageCircle',
      href: 'https://weixin.qq.com',
      label: '微信',
      component: 'MessageCircle' as const,
      sizeAdjustment: '',
    },
    {
      icon: 'Send',
      href: 'https://telegram.org',
      label: '电报',
      component: 'Send' as const,
      sizeAdjustment: '',
    },
    {
      icon: 'Package',
      href: 'https://www.npmjs.com/package/candleview',
      label: 'npm',
      component: 'Package' as const,
      sizeAdjustment: 'scale-110',
    },
  ],
  controls: {
    desktop: {
      buttonSize: 'h-4 w-4',
      buttonPadding: 'p-1',
      buttonClass: 'rounded-md transition-colors flex items-center justify-center',
      iconClass: 'text-foreground/60 hover:text-foreground transition-colors',
      gap: 'gap-2.5',
    },
    mobile: {
      buttonSize: 'h-4 w-4',
      buttonPadding: 'p-1',
      buttonClass: 'rounded-md transition-colors flex items-center justify-center',
      iconClass: 'text-foreground/60 hover:text-foreground transition-colors',
    },
  },
  separator: {
    className: 'h-4 w-px bg-border mx-1.5',
  },
  container: {
    className: 'container mx-auto px-4 sm:px-6 lg:px-8',
  },
} as const;
