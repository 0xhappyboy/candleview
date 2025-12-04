'use client';

import { useState } from 'react';

export default function TermsOfServicePage() {
    const [language, setLanguage] = useState<'en' | 'cn'>('en');

    const content = {
        en: {
            title: "Terms of Service",
            lastUpdated: "Last Updated: December 2024",
            introduction: "Welcome to ChartFin. By accessing or using our services, you agree to be bound by these Terms of Service. Please read them carefully before using our platform.",

            acceptanceOfTerms: {
                title: "Acceptance of Terms",
                content: "By accessing or using ChartFin's services, you confirm that you are at least 16 years old and have the legal capacity to enter into this agreement. If you are using our services on behalf of an organization, you represent that you have authority to bind that organization."
            },

            serviceDescription: {
                title: "Description of Services",
                content: "ChartFin provides financial charting tools, market analysis, and related services. We reserve the right to modify, suspend, or discontinue any aspect of our services at any time."
            },

            userAccount: {
                title: "User Account",
                content: [
                    "You are responsible for maintaining the confidentiality of your account credentials.",
                    "You agree to provide accurate and complete registration information.",
                    "You must notify us immediately of any unauthorized use of your account.",
                    "We reserve the right to suspend or terminate accounts that violate these terms."
                ]
            },

            acceptableUse: {
                title: "Acceptable Use",
                content: "You agree not to: use our services for illegal purposes; attempt to gain unauthorized access to our systems; interfere with other users' enjoyment of the services; or use automated systems to access our services without permission."
            },

            intellectualProperty: {
                title: "Intellectual Property",
                content: "All content, trademarks, and data on ChartFin are owned by or licensed to us. You may use our services for personal, non-commercial purposes. Any unauthorized use may violate copyright, trademark, and other laws."
            },

            userContent: {
                title: "User Content",
                content: "If you submit content to our platform, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, and display that content. You are solely responsible for any content you submit."
            },

            disclaimer: {
                title: "Disclaimer of Warranties",
                content: "Our services are provided 'as is' without warranties of any kind. We do not guarantee that the services will be uninterrupted, error-free, or that the information provided is accurate or complete. Financial information is for informational purposes only and not financial advice."
            },

            limitationOfLiability: {
                title: "Limitation of Liability",
                content: "To the maximum extent permitted by law, ChartFin shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services."
            },

            indemnification: {
                title: "Indemnification",
                content: "You agree to indemnify and hold harmless ChartFin from any claims, damages, or expenses arising from your use of our services or violation of these terms."
            },

            termination: {
                title: "Termination",
                content: "We may terminate or suspend your access to our services at our sole discretion, without prior notice, for conduct that we believe violates these terms or is harmful to other users."
            },

            modifications: {
                title: "Modifications to Terms",
                content: "We reserve the right to modify these terms at any time. We will notify users of significant changes by updating the 'Last Updated' date. Your continued use of our services after changes constitutes acceptance of the new terms."
            },

            governingLaw: {
                title: "Governing Law",
                content: "These terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions."
            },

            contactUs: {
                title: "Contact Us",
                content: "For questions about these Terms of Service, contact us at: legal@chartfin.com"
            }
        },
        cn: {
            title: "服务条款",
            lastUpdated: "最后更新：2024年12月",
            introduction: "欢迎使用 ChartFin。通过访问或使用我们的服务，您同意受本服务条款的约束。在使用我们的平台之前，请仔细阅读这些条款。",

            acceptanceOfTerms: {
                title: "条款接受",
                content: "通过访问或使用 ChartFin 的服务，您确认您至少年满 16 岁，并具有签订本协议的法律能力。如果您代表组织使用我们的服务，您表示您有权约束该组织。"
            },

            serviceDescription: {
                title: "服务描述",
                content: "ChartFin 提供金融图表工具、市场分析和相关服务。我们保留随时修改、暂停或中止我们服务任何方面的权利。"
            },

            userAccount: {
                title: "用户账户",
                content: [
                    "您负责维护账户凭据的机密性。",
                    "您同意提供准确完整的注册信息。",
                    "您必须立即通知我们任何未经授权使用您账户的情况。",
                    "我们保留暂停或终止违反这些条款的账户的权利。"
                ]
            },

            acceptableUse: {
                title: "可接受使用",
                content: "您同意不：将我们的服务用于非法目的；试图未经授权访问我们的系统；干扰其他用户对服务的使用；或未经许可使用自动化系统访问我们的服务。"
            },

            intellectualProperty: {
                title: "知识产权",
                content: "ChartFin 上的所有内容、商标和数据均归我们所有或已获得许可。您可以将我们的服务用于个人非商业目的。任何未经授权的使用都可能违反版权、商标和其他法律。"
            },

            userContent: {
                title: "用户内容",
                content: "如果您向我们的平台提交内容，您授予我们全球性、非排他性、免版税的许可，以使用、复制和显示该内容。您对您提交的任何内容全权负责。"
            },

            disclaimer: {
                title: "免责声明",
                content: "我们的服务按'现状'提供，不提供任何形式的保证。我们不保证服务不会中断、无错误，也不保证所提供的信息准确或完整。金融信息仅供参考，并非财务建议。"
            },

            limitationOfLiability: {
                title: "责任限制",
                content: "在法律允许的最大范围内，ChartFin 不对因您使用我们的服务而产生的任何间接、附带、特殊、后果性或惩罚性损害负责。"
            },

            indemnification: {
                title: "赔偿",
                content: "您同意赔偿 ChartFin 因您使用我们的服务或违反这些条款而产生的任何索赔、损害或费用。"
            },

            termination: {
                title: "终止",
                content: "如果我们认为您的行为违反了这些条款或对其他用户有害，我们可自行决定终止或暂停您对我们服务的访问，恕不另行通知。"
            },

            modifications: {
                title: "条款修改",
                content: "我们保留随时修改这些条款的权利。我们将通过更新'最后更新'日期来通知用户重大变更。您在变更后继续使用我们的服务即表示接受新条款。"
            },

            governingLaw: {
                title: "管辖法律",
                content: "这些条款应受[您的司法管辖区]法律管辖并据其解释，不考虑其法律冲突规定。"
            },

            contactUs: {
                title: "联系我们",
                content: "有关本服务条款的问题，请通过以下方式联系我们：legal@chartfin.com"
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
                            {currentContent.acceptanceOfTerms.title}
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            {currentContent.acceptanceOfTerms.content}
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            {currentContent.serviceDescription.title}
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            {currentContent.serviceDescription.content}
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            {currentContent.userAccount.title}
                        </h2>
                        <ul className="space-y-3">
                            {currentContent.userAccount.content.map((item, index) => (
                                <li key={index} className="flex items-start">
                                    <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                    <span className="text-gray-700 leading-relaxed">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            {currentContent.acceptableUse.title}
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            {currentContent.acceptableUse.content}
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            {currentContent.intellectualProperty.title}
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            {currentContent.intellectualProperty.content}
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            {currentContent.userContent.title}
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            {currentContent.userContent.content}
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            {currentContent.disclaimer.title}
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            {currentContent.disclaimer.content}
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            {currentContent.limitationOfLiability.title}
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            {currentContent.limitationOfLiability.content}
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            {currentContent.indemnification.title}
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            {currentContent.indemnification.content}
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            {currentContent.termination.title}
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            {currentContent.termination.content}
                        </p>
                    </section>
                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            {currentContent.modifications.title}
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            {currentContent.modifications.content}
                        </p>
                    </section>
                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            {currentContent.governingLaw.title}
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            {currentContent.governingLaw.content}
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