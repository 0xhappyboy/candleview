'use client';

import { Zap, Database, Cpu, ChartBar, Smartphone, Code } from 'lucide-react';
import { useI18n } from '@/app/providers/I18nProvider';

import enMessages from '@/messages/en.json';
import cnMessages from '@/messages/cn.json';

interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  titleKey: string;
  descriptionKey: string;
}

export default function Features() {
  const locale = 'cn';
  const t = (key: string): string => {
    const currentMessages = locale === 'cn' ? cnMessages : enMessages;
    const keys = key.split('.');
    let value: unknown = currentMessages.Features;
    for (const k of keys) {
      if (typeof value === 'object' && value !== null && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return key;
      }
    }
    return typeof value === 'string' ? value : key;
  };

  const features: Feature[] = [
    {
      icon: Zap,
      titleKey: 'plugAndPlay',
      descriptionKey: 'plugAndPlayDesc'
    },
    {
      icon: Database,
      titleKey: 'dataDriven',
      descriptionKey: 'dataDrivenDesc'
    },
    {
      icon: Cpu,
      titleKey: 'lowMemory',
      descriptionKey: 'lowMemoryDesc'
    },
    {
      icon: ChartBar,
      titleKey: 'professionalCharts',
      descriptionKey: 'professionalChartsDesc'
    },
    {
      icon: Smartphone,
      titleKey: 'multiPlatform',
      descriptionKey: 'multiPlatformDesc'
    },
    {
      icon: Code,
      titleKey: 'highExtensibility',
      descriptionKey: 'highExtensibilityDesc'
    },
  ];

  return (
    <section className="py-10 sm:py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t('title')}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="relative rounded-2xl border bg-card p-8 transition-all hover:shadow-lg hover:-translate-y-1"
            >
              <div className="mb-6 inline-flex items-center justify-center rounded-lg bg-primary/10 p-3">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">
                {t(feature.titleKey)}
              </h3>
              <p className="mt-3 text-muted-foreground">
                {t(feature.descriptionKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
