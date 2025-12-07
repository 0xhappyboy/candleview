'use client';

import { Github, Linkedin, Mail } from 'lucide-react';
import XIcon from '../icons/XIcon';
import Link from 'next/link';
import { useI18n } from '@/app/providers/I18nProvider';
import { siteConfig } from '../config';

const iconMap = {
  Github: Github,
  Twitter: XIcon,
  Linkedin: Linkedin,
  Mail: Mail,
} as const;

import enMessages from '@/messages/en.json';
import cnMessages from '@/messages/cn.json';
import { useVersion } from '../hooks/UseVersion';

export default function Footer() {
  const versionInfo = useVersion();
  const { locale } = useI18n();
  const t = (key: string): string => {
    const currentMessages = locale === 'cn' ? cnMessages : enMessages;
    const keys = key.split('.') as (keyof typeof currentMessages)[];
    let result: unknown = currentMessages;
    for (const k of keys) {
      if (typeof result === 'object' && result !== null && k in result) {
        result = (result as Record<string, unknown>)[k];
      } else {
        return key;
      }
    }
    return typeof result === 'string' ? result : key;
  };
  const siteName = t('SiteName.name');
  const { brand, navSections, footerSocialLinks, status, bottomBar } = siteConfig.footer;
  const year = new Date().getFullYear();
  const copyrightText = bottomBar.copyrightText[locale === 'cn' ? 'cn' : 'en']
    .replace('{year}', year.toString())
    .replace('{siteName}', siteName);
  return (
    <footer className="border-t bg-card">
      <div className={siteConfig.footer.container.className}>
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className={brand.logo.className}>
                <img
                  src={brand.logo.imageUrl}
                  alt={siteName}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-2xl font-bold">{siteName}</span>
            </div>
            <p className="text-muted-foreground max-w-md">
              {brand.description[locale === 'cn' ? 'cn' : 'en']}
            </p>
            <div className="mt-6 flex gap-4">
              {footerSocialLinks.map((social, index) => {
                const IconComponent = iconMap[social.icon as keyof typeof iconMap];
                return (
                  <a
                    key={index}
                    href={social.href}
                    className={social.className}
                    aria-label={social.label}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <IconComponent className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {navSections.map((section, index) => (
              <div key={index}>
                <h3 className="font-semibold mb-4">
                  {t(section.titleKey)}
                </h3>
                <ul className="space-y-2">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {t(link.labelKey)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className={bottomBar.className}>
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="text-center sm:text-left">
              <p className="text-sm text-muted-foreground">
                {copyrightText}
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className={status.dot.className} />
                <span className="text-xs text-muted-foreground">
                  {status.label[locale === 'cn' ? 'cn' : 'en']}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                {versionInfo.loading ? (
                  <span className="inline-flex items-center">
                    <span className="inline-block w-12 h-4 bg-muted rounded animate-pulse" />
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    {versionInfo.latest}
                    {versionInfo.error && (
                      <span className="text-xs text-muted-foreground/50 ml-1">(offline)</span>
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
