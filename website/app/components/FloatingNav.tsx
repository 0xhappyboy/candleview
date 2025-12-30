"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Home, Eye, MessageSquare, Zap, BarChart2, Clock, Mail, ChevronUp } from "lucide-react";
import { useI18n } from "@/app/providers/I18nProvider";
import enMessages from "@/messages/en.json";
import cnMessages from "@/messages/cn.json";

const iconMap = {
  hero: Home,
  preview: Eye,
  "ai-dialog": MessageSquare,
  features: Zap,
  chart: BarChart2,
  time: Clock,
  footer: Mail,
};

interface Section {
  id: string;
  labelKey: string;
}

interface FloatingNavProps {
  sections: Section[];
}

export default function FloatingNav({ sections }: FloatingNavProps) {
  const { locale } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const navRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          const elementTop = rect.top + window.scrollY;

          if (scrollPos >= elementTop) {
            setActiveSection(section.id);
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setActiveSection(id);
    }
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setActiveSection("hero");
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  return (
    <div
      ref={navRef}
      className="fixed right-6 top-1/2 -translate-y-1/2 z-50"
    >
      <div
        className={`
          flex flex-col items-center gap-3 p-3
          bg-white/90 backdrop-blur-md dark:bg-gray-800/90 dark:border-gray-700
          rounded-2xl shadow-xl
          border border-gray-200
          transition-all duration-300
          ${isOpen ? "w-48" : "w-12"}
        `}
      >
        <button
          onClick={scrollToTop}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors group relative"
          title={t("FloatingNav.backToTop")}
        >
          <ChevronUp className="w-4 h-4 text-gray-700 dark:text-gray-300" />
          {isOpen && (
            <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {t("FloatingNav.backToTop")}
            </span>
          )}
        </button>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors group relative"
          title={isOpen ? t("FloatingNav.collapse") : t("FloatingNav.expand")}
        >
          {isOpen ? (
            <ChevronRight className="w-4 h-4 text-gray-700 dark:text-gray-300" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-700 dark:text-gray-300" />
          )}
          {!isOpen && (
            <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {t("FloatingNav.expand")}
            </span>
          )}
        </button>
        <nav className="flex flex-col gap-2 w-full">
          {sections.map((section) => {
            const Icon = iconMap[section.id as keyof typeof iconMap] || Home;
            return (
              <button
                key={section.id}
                onClick={() => handleClick(section.id)}
                className={`
                  flex items-center justify-center
                  p-2 rounded-xl
                  transition-all duration-200
                  ${isOpen ? "justify-start gap-3" : "justify-center"}
                  ${activeSection === section.id
                    ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }
                `}
                title={t(section.labelKey)}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {isOpen && (
                  <span className="text-sm font-medium whitespace-nowrap">
                    {t(section.labelKey)}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
