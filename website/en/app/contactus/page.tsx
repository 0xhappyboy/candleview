'use client';

import { useState } from 'react';
import { siteConfig } from '../config';

import enMessages from '@/messages/en.json';
import cnMessages from '@/messages/cn.json';

export default function ContactPage() {
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
  const { bottomBar } = siteConfig.footer;
  const year = new Date().getFullYear();
  const copyrightText = bottomBar.copyrightText[language === 'cn' ? 'cn' : 'en']
    .replace('{year}', year.toString())
    .replace('{siteName}', siteName);
  const content = {
    en: {
      title: "Contact Us",
      subtitle: "Get in touch with our team",
      description: "Have questions about ChartFin, want to report a bug, or interested in collaborating? Reach out through any of the channels below.",
      email: {
        title: "Email",
        label: "Email Address",
        address: "superhappyboy1995@gmail.com",
        description: "For general inquiries, partnership opportunities, or any other questions.",
        button: "Send Email"
      },
      github: {
        title: "GitHub",
        description: "Explore our open-source projects, view the code, or report issues.",
        button: "Visit GitHub"
      },
      x: {
        title: "X (Twitter)",
        description: "Follow us for updates, announcements, and community discussions.",
        button: "Follow on X"
      },
      issues: {
        title: "Report Issues",
        description: "Found a bug or have a feature request? Report it on our GitHub Issues page.",
        button: "Report Issue"
      },
      responseTime: {
        title: "Response Time",
        content: "We aim to respond to all inquiries within 24-48 hours. For bug reports, we'll acknowledge receipt and provide updates on the GitHub issue tracker."
      },
      backToHome: "Back to Home"
    },
    cn: {
      title: "联系我们",
      subtitle: "与我们的团队取得联系",
      description: "对 ChartFin 有疑问、想要报告错误或对合作感兴趣？请通过以下任一渠道联系我们。",
      email: {
        title: "电子邮件",
        label: "邮箱地址",
        address: "superhappyboy1995@gmail.com",
        description: "用于一般咨询、合作机会或其他问题。",
        button: "发送邮件"
      },
      github: {
        title: "GitHub",
        description: "探索我们的开源项目、查看代码或报告问题。",
        button: "访问 GitHub"
      },
      x: {
        title: "X (Twitter)",
        description: "关注我们获取更新、公告和社区讨论。",
        button: "关注 X"
      },
      issues: {
        title: "报告问题",
        description: "发现了错误或有功能请求？请在 GitHub Issues 页面上报告。",
        button: "报告问题"
      },
      responseTime: {
        title: "响应时间",
        content: "我们致力于在 24-48 小时内回复所有咨询。对于错误报告，我们会在 GitHub issue 跟踪器上确认收到并提供更新。"
      },
      backToHome: "返回首页"
    }
  };

  const currentContent = content[language];

  const contactCards = [
    {
      id: 'email',
      title: currentContent.email.title,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      content: (
        <div>
          <p className="text-sm text-gray-500 mb-2">{currentContent.email.label}</p>
          <p className="text-lg font-medium text-gray-900 mb-3">{currentContent.email.address}</p>
          <p className="text-gray-600 mb-4">{currentContent.email.description}</p>
          <a
            href={`mailto:${currentContent.email.address}`}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {currentContent.email.button}
          </a>
        </div>
      )
    },
    {
      id: 'github',
      title: currentContent.github.title,
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
        </svg>
      ),
      content: (
        <div>
          <p className="text-gray-600 mb-4">{currentContent.github.description}</p>
          <a
            href="https://github.com/0xhappyboy"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            {currentContent.github.button}
          </a>
        </div>
      )
    },
    {
      id: 'x',
      title: currentContent.x.title,
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      content: (
        <div>
          <p className="text-gray-600 mb-4">{currentContent.x.description}</p>
          <a
            href="https://x.com/0xhappyboy_"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-900 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            {currentContent.x.button}
          </a>
        </div>
      )
    },
    {
      id: 'issues',
      title: currentContent.issues.title,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.242 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
      content: (
        <div>
          <p className="text-gray-600 mb-4">{currentContent.issues.description}</p>
          <a
            href="https://github.com/0xhappyboy/candleview/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.242 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            {currentContent.issues.button}
          </a>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-end mb-8">
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

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {currentContent.title}
          </h1>
          <p className="text-xl text-blue-600 font-medium mb-4">
            {currentContent.subtitle}
          </p>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            {currentContent.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {contactCards.map((card) => (
            <div
              key={card.id}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-100"
            >
              <div className="flex items-start mb-4">
                <div className={`p-3 rounded-xl mr-4 ${card.id === 'email' ? 'bg-blue-100 text-blue-600' :
                  card.id === 'github' ? 'bg-gray-100 text-gray-900' :
                    card.id === 'x' ? 'bg-black text-white' :
                      'bg-red-100 text-red-600'
                  }`}>
                  {card.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {card.title}
                  </h3>
                </div>
              </div>
              {card.content}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <div className="flex items-start">
            <div className="p-3 bg-green-100 text-green-600 rounded-xl mr-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {currentContent.responseTime.title}
              </h3>
              <p className="text-gray-700">
                {currentContent.responseTime.content}
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <a
            href='/'
            className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {currentContent.backToHome}
          </a>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <p className="text-gray-500 text-sm">
            {copyrightText}
          </p>
        </div>
      </div>
    </div>
  );
}
