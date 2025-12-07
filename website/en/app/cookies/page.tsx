'use client';

import { useState } from 'react';
import { siteConfig } from '../config';
import enMessages from '@/messages/en.json';
import cnMessages from '@/messages/cn.json';

export default function CookiesPage() {
  const [language, setLanguage] = useState<'en' | 'cn'>('en');
  const t = (key: string): string => {
    const currentMessages = language === 'cn' ? cnMessages : enMessages;
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
  let email = 'superhappyboy1995@gmail.com';
  const securityLink = siteConfig.footer.navSections[1]?.links[2]?.href;
  if (securityLink && securityLink.startsWith('mailto:')) {
    email = securityLink.replace('mailto:', '');
  } else {
    const socialEmail = siteConfig.footer.footerSocialLinks.find(link => link.icon === 'Mail')?.href;
    if (socialEmail && socialEmail.startsWith('mailto:')) {
      email = socialEmail.replace('mailto:', '');
    }
  }
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const englishMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const content = {
    en: {
      title: "Cookie Policy",
      lastUpdated: `Last Updated: ${englishMonths[currentMonth]} ${currentYear}`,
      introduction: `This Cookie Policy explains how ${siteName} uses cookies and similar technologies to recognize you when you visit our website.`,
      whatAreCookies: {
        title: "What Are Cookies?",
        content: "Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners to make their websites work, or to work more efficiently, as well as to provide reporting information."
      },
      howWeUseCookies: {
        title: "How We Use Cookies",
        content: `We use cookies for several purposes: Essential cookies to enable core functionality, Analytics cookies to understand how visitors interact with our website, and Preference cookies to remember your settings and preferences.`
      },
      typesOfCookies: {
        title: "Types of Cookies We Use",
        content: [
          "Essential Cookies: Necessary for the website to function properly.",
          "Performance Cookies: Collect information about how you use our website.",
          "Functional Cookies: Remember your preferences and settings.",
          "Targeting Cookies: Used to deliver relevant advertisements."
        ]
      },
      manageCookies: {
        title: "Managing Cookies",
        content: "You can control and/or delete cookies as you wish. You can delete all cookies that are already on your computer and you can set most browsers to prevent them from being placed."
      },
      contactUs: {
        title: "Contact Us",
        content: `If you have any questions about our Cookie Policy, please contact us at: ${email}`
      }
    },
    cn: {
      title: "Cookie 政策",
      lastUpdated: `最后更新：${currentYear}年${currentMonth + 1}月`,
      introduction: `本 Cookie 政策解释了 ${siteName} 如何使用 Cookie 和类似技术来识别您访问我们网站时的身份。`,
      whatAreCookies: {
        title: "什么是 Cookie？",
        content: "Cookie 是您在访问网站时放置在计算机或移动设备上的小型数据文件。网站所有者广泛使用 Cookie 来使其网站正常工作或更高效地工作，以及提供报告信息。"
      },
      howWeUseCookies: {
        title: "我们如何使用 Cookie",
        content: `我们出于多种目的使用 Cookie：必要 Cookie 用于启用核心功能，分析 Cookie 用于了解访问者如何与我们的网站互动，偏好 Cookie 用于记住您的设置和偏好。`
      },
      typesOfCookies: {
        title: "我们使用的 Cookie 类型",
        content: [
          "必要 Cookie：网站正常运行所必需的。",
          "性能 Cookie：收集有关您如何使用我们网站的信息。",
          "功能 Cookie：记住您的偏好和设置。",
          "定向 Cookie：用于提供相关广告。"
        ]
      },
      manageCookies: {
        title: "管理 Cookie",
        content: "您可以按需控制和/或删除 Cookie。您可以删除计算机上已有的所有 Cookie，并可以设置大多数浏览器以防止放置 Cookie。"
      },
      contactUs: {
        title: "联系我们",
        content: `如果您对我们的 Cookie 政策有任何疑问，请通过以下方式联系我们：${email}`
      }
    }
  };

  const currentContent = content[language];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-end mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setLanguage('en')}
              className={`px-4 py-2 rounded-lg transition-colors ${language === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('cn')}
              className={`px-4 py-2 rounded-lg transition-colors ${language === 'cn' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              中文
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              {currentContent.title}
            </h1>
            <p className="text-gray-500 text-sm">
              {currentContent.lastUpdated}
            </p>
          </div>

          <section className="mb-10">
            <p className="text-gray-700 leading-relaxed text-lg">
              {currentContent.introduction}
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {currentContent.whatAreCookies.title}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {currentContent.whatAreCookies.content}
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {currentContent.howWeUseCookies.title}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {currentContent.howWeUseCookies.content}
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {currentContent.typesOfCookies.title}
            </h2>
            <ul className="space-y-3">
              {currentContent.typesOfCookies.content.map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-gray-700 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {currentContent.manageCookies.title}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {currentContent.manageCookies.content}
            </p>
          </section>

          <section className="pt-8 border-t border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {currentContent.contactUs.title}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {currentContent.contactUs.content}
            </p>
          </section>
        </div>

        <div className="mt-8 text-center">
          <a
            href='/'
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {language === 'en' ? 'Back to Home' : '返回首页'}
          </a>
        </div>
      </div>
    </div>
  );
}
