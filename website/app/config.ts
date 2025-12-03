export const siteConfig = {
  name: '{siteName}',
  metadata: {
    title: {
      en: '🕯️CandleView | A data visualization charts(KLine) and draw graph engine for the financial industry.',
      cn: '🕯️烛光视图 | 一款面向金融行业的数据可视化图表(K线)与图形绘制引擎.'
    },
    description: {
      en: 'A data visualization charts(KLine) and draw graph engine for the financial industry.',
      cn: '一款面向金融行业的数据可视化图表(K线)与图形绘制引擎.'
    },
    keywords: {
      en: 'financial charts, trading, real-time, WebGL, high-frequency',
      cn: '金融图表, 交易, 实时, WebGL, 高频'
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
        en: 'Component Preview',
        cn: '组件预览'
      },
      highlight: {
        en: 'Preview',
        cn: '预览'
      },
      className: 'text-3xl sm:text-4xl font-bold text-center mb-6 tracking-tight'
    },
    subtitle: {
      text: {
        en: 'View your component preview in real-time',
        cn: '实时查看您的组件预览效果'
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
      label: {
        en: 'v1.1.3 Launch',
        cn: 'v1.1.3 正式发布'
      },
      showDot: true,
      dotColor: 'bg-green-500',
      className: 'inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 backdrop-blur-sm'
    },
    title: {
      main: {
        en: 'Build Trading Experiences with Precision',
        cn: '精准构建交易体验'
      },
      highlight: {
        en: 'Precision',
        cn: '精准'
      },
      className: 'text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 tracking-tight'
    },
    description: {
      text: {
        en: 'A high-performance, real-time data visualization charts(KLine) and drawing engine designed for the financial industry.',
        cn: '一个专为金融行业设计的高性能、实时数据可视化图表（K线）与绘图引擎。'
      },
      className: 'text-xl text-muted-foreground max-w-3xl mx-auto mb-6 leading-relaxed'
    },
    buttons: {
      primary: {
        label: {
          en: 'Get Started',
          cn: '快速开始'
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
        value: '多时间框架',
        label: {
          en: 'Multi-Timeframe',
          cn: '多时间框架'
        }
      },
      {
        value: '多时区',
        label: {
          en: 'Multi-Timezone',
          cn: '多时区支持'
        }
      },
      {
        value: '多图形',
        label: {
          en: 'Multi-Chart',
          cn: '多图形绘制'
        }
      },
      {
        value: '多指标',
        label: {
          en: 'Multi-Indicator',
          cn: '多技术指标'
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
      { href: '/docs', key: 'docs' },
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
        en: 'A data visualization charts(KLine) and draw graph engine for the financial industry.',
        cn: '一款面向金融行业的数据可视化图表(K线)与图形绘制引擎.'
      }
    },
    navSections: [
      {
        titleKey: 'Footer.resources',
        links: [
          { href: '/docs', labelKey: 'Footer.documentation' },
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
        en: 'All systems operational',
        cn: '所有系统运行正常'
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