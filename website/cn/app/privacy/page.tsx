'use client';

import { siteConfig } from '../config';
import enMessages from '@/messages/en.json';
import cnMessages from '@/messages/cn.json';

export default function PrivacyPolicyPage() {
  const language = 'cn';
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
      title: "Privacy Policy",
      lastUpdated: `Last Updated: ${englishMonths[currentMonth]} ${currentYear}`,
      introduction: `This Privacy Policy describes how ${siteName} collects, uses, and shares your personal information when you use our services. We are committed to protecting your privacy and handling your data with transparency and care.`,

      informationWeCollect: {
        title: "Information We Collect",
        content: [
          "Personal Information: Name, email address, contact details when you register.",
          "Usage Data: Information about how you interact with our platform.",
          "Technical Data: IP address, browser type, device information, and cookies.",
          "Financial Data: If applicable, billing information for premium services."
        ]
      },

      howWeUseInfo: {
        title: "How We Use Your Information",
        content: [
          "To provide, maintain, and improve our services",
          "To communicate with you about updates, security alerts, and support messages",
          "To personalize your experience and provide relevant content",
          "To ensure security and prevent fraudulent activities",
          "To comply with legal obligations"
        ]
      },

      dataSharing: {
        title: "Data Sharing and Disclosure",
        content: `We do not sell your personal information. We may share data only with: trusted service providers who assist in operating our platform; when required by law or to protect our rights; or with your explicit consent.`
      },

      dataSecurity: {
        title: "Data Security",
        content: "We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, or destruction. However, no internet transmission is 100% secure."
      },

      yourRights: {
        title: "Your Rights",
        content: [
          "Access: You can request access to your personal data.",
          "Correction: You can request correction of inaccurate data.",
          "Deletion: You can request deletion of your data under certain conditions.",
          "Objection: You can object to certain types of processing.",
          "Portability: You can request transfer of your data to another service."
        ]
      },

      dataRetention: {
        title: "Data Retention",
        content: "We retain your personal data only for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required by law."
      },

      childrenPrivacy: {
        title: "Children's Privacy",
        content: "Our services are not directed to individuals under 16. We do not knowingly collect personal information from children."
      },

      changesToPolicy: {
        title: "Changes to This Policy",
        content: "We may update this policy periodically. We will notify you of significant changes by posting the new policy on our website."
      },

      contactUs: {
        title: "Contact Us",
        content: `If you have questions about this Privacy Policy or your personal data, contact us at: ${email}`
      }
    },
    cn: {
      title: "隐私政策",
      lastUpdated: `最后更新：${currentYear}年${currentMonth + 1}月`,
      introduction: `本隐私政策描述了 ${siteName} 在您使用我们服务时如何收集、使用和共享您的个人信息。我们致力于保护您的隐私，并以透明和谨慎的方式处理您的数据。`,

      informationWeCollect: {
        title: "我们收集的信息",
        content: [
          "个人信息：注册时的姓名、电子邮件地址、联系方式。",
          "使用数据：关于您如何与我们的平台互动的信息。",
          "技术数据：IP地址、浏览器类型、设备信息和Cookie。",
          "财务数据：如适用，高级服务的账单信息。"
        ]
      },

      howWeUseInfo: {
        title: "我们如何使用您的信息",
        content: [
          "提供、维护和改进我们的服务",
          "与您沟通更新、安全警报和支持消息",
          "个性化您的体验并提供相关内容",
          "确保安全并防止欺诈活动",
          "遵守法律义务"
        ]
      },

      dataSharing: {
        title: "数据共享与披露",
        content: `我们不出售您的个人信息。我们仅可能与以下各方共享数据：协助运营我们平台的可信服务提供商；法律要求时或为保护我们的权利时；或在获得您的明确同意后。`
      },

      dataSecurity: {
        title: "数据安全",
        content: "我们实施适当的技术和组织措施，以保护您的个人数据免受未经授权的访问、篡改或破坏。然而，任何互联网传输都不是100%安全的。"
      },

      yourRights: {
        title: "您的权利",
        content: [
          "访问权：您可以请求访问您的个人数据。",
          "更正权：您可以请求更正不准确的数据。",
          "删除权：在某些条件下，您可以请求删除您的数据。",
          "反对权：您可以反对某些类型的处理。",
          "可携权：您可以请求将您的数据传输到另一服务。"
        ]
      },

      dataRetention: {
        title: "数据保留",
        content: "我们仅在为实现本政策所述目的所必需的时间内保留您的个人数据，除非法律要求更长的保留期。"
      },

      childrenPrivacy: {
        title: "儿童隐私",
        content: "我们的服务不针对16岁以下的个人。我们不会故意收集儿童的个人信息。"
      },

      changesToPolicy: {
        title: "政策变更",
        content: "我们可能会定期更新此政策。我们将在网站上发布新政策以通知您重大变更。"
      },

      contactUs: {
        title: "联系我们",
        content: `如果您对本隐私政策或您的个人数据有任何疑问，请通过以下方式联系我们：${email}`
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
              {currentContent.informationWeCollect.title}
            </h2>
            <ul className="space-y-3">
              {currentContent.informationWeCollect.content.map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-gray-700 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {currentContent.howWeUseInfo.title}
            </h2>
            <ul className="space-y-3">
              {currentContent.howWeUseInfo.content.map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-gray-700 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {currentContent.dataSharing.title}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {currentContent.dataSharing.content}
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {currentContent.dataSecurity.title}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {currentContent.dataSecurity.content}
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {currentContent.yourRights.title}
            </h2>
            <ul className="space-y-3">
              {currentContent.yourRights.content.map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-gray-700 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {currentContent.dataRetention.title}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {currentContent.dataRetention.content}
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {currentContent.childrenPrivacy.title}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {currentContent.childrenPrivacy.content}
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {currentContent.changesToPolicy.title}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {currentContent.changesToPolicy.content}
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
