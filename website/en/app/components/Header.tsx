'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X as CloseIcon, Github, MessageCircle, Send, Package } from 'lucide-react';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';
import { siteConfig } from '../config';
import XIcon from '../icons/XIcon';
import { useI18n } from '@/app/providers/I18nProvider';

import enMessages from '@/messages/en.json';
import cnMessages from '@/messages/cn.json';

export default function Header() {
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
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const iconComponents = {
    Github,
    XIcon,
    MessageCircle,
    Send,
    Package,   
  };
  const navItems = siteConfig.navigation.items.map(item => ({
    href: item.href,
    label: t(`Header.${item.key}`),
  }));
  const siteName = t('SiteName.name');

  return (
    <header className={siteConfig.header.className}>
      <div className={siteConfig.container.className}>
        <div className={`flex ${siteConfig.header.height} items-center justify-between`}>
          <Link href="/" className="flex items-center gap-2">
            <div className={`${siteConfig.logo.iconSize} rounded-lg overflow-hidden flex items-center justify-center`}>
              <img
                src={siteConfig.logo.imageUrl}
                alt={siteName}
                className="w-full h-full object-cover"
              />
            </div>
            <span className={`${siteConfig.logo.textSize} font-bold tracking-tight`}>
              {siteName}
            </span>
          </Link>
          <nav className={`hidden md:flex items-center ${siteConfig.navigation.desktop.gap} ml-auto mr-6`}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                target="_blank"
                className={`${siteConfig.navigation.desktop.className} ${pathname === item.href
                  ? siteConfig.navigation.desktop.activeClass
                  : siteConfig.navigation.desktop.inactiveClass
                  }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <LanguageSwitcher />
              <ThemeToggle />
              <div className={siteConfig.separator.className} />
              <div className={`hidden sm:flex items-center ${siteConfig.controls.desktop.gap}`}>
                {siteConfig.socialLinks.map((social) => {
                  const IconComponent = iconComponents[social.component];
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={siteConfig.controls.desktop.buttonClass}
                      aria-label={social.label}
                    >
                      <div className={`${siteConfig.controls.desktop.buttonSize} ${social.sizeAdjustment || ''} ${siteConfig.controls.desktop.iconClass}`}>
                        <IconComponent className="w-full h-full" />
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`md:hidden ${siteConfig.controls.mobile.buttonPadding} ${siteConfig.controls.mobile.buttonClass}`}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <CloseIcon className={siteConfig.controls.mobile.buttonSize} />
              ) : (
                <Menu className={siteConfig.controls.mobile.buttonSize} />
              )}
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden border-t">
            <div className="py-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-4 py-2 text-sm font-medium rounded-md transition-colors ${pathname === item.href
                    ? siteConfig.navigation.mobile.activeClass
                    : siteConfig.navigation.mobile.inactiveClass
                    }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="px-4 py-3 border-t">
                <div className="flex justify-center gap-3">
                  {siteConfig.socialLinks.map((social) => {
                    const IconComponent = iconComponents[social.component];
                    return (
                      <a
                        key={social.label}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-md transition-colors flex items-center justify-center"
                        aria-label={social.label}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <div className={`h-4 w-4 ${social.sizeAdjustment || ''} text-foreground/60 hover:text-foreground transition-colors`}>
                          <IconComponent className="w-full h-full" />
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}