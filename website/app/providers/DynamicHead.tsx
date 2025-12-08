'use client';

import { useEffect } from 'react';
import { useI18n } from '@/app/providers/I18nProvider';
import { siteConfig } from '@/app/config';

export default function DynamicHead() {
    const { locale } = useI18n();
    useEffect(() => {
        const title = siteConfig.metadata.title[locale] || siteConfig.metadata.title.en;
        document.title = title;
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute('content', siteConfig.metadata.description[locale] || siteConfig.metadata.description.en);
        }
        const metaKeywords = document.querySelector('meta[name="keywords"]');
        if (metaKeywords) {
            metaKeywords.setAttribute('content', siteConfig.metadata.keywords[locale] || siteConfig.metadata.keywords.en);
        }
        document.documentElement.lang = locale;
    }, [locale]);
    return null;
}