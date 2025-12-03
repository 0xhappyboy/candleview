'use client';

import { useState } from 'react';

export default function SponsorshipPage() {
  const [language, setLanguage] = useState<'en' | 'cn'>('en');
  const [selectedNetwork, setSelectedNetwork] = useState('eth');
  const [copied, setCopied] = useState(false);

  const walletAddresses = {
    btc: "",
    eth: "",
    base: "", 
    arb: "", 
    op: "",  
    solana: "",
    bsc: "",
    aptos: "",
    sui: ""
  };

  const networkInfo = {
    btc: { name: "Bitcoin", symbol: "BTC", color: "bg-orange-500" },
    eth: { name: "Ethereum", symbol: "ETH", color: "bg-gray-800" },
    base: { name: "Base", symbol: "ETH", color: "bg-blue-500" },
    arb: { name: "Arbitrum", symbol: "ETH", color: "bg-blue-600" },
    op: { name: "Optimism", symbol: "ETH", color: "bg-red-500" },
    solana: { name: "Solana", symbol: "SOL", color: "bg-purple-500" },
    bsc: { name: "BNB Chain", symbol: "BNB", color: "bg-yellow-500" },
    aptos: { name: "Aptos", symbol: "APT", color: "bg-indigo-600" },
    sui: { name: "Sui", symbol: "SUI", color: "bg-blue-400" }
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddresses[selectedNetwork]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const content = {
    en: {
      title: "Support This Project",
      subtitle: "Solo developer. Server costs add up.",
      message: "This is a solo project. Donations help cover server costs and keep it running.",
      selectNetwork: "Select Network",
      copyButton: "Copy Address",
      copied: "Copied!",
      thankYou: "Thank you for your support!",
      networks: networkInfo,
      backToHome: "Back to Home"
    },
    cn: {
      title: "支持这个项目",
      subtitle: "个人独立开发，服务器费用需要支持",
      message: "这是一个个人项目。您的捐赠将帮助支付服务器费用，维持项目运行。",
      selectNetwork: "选择网络",
      copyButton: "复制地址",
      copied: "已复制!",
      thankYou: "感谢您的支持！",
      networks: networkInfo,
      backToHome: "返回首页"
    }
  };

  const currentContent = content[language];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
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

        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              {currentContent.title}
            </h1>
            <p className="text-xl text-gray-600">
              {currentContent.subtitle}
            </p>
          </div>

          <div className="mb-12 text-center">
            <p className="text-gray-700 text-lg max-w-2xl mx-auto">
              {currentContent.message}
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {currentContent.selectNetwork}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {Object.entries(currentContent.networks).map(([key, network]) => (
                <button
                  key={key}
                  onClick={() => setSelectedNetwork(key)}
                  className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                    selectedNetwork === key 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full ${network.color} flex items-center justify-center mb-2`}>
                    <span className="text-white text-xs font-bold">
                      {network.symbol}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {network.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-10">
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="text-sm text-gray-500 mb-1">
                    {currentContent.networks[selectedNetwork].name} ({currentContent.networks[selectedNetwork].symbol}) Address
                  </div>
                  <div className="font-mono text-gray-900 bg-white p-3 rounded-lg border border-gray-300 overflow-x-auto">
                    {walletAddresses[selectedNetwork]}
                  </div>
                </div>
                <button
                  onClick={handleCopyAddress}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    copied 
                      ? 'bg-green-500 text-white' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {copied ? currentContent.copied : currentContent.copyButton}
                </button>
              </div>
            </div>
          </div>

          <div className="text-center pt-6 border-t border-gray-200">
            <p className="text-gray-600">
              {currentContent.thankYou}
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
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
      </div>
    </div>
  );
}