'use client';

export default function CommercialLicensePage() {
  const language = 'cn';
  const content = {
    en: {
      title: "Commercial License & AGPL-3.0",
      lastUpdated: "Last Updated: December 2024",
      introduction: "This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). This page outlines the licensing terms and commercial use restrictions.",
      licenseOverview: {
        title: "AGPL-3.0 License Overview",
        content: "The AGPL-3.0 is a strong copyleft license that requires any modifications or derivative works to be released under the same license. It also requires that if you run the software as a network service, you must provide the source code to users interacting with it."
      },
      commercialRestrictions: {
        title: "Commercial Use Restrictions",
        content: [
          "You may use this software for commercial purposes, but any modifications or derivative works must also be licensed under AGPL-3.0.",
          "If you host a modified version as a service accessible to users over a network, you must provide the complete corresponding source code to those users.",
          "You cannot sublicense this software under different terms than AGPL-3.0.",
          "Any distribution of the software (modified or unmodified) must include the original copyright notice and license text."
        ]
      },
      complianceRequirements: {
        title: "Compliance Requirements",
        content: [
          "Include the full AGPL-3.0 license text in any distribution.",
          "Provide clear notice that the software is AGPL-3.0 licensed.",
          "Make source code available to all users interacting with network services.",
          "Document any modifications made to the original software."
        ]
      },
      obtainingLicense: {
        title: "Obtaining a Commercial License",
        content: "If you require a different licensing arrangement for proprietary commercial use, please contact us to discuss commercial licensing options."
      },
      contactForCommercialization: {
        title: "Contact for Commercial Use",
        content: "For proprietary commercial use, closed-source licensing, or custom development requirements, please contact the author directly:",
        github: "GitHub: https://github.com/0xhappyboy",
        email: "Email: superhappyboy1995@gmail.com",
        x: "X: https://x.com/0xhappyboy_"
      },
      contactUs: {
        title: "Contact Us",
        content: "For licensing inquiries or commercial use arrangements, please contact us at: superhappyboy1995@gmail.com"
      },
      viewFullLicense: "View Full AGPL-3.0 License",
      backToHome: "Back to Home"
    },
    cn: {
      title: "商业许可证与 AGPL-3.0 声明",
      lastUpdated: "最后更新：2025年12月",
      introduction: "本项目采用 GNU Affero 通用公共许可证 v3.0 (AGPL-3.0)。本页面概述了许可条款和商业使用限制。",
      licenseOverview: {
        title: "AGPL-3.0 许可证概述",
        content: "AGPL-3.0 是一个强著作权许可证，要求任何修改或衍生作品必须以相同许可证发布。它还要求如果您将软件作为网络服务运行，必须向与之交互的用户提供源代码。"
      },
      commercialRestrictions: {
        title: "商业使用限制",
        content: [
          "您可以将此软件用于商业目的，但任何修改或衍生作品也必须以 AGPL-3.0 许可发布。",
          "如果您将修改版本作为网络可访问的服务托管，必须向这些用户提供完整的相应源代码。",
          "您不能以不同于 AGPL-3.0 的条款再许可此软件。",
          "任何软件分发（修改或未修改）必须包含原始版权声明和许可证文本。"
        ]
      },
      complianceRequirements: {
        title: "合规要求",
        content: [
          "在任何分发中包含完整的 AGPL-3.0 许可证文本。",
          "提供明确的通知，说明软件采用 AGPL-3.0 许可。",
          "向所有与网络服务交互的用户提供源代码。",
          "记录对原始软件所做的任何修改。"
        ]
      },
      obtainingLicense: {
        title: "获取商业许可证",
        content: "如果您需要专有商业用途的不同许可安排，请联系我们讨论商业许可选项。"
      },
      contactForCommercialization: {
        title: "商业使用联系",
        content: "如需专有商业使用、闭源许可或定制开发需求，请直接联系作者：",
        github: "GitHub: https://github.com/0xhappyboy",
        email: "邮箱: superhappyboy1995@gmail.com",
        x: "X: https://x.com/0xhappyboy_"
      },
      contactUs: {
        title: "联系我们",
        content: "有关许可查询或商业使用安排，请通过以下方式联系我们：superhappyboy1995@gmail.com"
      },
      viewFullLicense: "查看完整 AGPL-3.0 许可证",
      backToHome: "返回首页"
    }
  };

  const currentContent = content[language];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
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
              {currentContent.licenseOverview.title}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {currentContent.licenseOverview.content}
            </p>
          </section>
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {currentContent.commercialRestrictions.title}
            </h2>
            <ul className="space-y-3">
              {currentContent.commercialRestrictions.content.map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-gray-700 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </section>
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {currentContent.complianceRequirements.title}
            </h2>
            <ul className="space-y-3">
              {currentContent.complianceRequirements.content.map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-gray-700 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </section>
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {currentContent.obtainingLicense.title}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {currentContent.obtainingLicense.content}
            </p>
          </section>
          <section className="mb-10 p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {currentContent.contactForCommercialization.title}
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {currentContent.contactForCommercialization.content}
            </p>
            <div className="space-y-3 bg-white p-4 rounded-lg border border-amber-100">
              <p className="text-gray-700">
                <span className="font-medium text-gray-900">GitHub: </span>
                <a
                  href="https://github.com/0xhappyboy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  https://github.com/0xhappyboy
                </a>
              </p>
              <p className="text-gray-700">
                <span className="font-medium text-gray-900">Email: </span>
                <a
                  href="mailto:superhappyboy1995@gmail.com"
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  superhappyboy1995@gmail.com
                </a>
              </p>
            </div>
          </section>
          <section className="mb-10 p-6 bg-blue-50 rounded-xl">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {currentContent.contactUs.title}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {currentContent.contactUs.content}
            </p>
          </section>
          <section className="pt-8 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <a
                href="https://github.com/0xhappyboy/candleview/blob/main/LICENSE"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors mb-4 md:mb-0"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11a1 1 0 11-2 0V9a1 1 0 112 0v4zm-1-7a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                {currentContent.viewFullLicense}
              </a>
              <a
                href='/'
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                {currentContent.backToHome}
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
