'use client';

import {
    Clock, Globe, Calendar, Zap,
    TrendingUp, TrendingDown, Activity,
    Sun, Moon, Watch, CalendarDays
} from 'lucide-react';
import { useI18n } from '@/app/providers/I18nProvider';

import enMessages from '@/messages/en.json';
import cnMessages from '@/messages/cn.json';

interface TimeFrameCategory {
    categoryKey: string;
    timeFrames: string[];
}

interface TimeZone {
    name: string;
    timeZone: string;
    regionKey: string;
}

export default function TimeShowcase() {
    const { locale } = useI18n();
    const t = (key: string): string => {
        const currentMessages = locale === 'cn' ? cnMessages : enMessages;
        const keys = key.split('.');
        let value: unknown = currentMessages;
        for (const k of keys) {
            if (typeof value === 'object' && value !== null && k in value) {
                value = (value as Record<string, unknown>)[k];
            } else {
                return key;
            }
        }
        return typeof value === 'string' ? value : key;
    };

    const timeFrameCategories: TimeFrameCategory[] = [
        {
            categoryKey: 'TimeShowcase.secondLevel',
            timeFrames: [
                'TimeShowcase.timeFrames.1s',
                'TimeShowcase.timeFrames.5s',
                'TimeShowcase.timeFrames.15s',
                'TimeShowcase.timeFrames.30s'
            ]
        },
        {
            categoryKey: 'TimeShowcase.minuteLevel',
            timeFrames: [
                'TimeShowcase.timeFrames.1m',
                'TimeShowcase.timeFrames.3m',
                'TimeShowcase.timeFrames.5m',
                'TimeShowcase.timeFrames.15m',
                'TimeShowcase.timeFrames.30m',
                'TimeShowcase.timeFrames.45m'
            ]
        },
        {
            categoryKey: 'TimeShowcase.hourLevel',
            timeFrames: [
                'TimeShowcase.timeFrames.1h',
                'TimeShowcase.timeFrames.2h',
                'TimeShowcase.timeFrames.3h',
                'TimeShowcase.timeFrames.4h',
                'TimeShowcase.timeFrames.6h',
                'TimeShowcase.timeFrames.8h',
                'TimeShowcase.timeFrames.12h'
            ]
        },
        {
            categoryKey: 'TimeShowcase.dailyLevel',
            timeFrames: [
                'TimeShowcase.timeFrames.1d',
                'TimeShowcase.timeFrames.3d'
            ]
        },
        {
            categoryKey: 'TimeShowcase.weeklyLevel',
            timeFrames: [
                'TimeShowcase.timeFrames.1w',
                'TimeShowcase.timeFrames.2w'
            ]
        },
        {
            categoryKey: 'TimeShowcase.monthlyLevel',
            timeFrames: [
                'TimeShowcase.timeFrames.1M',
                'TimeShowcase.timeFrames.3M',
                'TimeShowcase.timeFrames.6M'
            ]
        }
    ];

    const timeZones: TimeZone[] = [
        { name: 'UTC', timeZone: 'UTC', regionKey: 'TimeShowcase.regions.global' },
        { name: 'New York', timeZone: 'America/New_York', regionKey: 'TimeShowcase.regions.americas' },
        { name: 'Chicago', timeZone: 'America/Chicago', regionKey: 'TimeShowcase.regions.americas' },
        { name: 'Denver', timeZone: 'America/Denver', regionKey: 'TimeShowcase.regions.americas' },
        { name: 'Los Angeles', timeZone: 'America/Los_Angeles', regionKey: 'TimeShowcase.regions.americas' },
        { name: 'Toronto', timeZone: 'America/Toronto', regionKey: 'TimeShowcase.regions.americas' },
        { name: 'London', timeZone: 'Europe/London', regionKey: 'TimeShowcase.regions.europe' },
        { name: 'Paris', timeZone: 'Europe/Paris', regionKey: 'TimeShowcase.regions.europe' },
        { name: 'Frankfurt', timeZone: 'Europe/Berlin', regionKey: 'TimeShowcase.regions.europe' },
        { name: 'Zurich', timeZone: 'Europe/Zurich', regionKey: 'TimeShowcase.regions.europe' },
        { name: 'Moscow', timeZone: 'Europe/Moscow', regionKey: 'TimeShowcase.regions.europe' },
        { name: 'Dubai', timeZone: 'Asia/Dubai', regionKey: 'TimeShowcase.regions.middleEast' },
        { name: 'Karachi', timeZone: 'Asia/Karachi', regionKey: 'TimeShowcase.regions.middleEast' },
        { name: 'Kolkata', timeZone: 'Asia/Kolkata', regionKey: 'TimeShowcase.regions.asia' },
        { name: 'Shanghai', timeZone: 'Asia/Shanghai', regionKey: 'TimeShowcase.regions.asia' },
        { name: 'Hong Kong', timeZone: 'Asia/Hong_Kong', regionKey: 'TimeShowcase.regions.asia' },
        { name: 'Singapore', timeZone: 'Asia/Singapore', regionKey: 'TimeShowcase.regions.asia' },
        { name: 'Tokyo', timeZone: 'Asia/Tokyo', regionKey: 'TimeShowcase.regions.asia' },
        { name: 'Seoul', timeZone: 'Asia/Seoul', regionKey: 'TimeShowcase.regions.asia' },
        { name: 'Sydney', timeZone: 'Australia/Sydney', regionKey: 'TimeShowcase.regions.pacific' },
        { name: 'Auckland', timeZone: 'Pacific/Auckland', regionKey: 'TimeShowcase.regions.pacific' }
    ];

    const features = [
        {
            titleKey: 'TimeShowcase.globalCoverage',
            descKey: 'TimeShowcase.globalCoverageDesc',
            gradient: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
            color: 'text-blue-600 dark:text-blue-400',
            bgColor: 'bg-blue-100 dark:bg-blue-900/30',
            icon: Globe
        },
        {
            titleKey: 'TimeShowcase.multiTimeframe',
            descKey: 'TimeShowcase.multiTimeframeDesc',
            gradient: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
            color: 'text-green-600 dark:text-green-400',
            bgColor: 'bg-green-100 dark:bg-green-900/30',
            icon: CalendarDays
        },
        {
            titleKey: 'TimeShowcase.realTimeSync',
            descKey: 'TimeShowcase.realTimeSyncDesc',
            gradient: 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
            color: 'text-purple-600 dark:text-purple-400',
            bgColor: 'bg-purple-100 dark:bg-purple-900/30',
            icon: Zap
        }
    ];

    const scrollbarStyles = `
    .custom-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: #94a3b8 #f1f5f9;
    }
    
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 10px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #94a3b8;
      border-radius: 10px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #64748b;
    }
    
    /* Dark mode styles */
    .dark .custom-scrollbar {
      scrollbar-color: #475569 #1e293b;
    }
    
    .dark .custom-scrollbar::-webkit-scrollbar-track {
      background: #1e293b;
    }
    
    .dark .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #475569;
    }
    
    .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #64748b;
    }
  `;

    return (
        <>
            <style jsx global>{scrollbarStyles}</style>
            <section className="py-10 sm:py-10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            {t('TimeShowcase.title')}
                        </h2>
                        <p className="mt-4 text-lg text-muted-foreground">
                            {t('TimeShowcase.subtitle')}
                        </p>
                    </div>
                    <div className="mx-auto mt-16 grid max-w-7xl grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-card rounded-2xl border p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 p-2">
                                    <Clock className="h-5 w-5 text-white" />
                                </div>
                                <h3 className="text-xl font-bold">
                                    {t('TimeShowcase.supportedTimeframes')}
                                </h3>
                            </div>
                            <div className="space-y-6 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                                {timeFrameCategories.map((category, categoryIndex) => (
                                    <div key={categoryIndex} className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                            <h4 className="font-semibold text-sm">
                                                {t(category.categoryKey)}
                                            </h4>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {category.timeFrames.map((timeFrameKey, timeFrameIndex) => (
                                                <span
                                                    key={timeFrameIndex}
                                                    className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700"
                                                >
                                                    {t(timeFrameKey)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 pt-6 border-t dark:border-gray-700">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {t('TimeShowcase.timeframeFeatures')}
                                </p>
                            </div>
                        </div>

                        <div className="bg-card rounded-2xl border p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 p-2">
                                    <Globe className="h-5 w-5 text-white" />
                                </div>
                                <h3 className="text-xl font-bold">
                                    {t('TimeShowcase.supportedTimezones')}
                                </h3>
                            </div>
                            <div className="space-y-6 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                                {(() => {
                                    const regions = timeZones.reduce((acc, tz) => {
                                        const region = t(tz.regionKey);
                                        if (!acc[region]) acc[region] = [];
                                        acc[region].push(tz);
                                        return acc;
                                    }, {} as Record<string, TimeZone[]>);
                                    return Object.entries(regions).map(([region, zoneList], regionIndex) => (
                                        <div key={regionIndex} className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                                                <h4 className="font-semibold text-sm">
                                                    {region}
                                                </h4>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {zoneList.map((timeZone, tzIndex) => (
                                                    <div
                                                        key={tzIndex}
                                                        className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200 dark:border-orange-700 min-w-0"
                                                    >
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <div className="h-2 w-2 rounded-full bg-orange-300 flex-shrink-0"></div>
                                                            <span className="font-medium text-sm text-gray-700 dark:text-gray-300 truncate">
                                                                {timeZone.name}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate sm:ml-auto">
                                                            {timeZone.timeZone}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ));
                                })()}
                            </div>
                            <div className="mt-6 pt-6 border-t dark:border-gray-700">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {t('TimeShowcase.timezoneFeatures')}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className={`bg-gradient-to-br ${feature.gradient} rounded-xl p-6 border border-transparent dark:border-gray-700`}
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`inline-flex items-center justify-center rounded-lg p-2 ${feature.bgColor}`}>
                                        <feature.icon className={`h-5 w-5 ${feature.color}`} />
                                    </div>
                                    <div className={`${feature.color} font-semibold`}>
                                        {t(feature.titleKey)}
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {t(feature.descKey)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}