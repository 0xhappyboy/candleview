import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import { I18nProvider } from "./providers/I18nProvider";
import { LocaleProvider } from "./providers/LocaleProvider";
import { ThemeProvider } from "./providers/ThemeProvider";
import '@/app/globals.css'
import { siteConfig } from './config';
import DynamicHead from "./providers/DynamicHead";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

const defaultLocale = 'en';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale = (cookieStore.get('locale')?.value as 'en' | 'cn') || defaultLocale;
  const title = siteConfig.metadata.title[locale] || siteConfig.metadata.title.en;
  const description = siteConfig.metadata.description[locale] || siteConfig.metadata.description.en;
  const keywords = siteConfig.metadata.keywords[locale] || siteConfig.metadata.keywords.en;

  return {
    title,
    description,
    keywords,
    authors: [{ name: 'happyboy', url: 'https://github.com/0xhappyboy' }],
    openGraph: {
      type: 'website',
      locale: locale === 'cn' ? 'zh_CN' : 'en_US',
      title,
      description,
      siteName: siteConfig.name,
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: 'CandleView Charting Engine'
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/twitter-image.png'],
      creator: '@0xhappyboy_',
    },
    icons: {
      icon: siteConfig.logo.imageUrl,
      shortcut: siteConfig.logo.imageUrl,
      apple: siteConfig.logo.imageUrl,
    },
  };
}

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({
  children,
}: RootLayoutProps) {
  return (
    <html lang={defaultLocale} suppressHydrationWarning>
      <head />
      <body className={`${inter.variable} font-sans antialiased`}>
        <I18nProvider defaultLocale={defaultLocale}>
          <ThemeProvider>
            <LocaleProvider>
              <DynamicHead />
              {children}
            </LocaleProvider>
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
